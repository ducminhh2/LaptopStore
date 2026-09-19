package com.laptopstore.controller;

import com.laptopstore.entity.ChiTietHoaDonImei;
import com.laptopstore.service.ChiTietHoaDonImeiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chi-tiet-hoa-don-imei")
@RequiredArgsConstructor
public class ChiTietHoaDonImeiController {

    private final ChiTietHoaDonImeiService chiTietHoaDonImeiService;

    @GetMapping
    public ResponseEntity<List<ChiTietHoaDonImei>> getAll() {
        return ResponseEntity.ok(chiTietHoaDonImeiService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChiTietHoaDonImei> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(chiTietHoaDonImeiService.getById(id));
    }

    @GetMapping("/chi-tiet-hoa-don/{cthdId}")
    public ResponseEntity<List<ChiTietHoaDonImei>> getByChiTietHoaDon(@PathVariable Integer cthdId) {
        return ResponseEntity.ok(chiTietHoaDonImeiService.getByChiTietHoaDon(cthdId));
    }

    @GetMapping("/imei/{imeiId}")
    public ResponseEntity<ChiTietHoaDonImei> getByImei(@PathVariable Integer imeiId) {
        return ResponseEntity.ok(chiTietHoaDonImeiService.getByImei(imeiId));
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
