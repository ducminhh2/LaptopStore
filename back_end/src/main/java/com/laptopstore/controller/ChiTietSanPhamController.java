package com.laptopstore.controller;

import com.laptopstore.entity.ChiTietSanPham;
import com.laptopstore.service.ChiTietSanPhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.laptopstore.dto.ChiTietSanPhamCreateRequest;

@RestController
@RequestMapping("/api/chi-tiet-san-pham")
@RequiredArgsConstructor
public class ChiTietSanPhamController {

    private final ChiTietSanPhamService chiTietSanPhamService;

    @GetMapping
    public ResponseEntity<List<ChiTietSanPham>> getAll() {
        return ResponseEntity.ok(chiTietSanPhamService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChiTietSanPham> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(chiTietSanPhamService.getById(id));
    }

    @GetMapping("/ma/{maCtsp}")
    public ResponseEntity<ChiTietSanPham> getByMaCtsp(@PathVariable String maCtsp) {
        return ResponseEntity.ok(chiTietSanPhamService.getByMaCtsp(maCtsp));
    }

    @GetMapping("/san-pham/{sanPhamId}")
    public ResponseEntity<List<ChiTietSanPham>> getBySanPham(@PathVariable Integer sanPhamId) {
        return ResponseEntity.ok(chiTietSanPhamService.getBySanPham(sanPhamId));
    }

    @GetMapping("/trang-thai/{trangThai}")
    public ResponseEntity<List<ChiTietSanPham>> getByTrangThai(@PathVariable Integer trangThai) {
        return ResponseEntity.ok(chiTietSanPhamService.getByTrangThai(trangThai));
    }

    @PostMapping
    public ResponseEntity<ChiTietSanPham> create(@RequestBody ChiTietSanPhamCreateRequest request) {
        if (request.getDanhSachImei() != null || (request.getSoLuong() != null && request.getSoLuong() > 0)) {
            return new ResponseEntity<>(chiTietSanPhamService.createWithImeis(request), HttpStatus.CREATED);
        }
        ChiTietSanPham ctsp = new ChiTietSanPham();
        ctsp.setMaCtsp(request.getMaCtsp());
        ctsp.setGia(request.getGia());
        ctsp.setSoLuong(request.getSoLuong() != null ? request.getSoLuong() : 0);
        ctsp.setMoTa(request.getMoTa());
        ctsp.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : 1);
        if (request.getIdSanPham() != null) {
            ctsp.setSanPham(com.laptopstore.entity.SanPham.builder().id(request.getIdSanPham()).build());
        } else if (request.getSanPham() != null) {
            ctsp.setSanPham(request.getSanPham());
        }
        if (request.getIdCpu() != null) ctsp.setCpu(com.laptopstore.entity.Cpu.builder().id(request.getIdCpu()).build());
        else if (request.getCpu() != null) ctsp.setCpu(request.getCpu());
        if (request.getIdRam() != null) ctsp.setRam(com.laptopstore.entity.Ram.builder().id(request.getIdRam()).build());
        else if (request.getRam() != null) ctsp.setRam(request.getRam());
        if (request.getIdOCung() != null) ctsp.setOCung(com.laptopstore.entity.OCung.builder().id(request.getIdOCung()).build());
        else if (request.getOCung() != null) ctsp.setOCung(request.getOCung());
        if (request.getIdCardDoHoa() != null) ctsp.setCardDoHoa(com.laptopstore.entity.CardDoHoa.builder().id(request.getIdCardDoHoa()).build());
        else if (request.getCardDoHoa() != null) ctsp.setCardDoHoa(request.getCardDoHoa());
        if (request.getIdManHinh() != null) ctsp.setManHinh(com.laptopstore.entity.ManHinh.builder().id(request.getIdManHinh()).build());
        else if (request.getManHinh() != null) ctsp.setManHinh(request.getManHinh());
        if (request.getIdMauSac() != null) ctsp.setMauSac(com.laptopstore.entity.MauSac.builder().id(request.getIdMauSac()).build());
        else if (request.getMauSac() != null) ctsp.setMauSac(request.getMauSac());

        return new ResponseEntity<>(chiTietSanPhamService.create(ctsp), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChiTietSanPham> update(@PathVariable Integer id, @RequestBody ChiTietSanPham chiTietSanPham) {
        return ResponseEntity.ok(chiTietSanPhamService.update(id, chiTietSanPham));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        chiTietSanPhamService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
