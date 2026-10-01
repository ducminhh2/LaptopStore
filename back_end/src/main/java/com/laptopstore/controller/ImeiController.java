package com.laptopstore.controller;

import com.laptopstore.dto.ThemImeiRequest;
import com.laptopstore.entity.Imei;
import com.laptopstore.service.ImeiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/imei")
@RequiredArgsConstructor
public class ImeiController {

    private final ImeiService imeiService;

    @GetMapping
    public ResponseEntity<List<Imei>> getAll() {
        return ResponseEntity.ok(imeiService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Imei> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(imeiService.getById(id));
    }

    @GetMapping("/so-imei/{soImei}")
    public ResponseEntity<Imei> getBySoImei(@PathVariable String soImei) {
        return ResponseEntity.ok(imeiService.getBySoImei(soImei));
    }

    @GetMapping("/chi-tiet-san-pham/{ctspId}")
    public ResponseEntity<List<Imei>> getByChiTietSanPham(@PathVariable Integer ctspId) {
        return ResponseEntity.ok(imeiService.getByChiTietSanPham(ctspId));
    }

    @GetMapping("/chi-tiet-san-pham/{ctspId}/trang-thai/{trangThai}")
    public ResponseEntity<List<Imei>> getByChiTietSanPhamAndTrangThai(
            @PathVariable Integer ctspId, @PathVariable Integer trangThai) {
        return ResponseEntity.ok(imeiService.getByChiTietSanPhamAndTrangThai(ctspId, trangThai));
    }

    @GetMapping("/trang-thai/{trangThai}")
    public ResponseEntity<List<Imei>> getByTrangThai(@PathVariable Integer trangThai) {
        return ResponseEntity.ok(imeiService.getByTrangThai(trangThai));
    }

    @PostMapping
    public ResponseEntity<Imei> create(@RequestBody Imei imei) {
        return new ResponseEntity<>(imeiService.create(imei), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Imei> update(@PathVariable Integer id, @RequestBody Imei imei) {
        return ResponseEntity.ok(imeiService.update(id, imei));
    }

    @PatchMapping("/{id}/trang-thai/{trangThai}")
    public ResponseEntity<Imei> updateTrangThai(@PathVariable Integer id, @PathVariable Integer trangThai) {
        return ResponseEntity.ok(imeiService.updateTrangThai(id, trangThai));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        imeiService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check-exists")
    public ResponseEntity<Boolean> checkExists(@RequestParam("soImei") String soImei) {
        return ResponseEntity.ok(imeiService.existsBySoImei(soImei));
    }

    @PostMapping("/check-existing")
    public ResponseEntity<List<String>> checkExisting(@RequestBody List<String> soImeis) {
        return ResponseEntity.ok(imeiService.findExistingImeis(soImeis));
    }

    @PostMapping(value = {"/them-nhieu", "/add-bulk"})
    public ResponseEntity<Map<String, Object>> addImeisToCtsp(@RequestBody ThemImeiRequest request) {
        return new ResponseEntity<>(imeiService.addImeisToCtsp(request), HttpStatus.CREATED);
    }

    @GetMapping({"/available", "/kha-dung", "/chi-tiet-san-pham/{ctspId}/kha-dung"})
    public ResponseEntity<List<Imei>> getAvailableImeis(
            @PathVariable(value = "ctspId", required = false) Integer pathCtspId,
            @RequestParam(value = "ctspId", required = false) Integer queryCtspId,
            @RequestParam(value = "idChiTietSanPham", required = false) Integer idChiTietSanPham) {
        Integer targetCtspId = pathCtspId != null ? pathCtspId : (queryCtspId != null ? queryCtspId : idChiTietSanPham);
        if (targetCtspId == null) {
            throw new IllegalArgumentException("Vui lòng cung cấp id chi tiết sản phẩm (ctspId)");
        }
        return ResponseEntity.ok(imeiService.getAvailableByChiTietSanPham(targetCtspId));
    }
}
