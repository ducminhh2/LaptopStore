package com.laptopstore.controller;

import com.laptopstore.entity.Cpu;
import com.laptopstore.service.CpuService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cpu")
public class CpuController {

    private final CpuService cpuService;

    public CpuController(CpuService cpuService) {
        this.cpuService = cpuService;
    }

    @GetMapping
    public ResponseEntity<List<Cpu>> getAll() {
        return ResponseEntity.ok(cpuService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cpu> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(cpuService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Cpu> create(@RequestBody Cpu cpu) {
        return new ResponseEntity<>(cpuService.create(cpu), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cpu> update(@PathVariable Integer id, @RequestBody Cpu cpu) {
        return ResponseEntity.ok(cpuService.update(id, cpu));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        cpuService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
