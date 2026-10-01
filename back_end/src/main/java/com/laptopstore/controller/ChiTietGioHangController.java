package com.laptopstore.controller;

import com.laptopstore.entity.ChiTietGioHang;
import com.laptopstore.service.ChiTietGioHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chi-tiet-gio-hang")
@RequiredArgsConstructor
public class ChiTietGioHangController {

    private final ChiTietGioHangService chiTietGioHangService;

    @GetMapping
    public ResponseEntity<List<ChiTietGioHang>> getAll() {
        return ResponseEntity.ok(chiTietGioHangService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChiTietGioHang> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(chiTietGioHangService.getById(id));
    }

    @GetMapping("/gio-hang/{gioHangId}")
    public ResponseEntity<List<ChiTietGioHang>> getByGioHang(@PathVariable Integer gioHangId) {
        return ResponseEntity.ok(chiTietGioHangService.getByGioHang(gioHangId));
    }

    @PostMapping
    public ResponseEntity<ChiTietGioHang> addToCart(@RequestBody ChiTietGioHang chiTietGioHang) {
        return new ResponseEntity<>(chiTietGioHangService.addToCart(chiTietGioHang), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/so-luong/{soLuong}")
    public ResponseEntity<ChiTietGioHang> updateQuantity(
            @PathVariable Integer id, @PathVariable Integer soLuong) {
        return ResponseEntity.ok(chiTietGioHangService.updateQuantity(id, soLuong));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        chiTietGioHangService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/gio-hang/{gioHangId}/clear")
    public ResponseEntity<Void> clearCart(@PathVariable Integer gioHangId) {
        chiTietGioHangService.clearCart(gioHangId);
        return ResponseEntity.noContent().build();
    }
}
