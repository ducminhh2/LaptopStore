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
}
