package com.laptopstore.service.impl;

import com.laptopstore.dto.ChiTietSanPhamCreateRequest;
import com.laptopstore.entity.*;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.*;
import com.laptopstore.service.ChiTietSanPhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class ChiTietSanPhamServiceImpl implements ChiTietSanPhamService {

    private final ChiTietSanPhamRepository chiTietSanPhamRepository;
    private final ImeiRepository imeiRepository;
    private final SanPhamRepository sanPhamRepository;
    private final MauSacRepository mauSacRepository;
    private final CpuRepository cpuRepository;
    private final RamRepository ramRepository;
    private final OCungRepository oCungRepository;
    private final CardDoHoaRepository cardDoHoaRepository;
    private final ManHinhRepository manHinhRepository;
    private final com.laptopstore.service.KhuyenMaiService khuyenMaiService;

    @Override
    @Transactional
    public List<ChiTietSanPham> getAll() {
        List<ChiTietSanPham> list = chiTietSanPhamRepository.findAll();
        applySoLuongKhaDung(list);
        khuyenMaiService.applyGiaKhuyenMai(list);
        return list;
    }

    @Override
    @Transactional
    public ChiTietSanPham getById(Integer id) {
        ChiTietSanPham ctsp = chiTietSanPhamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chi tiết sản phẩm", "id", id));
        applySoLuongKhaDung(ctsp);
        khuyenMaiService.applyGiaKhuyenMai(ctsp);
        return ctsp;
    }

    @Override
    @Transactional
    public ChiTietSanPham getByMaCtsp(String maCtsp) {
        ChiTietSanPham ctsp = chiTietSanPhamRepository.findByMaCtsp(maCtsp)
                .orElseThrow(() -> new ResourceNotFoundException("Chi tiết sản phẩm", "maCtsp", maCtsp));
        applySoLuongKhaDung(ctsp);
        khuyenMaiService.applyGiaKhuyenMai(ctsp);
        return ctsp;
    }

    @Override
    @Transactional
    public List<ChiTietSanPham> getBySanPham(Integer sanPhamId) {
        List<ChiTietSanPham> list = chiTietSanPhamRepository.findBySanPhamId(sanPhamId);
        applySoLuongKhaDung(list);
        khuyenMaiService.applyGiaKhuyenMai(list);
        return list;
    }

    @Override
    @Transactional
    public List<ChiTietSanPham> getByTrangThai(Integer trangThai) {
        List<ChiTietSanPham> list = chiTietSanPhamRepository.findByTrangThai(trangThai);
        applySoLuongKhaDung(list);
        khuyenMaiService.applyGiaKhuyenMai(list);
        return list;
    }

    private void applySoLuongKhaDung(List<ChiTietSanPham> list) {
        if (list == null || list.isEmpty()) return;

        List<Object[]> totalImeisList = imeiRepository.countTotalImeisGroupedByCtsp();
        java.util.Map<Integer, Long> totalImeisMap = new java.util.HashMap<>();
        for (Object[] row : totalImeisList) {
            totalImeisMap.put((Integer) row[0], (Long) row[1]);
        }

        List<Object[]> availableImeisList = imeiRepository.countAvailableImeisGroupedByCtsp();
        java.util.Map<Integer, Long> availableImeisMap = new java.util.HashMap<>();
        for (Object[] row : availableImeisList) {
            availableImeisMap.put((Integer) row[0], (Long) row[1]);
        }

        for (ChiTietSanPham ctsp : list) {
            Long total = totalImeisMap.get(ctsp.getId());
            int newQty;
            if (total != null && total > 0) {
                Long avail = availableImeisMap.getOrDefault(ctsp.getId(), 0L);
                newQty = avail.intValue();
            } else {
                newQty = 0;
            }
            ctsp.setSoLuong(newQty);
            if (ctsp.getId() != null) {
                chiTietSanPhamRepository.updateSoLuong(ctsp.getId(), newQty);
            }
        }
    }

    private void applySoLuongKhaDung(ChiTietSanPham ctsp) {
        if (ctsp == null || ctsp.getId() == null) return;
        int total = imeiRepository.countByChiTietSanPhamId(ctsp.getId());
        int newQty;
        if (total > 0) {
            newQty = imeiRepository.countAvailableByChiTietSanPhamId(ctsp.getId());
        } else {
            newQty = 0;
        }
        ctsp.setSoLuong(newQty);
        chiTietSanPhamRepository.updateSoLuong(ctsp.getId(), newQty);
    }

    @Override
    public ChiTietSanPham create(ChiTietSanPham chiTietSanPham) {
        return chiTietSanPhamRepository.save(chiTietSanPham);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ChiTietSanPham createWithImeis(ChiTietSanPhamCreateRequest request) {
        Integer soLuong = request.getSoLuong();
        if (soLuong == null || soLuong <= 0) {
            throw new IllegalArgumentException("Số lượng kho phải lớn hơn 0!");
        }

        List<String> danhSachImei = request.getDanhSachImei();
        if (danhSachImei == null || danhSachImei.size() != soLuong) {
            int count = (danhSachImei == null) ? 0 : danhSachImei.size();
            throw new IllegalArgumentException("Số lượng IMEI (" + count + ") phải đúng bằng số lượng kho (" + soLuong + ")!");
        }

        // Validate IMEI trống, trùng trong form, trùng trong DB
        Set<String> seenImeis = new HashSet<>();
        for (int i = 0; i < danhSachImei.size(); i++) {
            String imei = danhSachImei.get(i);
            if (imei == null || imei.trim().isEmpty()) {
                throw new IllegalArgumentException("IMEI " + (i + 1) + " không được để trống!");
            }
            imei = imei.trim();
            if (!seenImeis.add(imei.toLowerCase())) {
                throw new IllegalArgumentException("IMEI '" + imei + "' bị trùng lặp trong form nhập!");
            }
            if (imeiRepository.existsBySoImei(imei)) {
                throw new IllegalArgumentException("IMEI '" + imei + "' đã tồn tại trong database!");
            }
        }

        // BƯỚC 1: Tạo chi_tiet_san_pham trước
        ChiTietSanPham ctsp = new ChiTietSanPham();
        ctsp.setMaCtsp(request.getMaCtsp());
        ctsp.setGia(request.getGia());
        ctsp.setSoLuong(soLuong);
        ctsp.setMoTa(request.getMoTa());
        ctsp.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : 1);

        // Gán các thuộc tính quan hệ (hỗ trợ cả idSanPham lẫn sanPham.id)
        Integer spId = request.getIdSanPham() != null ? request.getIdSanPham() : (request.getSanPham() != null ? request.getSanPham().getId() : null);
        if (spId != null) ctsp.setSanPham(sanPhamRepository.findById(spId).orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", spId)));

        Integer msId = request.getIdMauSac() != null ? request.getIdMauSac() : (request.getMauSac() != null ? request.getMauSac().getId() : null);
        if (msId != null) ctsp.setMauSac(mauSacRepository.findById(msId).orElseThrow(() -> new ResourceNotFoundException("Màu sắc", "id", msId)));

        Integer cpuId = request.getIdCpu() != null ? request.getIdCpu() : (request.getCpu() != null ? request.getCpu().getId() : null);
        if (cpuId != null) ctsp.setCpu(cpuRepository.findById(cpuId).orElseThrow(() -> new ResourceNotFoundException("CPU", "id", cpuId)));

        Integer ramId = request.getIdRam() != null ? request.getIdRam() : (request.getRam() != null ? request.getRam().getId() : null);
        if (ramId != null) ctsp.setRam(ramRepository.findById(ramId).orElseThrow(() -> new ResourceNotFoundException("RAM", "id", ramId)));

        Integer oCungId = request.getIdOCung() != null ? request.getIdOCung() : (request.getOCung() != null ? request.getOCung().getId() : null);
        if (oCungId != null) ctsp.setOCung(oCungRepository.findById(oCungId).orElseThrow(() -> new ResourceNotFoundException("Ổ cứng", "id", oCungId)));

        Integer cardId = request.getIdCardDoHoa() != null ? request.getIdCardDoHoa() : (request.getCardDoHoa() != null ? request.getCardDoHoa().getId() : null);
        if (cardId != null) ctsp.setCardDoHoa(cardDoHoaRepository.findById(cardId).orElseThrow(() -> new ResourceNotFoundException("Card đồ họa", "id", cardId)));

        Integer mhId = request.getIdManHinh() != null ? request.getIdManHinh() : (request.getManHinh() != null ? request.getManHinh().getId() : null);
        if (mhId != null) ctsp.setManHinh(manHinhRepository.findById(mhId).orElseThrow(() -> new ResourceNotFoundException("Màn hình", "id", mhId)));

        // BƯỚC 2: Lưu CTSP trước để có ID
        ChiTietSanPham savedCtsp = chiTietSanPhamRepository.save(ctsp);

        // BƯỚC 3: Lặp qua danh sách IMEI và tạo các bản ghi imei
        for (String imeiStr : danhSachImei) {
            Imei imeiEntity = Imei.builder()
                    .soImei(imeiStr.trim())
                    .chiTietSanPham(savedCtsp)
                    .trangThai(0) // 0: Trong kho
                    .ngayNhap(LocalDateTime.now())
                    .build();
            imeiRepository.save(imeiEntity);
        }

        return savedCtsp;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ChiTietSanPham update(Integer id, ChiTietSanPham chiTietSanPham) {
        ChiTietSanPham existing = getById(id);
        existing.setMaCtsp(chiTietSanPham.getMaCtsp());
        existing.setGia(chiTietSanPham.getGia());
        
        // Số lượng kho đồng bộ dựa trên số IMEI khả dụng trong kho
        int totalImeis = imeiRepository.countByChiTietSanPhamId(existing.getId());
        if (totalImeis > 0) {
            existing.setSoLuong(imeiRepository.countAvailableByChiTietSanPhamId(existing.getId()));
        } else {
            existing.setSoLuong(chiTietSanPham.getSoLuong() != null ? chiTietSanPham.getSoLuong() : 0);
        }

        existing.setMoTa(chiTietSanPham.getMoTa());
        existing.setTrangThai(chiTietSanPham.getTrangThai());

        if (chiTietSanPham.getSanPham() != null && chiTietSanPham.getSanPham().getId() != null) {
            existing.setSanPham(sanPhamRepository.findById(chiTietSanPham.getSanPham().getId()).orElse(existing.getSanPham()));
        }
        if (chiTietSanPham.getMauSac() != null && chiTietSanPham.getMauSac().getId() != null) {
            existing.setMauSac(mauSacRepository.findById(chiTietSanPham.getMauSac().getId()).orElse(existing.getMauSac()));
        }
        if (chiTietSanPham.getCpu() != null && chiTietSanPham.getCpu().getId() != null) {
            existing.setCpu(cpuRepository.findById(chiTietSanPham.getCpu().getId()).orElse(existing.getCpu()));
        }
        if (chiTietSanPham.getRam() != null && chiTietSanPham.getRam().getId() != null) {
            existing.setRam(ramRepository.findById(chiTietSanPham.getRam().getId()).orElse(existing.getRam()));
        }
        if (chiTietSanPham.getOCung() != null && chiTietSanPham.getOCung().getId() != null) {
            existing.setOCung(oCungRepository.findById(chiTietSanPham.getOCung().getId()).orElse(existing.getOCung()));
        }
        if (chiTietSanPham.getCardDoHoa() != null && chiTietSanPham.getCardDoHoa().getId() != null) {
            existing.setCardDoHoa(cardDoHoaRepository.findById(chiTietSanPham.getCardDoHoa().getId()).orElse(existing.getCardDoHoa()));
        }
        if (chiTietSanPham.getManHinh() != null && chiTietSanPham.getManHinh().getId() != null) {
            existing.setManHinh(manHinhRepository.findById(chiTietSanPham.getManHinh().getId()).orElse(existing.getManHinh()));
        }

        return chiTietSanPhamRepository.save(existing);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Integer id) {
        ChiTietSanPham existing = getById(id);
        chiTietSanPhamRepository.delete(existing);
    }
}
