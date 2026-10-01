package com.laptopstore.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordUtil {

    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    /**
     * Băm mật khẩu bằng thuật toán BCrypt.
     */
    public static String hashPassword(String rawPassword) {
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            return rawPassword;
        }
        // Nếu đã là chuỗi băm BCrypt thì không băm lại
        if (isBCryptHash(rawPassword)) {
            return rawPassword;
        }
        return encoder.encode(rawPassword);
    }

    /**
     * So khớp mật khẩu nhập vào với mật khẩu trong DB.
     * Hỗ trợ cả chuỗi hash BCrypt và mật khẩu plaintext cũ từ dữ liệu mẫu.
     */
    public static boolean checkPassword(String rawPassword, String storedPassword) {
        if (rawPassword == null || storedPassword == null) {
            return false;
        }
        if (isBCryptHash(storedPassword)) {
            return encoder.matches(rawPassword, storedPassword);
        }
        // Khớp mật khẩu plaintext cho các tài khoản khởi tạo mẫu (123456)
        return rawPassword.equals(storedPassword);
    }

    /**
     * Kiểm tra xem chuỗi có phải là định dạng BCrypt hash hay không ($2a$, $2b$, $2y$, dài 60 ký tự).
     */
    public static boolean isBCryptHash(String str) {
        return str != null && str.length() == 60 &&
                (str.startsWith("$2a$") || str.startsWith("$2b$") || str.startsWith("$2y$"));
    }
}
