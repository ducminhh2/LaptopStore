package com.laptopstore.controller;

import com.laptopstore.entity.HoaDon;
import com.laptopstore.service.HoaDonService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/don-hang")
@RequiredArgsConstructor
public class DonHangController {

    private final HoaDonService hoaDonService;

    @PostMapping("/{id}/huy")
    public ResponseEntity<?> huyDonHang(
            @PathVariable Integer id,
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
                    .body(Map.of("message", "Vui lòng đăng nhập để thực hiện hủy đơn hàng!"));
        }

        HoaDon hoaDon = hoaDonService.huyDonHangKhachHang(id, khachHangId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Hủy đơn hàng thành công.",
                "idHoaDon", hoaDon.getId(),
                "trangThai", hoaDon.getTrangThai()
        ));
    }
}
