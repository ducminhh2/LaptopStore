package com.laptopstore.controller;

import com.laptopstore.dto.LichSuDonHangDTO;
import com.laptopstore.entity.HoaDon;
import com.laptopstore.service.HoaDonService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hoa-don")
@RequiredArgsConstructor
public class HoaDonController {

    private final HoaDonService hoaDonService;

    @GetMapping("/lich-su")
    public ResponseEntity<?> getLichSuDonHang(
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
                    .body(Map.of("message", "Vui lòng đăng nhập để xem lịch sử đơn hàng!"));
        }

        List<LichSuDonHangDTO> lichSu = hoaDonService.getLichSuDonHangKhachHang(khachHangId);
        return ResponseEntity.ok(lichSu);
    }

    @GetMapping
    public ResponseEntity<List<HoaDon>> getAll() {
        return ResponseEntity.ok(hoaDonService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HoaDon> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(hoaDonService.getById(id));
    }

    @GetMapping("/ma/{ma}")
    public ResponseEntity<HoaDon> getByMa(@PathVariable String ma) {
        return ResponseEntity.ok(hoaDonService.getByMa(ma));
    }

    @GetMapping("/khach-hang/{khachHangId}")
    public ResponseEntity<List<HoaDon>> getByKhachHang(@PathVariable Integer khachHangId) {
        return ResponseEntity.ok(hoaDonService.getByKhachHang(khachHangId));
    }

    @GetMapping("/nhan-vien/{nhanVienId}")
    public ResponseEntity<List<HoaDon>> getByNhanVien(@PathVariable Integer nhanVienId) {
        return ResponseEntity.ok(hoaDonService.getByNhanVien(nhanVienId));
    }

    @GetMapping("/trang-thai/{trangThai}")
    public ResponseEntity<List<HoaDon>> getByTrangThai(@PathVariable Integer trangThai) {
        return ResponseEntity.ok(hoaDonService.getByTrangThai(trangThai));
    }

    @PostMapping
    public ResponseEntity<HoaDon> create(@RequestBody HoaDon hoaDon) {
        return new ResponseEntity<>(hoaDonService.create(hoaDon), HttpStatus.CREATED);
    }

    @PostMapping("/pos-checkout")
    public ResponseEntity<HoaDon> posCheckout(@RequestBody com.laptopstore.dto.PosCheckoutRequest request) {
        return new ResponseEntity<>(hoaDonService.posCheckout(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HoaDon> update(@PathVariable Integer id, @RequestBody HoaDon hoaDon) {
        return ResponseEntity.ok(hoaDonService.update(id, hoaDon));
    }

    @PatchMapping("/{id}/trang-thai/{trangThai}")
    public ResponseEntity<HoaDon> updateTrangThai(@PathVariable Integer id, @PathVariable Integer trangThai) {
        return ResponseEntity.ok(hoaDonService.updateTrangThai(id, trangThai));
    }

    @PostMapping("/{id}/xac-nhan")
    public ResponseEntity<HoaDon> xacNhanDonHang(
            @PathVariable Integer id,
            @RequestBody(required = false) com.laptopstore.dto.XacNhanDonHangRequest request,
            @RequestHeader(value = "X-Staff-Username", required = false) String staffUsernameHeader,
            @RequestParam(required = false) Integer nhanVienId) {
        String username = null;
        if (staffUsernameHeader != null && !staffUsernameHeader.isBlank()) {
            username = staffUsernameHeader.trim();
        } else if (request != null && request.getUsername() != null && !request.getUsername().isBlank()) {
            username = request.getUsername().trim();
        }

        if (request != null && request.getChiTietImei() != null && !request.getChiTietImei().isEmpty()) {
            return ResponseEntity.ok(hoaDonService.xacNhanDonHangWithImei(id, request, username, nhanVienId));
        }

        return ResponseEntity.ok(hoaDonService.xacNhanDonHang(id, nhanVienId));
    }

    @PostMapping("/{id}/giao-hang")
    public ResponseEntity<HoaDon> giaoHang(@PathVariable Integer id) {
        return ResponseEntity.ok(hoaDonService.giaoHang(id));
    }

    @PostMapping("/{id}/xac-nhan-giao-va-thu-tien")
    public ResponseEntity<HoaDon> xacNhanGiaoHangVaThuTien(@PathVariable Integer id) {
        return ResponseEntity.ok(hoaDonService.xacNhanGiaoHangVaThuTien(id));
    }

    @PostMapping("/{id}/xac-nhan-giao-thanh-cong")
    public ResponseEntity<HoaDon> xacNhanGiaoHangThanhCong(@PathVariable Integer id) {
        return ResponseEntity.ok(hoaDonService.xacNhanGiaoHangThanhCong(id));
    }

    @PostMapping("/{id}/thanh-toan-tai-quay")
    public ResponseEntity<HoaDon> thanhToanTaiQuay(
            @PathVariable Integer id,
            @RequestHeader(value = "X-Staff-Username", required = false) String staffUsername) {
        return ResponseEntity.ok(hoaDonService.thanhToanTaiQuay(id, staffUsername));
    }

    @PostMapping("/{id}/huy")
    public ResponseEntity<HoaDon> huyHoaDon(
            @PathVariable Integer id,
            @RequestParam(required = false, defaultValue = "Khách hàng / Nhân viên yêu cầu hủy đơn") String lyDo) {
        return ResponseEntity.ok(hoaDonService.huyHoaDon(id, lyDo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        hoaDonService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
