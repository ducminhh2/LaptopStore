package com.laptopstore.controller;

import com.laptopstore.entity.ThanhToan;
import com.laptopstore.service.ThanhToanService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/thanh-toan")
public class ThanhToanController {

    private final ThanhToanService thanhToanService;

    public ThanhToanController(ThanhToanService thanhToanService) {
        this.thanhToanService = thanhToanService;
    }

    @GetMapping
    public ResponseEntity<List<ThanhToan>> getAll() {
        return ResponseEntity.ok(thanhToanService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ThanhToan> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(thanhToanService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ThanhToan> create(@RequestBody ThanhToan thanhToan) {
        return new ResponseEntity<>(thanhToanService.create(thanhToan), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ThanhToan> update(@PathVariable Integer id, @RequestBody ThanhToan thanhToan) {
        return ResponseEntity.ok(thanhToanService.update(id, thanhToan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        thanhToanService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
