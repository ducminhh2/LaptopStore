package com.laptopstore.controller;

import com.laptopstore.entity.BaoHanh;
import com.laptopstore.service.BaoHanhService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bao-hanh")
public class BaoHanhController {

    private final BaoHanhService baoHanhService;

    public BaoHanhController(BaoHanhService baoHanhService) {
        this.baoHanhService = baoHanhService;
    }

    @GetMapping
    public ResponseEntity<List<BaoHanh>> getAll() {
        return ResponseEntity.ok(baoHanhService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaoHanh> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(baoHanhService.getById(id));
    }

    @GetMapping("/ma-phieu/{maPhieu}")
    public ResponseEntity<BaoHanh> getByMaPhieu(@PathVariable String maPhieu) {
        return ResponseEntity.ok(baoHanhService.getByMaPhieu(maPhieu));
    }

    @GetMapping("/imei/{imeiId}")
    public ResponseEntity<BaoHanh> getByImei(@PathVariable Integer imeiId) {
        return ResponseEntity.ok(baoHanhService.getByImei(imeiId));
    }

    @GetMapping("/tra-cuu/{soImei}")
    public ResponseEntity<BaoHanh> traCuuBaoHanhTheoSoImei(@PathVariable String soImei) {
        return ResponseEntity.ok(baoHanhService.getBySoImei(soImei));
    }

    @PostMapping
    public ResponseEntity<BaoHanh> create(@RequestBody BaoHanh baoHanh) {
        return new ResponseEntity<>(baoHanhService.create(baoHanh), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BaoHanh> update(@PathVariable Integer id, @RequestBody BaoHanh baoHanh) {
        return ResponseEntity.ok(baoHanhService.update(id, baoHanh));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        baoHanhService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
