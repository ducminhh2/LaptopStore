package com.laptopstore.service.impl;

import com.laptopstore.dto.DanhMucSectionDTO;
import com.laptopstore.entity.ChiTietSanPham;
import com.laptopstore.entity.DanhMuc;
import com.laptopstore.exception.ResourceNotFoundException;
import com.laptopstore.repository.DanhMucRepository;
import com.laptopstore.service.ChiTietSanPhamService;
import com.laptopstore.service.DanhMucService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DanhMucServiceImpl implements DanhMucService {

    private final DanhMucRepository danhMucRepository;
    private final ChiTietSanPhamService chiTietSanPhamService;

    @Override
    public List<DanhMuc> getAll() {
        return danhMucRepository.findAll();
    }

    @Override
    public DanhMuc getById(Integer id) {
        return danhMucRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục", "id", id));
    }

    @Override
    public DanhMuc create(DanhMuc danhMuc) {
        return danhMucRepository.save(danhMuc);
    }

    @Override
    public DanhMuc update(Integer id, DanhMuc danhMuc) {
        DanhMuc existing = getById(id);
        existing.setTenDanhMuc(danhMuc.getTenDanhMuc());
        return danhMucRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        DanhMuc existing = getById(id);
        danhMucRepository.delete(existing);
    }

    @Override
    public List<DanhMucSectionDTO> getDanhMucSections(Integer limitPerSection) {
        int limit = (limitPerSection != null && limitPerSection > 0) ? limitPerSection : 5;
        List<DanhMuc> categories = danhMucRepository.findAll();
        List<ChiTietSanPham> allCtsps = chiTietSanPhamService.getAll();

        Map<Integer, List<ChiTietSanPham>> ctspByCatMap = new LinkedHashMap<>();
        for (ChiTietSanPham ctsp : allCtsps) {
            if (ctsp.getSanPham() != null && ctsp.getSanPham().getDanhMuc() != null && ctsp.getSanPham().getDanhMuc().getId() != null) {
                Integer catId = ctsp.getSanPham().getDanhMuc().getId();
                ctspByCatMap.computeIfAbsent(catId, k -> new ArrayList<>()).add(ctsp);
            }
        }

        List<DanhMucSectionDTO> sections = new ArrayList<>();
        for (DanhMuc dm : categories) {
            List<ChiTietSanPham> list = ctspByCatMap.get(dm.getId());
            // Only render categories that have at least 1 product
            if (list != null && !list.isEmpty()) {
                long total = list.size();
                List<ChiTietSanPham> previewList = list.stream().limit(limit).collect(Collectors.toList());
                sections.add(DanhMucSectionDTO.builder()
                        .danhMuc(dm)
                        .chiTietSanPhams(previewList)
                        .totalProducts(total)
                        .build());
            }
        }
        return sections;
    }
}

