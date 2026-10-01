package com.laptopstore.service.impl;

import com.laptopstore.dto.ThemImeiRequest;
import com.laptopstore.entity.ChiTietSanPham;
import com.laptopstore.entity.Imei;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.ChiTietSanPhamRepository;
import com.laptopstore.repository.ImeiRepository;
import com.laptopstore.service.ImeiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ImeiServiceImpl implements ImeiService {

    private final ImeiRepository imeiRepository;
    private final ChiTietSanPhamRepository chiTietSanPhamRepository;

    @Override
    public List<Imei> getAll() {
        return imeiRepository.findAll();
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
    public Imei updateTrangThai(Integer id, Integer trangThai) {
        Imei existing = getById(id);
        existing.setTrangThai(trangThai);
        return imeiRepository.save(existing);
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
}
