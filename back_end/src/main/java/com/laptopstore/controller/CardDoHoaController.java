package com.laptopstore.controller;

import com.laptopstore.entity.CardDoHoa;
import com.laptopstore.service.CardDoHoaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/card-do-hoa")
@RequiredArgsConstructor
public class CardDoHoaController {

    private final CardDoHoaService cardDoHoaService;

    @GetMapping
    public ResponseEntity<List<CardDoHoa>> getAll() {
        return ResponseEntity.ok(cardDoHoaService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CardDoHoa> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(cardDoHoaService.getById(id));
    }

    @PostMapping
    public ResponseEntity<CardDoHoa> create(@RequestBody CardDoHoa cardDoHoa) {
        return new ResponseEntity<>(cardDoHoaService.create(cardDoHoa), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CardDoHoa> update(@PathVariable Integer id, @RequestBody CardDoHoa cardDoHoa) {
        return ResponseEntity.ok(cardDoHoaService.update(id, cardDoHoa));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        cardDoHoaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
