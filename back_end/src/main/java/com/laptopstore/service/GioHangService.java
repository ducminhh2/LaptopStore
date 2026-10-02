package com.laptopstore.service;

import com.laptopstore.dto.CartSyncResponse;
import com.laptopstore.dto.GuestCartItemRequest;
import com.laptopstore.entity.ChiTietGioHang;
import com.laptopstore.entity.GioHang;
import java.util.List;

public interface GioHangService {
    List<GioHang> getAll();
    GioHang getById(Integer id);
    GioHang getByKhachHang(Integer khachHangId);
    GioHang create(GioHang gioHang);
    GioHang update(Integer id, GioHang gioHang);
    void delete(Integer id);

    CartSyncResponse syncLoginCart(Integer khachHangId, List<GuestCartItemRequest> guestCartItems);
    List<ChiTietGioHang> getCartItemsByKhachHang(Integer khachHangId);
    List<ChiTietGioHang> addToDbCart(Integer khachHangId, Integer ctspId, Integer soLuong);
    List<ChiTietGioHang> updateDbCartQuantity(Integer khachHangId, Integer chiTietGioHangId, Integer soLuong);
    List<ChiTietGioHang> removeDbCartItem(Integer khachHangId, Integer chiTietGioHangId);
    com.laptopstore.dto.CheckoutResponseDTO getCheckoutInfo(Integer khachHangId);
    com.laptopstore.dto.ApplyVoucherResponse applyVoucher(Integer khachHangId, Integer voucherId);
}
