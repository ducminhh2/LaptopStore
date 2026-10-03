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

    @GetMapping({"/lich-su/{id}", "/don-hang/{id}"})
    public ResponseEntity<?> getChiTietDonHangKhach(
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
                    .body(Map.of("message", "Vui lòng đăng nhập để xem chi tiết đơn hàng!"));
        }

        LichSuDonHangDTO chiTiet = hoaDonService.getChiTietDonHangKhachHang(id, khachHangId);
        if (chiTiet == null) {
            // Không tìm thấy đơn hàng hoặc đơn hàng không thuộc về người dùng này (Chống IDOR, không leak data)
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Đơn hàng không tồn tại hoặc bạn không có quyền xem đơn hàng này!"));
        }

        return ResponseEntity.ok(chiTiet);
    }

    @PostMapping({"/don-hang/{id}/huy", "/lich-su/{id}/huy"})
    public ResponseEntity<?> huyDonHangKhach(
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

    @GetMapping("/{id}/lich-su-trang-thai")
    public ResponseEntity<List<com.laptopstore.dto.LichSuHoaDonDTO>> getLichSuTrangThai(@PathVariable Integer id) {
        return ResponseEntity.ok(hoaDonService.getLichSuTrangThaiHoaDon(id));
    }

    @PatchMapping("/{id}/trang-thai/{trangThai}")
    public ResponseEntity<HoaDon> updateTrangThai(
            @PathVariable Integer id,
            @PathVariable Integer trangThai,
            @RequestHeader(value = "X-Staff-Username", required = false) String staffUsername,
            @RequestHeader(value = "X-Staff-Id", required = false) Integer staffId) {
        return ResponseEntity.ok(hoaDonService.updateTrangThai(id, trangThai, staffUsername, staffId));
    }

    @PostMapping("/{id}/xac-nhan")
    public ResponseEntity<HoaDon> xacNhanDonHang(
            @PathVariable Integer id,
            @RequestBody(required = false) com.laptopstore.dto.XacNhanDonHangRequest request,
            @RequestHeader(value = "X-Staff-Username", required = false) String staffUsernameHeader,
            @RequestHeader(value = "X-Staff-Id", required = false) Integer staffIdHeader,
            @RequestParam(required = false) Integer nhanVienId) {
        String username = null;
        if (staffUsernameHeader != null && !staffUsernameHeader.isBlank()) {
            username = staffUsernameHeader.trim();
        } else if (request != null && request.getUsername() != null && !request.getUsername().isBlank()) {
            username = request.getUsername().trim();
        }

        Integer nvId = nhanVienId != null ? nhanVienId : staffIdHeader;

        if (request != null && request.getChiTietImei() != null && !request.getChiTietImei().isEmpty()) {
            return ResponseEntity.ok(hoaDonService.xacNhanDonHangWithImei(id, request, username, nvId));
        }

        return ResponseEntity.ok(hoaDonService.xacNhanDonHang(id, nvId));
    }

    @PostMapping("/{id}/giao-hang")
    public ResponseEntity<HoaDon> giaoHang(
            @PathVariable Integer id,
            @RequestHeader(value = "X-Staff-Username", required = false) String staffUsername,
            @RequestHeader(value = "X-Staff-Id", required = false) Integer staffId) {
        return ResponseEntity.ok(hoaDonService.giaoHang(id, staffUsername, staffId));
    }

    @PostMapping("/{id}/xac-nhan-giao-va-thu-tien")
    public ResponseEntity<HoaDon> xacNhanGiaoHangVaThuTien(
            @PathVariable Integer id,
            @RequestHeader(value = "X-Staff-Username", required = false) String staffUsername,
            @RequestHeader(value = "X-Staff-Id", required = false) Integer staffId) {
        return ResponseEntity.ok(hoaDonService.xacNhanGiaoHangVaThuTien(id, staffUsername, staffId));
    }

    @PostMapping("/{id}/xac-nhan-giao-thanh-cong")
    public ResponseEntity<HoaDon> xacNhanGiaoHangThanhCong(
            @PathVariable Integer id,
            @RequestHeader(value = "X-Staff-Username", required = false) String staffUsername,
            @RequestHeader(value = "X-Staff-Id", required = false) Integer staffId) {
        return ResponseEntity.ok(hoaDonService.xacNhanGiaoHangThanhCong(id, staffUsername, staffId));
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
            @RequestParam(required = false, defaultValue = "Khách hàng / Nhân viên yêu cầu hủy đơn") String lyDo,
            @RequestHeader(value = "X-Staff-Username", required = false) String staffUsername,
            @RequestHeader(value = "X-Staff-Id", required = false) Integer staffId) {
        return ResponseEntity.ok(hoaDonService.huyHoaDon(id, lyDo, staffUsername, staffId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        hoaDonService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
