package com.laptopstore.controller;

import com.laptopstore.entity.ChiTietKhuyenMai;
import com.laptopstore.service.ChiTietKhuyenMaiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chi-tiet-khuyen-mai")
@RequiredArgsConstructor
public class ChiTietKhuyenMaiController {

    private final ChiTietKhuyenMaiService chiTietKhuyenMaiService;

    @GetMapping
    public ResponseEntity<List<ChiTietKhuyenMai>> getAll() {
        return ResponseEntity.ok(chiTietKhuyenMaiService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChiTietKhuyenMai> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(chiTietKhuyenMaiService.getById(id));
    }

    @GetMapping("/khuyen-mai/{khuyenMaiId}")
    public ResponseEntity<List<ChiTietKhuyenMai>> getByKhuyenMai(@PathVariable Integer khuyenMaiId) {
        return ResponseEntity.ok(chiTietKhuyenMaiService.getByKhuyenMai(khuyenMaiId));
    }

    @GetMapping("/san-pham/{sanPhamId}")
    public ResponseEntity<List<ChiTietKhuyenMai>> getBySanPham(@PathVariable Integer sanPhamId) {
        return ResponseEntity.ok(chiTietKhuyenMaiService.getBySanPham(sanPhamId));
    }

    @PostMapping
    public ResponseEntity<ChiTietKhuyenMai> create(@RequestBody ChiTietKhuyenMai chiTietKhuyenMai) {
        return new ResponseEntity<>(chiTietKhuyenMaiService.create(chiTietKhuyenMai), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        chiTietKhuyenMaiService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
