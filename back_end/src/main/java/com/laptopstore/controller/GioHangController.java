package com.laptopstore.controller;

import com.laptopstore.dto.CartSyncResponse;
import com.laptopstore.dto.SyncCartRequest;
import com.laptopstore.entity.ChiTietGioHang;
import com.laptopstore.entity.GioHang;
import com.laptopstore.service.GioHangService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gio-hang")
@RequiredArgsConstructor
public class GioHangController {

    private final GioHangService gioHangService;

    @GetMapping
    public ResponseEntity<List<GioHang>> getAll() {
        return ResponseEntity.ok(gioHangService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GioHang> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(gioHangService.getById(id));
    }

    @GetMapping("/khach-hang/{khachHangId}")
    public ResponseEntity<GioHang> getByKhachHang(@PathVariable Integer khachHangId) {
        return ResponseEntity.ok(gioHangService.getByKhachHang(khachHangId));
    }

    @GetMapping("/khach-hang/{khachHangId}/items")
    public ResponseEntity<List<ChiTietGioHang>> getCartItemsByKhachHang(@PathVariable Integer khachHangId) {
        return ResponseEntity.ok(gioHangService.getCartItemsByKhachHang(khachHangId));
    }

    @GetMapping("/checkout")
    public ResponseEntity<com.laptopstore.dto.CheckoutResponseDTO> getCheckout(
            HttpSession session,
            @RequestHeader(value = "X-User-Id", required = false) Integer headerUserId) {
        Integer khachHangId = null;
        if (session != null) {
            khachHangId = (Integer) session.getAttribute("CURRENT_USER_ID");
        }
        if (khachHangId == null && headerUserId != null) {
            khachHangId = headerUserId;
        }
        if (khachHangId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(com.laptopstore.dto.CheckoutResponseDTO.builder()
                            .success(false)
                            .message("Vui lòng đăng nhập để tiến hành thanh toán!")
                            .build());
        }
        return ResponseEntity.ok(gioHangService.getCheckoutInfo(khachHangId));
    }

    @PostMapping("/sync-login-cart")
    public ResponseEntity<CartSyncResponse> syncLoginCart(
            @RequestBody SyncCartRequest request,
            HttpSession session) {
        Integer khachHangId = request.getKhachHangId();
        if (khachHangId == null && session != null) {
            khachHangId = (Integer) session.getAttribute("CURRENT_USER_ID");
        }
        if (khachHangId == null) {
            throw new IllegalArgumentException("Không thể xác định người dùng đang đăng nhập!");
        }
        return ResponseEntity.ok(gioHangService.syncLoginCart(khachHangId, request.getGuestCart()));
    }

    @PostMapping("/khach-hang/{khachHangId}/add")
    public ResponseEntity<List<ChiTietGioHang>> addToDbCart(
            @PathVariable Integer khachHangId,
            @RequestParam Integer ctspId,
            @RequestParam(defaultValue = "1") Integer soLuong) {
        return ResponseEntity.ok(gioHangService.addToDbCart(khachHangId, ctspId, soLuong));
    }

    @PutMapping("/khach-hang/{khachHangId}/item/{chiTietGioHangId}/so-luong/{soLuong}")
    public ResponseEntity<List<ChiTietGioHang>> updateDbCartQuantity(
            @PathVariable Integer khachHangId,
            @PathVariable Integer chiTietGioHangId,
            @PathVariable Integer soLuong) {
        return ResponseEntity.ok(gioHangService.updateDbCartQuantity(khachHangId, chiTietGioHangId, soLuong));
    }

    @DeleteMapping("/khach-hang/{khachHangId}/item/{chiTietGioHangId}")
    public ResponseEntity<List<ChiTietGioHang>> removeDbCartItem(
            @PathVariable Integer khachHangId,
            @PathVariable Integer chiTietGioHangId) {
        return ResponseEntity.ok(gioHangService.removeDbCartItem(khachHangId, chiTietGioHangId));
    }

    @PostMapping
    public ResponseEntity<GioHang> create(@RequestBody GioHang gioHang) {
        return new ResponseEntity<>(gioHangService.create(gioHang), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GioHang> update(@PathVariable Integer id, @RequestBody GioHang gioHang) {
        return ResponseEntity.ok(gioHangService.update(id, gioHang));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        gioHangService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
