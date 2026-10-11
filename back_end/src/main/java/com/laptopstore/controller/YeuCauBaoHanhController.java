package com.laptopstore.controller;

import com.laptopstore.dto.WarrantyRequestResponseDTO;
import com.laptopstore.dto.WarrantyRequestStatsDTO;
import com.laptopstore.service.YeuCauBaoHanhService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/yeu-cau-bao-hanh")
@RequiredArgsConstructor
public class YeuCauBaoHanhController {

    private final YeuCauBaoHanhService yeuCauBaoHanhService;

    // =========================================================================
    // 1. ADMIN & NHÂN VIÊN ENDPOINTS (DÙNG CHUNG 1 GIAO DIỆN)
    // =========================================================================

    @GetMapping("/admin/thong-ke")
    public ResponseEntity<WarrantyRequestStatsDTO> getAdminRequestStats() {
        return ResponseEntity.ok(yeuCauBaoHanhService.getRequestStats());
    }

    @GetMapping("/admin/danh-sach")
    public ResponseEntity<List<WarrantyRequestResponseDTO>> getAdminRequestList(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) Integer status) {
        return ResponseEntity.ok(yeuCauBaoHanhService.getAdminRequestList(search, status));
    }

    @GetMapping("/admin/{id}")
    public ResponseEntity<WarrantyRequestResponseDTO> getAdminRequestDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(yeuCauBaoHanhService.getAdminRequestDetail(id));
    }

    @GetMapping("/imei/{soImei}")
    public ResponseEntity<List<WarrantyRequestResponseDTO>> getRequestsByImei(@PathVariable String soImei) {
        return ResponseEntity.ok(yeuCauBaoHanhService.getRequestsByImei(soImei));
    }

    // =========================================================================
    // 2. ADMIN & NHÂN VIÊN THAO TÁC XỬ LÝ (BƯỚC 5: DÙNG CHUNG 100% QUYỀN VÀ API)
    // =========================================================================

    @PostMapping("/admin/{id}/tiep-nhan")
    public ResponseEntity<?> tiepNhanYeuCau(
            @PathVariable Integer id,
            HttpSession session,
            @RequestHeader(value = "X-Staff-Id", required = false) Integer headerStaffId,
            @RequestHeader(value = "X-User-Id", required = false) Integer headerUserId) {
        Integer staffId = resolveStaffId(session, headerStaffId, headerUserId);
        if (staffId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập tài khoản Quản trị viên hoặc Nhân viên để tiếp nhận yêu cầu!"));
        }
        WarrantyRequestResponseDTO result = yeuCauBaoHanhService.tiepNhanYeuCau(id, staffId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/admin/{id}/tu-choi")
    public ResponseEntity<?> tuChoiYeuCau(
            @PathVariable Integer id,
            @Valid @RequestBody com.laptopstore.dto.WarrantyRejectRequest request,
            HttpSession session,
            @RequestHeader(value = "X-Staff-Id", required = false) Integer headerStaffId,
            @RequestHeader(value = "X-User-Id", required = false) Integer headerUserId) {
        Integer staffId = resolveStaffId(session, headerStaffId, headerUserId);
        if (staffId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập tài khoản Quản trị viên hoặc Nhân viên để từ chối yêu cầu!"));
        }
        WarrantyRequestResponseDTO result = yeuCauBaoHanhService.tuChoiYeuCau(id, request.getLyDoTuChoi(), staffId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/admin/{id}/bat-dau-xu-ly")
    public ResponseEntity<?> batDauXuLy(
            @PathVariable Integer id,
            HttpSession session,
            @RequestHeader(value = "X-Staff-Id", required = false) Integer headerStaffId,
            @RequestHeader(value = "X-User-Id", required = false) Integer headerUserId) {
        Integer staffId = resolveStaffId(session, headerStaffId, headerUserId);
        if (staffId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập tài khoản Quản trị viên hoặc Nhân viên để bắt đầu xử lý yêu cầu!"));
        }
        WarrantyRequestResponseDTO result = yeuCauBaoHanhService.batDauXuLy(id, staffId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/admin/{id}/hoan-thanh")
    public ResponseEntity<?> hoanThanhYeuCau(
            @PathVariable Integer id,
            @Valid @RequestBody com.laptopstore.dto.WarrantyCompleteRequest request,
            HttpSession session,
            @RequestHeader(value = "X-Staff-Id", required = false) Integer headerStaffId,
            @RequestHeader(value = "X-User-Id", required = false) Integer headerUserId) {
        Integer staffId = resolveStaffId(session, headerStaffId, headerUserId);
        if (staffId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập tài khoản Quản trị viên hoặc Nhân viên để hoàn thành yêu cầu!"));
        }
        WarrantyRequestResponseDTO result = yeuCauBaoHanhService.hoanThanhYeuCau(id, request.getGhiChuXuLy(), staffId);
        return ResponseEntity.ok(result);
    }

    // =========================================================================
    // 3. KHÁCH HÀNG ENDPOINTS (BƯỚC 4: GỬI YÊU CẦU & XEM CHI TIẾT)
    // =========================================================================

    @PostMapping
    public ResponseEntity<?> createWarrantyRequest(
            @Valid @RequestBody com.laptopstore.dto.WarrantyRequestCreateDTO request,
            HttpSession session,
            @RequestHeader(value = "X-User-Id", required = false) Integer headerUserId) {
        Integer customerId = resolveUserId(session, headerUserId);
        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập tài khoản khách hàng để gửi yêu cầu bảo hành!"));
        }
        WarrantyRequestResponseDTO result = yeuCauBaoHanhService.guiYeuCauBaoHanh(request, customerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/my")
    public ResponseEntity<?> createWarrantyRequestMy(
            @Valid @RequestBody com.laptopstore.dto.WarrantyRequestCreateDTO request,
            HttpSession session,
            @RequestHeader(value = "X-User-Id", required = false) Integer headerUserId) {
        return createWarrantyRequest(request, session, headerUserId);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyRequests(
            HttpSession session,
            @RequestHeader(value = "X-User-Id", required = false) Integer headerUserId) {
        Integer customerId = resolveUserId(session, headerUserId);
        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập để xem danh sách yêu cầu bảo hành!"));
        }
        return ResponseEntity.ok(yeuCauBaoHanhService.getCustomerRequestList(customerId));
    }

    @GetMapping("/my/{id}")
    public ResponseEntity<?> getMyRequestDetail(
            @PathVariable Integer id,
            HttpSession session,
            @RequestHeader(value = "X-User-Id", required = false) Integer headerUserId) {
        Integer customerId = resolveUserId(session, headerUserId);
        if (customerId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Vui lòng đăng nhập để xem chi tiết yêu cầu bảo hành!"));
        }

        WarrantyRequestResponseDTO dto = yeuCauBaoHanhService.getCustomerRequestDetail(id, customerId);
        if (dto == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Bạn không có quyền truy cập yêu cầu bảo hành này!"));
        }
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/form-info/{baoHanhId}")
    public ResponseEntity<?> getFormInfo(
            @PathVariable Integer baoHanhId,
            HttpSession session,
            @RequestHeader(value = "X-User-Id", required = false) Integer headerUserId) {
        Integer customerId = resolveUserId(session, headerUserId);
        WarrantyRequestResponseDTO dto = yeuCauBaoHanhService.getFormInfoByBaoHanhId(baoHanhId, customerId);
        if (dto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Phiếu bảo hành không tồn tại hoặc bạn không sở hữu thiết bị này!"));
        }
        return ResponseEntity.ok(dto);
    }

    // --- Helper resolve staff/user ID ---
    private Integer resolveStaffId(HttpSession session, Integer headerStaffId, Integer headerUserId) {
        if (session != null) {
            Object idObj = session.getAttribute("CURRENT_USER_ID");
            if (idObj instanceof Integer) {
                return (Integer) idObj;
            }
        }
        if (headerStaffId != null) return headerStaffId;
        return headerUserId;
    }

    private Integer resolveUserId(HttpSession session, Integer headerUserId) {
        if (session != null) {
            Object idObj = session.getAttribute("CURRENT_USER_ID");
            if (idObj instanceof Integer) {
                return (Integer) idObj;
            }
        }
        return headerUserId;
    }
}
