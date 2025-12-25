package com.techroom.room_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.io.File;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Lấy đường dẫn tuyệt đối để tránh lỗi sai thư mục khi chạy jar
        String uploadPath = new File("uploads/rooms").getAbsolutePath();

        // Map URL /api/rooms/images/** vào thư mục vật lý
        registry.addResourceHandler("/api/rooms/images/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}