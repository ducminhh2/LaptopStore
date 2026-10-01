package com.laptopstore.controller;

import com.laptopstore.entity.DanhMuc;
import com.laptopstore.service.DanhMucService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/danh-muc")
@RequiredArgsConstructor
public class DanhMucController {

    private final DanhMucService danhMucService;

    @GetMapping
    public ResponseEntity<List<DanhMuc>> getAll() {
        return ResponseEntity.ok(danhMucService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DanhMuc> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(danhMucService.getById(id));
    }

    @PostMapping
    public ResponseEntity<DanhMuc> create(@RequestBody DanhMuc danhMuc) {
        return new ResponseEntity<>(danhMucService.create(danhMuc), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DanhMuc> update(@PathVariable Integer id, @RequestBody DanhMuc danhMuc) {
        return ResponseEntity.ok(danhMucService.update(id, danhMuc));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        danhMucService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
