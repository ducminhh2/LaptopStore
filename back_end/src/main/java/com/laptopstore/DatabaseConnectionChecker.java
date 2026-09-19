package com.laptopstore;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

@Component
public class DatabaseConnectionChecker implements CommandLineRunner {

    private final DataSource dataSource;

    public DatabaseConnectionChecker(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) {
        try (Connection conn = dataSource.getConnection()) {
            System.out.println("\n===============================================================");
            System.out.println(" [SUCCESS] KẾT NỐI CƠ SỞ DỮ LIỆU THÀNH CÔNG!");
            System.out.println(" CSDL Đang Kết Nối : " + conn.getCatalog());
            System.out.println(" Phiên Bản SQL Server: " + conn.getMetaData().getDatabaseProductVersion());
            System.out.println(" Swagger UI URL      : http://localhost:8080/swagger-ui.html");
            System.out.println("===============================================================\n");
        } catch (Exception e) {
            System.err.println("\n===============================================================");
            System.err.println(" [ERROR] KẾT NỐI CƠ SỞ DỮ LIỆU THẤT BẠI!");
            System.err.println(" Chi tiết lỗi: " + e.getMessage());
            System.err.println("===============================================================\n");
        }
    }
}
