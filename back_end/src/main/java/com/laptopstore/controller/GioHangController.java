package com.laptopstore.controller;

import com.laptopstore.entity.GioHang;
import com.laptopstore.service.GioHangService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gio-hang")
public class GioHangController {

    private final GioHangService gioHangService;

    public GioHangController(GioHangService gioHangService) {
        this.gioHangService = gioHangService;
    }

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
