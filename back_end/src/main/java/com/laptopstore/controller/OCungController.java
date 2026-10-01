package com.laptopstore.controller;

import com.laptopstore.entity.OCung;
import com.laptopstore.service.OCungService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/o-cung")
@RequiredArgsConstructor
public class OCungController {

    private final OCungService oCungService;

    @GetMapping
    public ResponseEntity<List<OCung>> getAll() {
        return ResponseEntity.ok(oCungService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OCung> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(oCungService.getById(id));
    }

    @PostMapping
    public ResponseEntity<OCung> create(@RequestBody OCung oCung) {
        return new ResponseEntity<>(oCungService.create(oCung), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OCung> update(@PathVariable Integer id, @RequestBody OCung oCung) {
        return ResponseEntity.ok(oCungService.update(id, oCung));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        oCungService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
