package com.laptopstore.controller;

import com.laptopstore.entity.KhuyenMai;
import com.laptopstore.service.KhuyenMaiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/khuyen-mai")
@RequiredArgsConstructor
public class KhuyenMaiController {

    private final KhuyenMaiService khuyenMaiService;

    @GetMapping
    public ResponseEntity<List<com.laptopstore.dto.KhuyenMaiResponse>> getAll() {
        return ResponseEntity.ok(khuyenMaiService.getAllKhuyenMaiResponses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.laptopstore.dto.KhuyenMaiResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(khuyenMaiService.getKhuyenMaiResponseById(id));
    }

    @GetMapping("/ma/{ma}")
    public ResponseEntity<KhuyenMai> getByMa(@PathVariable String ma) {
        return ResponseEntity.ok(khuyenMaiService.getByMa(ma));
    }

    @GetMapping({"/gia/{ctspId}", "/ctsp/{ctspId}/gia"})
    public ResponseEntity<com.laptopstore.dto.GiaKhuyenMaiResponse> getGiaKhuyenMai(@PathVariable Integer ctspId) {
        return ResponseEntity.ok(khuyenMaiService.tinhGiaBanHienTai(ctspId));
    }

    @PostMapping
    public ResponseEntity<KhuyenMai> create(@RequestBody com.laptopstore.dto.KhuyenMaiRequest request) {
        return new ResponseEntity<>(khuyenMaiService.createWithCtsp(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<KhuyenMai> update(@PathVariable Integer id, @RequestBody com.laptopstore.dto.KhuyenMaiRequest request) {
        return ResponseEntity.ok(khuyenMaiService.updateWithCtsp(id, request));
    }

    @PatchMapping("/{id}/trang-thai")
    public ResponseEntity<Void> updateTrangThai(@PathVariable Integer id, @RequestParam Integer trangThai) {
        khuyenMaiService.updateTrangThai(id, trangThai);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        khuyenMaiService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
