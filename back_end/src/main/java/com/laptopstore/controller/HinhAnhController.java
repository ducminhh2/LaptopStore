package com.laptopstore.controller;

import com.laptopstore.entity.HinhAnh;
import com.laptopstore.service.HinhAnhService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hinh-anh")
@RequiredArgsConstructor
public class HinhAnhController {

    private final HinhAnhService hinhAnhService;

    @GetMapping
    public ResponseEntity<List<HinhAnh>> getAll() {
        return ResponseEntity.ok(hinhAnhService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HinhAnh> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(hinhAnhService.getById(id));
    }

    @GetMapping("/san-pham/{sanPhamId}")
    public ResponseEntity<List<HinhAnh>> getBySanPham(@PathVariable Integer sanPhamId) {
        return ResponseEntity.ok(hinhAnhService.getBySanPham(sanPhamId));
    }

    @PostMapping
    public ResponseEntity<HinhAnh> create(@RequestBody HinhAnh hinhAnh) {
        return new ResponseEntity<>(hinhAnhService.create(hinhAnh), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HinhAnh> update(@PathVariable Integer id, @RequestBody HinhAnh hinhAnh) {
        return ResponseEntity.ok(hinhAnhService.update(id, hinhAnh));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        hinhAnhService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
