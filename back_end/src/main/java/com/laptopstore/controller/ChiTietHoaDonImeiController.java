package com.laptopstore.controller;

import com.laptopstore.entity.ChiTietHoaDonImei;
import com.laptopstore.service.ChiTietHoaDonImeiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chi-tiet-hoa-don-imei")
public class ChiTietHoaDonImeiController {

    private final ChiTietHoaDonImeiService chiTietHoaDonImeiService;

    public ChiTietHoaDonImeiController(ChiTietHoaDonImeiService chiTietHoaDonImeiService) {
        this.chiTietHoaDonImeiService = chiTietHoaDonImeiService;
    }

    @GetMapping
    public ResponseEntity<List<ChiTietHoaDonImei>> getAll() {
        return ResponseEntity.ok(chiTietHoaDonImeiService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChiTietHoaDonImei> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(chiTietHoaDonImeiService.getById(id));
    }

    @GetMapping("/chi-tiet-hoa-don/{chiTietHoaDonId}")
    public ResponseEntity<List<ChiTietHoaDonImei>> getByChiTietHoaDon(@PathVariable Integer chiTietHoaDonId) {
        return ResponseEntity.ok(chiTietHoaDonImeiService.getByChiTietHoaDon(chiTietHoaDonId));
    }

    @PostMapping
    public ResponseEntity<ChiTietHoaDonImei> create(@RequestBody ChiTietHoaDonImei chiTietHoaDonImei) {
        return new ResponseEntity<>(chiTietHoaDonImeiService.create(chiTietHoaDonImei), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        chiTietHoaDonImeiService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
