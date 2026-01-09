package com.techroom.authservice.service;

import com.techroom.authservice.model.Landlord;
import com.techroom.authservice.model.LandlordRequest;
import com.techroom.authservice.model.RequestStatus;
import com.techroom.authservice.model.Role; // Thêm import này (Đảm bảo file Role.java có enum LANDLORD)
import com.techroom.authservice.model.User;
import com.techroom.authservice.repository.LandlordRepository;
import com.techroom.authservice.repository.LandlordRequestRepository;
import com.techroom.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LandlordRegistrationService {

    private final LandlordRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final LandlordRepository landlordRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String submitRequest(String username, String cccd, String address, Integer roomCount,
                                MultipartFile frontImg, MultipartFile backImg, MultipartFile licenseImg) throws IOException {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<LandlordRequest> existingRequest = requestRepository.findByUserAndStatus(user, RequestStatus.PENDING);
        if (existingRequest.isPresent()) {
            throw new RuntimeException("Bạn đã có yêu cầu đang chờ xét duyệt");
        }

        if (frontImg == null || frontImg.isEmpty()) {
            throw new RuntimeException("Ảnh mặt trước CCCD là bắt buộc");
        }
        if (backImg == null || backImg.isEmpty()) {
            throw new RuntimeException("Ảnh mặt sau CCCD là bắt buộc");
        }

        String frontPath = saveFile(frontImg);
        String backPath = saveFile(backImg);
        String licensePath = null;

        if (licenseImg != null && !licenseImg.isEmpty()) {
            licensePath = saveFile(licenseImg);
        }

        LandlordRequest request = LandlordRequest.builder()
                .user(user)
                .cccd(cccd)
                .address(address)
                .expectedRoomCount(roomCount)
                .frontImagePath(frontPath)
                .backImagePath(backPath)
                .businessLicensePath(licensePath)
                .status(RequestStatus.PENDING)
                .build();

        requestRepository.save(request);
        return "Gửi yêu cầu thành công! Vui lòng chờ Admin duyệt.";
    }

    private String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File không được để trống");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("File phải là ảnh (JPG, PNG)");
        }

        long maxSize = 5 * 1024 * 1024; // 5MB
        if (file.getSize() > maxSize) {
            throw new RuntimeException("Kích thước file không được vượt quá 5MB");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    public java.util.List<LandlordRequest> getAllRequests(String status) {
        if (status == null) {
            return requestRepository.findAll();
        }
        try {
            RequestStatus st = RequestStatus.valueOf(status.toUpperCase());
            return requestRepository.findAll().stream()
                    .filter(r -> r.getStatus() == st)
                    .toList();
        } catch (Exception e) {
            throw new RuntimeException("Trạng thái không hợp lệ");
        }
    }

    @Transactional
    public void approveRequest(Integer id) {
        LandlordRequest req = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu"));

        if (req.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Yêu cầu không ở trạng thái chờ duyệt");
        }

        // 1. Cập nhật trạng thái Request
        req.setStatus(RequestStatus.APPROVED);
        req.setProcessedAt(java.time.LocalDateTime.now());
        requestRepository.save(req);

        // 2. Cập nhật Role cho User
        User user = req.getUser();
        user.setRole(Role.LANDLORD); // Đã chuẩn theo Enum
        userRepository.save(user);

        // 3. Tạo thông tin trong bảng Landlord (CÓ KIỂM TRA TỒN TẠI)
        // Kiểm tra xem ông này đã có trong bảng landlords chưa để tránh lỗi
        if (landlordRepository.findByUser(user).isEmpty()) {
            Landlord newLandlord = Landlord.builder() // Dùng Builder cho gọn nếu class có @Builder
                    .user(user)
                    .cccd(req.getCccd())
                    .address(req.getAddress())
                    .expectedRoomCount(req.getExpectedRoomCount())
                    .frontImagePath(req.getFrontImagePath())
                    .backImagePath(req.getBackImagePath())
                    .businessLicensePath(req.getBusinessLicensePath())
                    .provinceCode(req.getProvinceCode())
                    .districtCode(req.getDistrictCode())
                    .approved("APPROVED") // Set cứng luôn cho chắc chắn
                    .build();

            // Nếu không dùng Builder thì dùng setter như cũ cũng được:
            /*
            Landlord newLandlord = new Landlord();
            newLandlord.setUser(user);
            ... set các trường khác ...
            newLandlord.setApproved("APPROVED");
            */

            landlordRepository.save(newLandlord);
        }
    }

    @Transactional
    public void rejectRequest(Integer id, String reason) {
        LandlordRequest req = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu"));

        if (req.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Yêu cầu không ở trạng thái chờ duyệt");
        }

        req.setStatus(RequestStatus.REJECTED);
        req.setRejectionReason(reason);
        req.setProcessedAt(java.time.LocalDateTime.now());
        requestRepository.save(req);
    }
}