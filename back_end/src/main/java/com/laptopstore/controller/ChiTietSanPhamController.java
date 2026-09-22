package com.laptopstore.controller;

import com.laptopstore.entity.ChiTietSanPham;
import com.laptopstore.service.ChiTietSanPhamService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chi-tiet-san-pham")
public class ChiTietSanPhamController {

    private final ChiTietSanPhamService chiTietSanPhamService;

    public ChiTietSanPhamController(ChiTietSanPhamService chiTietSanPhamService) {
        this.chiTietSanPhamService = chiTietSanPhamService;
    }

    @GetMapping
    public ResponseEntity<List<ChiTietSanPham>> getAll() {
        return ResponseEntity.ok(chiTietSanPhamService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChiTietSanPham> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(chiTietSanPhamService.getById(id));
    }

    @GetMapping("/ma/{maCtsp}")
    public ResponseEntity<ChiTietSanPham> getByMaCtsp(@PathVariable String maCtsp) {
        return ResponseEntity.ok(chiTietSanPhamService.getByMaCtsp(maCtsp));
    }

    @GetMapping("/san-pham/{sanPhamId}")
    public ResponseEntity<List<ChiTietSanPham>> getBySanPham(@PathVariable Integer sanPhamId) {
        return ResponseEntity.ok(chiTietSanPhamService.getBySanPham(sanPhamId));
    }

    @GetMapping("/trang-thai/{trangThai}")
    public ResponseEntity<List<ChiTietSanPham>> getByTrangThai(@PathVariable Integer trangThai) {
        return ResponseEntity.ok(chiTietSanPhamService.getByTrangThai(trangThai));
    }

    @PostMapping
    public ResponseEntity<ChiTietSanPham> create(@RequestBody ChiTietSanPham chiTietSanPham) {
        return new ResponseEntity<>(chiTietSanPhamService.create(chiTietSanPham), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChiTietSanPham> update(@PathVariable Integer id, @RequestBody ChiTietSanPham chiTietSanPham) {
        return ResponseEntity.ok(chiTietSanPhamService.update(id, chiTietSanPham));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        chiTietSanPhamService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
