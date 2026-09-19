package com.laptopstore.controller;

import com.laptopstore.entity.HoaDon;
import com.laptopstore.service.HoaDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hoa-don")
@RequiredArgsConstructor
public class HoaDonController {

    private final HoaDonService hoaDonService;

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

    @PutMapping("/{id}")
    public ResponseEntity<HoaDon> update(@PathVariable Integer id, @RequestBody HoaDon hoaDon) {
        return ResponseEntity.ok(hoaDonService.update(id, hoaDon));
    }

    @PatchMapping("/{id}/trang-thai/{trangThai}")
    public ResponseEntity<HoaDon> updateTrangThai(@PathVariable Integer id, @PathVariable Integer trangThai) {
        return ResponseEntity.ok(hoaDonService.updateTrangThai(id, trangThai));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        hoaDonService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
