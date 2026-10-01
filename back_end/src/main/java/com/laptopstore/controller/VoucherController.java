package com.laptopstore.controller;

import com.laptopstore.dto.VoucherRequest;
import com.laptopstore.dto.VoucherResponse;
import com.laptopstore.entity.Voucher;
import com.laptopstore.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping
    public ResponseEntity<List<VoucherResponse>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String statusFilter
    ) {
        return ResponseEntity.ok(voucherService.getAllVouchers(keyword, statusFilter));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VoucherResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(voucherService.getVoucherById(id));
    }

    @GetMapping("/ma/{ma}")
    public ResponseEntity<VoucherResponse> getByMa(@PathVariable String ma) {
        return ResponseEntity.ok(voucherService.getVoucherByMa(ma));
    }

    @PostMapping
    public ResponseEntity<Voucher> create(@RequestBody VoucherRequest request) {
        return new ResponseEntity<>(voucherService.createVoucher(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Voucher> update(@PathVariable Integer id, @RequestBody VoucherRequest request) {
        return ResponseEntity.ok(voucherService.updateVoucher(id, request));
    }

    @PatchMapping("/{id}/trang-thai")
    public ResponseEntity<Void> updateTrangThai(@PathVariable Integer id, @RequestParam Integer trangThai) {
        voucherService.updateTrangThai(id, trangThai);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/pos-available")
    public ResponseEntity<List<VoucherResponse>> getAvailableForPos(
            @RequestParam(required = false, defaultValue = "0") java.math.BigDecimal tongTienHang
    ) {
        return ResponseEntity.ok(voucherService.getAvailableVouchersForPos(tongTienHang));
    }

    @PostMapping("/calculate-discount")
    public ResponseEntity<com.laptopstore.dto.VoucherCalculationResponse> calculateDiscount(
            @RequestBody com.laptopstore.dto.VoucherCalculationRequest request
    ) {
        java.math.BigDecimal tongTien = request.getTongTienHang() != null ? request.getTongTienHang() : java.math.BigDecimal.ZERO;
        return ResponseEntity.ok(voucherService.calculateVoucherDiscount(request.getIdVoucher(), tongTien));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.noContent().build();
    }
}
