package com.laptopstore.controller;

import com.laptopstore.entity.SanPham;
import com.laptopstore.service.SanPhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/san-pham")
@RequiredArgsConstructor
public class SanPhamController {

    private final SanPhamService sanPhamService;

    @GetMapping
    public ResponseEntity<List<SanPham>> getAll() {
        return ResponseEntity.ok(sanPhamService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SanPham> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(sanPhamService.getById(id));
    }

    @GetMapping("/ma/{maSp}")
    public ResponseEntity<SanPham> getByMaSp(@PathVariable String maSp) {
        return ResponseEntity.ok(sanPhamService.getByMaSp(maSp));
    }

    @GetMapping("/danh-muc/{danhMucId}")
    public ResponseEntity<List<SanPham>> getByDanhMuc(@PathVariable Integer danhMucId) {
        return ResponseEntity.ok(sanPhamService.getByDanhMuc(danhMucId));
    }

    @GetMapping("/thuong-hieu/{thuongHieuId}")
    public ResponseEntity<List<SanPham>> getByThuongHieu(@PathVariable Integer thuongHieuId) {
        return ResponseEntity.ok(sanPhamService.getByThuongHieu(thuongHieuId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<SanPham>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(sanPhamService.search(keyword));
    }

    @PostMapping
    public ResponseEntity<SanPham> create(@RequestBody SanPham sanPham) {
        return new ResponseEntity<>(sanPhamService.create(sanPham), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SanPham> update(@PathVariable Integer id, @RequestBody SanPham sanPham) {
        return ResponseEntity.ok(sanPhamService.update(id, sanPham));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        sanPhamService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
