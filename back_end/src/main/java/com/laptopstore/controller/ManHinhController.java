package com.laptopstore.controller;

import com.laptopstore.entity.ManHinh;
import com.laptopstore.service.ManHinhService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/man-hinh")
public class ManHinhController {

    private final ManHinhService manHinhService;

    public ManHinhController(ManHinhService manHinhService) {
        this.manHinhService = manHinhService;
    }

    @GetMapping
    public ResponseEntity<List<ManHinh>> getAll() {
        return ResponseEntity.ok(manHinhService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ManHinh> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(manHinhService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ManHinh> create(@RequestBody ManHinh manHinh) {
        return new ResponseEntity<>(manHinhService.create(manHinh), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ManHinh> update(@PathVariable Integer id, @RequestBody ManHinh manHinh) {
        return ResponseEntity.ok(manHinhService.update(id, manHinh));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        manHinhService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
