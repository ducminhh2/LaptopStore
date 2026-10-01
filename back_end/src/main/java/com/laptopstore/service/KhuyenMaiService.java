package com.laptopstore.service;

import com.laptopstore.dto.GiaKhuyenMaiResponse;
import com.laptopstore.entity.ChiTietSanPham;
import com.laptopstore.entity.KhuyenMai;
import java.util.List;

public interface KhuyenMaiService {
    List<KhuyenMai> getAll();
    KhuyenMai getById(Integer id);
    KhuyenMai getByMa(String ma);
    KhuyenMai create(KhuyenMai khuyenMai);
    KhuyenMai update(Integer id, KhuyenMai khuyenMai);
    void delete(Integer id);

    // Promotion Management Methods
    List<com.laptopstore.dto.KhuyenMaiResponse> getAllKhuyenMaiResponses();
    com.laptopstore.dto.KhuyenMaiResponse getKhuyenMaiResponseById(Integer id);
    KhuyenMai createWithCtsp(com.laptopstore.dto.KhuyenMaiRequest request);
    KhuyenMai updateWithCtsp(Integer id, com.laptopstore.dto.KhuyenMaiRequest request);
    void updateTrangThai(Integer id, Integer trangThai);

    // Common Promotion Pricing logic
    GiaKhuyenMaiResponse tinhGiaBanHienTai(ChiTietSanPham ctsp);
    GiaKhuyenMaiResponse tinhGiaBanHienTai(Integer ctspId);
    void applyGiaKhuyenMai(ChiTietSanPham ctsp);
    void applyGiaKhuyenMai(List<ChiTietSanPham> list);
}
