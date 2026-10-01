package com.laptopstore.service;

import com.laptopstore.entity.HoaDon;
import java.util.List;

public interface HoaDonService {
    List<HoaDon> getAll();
    HoaDon getById(Integer id);
    HoaDon getByMa(String ma);
    List<HoaDon> getByKhachHang(Integer khachHangId);
    List<HoaDon> getByNhanVien(Integer nhanVienId);
    List<HoaDon> getByTrangThai(Integer trangThai);
    HoaDon create(HoaDon hoaDon);
    HoaDon update(Integer id, HoaDon hoaDon);
    HoaDon updateTrangThai(Integer id, Integer trangThai);
    HoaDon xacNhanDonHang(Integer id);
    HoaDon xacNhanDonHang(Integer id, Integer nhanVienId);
    HoaDon xacNhanDonHangWithImei(Integer id, com.laptopstore.dto.XacNhanDonHangRequest request, String username, Integer nhanVienId);
    HoaDon giaoHang(Integer id);
    HoaDon xacNhanGiaoHangVaThuTien(Integer id);
    HoaDon xacNhanGiaoHangThanhCong(Integer id);
    HoaDon huyHoaDon(Integer id, String lyDo);
    HoaDon posCheckout(com.laptopstore.dto.PosCheckoutRequest request);
    void delete(Integer id);
}
