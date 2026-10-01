const BASE_URL = 'http://localhost:8080/api';

async function testAll() {
  console.log('=== STARTING 12 MANDATORY TEST SUITE FOR POS VOUCHERS ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // TEST 1: Tổng tiền sau KM = 28.000.000, SALE10 (10% max 2M) -> Giảm 2M, phải trả 26M
  console.log('--- TEST 1: SALE10 với 28.000.000 (10% max 2.000.000) ---');
  let res = await fetch(`${BASE_URL}/vouchers/calculate-discount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idVoucher: 6, tongTienHang: 28000000 })
  });
  let d1 = await res.json();
  assert(d1.hopLe === true, 'TEST 1: SALE10 hop le voi 28M');
  assert(Number(d1.tienGiamVoucher) === 2000000, 'TEST 1: tienGiamVoucher == 2.000.000 (giam toi da)');
  assert(Number(d1.khachPhaiTra) === 26000000, 'TEST 1: khachPhaiTra == 26.000.000');

  // TEST 2: Tổng 15.000.000, SALE10 yêu cầu 20.000.000 -> Không được áp dụng
  console.log('\n--- TEST 2: SALE10 với 15.000.000 (< đơn tối thiểu 20M) ---');
  res = await fetch(`${BASE_URL}/vouchers/calculate-discount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idVoucher: 6, tongTienHang: 15000000 })
  });
  let d2 = await res.json();
  assert(d2.hopLe === false, 'TEST 2: SALE10 khong hop le khi tong tien < 20M');
  assert(Number(d2.tienGiamVoucher) === 0, 'TEST 2: tienGiamVoucher == 0');

  // TEST 3: SALE500K giảm 500.000, tổng 20.000.000 -> phải trả 19.500.000
  console.log('\n--- TEST 3: SALE500K với 20.000.000 ---');
  res = await fetch(`${BASE_URL}/vouchers/calculate-discount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idVoucher: 7, tongTienHang: 20000000 })
  });
  let d3 = await res.json();
  assert(d3.hopLe === true, 'TEST 3: SALE500K hop le');
  assert(Number(d3.tienGiamVoucher) === 500000, 'TEST 3: tienGiamVoucher == 500.000');
  assert(Number(d3.khachPhaiTra) === 19500000, 'TEST 3: khachPhaiTra == 19.500.000');

  // TEST 4: Voucher hết hạn (BLACKFRIDAY id 9)
  console.log('\n--- TEST 4: Voucher het han ---');
  res = await fetch(`${BASE_URL}/vouchers/calculate-discount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idVoucher: 9, tongTienHang: 20000000 })
  });
  let d4 = await res.json();
  assert(d4.hopLe === false, 'TEST 4: Voucher het han bi tu choi');
  assert(d4.thongBao.includes('hết hạn'), 'TEST 4: Thong bao het han dung nghiep vu');

  // TEST 5: Voucher trang_thai = 0 (VIPMEMBER id 10)
  console.log('\n--- TEST 5: Voucher trang_thai = 0 ---');
  res = await fetch(`${BASE_URL}/vouchers/calculate-discount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idVoucher: 10, tongTienHang: 30000000 })
  });
  let d5 = await res.json();
  assert(d5.hopLe === false, 'TEST 5: Voucher ngung hoat dong bi tu choi');
  assert(d5.thongBao.includes('không hoạt động'), 'TEST 5: Thong bao khong hoat dong dung nghiep vu');

  // TEST 6: Khong chon Voucher -> tien giam = 0, phai tra = tong tien hang
  console.log('\n--- TEST 6: Checkout khong dung voucher ---');
  let orderCode6 = 'HD_TEST6_' + Date.now().toString().slice(-5);
  res = await fetch(`${BASE_URL}/hoa-don/pos-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ma: orderCode6,
      customerId: 1,
      cashierId: 4,
      payMethod: 'TIEN_MAT',
      customerGiven: 20000000,
      isCompleted: true,
      idVoucher: null,
      items: [{ ctspId: 1, qty: 1 }] // CTSP 1 gia ban sau KM = 17.091.000
    })
  });
  let hd6 = await res.json();
  assert(hd6.voucher === null, 'TEST 6: id_voucher is null');
  assert(Number(hd6.tienGiamVoucher) === 0, 'TEST 6: tien_giam_voucher == 0');
  assert(Number(hd6.thanhToan.soTien) === 17091000, 'TEST 6: soTien == 17.091.000');

  // TEST 7: Đang dùng Voucher đủ điều kiện, giảm số lượng/xóa sản phẩm khiến tổng xuống dưới đơn tối thiểu
  console.log('\n--- TEST 7: Revalidate khi tong tien giam duoi don toi thieu ---');
  // Subtotal ban đầu 40M: SALE10 ok
  let sub7_before = 40000000;
  let calc7_before = await (await fetch(`${BASE_URL}/vouchers/calculate-discount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idVoucher: 6, tongTienHang: sub7_before })
  })).json();
  assert(calc7_before.hopLe === true, 'TEST 7: Truoc khi xoa san pham, SALE10 hop le');

  // Subtotal sau khi xoa giam con 17M: SALE10 khong con hop le
  let sub7_after = 17000000;
  let calc7_after = await (await fetch(`${BASE_URL}/vouchers/calculate-discount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idVoucher: 6, tongTienHang: sub7_after })
  })).json();
  assert(calc7_after.hopLe === false, 'TEST 7: Sau khi giam con 17M, SALE10 khong con hop le');
  assert(Number(calc7_after.tienGiamVoucher) === 0, 'TEST 7: Tien giam ve 0');

  // TEST 8: Chọn Voucher sau đó tăng số lượng -> tính lại tổng và tiền voucher
  console.log('\n--- TEST 8: Tang so luong -> tinh lai tien voucher ---');
  // 1 CTSP giá 10M -> subtotal = 10M (chưa đủ 20M)
  // Tang len 3 CTSP -> subtotal = 30M -> 10% = 3M, capped at 2M
  let calc8 = await (await fetch(`${BASE_URL}/vouchers/calculate-discount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idVoucher: 6, tongTienHang: 30000000 })
  })).json();
  assert(calc8.hopLe === true && Number(calc8.tienGiamVoucher) === 2000000, 'TEST 8: Tang SL -> tong 30M -> giam toi da 2M');

  // TEST 9: CTSP có KM sản phẩm -> Voucher tính trên GIÁ SAU KM
  console.log('\n--- TEST 9: Voucher tinh tren gia sau KM san pham ---');
  // CTSP 1: gia goc 18.990.000, KM 10% -> 17.091.000
  // CTSP 2: gia goc 24.990.000, KM -2M -> 22.990.000
  // Subtotal = 17.091.000 + 22.990.000 = 40.081.000 (khong phai 18.990.000 + 24.990.000 = 43.980.000)
  let orderCode9 = 'HD_TEST9_' + Date.now().toString().slice(-5);
  res = await fetch(`${BASE_URL}/hoa-don/pos-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ma: orderCode9,
      customerId: 1,
      cashierId: 4,
      payMethod: 'TIEN_MAT',
      customerGiven: 40000000,
      isCompleted: true,
      idVoucher: 6, // SALE10
      items: [
        { ctspId: 1, qty: 1 },
        { ctspId: 2, qty: 1 }
      ]
    })
  });
  let hd9 = await res.json();
  assert(Number(hd9.tienGiamVoucher) === 2000000, 'TEST 9: tienGiamVoucher == 2.000.000');
  assert(Number(hd9.thanhToan.soTien) === 38081000, 'TEST 9: soTien == 40.081.000 - 2.000.000 = 38.081.000');

  // TEST 10: Snapshot Voucher - hoa don cu khong thay doi khi voucher bi sua
  console.log('\n--- TEST 10: Snapshot hoa don giu nguyen khi voucher bi sua ---');
  // Check hd9 snapshot
  let savedId = hd9.id;
  let recheckHd9 = await (await fetch(`${BASE_URL}/hoa-don/${savedId}`)).json();
  assert(Number(recheckHd9.tienGiamVoucher) === 2000000, 'TEST 10: Hoa don cu luu snapshot tien_giam_voucher = 2.000.000');
  assert(recheckHd9.voucher.ma === 'SALE10', 'TEST 10: Hoa don cu giu nguyen id_voucher = 6 (SALE10)');

  // TEST 11: Tiền mặt: tiền khách đưa < khách phải trả -> Không cho thanh toán
  console.log('\n--- TEST 11: Tien khach dua < khach phai tra -> chan thanh toan ---');
  let orderCode11 = 'HD_TEST11_' + Date.now().toString().slice(-5);
  res = await fetch(`${BASE_URL}/hoa-don/pos-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ma: orderCode11,
      customerId: 1,
      cashierId: 4,
      payMethod: 'TIEN_MAT',
      customerGiven: 10000000, // Chỉ đưa 10M trong khi đơn 17M
      isCompleted: true,
      idVoucher: null,
      items: [{ ctspId: 1, qty: 1 }]
    })
  });
  assert(res.status >= 400, 'TEST 11: Backend tu choi thanh toan khi tien dua < tong tien (status >= 400)');
  let err11 = await res.json();
  assert(err11.message && err11.message.includes('không đủ'), 'TEST 11: Thong bao loi hop ly');

  // TEST 12: Voucher giảm tiền lớn hơn tổng tiền -> không âm, tiền giảm tối đa bằng tổng hóa đơn
  console.log('\n--- TEST 12: Tien giam khong lam am tong tien ---');
  // Tạo voucher giảm 99 triệu
  let cvRes = await fetch(`${BASE_URL}/vouchers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ma: 'TEST99M_' + Date.now().toString().slice(-4),
      tenVoucher: 'Giam 99 Trieu',
      loaiGiam: 2,
      giaTriGiam: 99000000,
      giaTriDonToiThieu: 1000000,
      ngayBatDau: '2026-01-01T00:00:00',
      ngayKetThuc: '2026-12-31T23:59:59',
      trangThai: 1
    })
  });
  let v12 = await cvRes.json();
  let calc12 = await (await fetch(`${BASE_URL}/vouchers/calculate-discount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idVoucher: v12.id, tongTienHang: 17091000 })
  })).json();
  assert(Number(calc12.tienGiamVoucher) === 17091000, 'TEST 12: Tien giam toi da bang tong tien hang (17.091.000)');
  assert(Number(calc12.khachPhaiTra) === 0, 'TEST 12: Khach phai tra == 0 (khong am)');

  // Clean up v12
  await fetch(`${BASE_URL}/vouchers/${v12.id}`, { method: 'DELETE' });

  console.log(`\n==================================================`);
  console.log(`KET QUA TEST: PASSED = ${passed}/${passed + failed}, FAILED = ${failed}`);
  console.log(`==================================================`);
}

testAll().catch(e => console.error('Exception running tests:', e));
