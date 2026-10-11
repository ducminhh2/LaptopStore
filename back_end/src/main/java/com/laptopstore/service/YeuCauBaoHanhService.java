package com.laptopstore.service;

import com.laptopstore.dto.WarrantyRequestCreateDTO;
import com.laptopstore.dto.WarrantyRequestResponseDTO;
import com.laptopstore.dto.WarrantyRequestStatsDTO;
import com.laptopstore.entity.YeuCauBaoHanh;

import java.util.List;

public interface YeuCauBaoHanhService {

    List<YeuCauBaoHanh> getAll();

    YeuCauBaoHanh getById(Integer id);

    // ==========================================
    // BƯỚC 4: KHÁCH HÀNG GỬI YÊU CẦU BẢO HÀNH
    // ==========================================
    WarrantyRequestResponseDTO guiYeuCauBaoHanh(WarrantyRequestCreateDTO request, Integer customerId);

    // ==========================================
    // BƯỚC 2: CÁC PHƯƠNG THỨC ĐỒNG BỘ DỮ LIỆU ĐỌC
    // ==========================================
    WarrantyRequestStatsDTO getRequestStats();

    List<WarrantyRequestResponseDTO> getAdminRequestList(String search, Integer status);

    WarrantyRequestResponseDTO getAdminRequestDetail(Integer id);

    List<WarrantyRequestResponseDTO> getCustomerRequestList(Integer customerId);

    WarrantyRequestResponseDTO getCustomerRequestDetail(Integer id, Integer customerId);

    List<WarrantyRequestResponseDTO> getRequestsByImei(String soImei);

    WarrantyRequestResponseDTO getFormInfoByBaoHanhId(Integer baoHanhId, Integer customerId);

    // ==========================================
    // BƯỚC 5: NGHIỆP VỤ XỬ LÝ YÊU CẦU BẢO HÀNH
    // ==========================================
    WarrantyRequestResponseDTO tiepNhanYeuCau(Integer id, Integer staffId);

    WarrantyRequestResponseDTO tuChoiYeuCau(Integer id, String lyDoTuChoi, Integer staffId);

    WarrantyRequestResponseDTO batDauXuLy(Integer id, Integer staffId);

    WarrantyRequestResponseDTO hoanThanhYeuCau(Integer id, String ghiChuXuLy, Integer staffId);
}
