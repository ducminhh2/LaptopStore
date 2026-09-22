/* ==========================================================================
   LaptopStore - Centralized API Service Module
   Interacts with Spring Boot Backend (http://localhost:8080/api)
   Fallbacks to local MOCK_DATA seamlessly if offline.
   ========================================================================== */

const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
  static async request(endpoint, options = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      if (response.status === 204) return null;
      return await response.json();
    } catch (err) {
      console.warn(`Backend API unreachable at ${endpoint}. Using Local Data Fallback.`);
      return null;
    }
  }

  // --- SanPham Endpoints ---
  static async getSanPhams() {
    const data = await this.request('/san-pham');
    return data || MOCK_DATA.sanPham;
  }

  static async getSanPhamById(id) {
    const data = await this.request(`/san-pham/${id}`);
    return data || MOCK_DATA.sanPham.find(p => p.id === parseInt(id));
  }

  static async searchSanPhams(keyword) {
    const data = await this.request(`/san-pham/search?keyword=${encodeURIComponent(keyword)}`);
    if (data) return data;
    const kw = keyword.toLowerCase();
    return MOCK_DATA.sanPham.filter(p => 
      p.tenSp.toLowerCase().includes(kw) || 
      p.maSp.toLowerCase().includes(kw) ||
      (p.moTa && p.moTa.toLowerCase().includes(kw))
    );
  }

  static async getSanPhamsByDanhMuc(danhMucId) {
    const data = await this.request(`/san-pham/danh-muc/${danhMucId}`);
    if (data) return data;
    return MOCK_DATA.sanPham.filter(p => p.danhMuc && p.danhMuc.id === parseInt(danhMucId));
  }

  static async getSanPhamsByThuongHieu(thuongHieuId) {
    const data = await this.request(`/san-pham/thuong-hieu/${thuongHieuId}`);
    if (data) return data;
    return MOCK_DATA.sanPham.filter(p => p.thuongHieu && p.thuongHieu.id === parseInt(thuongHieuId));
  }

  static async createSanPham(sanPhamData) {
    const res = await this.request('/san-pham', {
      method: 'POST',
      body: JSON.stringify(sanPhamData)
    });
    if (res) return res;

    // Local fallback creation
    const newId = MOCK_DATA.sanPham.length + 1;
    const newItem = { id: newId, ...sanPhamData };
    MOCK_DATA.sanPham.push(newItem);
    return newItem;
  }

  static async updateSanPham(id, sanPhamData) {
    const res = await this.request(`/san-pham/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sanPhamData)
    });
    const item = MOCK_DATA.sanPham.find(p => p.id === parseInt(id));
    if (item) {
      Object.assign(item, sanPhamData);
    }
    return res || item;
  }

  static async deleteSanPham(id) {
    await this.request(`/san-pham/${id}`, { method: 'DELETE' });
    MOCK_DATA.sanPham = MOCK_DATA.sanPham.filter(p => p.id !== parseInt(id));
    return true;
  }

  // --- ChiTietSanPham Endpoints ---
  static async getChiTietSanPhams() {
    const data = await this.request('/chi-tiet-san-pham');
    return data || MOCK_DATA.chiTietSanPham;
  }

  static async getChiTietBySanPhamId(sanPhamId) {
    const data = await this.request(`/chi-tiet-san-pham/san-pham/${sanPhamId}`);
    if (data) return data;
    return MOCK_DATA.chiTietSanPham.filter(ct => ct.sanPham && ct.sanPham.id === parseInt(sanPhamId));
  }

  static async createChiTietSanPham(ctspData) {
    const res = await this.request('/chi-tiet-san-pham', {
      method: 'POST',
      body: JSON.stringify(ctspData)
    });
    if (res) return res;
    const newId = MOCK_DATA.chiTietSanPham.length + 1;
    const newItem = { id: newId, ...ctspData };
    MOCK_DATA.chiTietSanPham.push(newItem);
    return newItem;
  }

  // --- Metadata Endpoints (DanhMuc, ThuongHieu, CPU, RAM, OCung, CardDoHoa, ManHinh) ---
  static async getDanhMucs() {
    const data = await this.request('/danh-muc');
    return data || MOCK_DATA.danhMuc;
  }

  static async getThuongHieus() {
    const data = await this.request('/thuong-hieu');
    return data || MOCK_DATA.thuongHieu;
  }

  static async getCpus() {
    const data = await this.request('/cpu');
    return data || MOCK_DATA.cpu;
  }

  static async getRams() {
    const data = await this.request('/ram');
    return data || MOCK_DATA.ram;
  }

  static async getOCungs() {
    const data = await this.request('/o-cung');
    return data || MOCK_DATA.oCung;
  }

  static async getCardDoHoas() {
    const data = await this.request('/card-do-hoa');
    return data || MOCK_DATA.cardDoHoa;
  }

  static async getManHinhs() {
    const data = await this.request('/man-hinh');
    return data || MOCK_DATA.manHinh;
  }

  static async getMauSacs() {
    const data = await this.request('/mau-sac');
    return data || MOCK_DATA.mauSac;
  }

  // --- HoaDon Endpoints ---
  static async getHoaDons() {
    const data = await this.request('/hoa-don');
    return data || MOCK_DATA.hoaDon;
  }

  static async getHoaDonsByCustomer(customerId) {
    const data = await this.request(`/hoa-don/khach-hang/${customerId}`);
    if (data) return data;
    return MOCK_DATA.hoaDon.filter(order =>
      parseInt(order.idKhachHang || order.khachHang?.id) === parseInt(customerId)
    );
  }

  static async createHoaDon(hoaDonData) {
    const res = await this.request('/hoa-don', {
      method: 'POST',
      body: JSON.stringify(hoaDonData)
    });
    if (res) return res;
    const newId = MOCK_DATA.hoaDon.length + 1;
    const newOrder = {
      id: newId,
      ma: `HD00${newId}`,
      ngayTao: new Date().toISOString().replace('T', ' ').substring(0, 19),
      trangThai: 0,
      ...hoaDonData
    };
    MOCK_DATA.hoaDon.unshift(newOrder);
    return newOrder;
  }

  static async updateHoaDonStatus(id, trangThai) {
    const res = await this.request(`/hoa-don/${id}/trang-thai/${trangThai}`, {
      method: 'PATCH'
    });
    const order = MOCK_DATA.hoaDon.find(h => h.id === parseInt(id));
    if (order) order.trangThai = parseInt(trangThai);
    return res || order;
  }

  // --- BaoHanh & IMEI ---
  static async getBaoHanhByImei(imeiCode) {
    const data = await this.request(`/bao-hanh/imei/${imeiCode}`);
    if (data) return data;
    return MOCK_DATA.baoHanh.find(b => b.soImei.toLowerCase() === imeiCode.toLowerCase().trim());
  }

  static async getImeis() {
    const data = await this.request('/imei');
    return data || MOCK_DATA.imei;
  }

  // --- KhuyenMai Endpoints ---
  static async getKhuyenMais() {
    const data = await this.request('/khuyen-mai');
    return data || MOCK_DATA.khuyenMai;
  }

  static async createKhuyenMai(kmData) {
    const res = await this.request('/khuyen-mai', {
      method: 'POST',
      body: JSON.stringify(kmData)
    });
    if (res) return res;
    const newId = MOCK_DATA.khuyenMai.length + 1;
    const newItem = { id: newId, ...kmData };
    MOCK_DATA.khuyenMai.push(newItem);
    return newItem;
  }

  static async updateKhuyenMai(id, kmData) {
    const res = await this.request(`/khuyen-mai/${id}`, {
      method: 'PUT',
      body: JSON.stringify(kmData)
    });
    const item = MOCK_DATA.khuyenMai.find(k => k.id === parseInt(id));
    if (item) {
      Object.assign(item, kmData);
    }
    return res || item;
  }

  static async deleteKhuyenMai(id) {
    await this.request(`/khuyen-mai/${id}`, { method: 'DELETE' });
    MOCK_DATA.khuyenMai = MOCK_DATA.khuyenMai.filter(k => k.id !== parseInt(id));
    return true;
  }
}
