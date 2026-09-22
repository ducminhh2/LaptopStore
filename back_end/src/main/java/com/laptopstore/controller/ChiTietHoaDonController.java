package com.laptopstore.controller;

import com.laptopstore.entity.ChiTietHoaDon;
import com.laptopstore.service.ChiTietHoaDonService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chi-tiet-hoa-don")
public class ChiTietHoaDonController {

    private final ChiTietHoaDonService chiTietHoaDonService;

    public ChiTietHoaDonController(ChiTietHoaDonService chiTietHoaDonService) {
        this.chiTietHoaDonService = chiTietHoaDonService;
    }

    @GetMapping
    public ResponseEntity<List<ChiTietHoaDon>> getAll() {
        return ResponseEntity.ok(chiTietHoaDonService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChiTietHoaDon> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(chiTietHoaDonService.getById(id));
    }

    @GetMapping("/hoa-don/{hoaDonId}")
    public ResponseEntity<List<ChiTietHoaDon>> getByHoaDon(@PathVariable Integer hoaDonId) {
        return ResponseEntity.ok(chiTietHoaDonService.getByHoaDon(hoaDonId));
    }

    @PostMapping
    public ResponseEntity<ChiTietHoaDon> create(@RequestBody ChiTietHoaDon chiTietHoaDon) {
        return new ResponseEntity<>(chiTietHoaDonService.create(chiTietHoaDon), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChiTietHoaDon> update(@PathVariable Integer id, @RequestBody ChiTietHoaDon chiTietHoaDon) {
        return ResponseEntity.ok(chiTietHoaDonService.update(id, chiTietHoaDon));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        chiTietHoaDonService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
