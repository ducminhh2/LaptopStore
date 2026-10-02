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
}
