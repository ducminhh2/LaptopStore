package com.laptopstore.controller;

import com.laptopstore.entity.ThuongHieu;
import com.laptopstore.service.ThuongHieuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/thuong-hieu")
@RequiredArgsConstructor
public class ThuongHieuController {

    private final ThuongHieuService thuongHieuService;

    @GetMapping
    public ResponseEntity<List<ThuongHieu>> getAll() {
        return ResponseEntity.ok(thuongHieuService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ThuongHieu> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(thuongHieuService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ThuongHieu> create(@RequestBody ThuongHieu thuongHieu) {
        return new ResponseEntity<>(thuongHieuService.create(thuongHieu), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ThuongHieu> update(@PathVariable Integer id, @RequestBody ThuongHieu thuongHieu) {
        return ResponseEntity.ok(thuongHieuService.update(id, thuongHieu));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        thuongHieuService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
