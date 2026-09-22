package com.laptopstore.controller;

import com.laptopstore.entity.KhuyenMai;
import com.laptopstore.service.KhuyenMaiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/khuyen-mai")
public class KhuyenMaiController {

    private final KhuyenMaiService khuyenMaiService;

    public KhuyenMaiController(KhuyenMaiService khuyenMaiService) {
        this.khuyenMaiService = khuyenMaiService;
    }

    @GetMapping
    public ResponseEntity<List<KhuyenMai>> getAll() {
        return ResponseEntity.ok(khuyenMaiService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<KhuyenMai> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(khuyenMaiService.getById(id));
    }

    @GetMapping("/ma/{ma}")
    public ResponseEntity<KhuyenMai> getByMa(@PathVariable String ma) {
        return ResponseEntity.ok(khuyenMaiService.getByMa(ma));
    }

    @PostMapping
    public ResponseEntity<KhuyenMai> create(@RequestBody KhuyenMai khuyenMai) {
        return new ResponseEntity<>(khuyenMaiService.create(khuyenMai), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<KhuyenMai> update(@PathVariable Integer id, @RequestBody KhuyenMai khuyenMai) {
        return ResponseEntity.ok(khuyenMaiService.update(id, khuyenMai));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        khuyenMaiService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
