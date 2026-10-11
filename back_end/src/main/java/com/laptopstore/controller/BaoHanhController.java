package com.laptopstore.controller;

import com.laptopstore.dto.WarrantyResponseDTO;
import com.laptopstore.dto.WarrantyStatsDTO;
import com.laptopstore.entity.BaoHanh;
import com.laptopstore.service.BaoHanhService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bao-hanh")
@RequiredArgsConstructor
public class BaoHanhController {

    private final BaoHanhService baoHanhService;

    // =========================================================================
    // 1. ADMIN & NHÂN VIÊN ENDPOINTS (DÙNG CHUNG 1 GIAO DIỆN)
    // =========================================================================

    @GetMapping("/admin/thong-ke")
    public ResponseEntity<WarrantyStatsDTO> getAdminWarrantyStats() {
        return ResponseEntity.ok(baoHanhService.getWarrantyStats());
    }

    @GetMapping("/admin/danh-sach")
    public ResponseEntity<List<WarrantyResponseDTO>> getAdminWarrantyList(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) String status) {
        return ResponseEntity.ok(baoHanhService.getAdminWarrantyList(search, status));
    }

    @GetMapping("/admin/{id}")
    public ResponseEntity<WarrantyResponseDTO> getAdminWarrantyDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(baoHanhService.getAdminWarrantyDetail(id));
    }

    @PostMapping("/admin/kich-hoat/{idHoaDon}")
    public ResponseEntity<?> kichHoatBaoHanh(@PathVariable Integer idHoaDon) {
        try {
            List<BaoHanh> list = baoHanhService.kichHoatBaoHanhTheoHoaDon(idHoaDon);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Kích hoạt bảo hành thành công.",
                    "count", list.size(),
                    "data", list
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/admin/dong-bo")
    public ResponseEntity<?> dongBoBaoHanh() {
        try {
            baoHanhService.dongBoBaoHanhChoHoaDonDaHoanThanh();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đã đồng bộ bảo hành cho các hóa đơn hoàn thành."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // =========================================================================
    // 2. KHÁCH HÀNG ENDPOINTS (BẢO HÀNH CỦA TÔI & CHI TIẾT BẢO HÀNH)
    // =========================================================================

    @GetMapping("/my")
    public ResponseEntity<?> getMyWarranties(
            HttpSession session,
            @RequestHeader(value = "X-User-Id", required = false) Integer headerUserId) {
        Integer customerId = resolveUserId(session, headerUserId);
        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập để xem thông tin bảo hành!"));
        }
        return ResponseEntity.ok(baoHanhService.getCustomerWarrantyList(customerId));
    }

    @GetMapping("/my/{id}")
    public ResponseEntity<?> getMyWarrantyDetail(
            @PathVariable Integer id,
            HttpSession session,
            @RequestHeader(value = "X-User-Id", required = false) Integer headerUserId) {
        Integer customerId = resolveUserId(session, headerUserId);
        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập để xem chi tiết bảo hành!"));
        }

        WarrantyResponseDTO dto = baoHanhService.getCustomerWarrantyDetail(id, customerId);
        if (dto == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Bạn không có quyền truy cập thông tin bảo hành này!"));
        }
        return ResponseEntity.ok(dto);
    }

    // =========================================================================
    // 3. EXISTING BASIC CRUD ENDPOINTS
    // =========================================================================

    @GetMapping
    public ResponseEntity<List<BaoHanh>> getAll() {
        return ResponseEntity.ok(baoHanhService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaoHanh> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(baoHanhService.getById(id));
    }

    @GetMapping("/ma-phieu/{maPhieu}")
    public ResponseEntity<BaoHanh> getByMaPhieu(@PathVariable String maPhieu) {
        return ResponseEntity.ok(baoHanhService.getByMaPhieu(maPhieu));
    }

    @GetMapping("/imei/{imeiId}")
    public ResponseEntity<BaoHanh> getByImei(@PathVariable Integer imeiId) {
        return ResponseEntity.ok(baoHanhService.getByImei(imeiId));
    }

    @GetMapping("/tra-cuu/{soImei}")
    public ResponseEntity<BaoHanh> traCuuBaoHanhTheoSoImei(@PathVariable String soImei) {
        return ResponseEntity.ok(baoHanhService.getBySoImei(soImei));
    }

    @PostMapping
    public ResponseEntity<BaoHanh> create(@RequestBody BaoHanh baoHanh) {
        return new ResponseEntity<>(baoHanhService.create(baoHanh), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BaoHanh> update(@PathVariable Integer id, @RequestBody BaoHanh baoHanh) {
        return ResponseEntity.ok(baoHanhService.update(id, baoHanh));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        baoHanhService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // --- Helper resolve user ID ---
    private Integer resolveUserId(HttpSession session, Integer headerUserId) {
        if (session != null) {
            Object idObj = session.getAttribute("CURRENT_USER_ID");
            if (idObj instanceof Integer) {
                return (Integer) idObj;
            }
        }
        return headerUserId;
    }
}
