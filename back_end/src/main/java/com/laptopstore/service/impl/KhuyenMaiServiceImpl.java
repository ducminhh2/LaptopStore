package com.laptopstore.service.impl;

import com.laptopstore.dto.GiaKhuyenMaiResponse;
import com.laptopstore.entity.ChiTietKhuyenMai;
import com.laptopstore.entity.ChiTietSanPham;
import com.laptopstore.entity.KhuyenMai;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.ChiTietKhuyenMaiRepository;
import com.laptopstore.repository.ChiTietSanPhamRepository;
import com.laptopstore.repository.KhuyenMaiRepository;
import com.laptopstore.service.KhuyenMaiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class KhuyenMaiServiceImpl implements KhuyenMaiService {

    private final KhuyenMaiRepository khuyenMaiRepository;
    private final ChiTietKhuyenMaiRepository chiTietKhuyenMaiRepository;
    private final ChiTietSanPhamRepository chiTietSanPhamRepository;

    @Override
    public List<KhuyenMai> getAll() {
        return khuyenMaiRepository.findAll();
    }

    @Override
    public KhuyenMai getById(Integer id) {
        return khuyenMaiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khuyến mãi", "id", id));
    }

    @Override
    public KhuyenMai getByMa(String ma) {
        return khuyenMaiRepository.findByMa(ma)
                .orElseThrow(() -> new ResourceNotFoundException("Khuyến mãi", "ma", ma));
    }

    @Override
    public KhuyenMai create(KhuyenMai khuyenMai) {
        if (khuyenMai.getTrangThai() == null) {
            khuyenMai.setTrangThai(1);
        }
        return khuyenMaiRepository.save(khuyenMai);
    }

    @Override
    public KhuyenMai update(Integer id, KhuyenMai khuyenMai) {
        KhuyenMai existing = getById(id);
        existing.setMa(khuyenMai.getMa());
        existing.setTenKm(khuyenMai.getTenKm());
        existing.setLoaiGiam(khuyenMai.getLoaiGiam() != null ? khuyenMai.getLoaiGiam() : 1);
        existing.setGiaTriGiam(khuyenMai.getGiaTriGiam() != null ? khuyenMai.getGiaTriGiam() : BigDecimal.ZERO);
        existing.setNgayBatDau(khuyenMai.getNgayBatDau());
        existing.setNgayKetThuc(khuyenMai.getNgayKetThuc());
        existing.setTrangThai(khuyenMai.getTrangThai() != null ? khuyenMai.getTrangThai() : 1);
        return khuyenMaiRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        KhuyenMai existing = getById(id);
        // Ngừng hoạt động thay vì xóa cứng
        existing.setTrangThai(0);
        khuyenMaiRepository.save(existing);
    }

    @Override
    public List<com.laptopstore.dto.KhuyenMaiResponse> getAllKhuyenMaiResponses() {
        List<KhuyenMai> list = khuyenMaiRepository.findAll();
        // Sắp xếp mới nhất lên đầu
        list.sort((a, b) -> {
            if (a.getId() == null || b.getId() == null) return 0;
            return b.getId().compareTo(a.getId());
        });
        return list.stream().map(km -> mapToResponse(km, false)).toList();
    }

    @Override
    public com.laptopstore.dto.KhuyenMaiResponse getKhuyenMaiResponseById(Integer id) {
        KhuyenMai km = getById(id);
        return mapToResponse(km, true);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public KhuyenMai createWithCtsp(com.laptopstore.dto.KhuyenMaiRequest request) {
        validatePromotionRequest(request, null);

        // Kiểm tra mã KM trùng
        if (request.getMa() != null && !request.getMa().isBlank()) {
            if (khuyenMaiRepository.findByMa(request.getMa().trim()).isPresent()) {
                throw new IllegalArgumentException("Mã khuyến mãi '" + request.getMa().trim() + "' đã tồn tại trong hệ thống.");
            }
        }

        String maKm = (request.getMa() != null && !request.getMa().isBlank())
                ? request.getMa().trim().toUpperCase()
                : "KM" + (System.currentTimeMillis() / 1000);

        KhuyenMai km = KhuyenMai.builder()
                .ma(maKm)
                .tenKm(request.getTenKm().trim())
                .loaiGiam(request.getLoaiGiam())
                .giaTriGiam(request.getGiaTriGiam())
                .ngayBatDau(request.getNgayBatDau())
                .ngayKetThuc(request.getNgayKetThuc())
                .trangThai(request.getTrangThai() != null ? request.getTrangThai() : 1)
                .build();

        KhuyenMai savedKm = khuyenMaiRepository.save(km);

        if (request.getIdChiTietSanPhams() != null && !request.getIdChiTietSanPhams().isEmpty()) {
            java.util.List<ChiTietKhuyenMai> links = new java.util.ArrayList<>();
            for (Integer ctspId : request.getIdChiTietSanPhams()) {
                ChiTietSanPham ctsp = chiTietSanPhamRepository.findById(ctspId)
                        .orElseThrow(() -> new ResourceNotFoundException("Chi tiết sản phẩm", "id", ctspId));

                ChiTietKhuyenMai ctkm = ChiTietKhuyenMai.builder()
                        .maCtkm("CTKM_" + savedKm.getMa() + "_" + ctsp.getMaCtsp())
                        .chiTietSanPham(ctsp)
                        .khuyenMai(savedKm)
                        .build();
                links.add(ctkm);
            }
            chiTietKhuyenMaiRepository.saveAll(links);
        }

        return savedKm;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public KhuyenMai updateWithCtsp(Integer id, com.laptopstore.dto.KhuyenMaiRequest request) {
        KhuyenMai existing = getById(id);
        validatePromotionRequest(request, id);

        existing.setTenKm(request.getTenKm().trim());
        existing.setLoaiGiam(request.getLoaiGiam());
        existing.setGiaTriGiam(request.getGiaTriGiam());
        existing.setNgayBatDau(request.getNgayBatDau());
        existing.setNgayKetThuc(request.getNgayKetThuc());
        existing.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : 1);

        KhuyenMai savedKm = khuyenMaiRepository.save(existing);

        // Quản lý cập nhật danh sách CTSP:
        // CTSP bỏ chọn -> xóa
        // CTSP mới chọn -> thêm
        // CTSP vẫn chọn -> giữ nguyên
        java.util.List<ChiTietKhuyenMai> currentLinks = chiTietKhuyenMaiRepository.findByKhuyenMaiId(id);
        java.util.Map<Integer, ChiTietKhuyenMai> currentMap = currentLinks.stream()
                .collect(java.util.stream.Collectors.toMap(c -> c.getChiTietSanPham().getId(), c -> c, (a, b) -> a));

        java.util.Set<Integer> targetCtspIds = request.getIdChiTietSanPhams() != null
                ? new java.util.HashSet<>(request.getIdChiTietSanPhams())
                : new java.util.HashSet<>();

        // Xóa những link không còn được chọn
        java.util.List<ChiTietKhuyenMai> toDelete = currentLinks.stream()
                .filter(c -> !targetCtspIds.contains(c.getChiTietSanPham().getId()))
                .toList();
        if (!toDelete.isEmpty()) {
            chiTietKhuyenMaiRepository.deleteAll(toDelete);
        }

        // Thêm những link mới được chọn
        java.util.List<ChiTietKhuyenMai> toAdd = new java.util.ArrayList<>();
        for (Integer ctspId : targetCtspIds) {
            if (!currentMap.containsKey(ctspId)) {
                ChiTietSanPham ctsp = chiTietSanPhamRepository.findById(ctspId)
                        .orElseThrow(() -> new ResourceNotFoundException("Chi tiết sản phẩm", "id", ctspId));
                ChiTietKhuyenMai ctkm = ChiTietKhuyenMai.builder()
                        .maCtkm("CTKM_" + savedKm.getMa() + "_" + ctsp.getMaCtsp())
                        .chiTietSanPham(ctsp)
                        .khuyenMai(savedKm)
                        .build();
                toAdd.add(ctkm);
            }
        }
        if (!toAdd.isEmpty()) {
            chiTietKhuyenMaiRepository.saveAll(toAdd);
        }

        return savedKm;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void updateTrangThai(Integer id, Integer trangThai) {
        KhuyenMai km = getById(id);
        int newStatus = (trangThai != null && trangThai == 1) ? 1 : 0;

        if (newStatus == 1) {
            // Khi kích hoạt lại khuyến mãi, phải kiểm tra trùng lặp thời gian với các KM đang hoạt động khác
            List<ChiTietKhuyenMai> links = chiTietKhuyenMaiRepository.findByKhuyenMaiId(id);
            if (links != null && !links.isEmpty()) {
                List<Integer> ctspIds = links.stream().map(c -> c.getChiTietSanPham().getId()).toList();
                List<ChiTietKhuyenMai> overlaps = chiTietKhuyenMaiRepository.findOverlappingActivePromotions(
                        ctspIds, km.getNgayBatDau(), km.getNgayKetThuc(), km.getId());
                if (overlaps != null && !overlaps.isEmpty()) {
                    ChiTietKhuyenMai first = overlaps.get(0);
                    String ctspCode = first.getChiTietSanPham() != null ? first.getChiTietSanPham().getMaCtsp() : "";
                    String otherKm = first.getKhuyenMai() != null ? first.getKhuyenMai().getMa() : "";
                    String otherKmTen = (first.getKhuyenMai() != null && first.getKhuyenMai().getTenKm() != null) ? first.getKhuyenMai().getTenKm() : "";
                    throw new IllegalArgumentException(String.format(
                            "%s đang được áp dụng khuyến mãi %s - %s. Không thể áp dụng thêm khuyến mãi khác.",
                            ctspCode, otherKm, otherKmTen));
                }
            }
        }

        km.setTrangThai(newStatus);
        khuyenMaiRepository.save(km);
    }

    private void validatePromotionRequest(com.laptopstore.dto.KhuyenMaiRequest req, Integer excludeKmId) {
        if (req == null) {
            throw new IllegalArgumentException("Dữ liệu khuyến mãi không hợp lệ.");
        }
        if (req.getTenKm() == null || req.getTenKm().trim().isBlank()) {
            throw new IllegalArgumentException("Tên chương trình khuyến mãi không được để trống.");
        }
        if (req.getNgayBatDau() == null) {
            throw new IllegalArgumentException("Vui lòng chọn ngày bắt đầu khuyến mãi.");
        }
        if (req.getNgayKetThuc() == null) {
            throw new IllegalArgumentException("Vui lòng chọn ngày kết thúc khuyến mãi.");
        }
        if (!req.getNgayBatDau().isBefore(req.getNgayKetThuc())) {
            throw new IllegalArgumentException("Ngày kết thúc phải diễn ra sau ngày bắt đầu.");
        }

        Integer loaiGiam = req.getLoaiGiam();
        if (loaiGiam == null || (loaiGiam != 1 && loaiGiam != 2)) {
            throw new IllegalArgumentException("Loại giảm giá không hợp lệ (chỉ chấp nhận 1: Giảm theo % hoặc 2: Giảm theo số tiền).");
        }

        BigDecimal giaTriGiam = req.getGiaTriGiam();
        if (giaTriGiam == null || giaTriGiam.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giá trị giảm giá phải lớn hơn 0.");
        }

        if (loaiGiam == 1) { // Giảm %
            if (giaTriGiam.compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new IllegalArgumentException("Mức giảm theo phần trăm không được vượt quá 100%.");
            }
        }

        // Nếu có chọn CTSP thì kiểm tra tính tồn tại, mức giảm tiền và xung đột thời gian
        if (req.getIdChiTietSanPhams() != null && !req.getIdChiTietSanPhams().isEmpty()) {
            List<ChiTietSanPham> ctsps = chiTietSanPhamRepository.findAllById(req.getIdChiTietSanPhams());
            if (ctsps.size() != req.getIdChiTietSanPhams().size()) {
                throw new IllegalArgumentException("Một số chi tiết sản phẩm được chọn không tồn tại trong hệ thống.");
            }

            // Nếu giảm theo số tiền, kiểm tra giá bán không âm (giaGoc >= giaTriGiam)
            if (loaiGiam == 2) {
                List<String> invalidCtsps = new java.util.ArrayList<>();
                java.text.NumberFormat nf = java.text.NumberFormat.getInstance(java.util.Locale.GERMAN);
                for (ChiTietSanPham ctsp : ctsps) {
                    BigDecimal giaGoc = ctsp.getGia() != null ? ctsp.getGia() : BigDecimal.ZERO;
                    if (giaGoc.compareTo(giaTriGiam) < 0) {
                        invalidCtsps.add(String.format("%s (Giá gốc: %s đ)", ctsp.getMaCtsp(), nf.format(giaGoc)));
                    }
                }
                if (!invalidCtsps.isEmpty()) {
                    throw new IllegalArgumentException(String.format(
                            "Mức giảm tiền (%s đ) vượt quá giá gốc của: %s. Giá sau giảm không được âm.",
                            nf.format(giaTriGiam), String.join(", ", invalidCtsps)));
                }
            }

            // Chặn trùng / chồng thời gian khuyến mãi với các khuyến mãi đang hoạt động khác
            int targetStatus = req.getTrangThai() != null ? req.getTrangThai() : 1;
            if (targetStatus == 1) {
                List<ChiTietKhuyenMai> overlaps = chiTietKhuyenMaiRepository.findOverlappingActivePromotions(
                        req.getIdChiTietSanPhams(), req.getNgayBatDau(), req.getNgayKetThuc(), excludeKmId);

                if (overlaps != null && !overlaps.isEmpty()) {
                    java.util.Set<String> seen = new java.util.HashSet<>();
                    List<String> conflictMsgs = new java.util.ArrayList<>();

                    for (ChiTietKhuyenMai ctkm : overlaps) {
                        String ctspCode = (ctkm.getChiTietSanPham() != null) ? ctkm.getChiTietSanPham().getMaCtsp() : "CTSP";
                        String kmMa = (ctkm.getKhuyenMai() != null) ? ctkm.getKhuyenMai().getMa() : "";
                        String kmTen = (ctkm.getKhuyenMai() != null && ctkm.getKhuyenMai().getTenKm() != null) ? ctkm.getKhuyenMai().getTenKm() : "";

                        String key = ctspCode + "_" + kmMa;
                        if (seen.add(key)) {
                            conflictMsgs.add(String.format("%s đang được áp dụng khuyến mãi %s - %s. Không thể áp dụng thêm khuyến mãi khác.",
                                    ctspCode, kmMa, kmTen));
                        }
                    }
                    throw new IllegalArgumentException(String.join("\n", conflictMsgs));
                }
            }
        }
    }

    private com.laptopstore.dto.KhuyenMaiResponse mapToResponse(KhuyenMai km, boolean includeDetails) {
        LocalDateTime now = LocalDateTime.now();
        String statusText;
        String badgeClass;

        if (km.getTrangThai() == null || km.getTrangThai() == 0) {
            statusText = "Ngừng hoạt động";
            badgeClass = "cancelled";
        } else if (now.isBefore(km.getNgayBatDau())) {
            statusText = "Sắp diễn ra";
            badgeClass = "pending";
        } else if (now.isAfter(km.getNgayKetThuc())) {
            statusText = "Đã kết thúc";
            badgeClass = "shipping";
        } else {
            statusText = "Đang diễn ra";
            badgeClass = "confirmed";
        }

        List<ChiTietKhuyenMai> links = chiTietKhuyenMaiRepository.findByKhuyenMaiId(km.getId());
        int count = links != null ? links.size() : 0;

        List<com.laptopstore.dto.KhuyenMaiCtspItemResponse> ctspItems = null;
        if (includeDetails && links != null) {
            ctspItems = new java.util.ArrayList<>();
            for (ChiTietKhuyenMai link : links) {
                ChiTietSanPham ctsp = link.getChiTietSanPham();
                if (ctsp == null) continue;

                BigDecimal giaGoc = ctsp.getGia() != null ? ctsp.getGia() : BigDecimal.ZERO;
                BigDecimal tienGiam = BigDecimal.ZERO;

                if (km.getLoaiGiam() != null && km.getLoaiGiam() == 1) { // %
                    BigDecimal pct = km.getGiaTriGiam() != null ? km.getGiaTriGiam() : BigDecimal.ZERO;
                    tienGiam = giaGoc.multiply(pct).divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
                } else if (km.getLoaiGiam() != null && km.getLoaiGiam() == 2) { // Tiền
                    tienGiam = km.getGiaTriGiam() != null ? km.getGiaTriGiam() : BigDecimal.ZERO;
                }
                if (tienGiam.compareTo(giaGoc) > 0) tienGiam = giaGoc;
                BigDecimal giaSauGiam = giaGoc.subtract(tienGiam);
                if (giaSauGiam.compareTo(BigDecimal.ZERO) < 0) giaSauGiam = BigDecimal.ZERO;

                String tenSp = ctsp.getSanPham() != null ? ctsp.getSanPham().getTenSp() : "Laptop";
                String maSp = ctsp.getSanPham() != null ? ctsp.getSanPham().getMaSp() : "";
                String cpu = ctsp.getCpu() != null ? ctsp.getCpu().getTenCpu() : "";
                String ram = ctsp.getRam() != null ? (ctsp.getRam().getDungLuong() + " " + (ctsp.getRam().getLoaiRam() != null ? ctsp.getRam().getLoaiRam() : "")) : "";
                String ssd = ctsp.getOCung() != null ? (ctsp.getOCung().getLoaiOCung() + " " + ctsp.getOCung().getDungLuong()) : "";
                String gpu = ctsp.getCardDoHoa() != null ? ctsp.getCardDoHoa().getTenCard() : "";
                String color = ctsp.getMauSac() != null ? ctsp.getMauSac().getTenMau() : "";
                String specs = String.join(" • ", java.util.stream.Stream.of(cpu, ram, ssd, gpu, color)
                        .filter(s -> s != null && !s.isBlank()).toList());

                String hinhAnh = null;
                if (ctsp.getDanhSachHinhAnh() != null && !ctsp.getDanhSachHinhAnh().isEmpty()) {
                    hinhAnh = ctsp.getDanhSachHinhAnh().get(0).getUrlHinhAnh();
                } else if (ctsp.getSanPham() != null && ctsp.getSanPham().getDanhSachHinhAnh() != null && !ctsp.getSanPham().getDanhSachHinhAnh().isEmpty()) {
                    hinhAnh = ctsp.getSanPham().getDanhSachHinhAnh().get(0).getUrlHinhAnh();
                }

                ctspItems.add(com.laptopstore.dto.KhuyenMaiCtspItemResponse.builder()
                        .idCtsp(ctsp.getId())
                        .maCtsp(ctsp.getMaCtsp())
                        .idSanPham(ctsp.getSanPham() != null ? ctsp.getSanPham().getId() : null)
                        .tenSp(tenSp)
                        .maSp(maSp)
                        .cauHinhChiTiet(specs)
                        .giaGoc(giaGoc)
                        .tienGiam(tienGiam)
                        .giaSauGiam(giaSauGiam)
                        .hinhAnh(hinhAnh)
                        .soLuongKho(ctsp.getSoLuong())
                        .build());
            }
        }

        return com.laptopstore.dto.KhuyenMaiResponse.builder()
                .id(km.getId())
                .ma(km.getMa())
                .tenKm(km.getTenKm())
                .loaiGiam(km.getLoaiGiam())
                .giaTriGiam(km.getGiaTriGiam())
                .ngayBatDau(km.getNgayBatDau())
                .ngayKetThuc(km.getNgayKetThuc())
                .trangThai(km.getTrangThai())
                .soCtspApDung(count)
                .trangThaiHienThi(statusText)
                .trangThaiBadgeClass(badgeClass)
                .danhSachCtsp(ctspItems)
                .build();
    }

    @Override
    public GiaKhuyenMaiResponse tinhGiaBanHienTai(ChiTietSanPham ctsp) {
        if (ctsp == null) {
            return null;
        }

        BigDecimal giaGoc = ctsp.getGia() != null ? ctsp.getGia() : BigDecimal.ZERO;
        List<ChiTietKhuyenMai> activeLinks = chiTietKhuyenMaiRepository
                .findActiveByChiTietSanPhamId(ctsp.getId(), LocalDateTime.now());

        if (activeLinks == null || activeLinks.isEmpty()) {
            return GiaKhuyenMaiResponse.builder()
                    .idCtsp(ctsp.getId())
                    .maCtsp(ctsp.getMaCtsp())
                    .giaGoc(giaGoc)
                    .coKhuyenMai(false)
                    .loaiGiam(null)
                    .giaTriGiam(BigDecimal.ZERO)
                    .tienGiam(BigDecimal.ZERO)
                    .giaBan(giaGoc)
                    .tenKhuyenMai(null)
                    .maKhuyenMai(null)
                    .build();
        }

        // Chọn khuyến mãi ưu đãi tốt nhất (số tiền giảm lớn nhất)
        ChiTietKhuyenMai bestCtkm = null;
        BigDecimal bestTienGiam = BigDecimal.ZERO;
        BigDecimal bestGiaBan = giaGoc;

        for (ChiTietKhuyenMai ctkm : activeLinks) {
            KhuyenMai km = ctkm.getKhuyenMai();
            if (km == null || km.getTrangThai() == null || km.getTrangThai() != 1) continue;
            if (km.getGiaTriGiam() == null || km.getGiaTriGiam().compareTo(BigDecimal.ZERO) <= 0) continue;

            BigDecimal tienGiam = BigDecimal.ZERO;
            int loai = km.getLoaiGiam() != null ? km.getLoaiGiam() : 1;

            if (loai == 1) { // Giảm theo phần trăm (%)
                BigDecimal phanTram = km.getGiaTriGiam();
                if (phanTram.compareTo(BigDecimal.valueOf(100)) > 0) {
                    phanTram = BigDecimal.valueOf(100);
                }
                tienGiam = giaGoc.multiply(phanTram).divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
            } else if (loai == 2) { // Giảm theo số tiền cố định
                tienGiam = km.getGiaTriGiam();
            }

            // Đảm bảo không giảm vượt quá giá gốc
            if (tienGiam.compareTo(giaGoc) > 0) {
                tienGiam = giaGoc;
            }

            if (bestCtkm == null || tienGiam.compareTo(bestTienGiam) > 0) {
                bestTienGiam = tienGiam;
                bestCtkm = ctkm;
                bestGiaBan = giaGoc.subtract(tienGiam);
                if (bestGiaBan.compareTo(BigDecimal.ZERO) < 0) {
                    bestGiaBan = BigDecimal.ZERO;
                }
            }
        }

        if (bestCtkm == null || bestTienGiam.compareTo(BigDecimal.ZERO) <= 0) {
            return GiaKhuyenMaiResponse.builder()
                    .idCtsp(ctsp.getId())
                    .maCtsp(ctsp.getMaCtsp())
                    .giaGoc(giaGoc)
                    .coKhuyenMai(false)
                    .loaiGiam(null)
                    .giaTriGiam(BigDecimal.ZERO)
                    .tienGiam(BigDecimal.ZERO)
                    .giaBan(giaGoc)
                    .build();
        }

        KhuyenMai km = bestCtkm.getKhuyenMai();
        return GiaKhuyenMaiResponse.builder()
                .idCtsp(ctsp.getId())
                .maCtsp(ctsp.getMaCtsp())
                .giaGoc(giaGoc)
                .coKhuyenMai(true)
                .loaiGiam(km.getLoaiGiam())
                .giaTriGiam(km.getGiaTriGiam())
                .tienGiam(bestTienGiam)
                .giaBan(bestGiaBan)
                .tenKhuyenMai(km.getTenKm())
                .maKhuyenMai(km.getMa())
                .build();
    }

    @Override
    public GiaKhuyenMaiResponse tinhGiaBanHienTai(Integer ctspId) {
        if (ctspId == null) return null;
        ChiTietSanPham ctsp = chiTietSanPhamRepository.findById(ctspId).orElse(null);
        if (ctsp == null) return null;
        return tinhGiaBanHienTai(ctsp);
    }

    @Override
    public void applyGiaKhuyenMai(ChiTietSanPham ctsp) {
        if (ctsp == null) return;
        GiaKhuyenMaiResponse res = tinhGiaBanHienTai(ctsp);
        if (res != null) {
            ctsp.setGiaBan(res.getGiaBan());
            ctsp.setCoKhuyenMai(res.getCoKhuyenMai());
            ctsp.setLoaiGiam(res.getLoaiGiam());
            ctsp.setGiaTriGiam(res.getGiaTriGiam());
            ctsp.setTienGiam(res.getTienGiam());
            ctsp.setTenKhuyenMai(res.getTenKhuyenMai());
        }
    }

    @Override
    public void applyGiaKhuyenMai(List<ChiTietSanPham> list) {
        if (list == null || list.isEmpty()) return;
        for (ChiTietSanPham ctsp : list) {
            applyGiaKhuyenMai(ctsp);
        }
    }
}
