package com.laptopstore.service;

import com.laptopstore.dto.VoucherRequest;
import com.laptopstore.dto.VoucherResponse;
import com.laptopstore.entity.Voucher;

import java.util.List;

public interface VoucherService {

    List<VoucherResponse> getAllVouchers(String keyword, String statusFilter);

    VoucherResponse getVoucherById(Integer id);

    VoucherResponse getVoucherByMa(String ma);

    Voucher createVoucher(VoucherRequest request);

    Voucher updateVoucher(Integer id, VoucherRequest request);

    void updateTrangThai(Integer id, Integer trangThai);

    void deleteVoucher(Integer id);

    List<VoucherResponse> getAvailableVouchersForPos(java.math.BigDecimal tongTienHang);

    com.laptopstore.dto.VoucherCalculationResponse calculateVoucherDiscount(Integer idVoucher, java.math.BigDecimal tongTienHang);
}
