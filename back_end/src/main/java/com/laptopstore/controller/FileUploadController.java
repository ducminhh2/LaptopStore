package com.laptopstore.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private final Path uploadPath;

    public FileUploadController() {
        // Resolve upload path to front_end/images/uploads
        Path p = Paths.get("d:/LaptopStore/front_end/images/uploads").toAbsolutePath().normalize();
        if (!Files.exists(p)) {
            try {
                Files.createDirectories(p);
            } catch (IOException ignored) {}
        }
        this.uploadPath = p;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> uploadSingleFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File tải lên không có dữ liệu"));
        }

        try {
            String originalName = file.getOriginalFilename();
            String ext = "";
            if (originalName != null && originalName.lastIndexOf('.') > 0) {
                ext = originalName.substring(originalName.lastIndexOf('.'));
            } else {
                ext = ".jpg";
            }

            String savedName = "ctsp_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;
            Path target = uploadPath.resolve(savedName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "http://localhost:8080/uploads/" + savedName;
            String relativeUrl = "../images/uploads/" + savedName;

            Map<String, Object> resp = new HashMap<>();
            resp.put("url", fileUrl);
            resp.put("relativeUrl", relativeUrl);
            resp.put("fileName", savedName);
            return ResponseEntity.ok(resp);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi lưu file: " + e.getMessage()));
        }
    }

    @PostMapping("/multiple")
    public ResponseEntity<List<Map<String, Object>>> uploadMultipleFiles(@RequestParam("files") MultipartFile[] files) {
        List<Map<String, Object>> results = new ArrayList<>();
        if (files == null || files.length == 0) {
            return ResponseEntity.ok(results);
        }

        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                try {
                    String originalName = file.getOriginalFilename();
                    String ext = "";
                    if (originalName != null && originalName.lastIndexOf('.') > 0) {
                        ext = originalName.substring(originalName.lastIndexOf('.'));
                    } else {
                        ext = ".jpg";
                    }

                    String savedName = "ctsp_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;
                    Path target = uploadPath.resolve(savedName);
                    Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

                    String fileUrl = "http://localhost:8080/uploads/" + savedName;
                    String relativeUrl = "../images/uploads/" + savedName;

                    Map<String, Object> item = new HashMap<>();
                    item.put("url", fileUrl);
                    item.put("relativeUrl", relativeUrl);
                    item.put("fileName", savedName);
                    results.add(item);
                } catch (IOException ignored) {}
            }
        }
        return ResponseEntity.ok(results);
    }
}
