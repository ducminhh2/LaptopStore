package com.laptopstore.controller;

import com.laptopstore.entity.HinhAnh;
import com.laptopstore.service.HinhAnhService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hinh-anh")
public class HinhAnhController {

    private final HinhAnhService hinhAnhService;

    public HinhAnhController(HinhAnhService hinhAnhService) {
        this.hinhAnhService = hinhAnhService;
    }

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        hinhAnhService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
