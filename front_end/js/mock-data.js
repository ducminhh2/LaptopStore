/* ==========================================================================
   LaptopStore - Realistic Mock Data (Syncs with LaptopStoreDB.sql)
   Includes Laptop AI & Copilot+ PC category
   ========================================================================== */

const MOCK_DATA = {
  vaiTro: [
    { id: 1, tenVaiTro: "Quản trị viên" },
    { id: 2, tenVaiTro: "Nhân viên" },
    { id: 3, tenVaiTro: "Khách hàng" }
  ],

  nguoiDung: [
    { id: 1, ma: "KH001", ten: "Nguyễn Văn An", username: "nguyenvanan", diaChi: "Hà Nội", dienThoai: "0901234567", email: "an@gmail.com", idVaiTro: 3 },
    { id: 2, ma: "KH002", ten: "Trần Minh Đức", username: "tranminhduc", diaChi: "Phú Thọ", dienThoai: "0912345678", email: "duc@gmail.com", idVaiTro: 3 },
    { id: 3, ma: "KH003", ten: "Lê Hoàng Nam", username: "lehoangnam", diaChi: "Hải Phòng", dienThoai: "0923456789", email: "nam@gmail.com", idVaiTro: 3 },
    { id: 4, ma: "NV001", ten: "Nguyễn Thị Mai", username: "nhanvien01", diaChi: "Hà Nội", dienThoai: "0934567890", email: "mai@laptopstore.vn", idVaiTro: 2 },
    { id: 5, ma: "ADMIN001", ten: "Quản Trị Viên System", username: "admin", diaChi: "Hà Nội", dienThoai: "0999999999", email: "admin@laptopstore.vn", idVaiTro: 1 }
  ],

  danhMuc: [
    { id: 1, tenDanhMuc: "Laptop Gaming - Đồ họa" },
    { id: 2, tenDanhMuc: "Laptop Văn phòng" },
    { id: 4, tenDanhMuc: "Laptop Mỏng nhẹ" },
    { id: 5, tenDanhMuc: "Laptop AI & Copilot+" }
  ],

  thuongHieu: [
    { id: 1, tenThuongHieu: "ASUS" },
    { id: 2, tenThuongHieu: "Dell" },
    { id: 3, tenThuongHieu: "Lenovo" },
    { id: 4, tenThuongHieu: "Acer" },
    { id: 5, tenThuongHieu: "HP" }
  ],

  mauSac: [
    { id: 1, tenMau: "Đen" },
    { id: 2, tenMau: "Xám" },
    { id: 3, tenMau: "Bạc" },
    { id: 4, tenMau: "Xanh" }
  ],

  cpu: [
    { id: 1, tenCpu: "Intel Core i5-13420H" },
    { id: 2, tenCpu: "Intel Core i7-13620H" },
    { id: 3, tenCpu: "Intel Core Ultra 5 125H" },
    { id: 4, tenCpu: "AMD Ryzen 5 7535HS" },
    { id: 5, tenCpu: "AMD Ryzen 7 8845HS" },
    { id: 6, tenCpu: "AMD Ryzen AI 9 HX 370 (50 TOPS NPU)" },
    { id: 7, tenCpu: "Snapdragon X Elite (45 TOPS NPU)" },
    { id: 8, tenCpu: "Intel Core Ultra 7 155H AI Boost" }
  ],

  ram: [
    { id: 1, dungLuong: "8GB", loaiRam: "DDR4" },
    { id: 2, dungLuong: "16GB", loaiRam: "DDR4" },
    { id: 3, dungLuong: "16GB", loaiRam: "DDR5" },
    { id: 4, dungLuong: "32GB", loaiRam: "DDR5" },
    { id: 5, dungLuong: "32GB", loaiRam: "LPDDR5X AI" }
  ],

  oCung: [
    { id: 1, loaiOCung: "SSD NVMe", dungLuong: "256GB" },
    { id: 2, loaiOCung: "SSD NVMe", dungLuong: "512GB" },
    { id: 3, loaiOCung: "SSD NVMe", dungLuong: "1TB" },
    { id: 4, loaiOCung: "SSD NVMe", dungLuong: "2TB" }
  ],

  cardDoHoa: [
    { id: 1, tenCard: "Intel Iris Xe Graphics" },
    { id: 2, tenCard: "Intel Arc Graphics" },
    { id: 3, tenCard: "NVIDIA GeForce RTX 3050 6GB" },
    { id: 4, tenCard: "NVIDIA GeForce RTX 4050 6GB" },
    { id: 5, tenCard: "NVIDIA GeForce RTX 4060 8GB" },
    { id: 6, tenCard: "AMD Radeon 890M AI" },
    { id: 7, tenCard: "Qualcomm Adreno GPU" }
  ],

  manHinh: [
    { id: 1, kichThuoc: "14 inch", doPhanGiai: "1920x1200", tanSoQuet: "60Hz" },
    { id: 2, kichThuoc: "14 inch", doPhanGiai: "2880x1800", tanSoQuet: "120Hz" },
    { id: 3, kichThuoc: "15.6 inch", doPhanGiai: "1920x1080", tanSoQuet: "144Hz" },
    { id: 4, kichThuoc: "16 inch 3K OLED", doPhanGiai: "2880x1800", tanSoQuet: "120Hz" }
  ],

  sanPham: [
    {
      id: 1,
      maSp: "SP001",
      tenSp: "ASUS TUF Gaming A15",
      giaCoBan: 18990000,
      moTa: "Laptop gaming hiệu năng cao, chip AMD Ryzen thế hệ mới, tản nhiệt mát mẻ phù hợp chiến mọi tựa game.",
      danhMuc: { id: 1, tenDanhMuc: "Laptop Gaming - Đồ họa" },
      thuongHieu: { id: 1, tenThuongHieu: "ASUS" },
      imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80",
      danhSachHinhAnh: [
        { id: 101, urlHinhAnh: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80" },
        { id: 102, urlHinhAnh: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80" },
        { id: 103, urlHinhAnh: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    {
      id: 2,
      maSp: "SP002",
      tenSp: "ASUS Zenbook 14 OLED",
      giaCoBan: 22990000,
      moTa: "Laptop mỏng nhẹ thời trang cao cấp với màn hình OLED 2.8K rực rỡ, thời lượng pin ấn tượng.",
      danhMuc: { id: 4, tenDanhMuc: "Laptop Mỏng nhẹ" },
      thuongHieu: { id: 1, tenThuongHieu: "ASUS" },
      imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80",
      danhSachHinhAnh: [
        { id: 104, urlHinhAnh: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80" },
        { id: 105, urlHinhAnh: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80" },
        { id: 106, urlHinhAnh: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    {
      id: 6,
      maSp: "SP006",
      tenSp: "ASUS Zenbook S 16 OLED Copilot+ AI",
      giaCoBan: 39990000,
      moTa: "Laptop AI cao cấp trang bị chip AMD Ryzen AI 9 HX 370 với NPU 50 TOPS xử lý trí tuệ nhân tạo mượt mà, khung vỏ Ceraluminum sang trọng.",
      danhMuc: { id: 5, tenDanhMuc: "Laptop AI & Copilot+" },
      thuongHieu: { id: 1, tenThuongHieu: "ASUS" },
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
      danhSachHinhAnh: [
        { id: 107, urlHinhAnh: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80" },
        { id: 108, urlHinhAnh: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80" },
        { id: 109, urlHinhAnh: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    {
      id: 7,
      maSp: "SP007",
      tenSp: "Lenovo Yoga Slim 7x Copilot+ AI",
      giaCoBan: 34990000,
      moTa: "Laptop AI chạy vi xử lý Snapdragon X Elite với chip NPU 45 TOPS chuyên dụng, pin dùng liên tục 22 giờ, màn hình 3K OLED.",
      danhMuc: { id: 5, tenDanhMuc: "Laptop AI & Copilot+" },
      thuongHieu: { id: 3, tenThuongHieu: "Lenovo" },
      imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
      danhSachHinhAnh: [
        { id: 110, urlHinhAnh: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80" },
        { id: 111, urlHinhAnh: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80" },
        { id: 112, urlHinhAnh: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    {
      id: 8,
      maSp: "SP008",
      tenSp: "Dell XPS 13 Copilot+ AI Boost",
      giaCoBan: 41990000,
      moTa: "Đỉnh cao thiết kế Laptop AI màn hình viền siêu mỏng Touch Bar cảm ứng, trang bị Intel Core Ultra 7 tích hợp AI Engine.",
      danhMuc: { id: 5, tenDanhMuc: "Laptop AI & Copilot+" },
      thuongHieu: { id: 2, tenThuongHieu: "Dell" },
      imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
      danhSachHinhAnh: [
        { id: 113, urlHinhAnh: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80" },
        { id: 114, urlHinhAnh: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80" },
        { id: 115, urlHinhAnh: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    {
      id: 3,
      maSp: "SP003",
      tenSp: "Dell Inspiron 15 3530",
      giaCoBan: 15990000,
      moTa: "Laptop văn phòng học tập bền bỉ, thiết kế gọn gàng, bàn phím gõ êm ái.",
      danhMuc: { id: 2, tenDanhMuc: "Laptop Văn phòng" },
      thuongHieu: { id: 2, tenThuongHieu: "Dell" },
      imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
      danhSachHinhAnh: [
        { id: 116, urlHinhAnh: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80" },
        { id: 117, urlHinhAnh: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80" },
        { id: 118, urlHinhAnh: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    {
      id: 4,
      maSp: "SP004",
      tenSp: "Lenovo Legion 5 Pro",
      giaCoBan: 26990000,
      moTa: "Laptop gaming đỉnh cao thiết kế hầm hố, màn hình 16 inch 165Hz màu sắc chuẩn đồ họa.",
      danhMuc: { id: 1, tenDanhMuc: "Laptop Gaming - Đồ họa" },
      thuongHieu: { id: 3, tenThuongHieu: "Lenovo" },
      imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
      danhSachHinhAnh: [
        { id: 119, urlHinhAnh: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80" },
        { id: 120, urlHinhAnh: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80" },
        { id: 121, urlHinhAnh: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    {
      id: 5,
      maSp: "SP005",
      tenSp: "Acer Nitro V 15",
      giaCoBan: 19990000,
      moTa: "Dòng laptop quốc dân gaming trang bị RTX 4050 6GB, hỗ trợ tối đa trải nghiệm đồ họa.",
      danhMuc: { id: 1, tenDanhMuc: "Laptop Gaming - Đồ họa" },
      thuongHieu: { id: 4, tenThuongHieu: "Acer" },
      imageUrl: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80",
      danhSachHinhAnh: [
        { id: 122, urlHinhAnh: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80" },
        { id: 123, urlHinhAnh: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80" },
        { id: 124, urlHinhAnh: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80" }
      ]
    }
  ],

  chiTietSanPham: [
    {
      id: 1,
      maCtsp: "CTSP001",
      sanPham: { id: 1, tenSp: "ASUS TUF Gaming A15", maSp: "SP001" },
      mauSac: { id: 1, tenMau: "Đen" },
      cpu: { id: 4, tenCpu: "AMD Ryzen 5 7535HS" },
      ram: { id: 3, dungLuong: "16GB", loaiRam: "DDR5" },
      oCung: { id: 2, loaiOCung: "SSD NVMe", dungLuong: "512GB" },
      cardDoHoa: { id: 4, tenCard: "NVIDIA GeForce RTX 4050 6GB" },
      manHinh: { id: 3, kichThuoc: "15.6 inch", doPhanGiai: "1920x1080", tanSoQuet: "144Hz" },
      soLuong: 12,
      gia: 18990000,
      moTa: "Ryzen 5 7535HS / RAM 16GB DDR5 / SSD 512GB / RTX 4050 6GB",
      trangThai: 1,
      danhSachHinhAnh: [
        { id: 201, urlHinhAnh: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80" },
        { id: 202, urlHinhAnh: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80" },
        { id: 203, urlHinhAnh: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    {
      id: 6,
      maCtsp: "CTSP006",
      sanPham: { id: 6, tenSp: "ASUS Zenbook S 16 OLED Copilot+ AI", maSp: "SP006" },
      mauSac: { id: 2, tenMau: "Xám Scandinavian" },
      cpu: { id: 6, tenCpu: "AMD Ryzen AI 9 HX 370 (50 TOPS NPU)" },
      ram: { id: 5, dungLuong: "32GB", loaiRam: "LPDDR5X AI" },
      oCung: { id: 3, loaiOCung: "SSD NVMe", dungLuong: "1TB" },
      cardDoHoa: { id: 6, tenCard: "AMD Radeon 890M AI" },
      manHinh: { id: 4, kichThuoc: "16 inch 3K OLED", doPhanGiai: "2880x1800", tanSoQuet: "120Hz" },
      soLuong: 6,
      gia: 39990000,
      moTa: "Ryzen AI 9 HX 370 / NPU 50 TOPS / RAM 32GB / SSD 1TB / 3K OLED 120Hz",
      trangThai: 1,
      danhSachHinhAnh: [
        { id: 204, urlHinhAnh: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80" },
        { id: 205, urlHinhAnh: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    {
      id: 7,
      maCtsp: "CTSP007",
      sanPham: { id: 7, tenSp: "Lenovo Yoga Slim 7x Copilot+ AI", maSp: "SP007" },
      mauSac: { id: 4, tenMau: "Xanh Cosmic" },
      cpu: { id: 7, tenCpu: "Snapdragon X Elite (45 TOPS NPU)" },
      ram: { id: 5, dungLuong: "32GB", loaiRam: "LPDDR5X AI" },
      oCung: { id: 3, loaiOCung: "SSD NVMe", dungLuong: "1TB" },
      cardDoHoa: { id: 7, tenCard: "Qualcomm Adreno GPU" },
      manHinh: { id: 4, kichThuoc: "14.5 inch 3K OLED", doPhanGiai: "2944x1840", tanSoQuet: "90Hz" },
      soLuong: 8,
      gia: 34990000,
      moTa: "Snapdragon X Elite / NPU 45 TOPS / RAM 32GB / SSD 1TB / OLED 3K",
      trangThai: 1,
      danhSachHinhAnh: [
        { id: 206, urlHinhAnh: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80" },
        { id: 207, urlHinhAnh: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    {
      id: 2,
      maCtsp: "CTSP002",
      sanPham: { id: 1, tenSp: "ASUS TUF Gaming A15", maSp: "SP001" },
      mauSac: { id: 1, tenMau: "Đen" },
      cpu: { id: 5, tenCpu: "AMD Ryzen 7 8845HS" },
      ram: { id: 4, dungLuong: "32GB", loaiRam: "DDR5" },
      oCung: { id: 3, loaiOCung: "SSD NVMe", dungLuong: "1TB" },
      cardDoHoa: { id: 5, tenCard: "NVIDIA GeForce RTX 4060 8GB" },
      manHinh: { id: 3, kichThuoc: "15.6 inch", doPhanGiai: "1920x1080", tanSoQuet: "144Hz" },
      soLuong: 5,
      gia: 24990000,
      moTa: "Ryzen 7 8845HS / RAM 32GB DDR5 / SSD 1TB / RTX 4060 8GB",
      trangThai: 1,
      danhSachHinhAnh: [
        { id: 208, urlHinhAnh: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80" },
        { id: 209, urlHinhAnh: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    {
      id: 3,
      maCtsp: "CTSP003",
      sanPham: { id: 2, tenSp: "ASUS Zenbook 14 OLED", maSp: "SP002" },
      mauSac: { id: 2, tenMau: "Xám" },
      cpu: { id: 3, tenCpu: "Intel Core Ultra 5 125H" },
      ram: { id: 3, dungLuong: "16GB", loaiRam: "DDR5" },
      oCung: { id: 2, loaiOCung: "SSD NVMe", dungLuong: "512GB" },
      cardDoHoa: { id: 2, tenCard: "Intel Arc Graphics" },
      manHinh: { id: 2, kichThuoc: "14 inch", doPhanGiai: "2880x1800", tanSoQuet: "120Hz" },
      soLuong: 8,
      gia: 22990000,
      moTa: "Core Ultra 5 / RAM 16GB / SSD 512GB / OLED 120Hz / Intel Arc",
      trangThai: 1,
      danhSachHinhAnh: [
        { id: 210, urlHinhAnh: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80" },
        { id: 211, urlHinhAnh: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    {
      id: 4,
      maCtsp: "CTSP004",
      sanPham: { id: 3, tenSp: "Dell Inspiron 15 3530", maSp: "SP003" },
      mauSac: { id: 3, tenMau: "Bạc" },
      cpu: { id: 1, tenCpu: "Intel Core i5-13420H" },
      ram: { id: 2, dungLuong: "16GB", loaiRam: "DDR4" },
      oCung: { id: 2, loaiOCung: "SSD NVMe", dungLuong: "512GB" },
      cardDoHoa: { id: 1, tenCard: "Intel Iris Xe Graphics" },
      manHinh: { id: 3, kichThuoc: "15.6 inch", doPhanGiai: "1920x1080", tanSoQuet: "60Hz" },
      soLuong: 15,
      gia: 15990000,
      moTa: "Core i5 13420H / RAM 16GB / SSD 512GB / Intel Iris Xe",
      trangThai: 1,
      danhSachHinhAnh: [
        { id: 212, urlHinhAnh: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80" },
        { id: 213, urlHinhAnh: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80" }
      ]
    },
    {
      id: 5,
      maCtsp: "CTSP005",
      sanPham: { id: 4, tenSp: "Lenovo Legion 5 Pro", maSp: "SP004" },
      mauSac: { id: 2, tenMau: "Xám" },
      cpu: { id: 2, tenCpu: "Intel Core i7-13620H" },
      ram: { id: 4, dungLuong: "32GB", loaiRam: "DDR5" },
      oCung: { id: 3, loaiOCung: "SSD NVMe", dungLuong: "1TB" },
      cardDoHoa: { id: 5, tenCard: "NVIDIA GeForce RTX 4060 8GB" },
      manHinh: { id: 4, kichThuoc: "16 inch", doPhanGiai: "2560x1600", tanSoQuet: "165Hz" },
      soLuong: 4,
      gia: 28990000,
      moTa: "Core i7 13620H / RAM 32GB / SSD 1TB / RTX 4060 / 16 inch 165Hz",
      trangThai: 1,
      danhSachHinhAnh: [
        { id: 214, urlHinhAnh: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80" },
        { id: 215, urlHinhAnh: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80" }
      ]
    }
  ],

  imei: [
    { id: 1, soImei: "ASUSTUF00100001", idChiTietSanPham: 1, trangThai: 0, ngayNhap: "2026-09-01 10:00:00" },
    { id: 2, soImei: "ASUSTUF00100002", idChiTietSanPham: 1, trangThai: 0, ngayNhap: "2026-09-01 10:00:00" },
    { id: 3, soImei: "ZENBOOK00300001", idChiTietSanPham: 3, trangThai: 1, ngayNhap: "2026-09-02 11:30:00" },
    { id: 4, soImei: "LEGION00500001", idChiTietSanPham: 5, trangThai: 0, ngayNhap: "2026-09-05 14:20:00" },
    { id: 5, soImei: "ZENBOOKAI0060001", idChiTietSanPham: 6, trangThai: 0, ngayNhap: "2026-09-10 09:00:00" }
  ],

  baoHanh: [
    {
      id: 1,
      maPhieu: "BH001",
      soImei: "ZENBOOK00300001",
      tenSanPham: "ASUS Zenbook 14 OLED",
      ngayKichHoat: "2026-09-02",
      ngayHetHan: "2028-09-02",
      trangThai: 1
    },
    {
      id: 2,
      maPhieu: "BH002",
      soImei: "ASUSTUF00100001",
      tenSanPham: "ASUS TUF Gaming A15",
      ngayKichHoat: "2026-09-10",
      ngayHetHan: "2028-09-10",
      trangThai: 1
    },
    {
      id: 3,
      maPhieu: "BH003",
      soImei: "ZENBOOKAI0060001",
      tenSanPham: "ASUS Zenbook S 16 OLED Copilot+ AI",
      ngayKichHoat: "2026-09-15",
      ngayHetHan: "2028-09-15",
      trangThai: 1
    }
  ],

  khuyenMai: [
    { id: 1, ma: "KM_AI2026", tenKm: "Ưu Đãi Laptop AI & Copilot+ PC - Giảm 12%", phanTramGiam: 12, ngayBatDau: "2026-09-01", ngayKetThuc: "2026-10-15" },
    { id: 2, ma: "KM_GAMING", tenKm: "Siêu Giảm Giá Laptop Gaming", phanTramGiam: 10, ngayBatDau: "2026-09-01", ngayKetThuc: "2026-10-01" },
    { id: 3, ma: "KM_HE2026", tenKm: "Chào Thu 2026 - Giảm 5%", phanTramGiam: 5, ngayBatDau: "2026-09-15", ngayKetThuc: "2026-10-15" }
  ],

  hoaDon: [
    {
      id: 1,
      ma: "HD001",
      idKhachHang: 1,
      tenKhachHang: "Nguyễn Văn An",
      tenNguoiNhan: "Nguyễn Văn An",
      dienThoai: "0901234567",
      diaChi: "123 Đường Cầu Giấy, Hà Nội",
      ngayTao: "2026-09-15 14:30:00",
      trangThai: 3, // 0: Chờ xác nhận, 1: Đã xác nhận, 2: Đang giao, 3: Hoàn thành, 4: Đã hủy
      phuongThucThanhToan: "Chuyển khoản Ngân hàng",
      tongTien: 39990000,
      sanPhamDaMua: [
        { id: 6, tenSp: "ASUS Zenbook S 16 OLED Copilot+ AI", cauHinh: "Ryzen AI 9 HX 370 / NPU 50 TOPS / RAM 32GB / 1TB SSD", soLuong: 1, gia: 39990000 }
      ]
    },
    {
      id: 2,
      ma: "HD002",
      idKhachHang: 2,
      tenKhachHang: "Trần Minh Đức",
      tenNguoiNhan: "Trần Minh Đức",
      dienThoai: "0912345678",
      diaChi: "Thành phố Việt Trì, Phú Thọ",
      ngayTao: "2026-09-18 09:15:00",
      trangThai: 1, // Đã xác nhận
      phuongThucThanhToan: "Thanh toán khi nhận hàng (COD)",
      tongTien: 18990000,
      sanPhamDaMua: [
        { id: 2, tenSp: "ASUS TUF Gaming A15", cauHinh: "Ryzen 5 7535HS / RAM 16GB / SSD 512GB", soLuong: 1, gia: 18990000 }
      ]
    }
  ]
};
