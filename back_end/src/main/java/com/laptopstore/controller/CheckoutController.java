package com.laptopstore.controller;

import com.laptopstore.dto.CheckoutResponseDTO;
import com.laptopstore.service.GioHangService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final GioHangService gioHangService;

    @GetMapping
    public ResponseEntity<CheckoutResponseDTO> getCheckoutInfo(
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
                    .body(CheckoutResponseDTO.builder()
                            .success(false)
                            .message("Vui lòng đăng nhập để tiến hành thanh toán!")
                            .build());
        }

        return ResponseEntity.ok(gioHangService.getCheckoutInfo(khachHangId));
    }

    @PostMapping("/apply-voucher")
    public ResponseEntity<com.laptopstore.dto.ApplyVoucherResponse> applyVoucher(
            @RequestBody com.laptopstore.dto.ApplyVoucherRequest request,
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
                    .body(com.laptopstore.dto.ApplyVoucherResponse.builder()
                            .success(false)
                            .message("Vui lòng đăng nhập để sử dụng Voucher!")
                            .build());
        }

        Integer voucherId = request != null ? request.getVoucherId() : null;
        return ResponseEntity.ok(gioHangService.applyVoucher(khachHangId, voucherId));
    }

    @PostMapping("/dat-hang")
    public ResponseEntity<com.laptopstore.dto.DatHangResponse> datHang(
            @RequestBody com.laptopstore.dto.DatHangRequest request,
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
                    .body(com.laptopstore.dto.DatHangResponse.builder()
                            .success(false)
                            .message("Vui lòng đăng nhập để tiến hành đặt hàng!")
                            .build());
        }

        try {
            com.laptopstore.dto.DatHangResponse response = gioHangService.datHangOnline(khachHangId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | com.laptopstore.exception.ResourceNotFoundException e) {
            return ResponseEntity.badRequest()
                    .body(com.laptopstore.dto.DatHangResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(com.laptopstore.dto.DatHangResponse.builder()
                            .success(false)
                            .message("Đã xảy ra lỗi khi xử lý đặt hàng: " + e.getMessage())
                            .build());
        }
    }
}
