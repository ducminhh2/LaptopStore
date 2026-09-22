package com.laptopstore.service.impl;

import com.laptopstore.entity.ChiTietSanPham;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.ChiTietSanPhamRepository;
import com.laptopstore.service.ChiTietSanPhamService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChiTietSanPhamServiceImpl implements ChiTietSanPhamService {

    private final ChiTietSanPhamRepository chiTietSanPhamRepository;

    public ChiTietSanPhamServiceImpl(ChiTietSanPhamRepository chiTietSanPhamRepository) {
        this.chiTietSanPhamRepository = chiTietSanPhamRepository;
    }

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
        existing.setSanPham(chiTietSanPham.getSanPham());
        existing.setMauSac(chiTietSanPham.getMauSac());
        existing.setCpu(chiTietSanPham.getCpu());
        existing.setRam(chiTietSanPham.getRam());
        existing.setOCung(chiTietSanPham.getOCung());
        existing.setCardDoHoa(chiTietSanPham.getCardDoHoa());
        existing.setManHinh(chiTietSanPham.getManHinh());
        existing.setSoLuong(chiTietSanPham.getSoLuong());
        existing.setGia(chiTietSanPham.getGia());
        existing.setMoTa(chiTietSanPham.getMoTa());
        existing.setTrangThai(chiTietSanPham.getTrangThai());
        return chiTietSanPhamRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        ChiTietSanPham existing = getById(id);
        chiTietSanPhamRepository.delete(existing);
    }
}
