package com.laptopstore.service.impl;

import com.laptopstore.entity.ChiTietSanPham;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.ChiTietSanPhamRepository;
import com.laptopstore.service.ChiTietSanPhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChiTietSanPhamServiceImpl implements ChiTietSanPhamService {

    private final ChiTietSanPhamRepository chiTietSanPhamRepository;

    @Override
    public List<ChiTietSanPham> getAll() {
        return chiTietSanPhamRepository.findAll();
    }

    @Override
    public ChiTietSanPham getById(Integer id) {
        return chiTietSanPhamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chi tiết sản phẩm", "id", id));
    }

    @Override
    public ChiTietSanPham getByMaCtsp(String maCtsp) {
        return chiTietSanPhamRepository.findByMaCtsp(maCtsp)
                .orElseThrow(() -> new ResourceNotFoundException("Chi tiết sản phẩm", "maCtsp", maCtsp));
    }

    @Override
    public List<ChiTietSanPham> getBySanPham(Integer sanPhamId) {
        return chiTietSanPhamRepository.findBySanPhamId(sanPhamId);
    }

    @Override
    public List<ChiTietSanPham> getByTrangThai(Integer trangThai) {
        return chiTietSanPhamRepository.findByTrangThai(trangThai);
    }

    @Override
    public ChiTietSanPham create(ChiTietSanPham chiTietSanPham) {
        return chiTietSanPhamRepository.save(chiTietSanPham);
    }

    @Override
    public ChiTietSanPham update(Integer id, ChiTietSanPham chiTietSanPham) {
        ChiTietSanPham existing = getById(id);
        existing.setMaCtsp(chiTietSanPham.getMaCtsp());
        existing.setGia(chiTietSanPham.getGia());
        existing.setSoLuong(chiTietSanPham.getSoLuong());
        existing.setMoTa(chiTietSanPham.getMoTa());
        existing.setTrangThai(chiTietSanPham.getTrangThai());

        if (chiTietSanPham.getSanPham() != null) existing.setSanPham(chiTietSanPham.getSanPham());
        if (chiTietSanPham.getMauSac() != null) existing.setMauSac(chiTietSanPham.getMauSac());
        if (chiTietSanPham.getCpu() != null) existing.setCpu(chiTietSanPham.getCpu());
        if (chiTietSanPham.getRam() != null) existing.setRam(chiTietSanPham.getRam());
        if (chiTietSanPham.getOCung() != null) existing.setOCung(chiTietSanPham.getOCung());
        if (chiTietSanPham.getCardDoHoa() != null) existing.setCardDoHoa(chiTietSanPham.getCardDoHoa());
        if (chiTietSanPham.getManHinh() != null) existing.setManHinh(chiTietSanPham.getManHinh());

        return chiTietSanPhamRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        ChiTietSanPham existing = getById(id);
        chiTietSanPhamRepository.delete(existing);
    }
}
