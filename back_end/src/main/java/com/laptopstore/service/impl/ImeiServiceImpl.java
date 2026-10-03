package com.laptopstore.service.impl;
 
import com.laptopstore.dto.ImeiResponseDTO;
import com.laptopstore.dto.ThemImeiRequest;
import com.laptopstore.entity.ChiTietHoaDon;
import com.laptopstore.entity.ChiTietHoaDonImei;
import com.laptopstore.entity.ChiTietSanPham;
import com.laptopstore.entity.HoaDon;
import com.laptopstore.entity.Imei;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.ChiTietHoaDonImeiRepository;
import com.laptopstore.repository.ChiTietSanPhamRepository;
import com.laptopstore.repository.ImeiRepository;
import com.laptopstore.service.ImeiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImeiServiceImpl implements ImeiService {

    private final ImeiRepository imeiRepository;
    private final ChiTietSanPhamRepository chiTietSanPhamRepository;
    private final ChiTietHoaDonImeiRepository chiTietHoaDonImeiRepository;

    @Override
    public List<Imei> getAll() {
        return imeiRepository.findAll();
    }

    @Override
    public List<ImeiResponseDTO> getAllImeiResponses() {
        List<Imei> imeis = imeiRepository.findAll();
        List<ChiTietHoaDonImei> cthdImeis = chiTietHoaDonImeiRepository.findAll();
        Map<Integer, ChiTietHoaDonImei> imeiInvoiceMap = new HashMap<>();
        for (ChiTietHoaDonImei link : cthdImeis) {
            if (link.getImei() != null && link.getImei().getId() != null) {
                imeiInvoiceMap.put(link.getImei().getId(), link);
            }
        }

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

        return imeis.stream().map(imei -> {
            ImeiResponseDTO dto = new ImeiResponseDTO();
            dto.setId(imei.getId());
            dto.setSoImei(imei.getSoImei());
            dto.setChiTietSanPham(imei.getChiTietSanPham());
            dto.setTrangThai(imei.getTrangThai());
            dto.setNgayNhap(imei.getNgayNhap());
            if (imei.getNgayNhap() != null) {
                dto.setNgayNhapFormatted(imei.getNgayNhap().format(dtf));
            }

            ChiTietHoaDonImei cthdImei = imeiInvoiceMap.get(imei.getId());
            int st = imei.getTrangThai() != null ? imei.getTrangThai() : 0;
            switch (st) {
                case 0 -> {
                    if (cthdImei != null) {
                        dto.setTenTrangThai("Đang phân bổ");
                        dto.setBadgeClass("badge-info");
                    } else {
                        dto.setTenTrangThai("Trong kho");
                        dto.setBadgeClass("badge-success");
                    }
                }
                case 1 -> {
                    dto.setTenTrangThai("Đã bán");
                    dto.setBadgeClass("badge-secondary");
                }
                case 2 -> {
                    dto.setTenTrangThai("Ngừng sử dụng");
                    dto.setBadgeClass("badge-danger");
                }
                default -> {
                    dto.setTenTrangThai("Khác");
                    dto.setBadgeClass("badge-info");
                }
            }

            if (cthdImei != null && cthdImei.getChiTietHoaDon() != null) {
                ChiTietHoaDon cthd = cthdImei.getChiTietHoaDon();
                HoaDon hd = cthd.getHoaDon();
                if (hd != null) {
                    dto.setIdHoaDon(hd.getId());
                    dto.setMaHoaDon(hd.getMa());
                    dto.setNgayBan(hd.getNgayTao());
                    if (hd.getNgayTao() != null) {
                        dto.setNgayBanFormatted(hd.getNgayTao().format(dtf));
                    }
                    if (hd.getKhachHang() != null) {
                        dto.setTenKhachHang(hd.getKhachHang().getTen());
                        dto.setSoDienThoai(hd.getKhachHang().getDienThoai());
                    } else if (hd.getTenNguoiNhan() != null) {
                        dto.setTenKhachHang(hd.getTenNguoiNhan());
                        dto.setSoDienThoai(hd.getDienThoai());
                    }
                    dto.setTrangThaiHoaDon(hd.getTrangThai());

                    if (hd.getTrangThai() != null) {
                        switch (hd.getTrangThai()) {
                            case 0 -> dto.setTenTrangThaiHoaDon("Chờ xác nhận");
                            case 1 -> dto.setTenTrangThaiHoaDon("Đã xác nhận");
                            case 2 -> dto.setTenTrangThaiHoaDon("Đang giao hàng");
                            case 3 -> dto.setTenTrangThaiHoaDon("Hoàn thành");
                            case 4 -> dto.setTenTrangThaiHoaDon("Đã hủy");
                            default -> dto.setTenTrangThaiHoaDon("Đơn hàng");
                        }
                    }
                }
            }

            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public Imei getById(Integer id) {
        return imeiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("IMEI", "id", id));
    }

    @Override
    public Imei getBySoImei(String soImei) {
        return imeiRepository.findBySoImei(soImei)
                .orElseThrow(() -> new ResourceNotFoundException("IMEI", "soImei", soImei));
    }

    @Override
    public List<Imei> getByChiTietSanPham(Integer ctspId) {
        return imeiRepository.findByChiTietSanPhamId(ctspId);
    }

    @Override
    public List<Imei> getByChiTietSanPhamAndTrangThai(Integer ctspId, Integer trangThai) {
        return imeiRepository.findByChiTietSanPhamIdAndTrangThai(ctspId, trangThai);
    }

    @Override
    public List<Imei> getByTrangThai(Integer trangThai) {
        return imeiRepository.findByTrangThai(trangThai);
    }

    @Override
    public Imei create(Imei imei) {
        return imeiRepository.save(imei);
    }

    @Override
    public Imei update(Integer id, Imei imei) {
        Imei existing = getById(id);
        existing.setSoImei(imei.getSoImei());
        existing.setTrangThai(imei.getTrangThai());
        if (imei.getChiTietSanPham() != null) {
            existing.setChiTietSanPham(imei.getChiTietSanPham());
        }
        return imeiRepository.save(existing);
    }

    @Override
    @Transactional
    public Imei updateTrangThai(Integer id, Integer trangThai) {
        Imei existing = getById(id);
        existing.setTrangThai(trangThai);
        Imei saved = imeiRepository.save(existing);

        // Tự động đồng bộ số lượng tồn kho khả dụng của CTSP khi trạng thái IMEI thay đổi
        if (existing.getChiTietSanPham() != null && existing.getChiTietSanPham().getId() != null) {
            Integer ctspId = existing.getChiTietSanPham().getId();
            int availableCount = imeiRepository.countAvailableByChiTietSanPhamId(ctspId);
            chiTietSanPhamRepository.findById(ctspId).ifPresent(ctsp -> {
                ctsp.setSoLuong(availableCount);
                chiTietSanPhamRepository.save(ctsp);
            });
        }

        return saved;
    }

    @Override
    public void delete(Integer id) {
        Imei existing = getById(id);
        imeiRepository.delete(existing);
    }

    @Override
    public boolean existsBySoImei(String soImei) {
        if (soImei == null || soImei.trim().isEmpty()) return false;
        return imeiRepository.existsBySoImei(soImei.trim());
    }

    @Override
    public List<String> findExistingImeis(List<String> soImeis) {
        if (soImeis == null || soImeis.isEmpty()) return List.of();
        List<String> cleaned = soImeis.stream()
                .filter(s -> s != null && !s.trim().isEmpty())
                .map(String::trim)
                .toList();
        return imeiRepository.findBySoImeiIn(cleaned).stream()
                .map(Imei::getSoImei)
                .toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> addImeisToCtsp(ThemImeiRequest request) {
        if (request == null || request.getIdChiTietSanPham() == null) {
            throw new IllegalArgumentException("ID phiên bản cấu hình không được để trống!");
        }

        ChiTietSanPham ctsp = chiTietSanPhamRepository.findById(request.getIdChiTietSanPham())
                .orElseThrow(() -> new ResourceNotFoundException("Chi tiết sản phẩm", "id", request.getIdChiTietSanPham()));

        List<String> list = request.getDanhSachImei();
        if (list == null || list.isEmpty()) {
            throw new IllegalArgumentException("Danh sách IMEI không được để trống!");
        }

        // Validate IMEI trống, trùng lặp trong request, trùng lặp trong database
        Set<String> seenImeis = new HashSet<>();
        for (int i = 0; i < list.size(); i++) {
            String imei = list.get(i);
            if (imei == null || imei.trim().isEmpty()) {
                throw new IllegalArgumentException("IMEI " + (i + 1) + " không được để trống!");
            }
            imei = imei.trim();
            if (!seenImeis.add(imei.toLowerCase())) {
                throw new IllegalArgumentException("IMEI '" + imei + "' bị trùng lặp trong danh sách thêm mới!");
            }
            if (imeiRepository.existsBySoImei(imei)) {
                throw new IllegalArgumentException("IMEI '" + imei + "' đã tồn tại trong database!");
            }
        }

        // Tạo và lưu từng IMEI với trạng thái 0 (Trong kho)
        List<Imei> savedList = new ArrayList<>();
        for (String imeiStr : list) {
            Imei imeiEntity = Imei.builder()
                    .soImei(imeiStr.trim())
                    .chiTietSanPham(ctsp)
                    .trangThai(0) // 0: Trong kho
                    .ngayNhap(LocalDateTime.now())
                    .build();
            savedList.add(imeiRepository.save(imeiEntity));
        }

        // Cập nhật lại số lượng kho theo số IMEI có trang_thai = 0 trong DB
        int soLuongKhoMoi = imeiRepository.countByChiTietSanPhamIdAndTrangThai(ctsp.getId(), 0);
        ctsp.setSoLuong(soLuongKhoMoi);
        chiTietSanPhamRepository.save(ctsp);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Thêm IMEI thành công!");
        response.put("soLuongKho", soLuongKhoMoi);
        response.put("danhSachImei", savedList);
        return response;
    }

    @Override
    public List<Imei> getAvailableByChiTietSanPham(Integer ctspId) {
        return imeiRepository.findAvailableByChiTietSanPhamId(ctspId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Imei ngungSuDungImei(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("Mã IMEI không hợp lệ.");
        }
        Imei existing = getById(id);
        if (existing.getTrangThai() == null || existing.getTrangThai() != 0) {
            throw new IllegalStateException("Chỉ có thể ngừng sử dụng IMEI đang ở trạng thái 'Trong kho' (0). Trạng thái hiện tại: " + existing.getTrangThai());
        }
        if (chiTietHoaDonImeiRepository.findByImeiId(id).isPresent()) {
            throw new IllegalStateException("Không thể ngừng sử dụng IMEI đang được phân bổ cho đơn hàng!");
        }
        existing.setTrangThai(2); // 2: Ngừng sử dụng
        Imei saved = imeiRepository.save(existing);

        // Tự động đồng bộ số lượng tồn kho khả dụng của CTSP
        if (existing.getChiTietSanPham() != null && existing.getChiTietSanPham().getId() != null) {
            Integer ctspId = existing.getChiTietSanPham().getId();
            int availableCount = imeiRepository.countAvailableByChiTietSanPhamId(ctspId);
            chiTietSanPhamRepository.updateSoLuong(ctspId, availableCount);
        }
        return saved;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Imei kichHoatLaiImei(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("Mã IMEI không hợp lệ.");
        }
        Imei existing = getById(id);
        if (existing.getTrangThai() == null || existing.getTrangThai() != 2) {
            throw new IllegalStateException("Chỉ có thể kích hoạt lại IMEI đang ở trạng thái 'Ngừng sử dụng' (2). Trạng thái hiện tại: " + existing.getTrangThai());
        }
        if (chiTietHoaDonImeiRepository.findByImeiId(id).isPresent()) {
            throw new IllegalStateException("Phát hiện liên kết hóa đơn bất thường đối với IMEI này!");
        }
        existing.setTrangThai(0); // 0: Trong kho / Có thể sử dụng
        Imei saved = imeiRepository.save(existing);

        // Tự động đồng bộ số lượng tồn kho khả dụng của CTSP
        if (existing.getChiTietSanPham() != null && existing.getChiTietSanPham().getId() != null) {
            Integer ctspId = existing.getChiTietSanPham().getId();
            int availableCount = imeiRepository.countAvailableByChiTietSanPhamId(ctspId);
            chiTietSanPhamRepository.updateSoLuong(ctspId, availableCount);
        }
        return saved;
    }

    @Override
    public List<ImeiResponseDTO> getImeisByCtsp(Integer ctspId) {
        if (ctspId == null) return List.of();
        List<Imei> imeis = imeiRepository.findByChiTietSanPhamId(ctspId);
        List<ChiTietHoaDonImei> cthdImeis = chiTietHoaDonImeiRepository.findAll();
        Map<Integer, ChiTietHoaDonImei> imeiInvoiceMap = new HashMap<>();
        for (ChiTietHoaDonImei link : cthdImeis) {
            if (link.getImei() != null && link.getImei().getId() != null) {
                imeiInvoiceMap.put(link.getImei().getId(), link);
            }
        }

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

        return imeis.stream().map(imei -> {
            ImeiResponseDTO dto = new ImeiResponseDTO();
            dto.setId(imei.getId());
            dto.setSoImei(imei.getSoImei());
            dto.setChiTietSanPham(imei.getChiTietSanPham());
            dto.setTrangThai(imei.getTrangThai());
            dto.setNgayNhap(imei.getNgayNhap());
            if (imei.getNgayNhap() != null) {
                dto.setNgayNhapFormatted(imei.getNgayNhap().format(dtf));
            }

            ChiTietHoaDonImei cthdImei = imeiInvoiceMap.get(imei.getId());
            int st = imei.getTrangThai() != null ? imei.getTrangThai() : 0;
            switch (st) {
                case 0 -> {
                    if (cthdImei != null) {
                        dto.setTenTrangThai("Đang phân bổ");
                        dto.setBadgeClass("badge-info");
                    } else {
                        dto.setTenTrangThai("Trong kho");
                        dto.setBadgeClass("badge-success");
                    }
                }
                case 1 -> {
                    dto.setTenTrangThai("Đã bán");
                    dto.setBadgeClass("badge-secondary");
                }
                case 2 -> {
                    dto.setTenTrangThai("Ngừng sử dụng");
                    dto.setBadgeClass("badge-danger");
                }
                default -> {
                    dto.setTenTrangThai("Khác");
                    dto.setBadgeClass("badge-info");
                }
            }

            if (cthdImei != null && cthdImei.getChiTietHoaDon() != null) {
                ChiTietHoaDon cthd = cthdImei.getChiTietHoaDon();
                HoaDon hd = cthd.getHoaDon();
                if (hd != null) {
                    dto.setIdHoaDon(hd.getId());
                    dto.setMaHoaDon(hd.getMa());
                    dto.setNgayBan(hd.getNgayTao());
                    if (hd.getNgayTao() != null) {
                        dto.setNgayBanFormatted(hd.getNgayTao().format(dtf));
                    }
                    if (hd.getKhachHang() != null) {
                        dto.setTenKhachHang(hd.getKhachHang().getTen());
                        dto.setSoDienThoai(hd.getKhachHang().getDienThoai());
                    } else if (hd.getTenNguoiNhan() != null) {
                        dto.setTenKhachHang(hd.getTenNguoiNhan());
                        dto.setSoDienThoai(hd.getDienThoai());
                    }
                    dto.setTrangThaiHoaDon(hd.getTrangThai());
                }
            }

            return dto;
        }).collect(Collectors.toList());
    }
}
