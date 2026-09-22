package com.laptopstore.controller;

import com.laptopstore.entity.HinhAnhChiTiet;
import com.laptopstore.service.HinhAnhChiTietService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hinh-anh-chi-tiet")
public class HinhAnhChiTietController {

    private final HinhAnhChiTietService hinhAnhChiTietService;

    public HinhAnhChiTietController(HinhAnhChiTietService hinhAnhChiTietService) {
        this.hinhAnhChiTietService = hinhAnhChiTietService;
    }

    @GetMapping
    public ResponseEntity<List<HinhAnhChiTiet>> getAll() {
        return ResponseEntity.ok(hinhAnhChiTietService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HinhAnhChiTiet> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(hinhAnhChiTietService.getById(id));
    }

    @GetMapping("/chi-tiet-san-pham/{ctspId}")
    public ResponseEntity<List<HinhAnhChiTiet>> getByChiTietSanPham(@PathVariable Integer ctspId) {
        return ResponseEntity.ok(hinhAnhChiTietService.getByChiTietSanPham(ctspId));
    }

    @PostMapping
    public ResponseEntity<HinhAnhChiTiet> create(@RequestBody HinhAnhChiTiet hinhAnhChiTiet) {
        return new ResponseEntity<>(hinhAnhChiTietService.create(hinhAnhChiTiet), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        hinhAnhChiTietService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
