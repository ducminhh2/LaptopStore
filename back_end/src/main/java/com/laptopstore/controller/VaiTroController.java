package com.laptopstore.controller;

import com.laptopstore.entity.VaiTro;
import com.laptopstore.service.VaiTroService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vai-tro")
public class VaiTroController {

    private final VaiTroService vaiTroService;

    public VaiTroController(VaiTroService vaiTroService) {
        this.vaiTroService = vaiTroService;
    }

    @GetMapping
    public ResponseEntity<List<VaiTro>> getAll() {
        return ResponseEntity.ok(vaiTroService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VaiTro> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(vaiTroService.getById(id));
    }

    @PostMapping
    public ResponseEntity<VaiTro> create(@RequestBody VaiTro vaiTro) {
        return new ResponseEntity<>(vaiTroService.create(vaiTro), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VaiTro> update(@PathVariable Integer id, @RequestBody VaiTro vaiTro) {
        return ResponseEntity.ok(vaiTroService.update(id, vaiTro));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        vaiTroService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
