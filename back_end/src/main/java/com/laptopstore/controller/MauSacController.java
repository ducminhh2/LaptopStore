package com.laptopstore.controller;

import com.laptopstore.entity.MauSac;
import com.laptopstore.service.MauSacService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mau-sac")
public class MauSacController {

    private final MauSacService mauSacService;

    public MauSacController(MauSacService mauSacService) {
        this.mauSacService = mauSacService;
    }

    @GetMapping
    public ResponseEntity<List<MauSac>> getAll() {
        return ResponseEntity.ok(mauSacService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MauSac> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(mauSacService.getById(id));
    }

    @PostMapping
    public ResponseEntity<MauSac> create(@RequestBody MauSac mauSac) {
        return new ResponseEntity<>(mauSacService.create(mauSac), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MauSac> update(@PathVariable Integer id, @RequestBody MauSac mauSac) {
        return ResponseEntity.ok(mauSacService.update(id, mauSac));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        mauSacService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
