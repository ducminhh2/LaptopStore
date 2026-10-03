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
    HoaDon updateTrangThai(Integer id, Integer trangThai, String username, Integer nhanVienId);
    HoaDon xacNhanDonHang(Integer id);
    HoaDon xacNhanDonHang(Integer id, Integer nhanVienId);
    HoaDon xacNhanDonHangWithImei(Integer id, com.laptopstore.dto.XacNhanDonHangRequest request, String username, Integer nhanVienId);
    HoaDon giaoHang(Integer id);
    HoaDon giaoHang(Integer id, String username, Integer nhanVienId);
    HoaDon xacNhanGiaoHangVaThuTien(Integer id);
    HoaDon xacNhanGiaoHangVaThuTien(Integer id, String username, Integer nhanVienId);
    HoaDon xacNhanGiaoHangThanhCong(Integer id);
    HoaDon xacNhanGiaoHangThanhCong(Integer id, String username, Integer nhanVienId);
    HoaDon huyHoaDon(Integer id, String lyDo);
    HoaDon huyHoaDon(Integer id, String lyDo, String username, Integer nhanVienId);
    HoaDon huyDonHangKhachHang(Integer id, Integer khachHangId);
    HoaDon posCheckout(com.laptopstore.dto.PosCheckoutRequest request);
    HoaDon thanhToanTaiQuay(Integer id, String username);
    List<com.laptopstore.dto.LichSuHoaDonDTO> getLichSuTrangThaiHoaDon(Integer hoaDonId);
    List<com.laptopstore.dto.LichSuDonHangDTO> getLichSuDonHangKhachHang(Integer khachHangId);
    com.laptopstore.dto.LichSuDonHangDTO getChiTietDonHangKhachHang(Integer hoaDonId, Integer khachHangId);
    void delete(Integer id);
}
