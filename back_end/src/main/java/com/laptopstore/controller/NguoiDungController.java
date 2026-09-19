package com.laptopstore.controller;

import com.laptopstore.entity.NguoiDung;
import com.laptopstore.service.NguoiDungService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nguoi-dung")
@RequiredArgsConstructor
public class NguoiDungController {

    private final NguoiDungService nguoiDungService;

    @GetMapping
    public ResponseEntity<List<NguoiDung>> getAll() {
        return ResponseEntity.ok(nguoiDungService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NguoiDung> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(nguoiDungService.getById(id));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<NguoiDung> getByUsername(@PathVariable String username) {
        return ResponseEntity.ok(nguoiDungService.getByUsername(username));
    }

    @GetMapping("/vai-tro/{vaiTroId}")
    public ResponseEntity<List<NguoiDung>> getByVaiTro(@PathVariable Integer vaiTroId) {
        return ResponseEntity.ok(nguoiDungService.getByVaiTro(vaiTroId));
    }

    @PostMapping
    public ResponseEntity<NguoiDung> create(@RequestBody NguoiDung nguoiDung) {
        return new ResponseEntity<>(nguoiDungService.create(nguoiDung), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NguoiDung> update(@PathVariable Integer id, @RequestBody NguoiDung nguoiDung) {
        return ResponseEntity.ok(nguoiDungService.update(id, nguoiDung));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        nguoiDungService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
