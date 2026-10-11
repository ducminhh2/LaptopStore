package com.laptopstore;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;

@Component
public class DatabaseConnectionChecker {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConnectionChecker.class);

    private final DataSource dataSource;

    public DatabaseConnectionChecker(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Lắng nghe ApplicationReadyEvent với thứ tự LOWEST_PRECEDENCE để đảm bảo
     * bảng thông tin kết nối CSDL được in ra cuối cùng sau mọi log khởi động và câu lệnh SQL.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Order(Ordered.LOWEST_PRECEDENCE)
    public void onApplicationReady() {
        printDatabaseConnectionInfo();
    }

    public void printDatabaseConnectionInfo() {
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            String dbCatalog = conn.getCatalog();
            String dbProduct = metaData.getDatabaseProductName();
            String dbVersion = metaData.getDatabaseProductVersion();
            String rawUrl = metaData.getURL();
            String dbUser = metaData.getUserName();

            // Rút gọn địa chỉ máy chủ và cổng để hiển thị rõ ràng, súc tích
            String serverAddress = "localhost:1433";
            if (rawUrl != null && rawUrl.startsWith("jdbc:sqlserver://")) {
                int start = "jdbc:sqlserver://".length();
                int end = rawUrl.indexOf(';', start);
                if (end > start) {
                    serverAddress = rawUrl.substring(start, end);
                } else if (end == -1) {
                    serverAddress = rawUrl.substring(start);
                }
            }

            String separator = "========================================================================================";
            String subSeparator = "----------------------------------------------------------------------------------------";

            StringBuilder sb = new StringBuilder();
            sb.append("\n").append(separator).append("\n");
            sb.append("                  [SUCCESS] KẾT NỐI CƠ SỞ DỮ LIỆU THÀNH CÔNG!                           \n");
            sb.append(separator).append("\n");
            sb.append("  -> Trạng Thái Kết Nối      : Hoạt động bình thường (Connected)\n");
            sb.append(String.format("  -> Cơ Sở Dữ Liệu Đang Dùng : %s%n", (dbCatalog != null ? dbCatalog : "LaptopStoreDB")));
            sb.append(String.format("  -> Hệ Quản Trị CSDL        : %s (v%s)%n", dbProduct, dbVersion));
            sb.append(String.format("  -> Máy Chủ & Cổng (Host)   : %s%n", serverAddress));
            sb.append(String.format("  -> Tài Khoản CSDL          : %s%n", dbUser));
            sb.append(subSeparator).append("\n");
            sb.append("  -> Backend API Base URL    : http://localhost:8080\n");
            sb.append("  -> Tài Liệu Swagger UI Docs: http://localhost:8080/swagger-ui.html\n");
            sb.append(separator).append("\n");

            System.out.println(sb.toString());

            log.info("KẾT NỐI CƠ SỞ DỮ LIỆU THÀNH CÔNG! Database: [{}], Host: [{}], User: [{}]",
                    (dbCatalog != null ? dbCatalog : "LaptopStoreDB"), serverAddress, dbUser);
        } catch (Exception e) {
            String separator = "========================================================================================";
            StringBuilder sb = new StringBuilder();
            sb.append("\n").append(separator).append("\n");
            sb.append("                  [ERROR] KẾT NỐI CƠ SỞ DỮ LIỆU THẤT BẠI!                              \n");
            sb.append(separator).append("\n");
            sb.append(String.format("  -> Chi tiết lỗi: %s%n", e.getMessage()));
            sb.append(separator).append("\n");

            System.err.println(sb.toString());
            log.error("Kết nối CSDL thất bại! Lỗi: {}", e.getMessage(), e);
        }
    }
}
