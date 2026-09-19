package com.laptopstore.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI laptopStoreOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("LaptopStore REST API Documentation")
                        .version("1.0.0")
                        .description("Tài liệu API hệ thống quản lý và bán laptop cho Frontend Developer. Bao gồm 24 Controller đầy đủ nghiệp vụ: Sản phẩm, Cấu hình, IMEI, Giỏ hàng, Đơn hàng, Bảo hành, Khuyến mãi.")
                        .contact(new Contact()
                                .name("LaptopStore Development Team")
                                .email("support@laptopstore.com")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server")
                ));
    }
}
