package com.laptopstore.controller;

import com.laptopstore.entity.Ram;
import com.laptopstore.service.RamService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ram")
public class RamController {

    private final RamService ramService;

    public RamController(RamService ramService) {
        this.ramService = ramService;
    }

    @GetMapping
    public ResponseEntity<List<Ram>> getAll() {
        return ResponseEntity.ok(ramService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ram> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ramService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Ram> create(@RequestBody Ram ram) {
        return new ResponseEntity<>(ramService.create(ram), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ram> update(@PathVariable Integer id, @RequestBody Ram ram) {
        return ResponseEntity.ok(ramService.update(id, ram));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        ramService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
