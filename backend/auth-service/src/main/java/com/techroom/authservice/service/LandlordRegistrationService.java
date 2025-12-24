package com.techroom.authservice.service;

import com.techroom.authservice.model.LandlordRequest;
import com.techroom.authservice.model.RequestStatus;
import com.techroom.authservice.model.User;
import com.techroom.authservice.repository.LandlordRequestRepository;
import com.techroom.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LandlordRegistrationService {

    private final LandlordRequestRepository requestRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String submitRequest(String username, String cccd, String address, Integer roomCount,
                                MultipartFile frontImg, MultipartFile backImg, MultipartFile licenseImg) throws IOException {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Lưu file ảnh
        String frontPath = saveFile(frontImg);
        String backPath = saveFile(backImg);
        String licensePath = saveFile(licenseImg);

        // 2. Tạo record trong DB
        LandlordRequest request = LandlordRequest.builder()
                .user(user)
                .cccd(cccd)
                .address(address)
                .expectedRoomCount(roomCount)
                .frontImagePath(frontPath)
                .backImagePath(backPath)
                .businessLicensePath(licensePath)
                .status(RequestStatus.PENDING) // Mặc định là chờ duyệt
                .build();

        requestRepository.save(request);
        return "Gửi yêu cầu thành công! Vui lòng chờ Admin duyệt.";
    }

    // Hàm hỗ trợ lưu file ra ổ cứng
    private String saveFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new RuntimeException("File is empty");

        // Tạo tên file ngẫu nhiên để không bị trùng
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }
}