package com.laptopstore.service.impl;

import com.laptopstore.dto.AuthResponse;
import com.laptopstore.dto.LoginRequest;
import com.laptopstore.dto.RegisterRequest;
import com.laptopstore.entity.NguoiDung;
import com.laptopstore.entity.VaiTro;
import com.laptopstore.repository.NguoiDungRepository;
import com.laptopstore.repository.VaiTroRepository;
import com.laptopstore.service.AuthService;
import com.laptopstore.util.PasswordUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final NguoiDungRepository nguoiDungRepository;
    private final VaiTroRepository vaiTroRepository;
    private final com.laptopstore.service.GioHangService gioHangService;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsername().trim();
        Optional<NguoiDung> userOpt = nguoiDungRepository.findByUsername(identifier);
        if (userOpt.isEmpty()) {
            userOpt = nguoiDungRepository.findByEmail(identifier);
        }

        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Tài khoản hoặc mật khẩu không chính xác");
        }

        NguoiDung user = userOpt.get();

        // Kiểm tra mật khẩu (hỗ trợ hash BCrypt và cả plaintext cũ của seed data)
        if (!PasswordUtil.checkPassword(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Tài khoản hoặc mật khẩu không chính xác");
        }

        // Tự động nâng cấp mật khẩu sang dạng băm BCrypt nếu trong DB còn là plaintext
        if (!PasswordUtil.isBCryptHash(user.getPassword())) {
            user.setPassword(PasswordUtil.hashPassword(request.getPassword()));
            nguoiDungRepository.save(user);
        }

        AuthResponse authResponse = buildAuthResponse(user, "Đăng nhập thành công!");

        // Xử lý đồng bộ giỏ hàng theo đúng nghiệp vụ sau khi đăng nhập thành công
        if (request.getGuestCart() != null) {
            com.laptopstore.dto.CartSyncResponse cartSync = gioHangService.syncLoginCart(user.getId(), request.getGuestCart());
            authResponse.setCartSync(cartSync);
        }

        return authResponse;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String username = request.getUsername().trim();
        if (nguoiDungRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Tên đăng nhập '" + username + "' đã được sử dụng");
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String email = request.getEmail().trim();
            if (nguoiDungRepository.existsByEmail(email)) {
                throw new IllegalArgumentException("Email '" + email + "' đã được sử dụng");
            }
        }

        // Vai trò mặc định cho tài khoản đăng ký là Khách hàng (id = 3)
        VaiTro vaiTroKhachHang = vaiTroRepository.findById(3)
                .orElseGet(() -> vaiTroRepository.findAll().stream()
                        .filter(v -> v.getTenVaiTro().toLowerCase().contains("khách"))
                        .findFirst()
                        .orElse(null));

        if (vaiTroKhachHang == null) {
            vaiTroKhachHang = vaiTroRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("Hệ thống chưa thiết lập vai trò người dùng trong DB"));
        }

        // Tạo mã khách hàng duy nhất (ví dụ: KH0004, KH0005...)
        long count = nguoiDungRepository.count();
        String maUser = "KH" + String.format("%03d", count + 1);
        while (nguoiDungRepository.existsByMa(maUser)) {
            maUser = "KH" + (System.currentTimeMillis() % 10000);
        }

        // BĂM MẬT KHẨU BẰNG BCRYPT TRƯỚC KHI LƯU VÀO DB
        String hashedPassword = PasswordUtil.hashPassword(request.getPassword());

        NguoiDung newUser = NguoiDung.builder()
                .ma(maUser)
                .ten(request.getTen().trim())
                .username(username)
                .password(hashedPassword)
                .email(request.getEmail() != null ? request.getEmail().trim() : null)
                .dienThoai(request.getDienThoai() != null ? request.getDienThoai().trim() : null)
                .diaChi(request.getDiaChi() != null ? request.getDiaChi().trim() : null)
                .vaiTro(vaiTroKhachHang)
                .build();

        NguoiDung savedUser = nguoiDungRepository.save(newUser);

        return buildAuthResponse(savedUser, "Đăng ký tài khoản thành công!");
    }

    private AuthResponse buildAuthResponse(NguoiDung user, String message) {
        String roleCode = "KHACH_HANG";
        String redirectUrl = "index.html";

        if (user.getVaiTro() != null) {
            String tenVaiTro = user.getVaiTro().getTenVaiTro().toLowerCase();
            Integer idVaiTro = user.getVaiTro().getId();

            // Nếu vai trò là Admin hoặc Nhân viên -> chuyển sang trang admin
            if (idVaiTro == 1 || tenVaiTro.contains("quản trị") || tenVaiTro.contains("admin")) {
                roleCode = "ADMIN";
                redirectUrl = "admin.html";
            } else if (idVaiTro == 2 || tenVaiTro.contains("nhân viên") || tenVaiTro.contains("staff")) {
                roleCode = "NHAN_VIEN";
                redirectUrl = "admin.html";
            } else {
                roleCode = "KHACH_HANG";
                redirectUrl = "index.html";
            }
        }

        return AuthResponse.builder()
                .id(user.getId())
                .ma(user.getMa())
                .ten(user.getTen())
                .username(user.getUsername())
                .email(user.getEmail())
                .dienThoai(user.getDienThoai())
                .diaChi(user.getDiaChi())
                .vaiTro(user.getVaiTro())
                .roleCode(roleCode)
                .redirectUrl(redirectUrl)
                .message(message)
                .build();
    }
}
