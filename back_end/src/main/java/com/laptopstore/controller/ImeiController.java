package com.laptopstore.controller;

import com.laptopstore.entity.Imei;
import com.laptopstore.service.ImeiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/imei")
public class ImeiController {

    private final ImeiService imeiService;

    public ImeiController(ImeiService imeiService) {
        this.imeiService = imeiService;
    }

    @GetMapping
    public ResponseEntity<List<Imei>> getAll() {
        return ResponseEntity.ok(imeiService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Imei> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(imeiService.getById(id));
    }

    @GetMapping("/so-imei/{soImei}")
    public ResponseEntity<Imei> getBySoImei(@PathVariable String soImei) {
        return ResponseEntity.ok(imeiService.getBySoImei(soImei));
    }

    @GetMapping("/chi-tiet-san-pham/{ctspId}")
    public ResponseEntity<List<Imei>> getByChiTietSanPham(@PathVariable Integer ctspId) {
        return ResponseEntity.ok(imeiService.getByChiTietSanPham(ctspId));
    }

    @GetMapping("/trang-thai/{trangThai}")
    public ResponseEntity<List<Imei>> getByTrangThai(@PathVariable Integer trangThai) {
        return ResponseEntity.ok(imeiService.getByTrangThai(trangThai));
    }

    @PostMapping
    public ResponseEntity<Imei> create(@RequestBody Imei imei) {
        return new ResponseEntity<>(imeiService.create(imei), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Imei> update(@PathVariable Integer id, @RequestBody Imei imei) {
        return ResponseEntity.ok(imeiService.update(id, imei));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        imeiService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
