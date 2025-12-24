-- ============================================================
-- MICROSERVICES DATABASE - CHIA ĐỀU CHO 3 NGƯỜI
-- Mỗi người 1 database độc lập
-- ============================================================

-- ============================================================
-- MEMBER 1: AUTH_DB - Authentication & User Management
-- Port: 8081
-- ============================================================
DROP DATABASE IF EXISTS auth_db;
CREATE DATABASE auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auth_db;

-- Bảng users (core authentication)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  role TINYINT NOT NULL DEFAULT 2 COMMENT '0=Admin, 1=Landlord, 2=Tenant',
  status ENUM('ACTIVE','BANNED','PENDING') DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng refresh_tokens
CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expiry_date DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng tenants
CREATE TABLE tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  cccd VARCHAR(20) UNIQUE,
  date_of_birth DATE,
  province_code INT,
  district_code INT,
  address VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng landlords
CREATE TABLE landlords (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  cccd VARCHAR(20),
  address VARCHAR(255),
  expected_room_count INT,
  province_code INT,
  district_code INT,
  front_image_path VARCHAR(255),
  back_image_path VARCHAR(255),
  business_license_path VARCHAR(255),
  approved ENUM('APPROVED') DEFAULT 'APPROVED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng landlord_requests (yêu cầu đăng ký làm chủ trọ)
CREATE TABLE landlord_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  cccd VARCHAR(20) NOT NULL,
  address VARCHAR(255) NOT NULL,
  expected_room_count INT NOT NULL,
  province_code INT,
  district_code INT,
  front_image_path VARCHAR(255) NOT NULL,
  back_image_path VARCHAR(255) NOT NULL,
  business_license_path VARCHAR(255) NOT NULL,
  status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  rejection_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for MEMBER 1
INSERT INTO users (username, password, full_name, email, phone, role, status) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'admin@techroom.vn', '0909000001', 0, 'ACTIVE'),
('landlord1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyễn Văn An', 'vanan@techroom.vn', '0909111001', 1, 'ACTIVE'),
('landlord2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Trần Thị Bích', 'thibich@techroom.vn', '0909111002', 1, 'ACTIVE'),
('tenant1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Phạm Thị Dung', 'dungpham@gmail.com', '0909222001', 2, 'ACTIVE'),
('tenant2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Hoàng Văn Em', 'emhoang@gmail.com', '0909222002', 2, 'ACTIVE'),
('tenant3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Võ Thị Phượng', 'phuongvo@gmail.com', '0909222003', 2, 'ACTIVE');

INSERT INTO landlords (user_id, cccd, address, expected_room_count, province_code, district_code, business_license_path) VALUES
(2, '079123456789', '69 Cần Vương, Quy Nhơn', 10, 1, 1, 'GP123456'),
(3, '080987654321', '789 Nguyễn Thị Thập, TP.HCM', 8, 2, 3, 'GP654321');

INSERT INTO tenants (user_id, cccd, date_of_birth, province_code, district_code, address) VALUES
(4, '079123456789', '2000-04-12', 1, 2, 'An Nhơn, Bình Định'),
(5, '079987654321', '1999-10-22', 2, 3, 'Quận 7, TP.HCM'),
(6, '080123456789', '2001-05-15', 3, 4, 'Tuy Hòa, Phú Yên');


-- ============================================================
-- MEMBER 2: ROOM_DB - Room & Building Management
-- Port: 8082
-- ============================================================
DROP DATABASE IF EXISTS room_db;
CREATE DATABASE room_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE room_db;

-- Bảng provinces (tỉnh/thành phố)
CREATE TABLE provinces (
  code INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  division_type VARCHAR(50),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng districts (quận/huyện)
CREATE TABLE districts (
  code INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  province_code INT NOT NULL,
  division_type VARCHAR(50),
  FOREIGN KEY (province_code) REFERENCES provinces(code),
  INDEX idx_province (province_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng buildings (tòa nhà/dãy trọ)
CREATE TABLE buildings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  landlord_id INT NOT NULL COMMENT 'ID từ auth_db.landlords.id',
  name VARCHAR(100) NOT NULL,
  province_code INT,
  district_code INT,
  address VARCHAR(255),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (province_code) REFERENCES provinces(code),
  FOREIGN KEY (district_code) REFERENCES districts(code),
  INDEX idx_landlord_id (landlord_id),
  INDEX idx_province (province_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng rooms (phòng trọ)
CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  building_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  area DECIMAL(5,2),
  status ENUM('AVAILABLE','OCCUPIED','REPAIRING') DEFAULT 'AVAILABLE',
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
  INDEX idx_building_id (building_id),
  INDEX idx_status (status),
  INDEX idx_price (price),
  INDEX idx_area (area)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng room_images (ảnh phòng)
CREATE TABLE room_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_room_id (room_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng amenities (tiện ích)
CREATE TABLE amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(255),
  description VARCHAR(255),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng room_amenities (phòng - tiện ích, many-to-many)
CREATE TABLE room_amenities (
  room_id INT NOT NULL,
  amenity_id INT NOT NULL,
  PRIMARY KEY (room_id, amenity_id),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng reviews (đánh giá phòng)
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  tenant_id INT NOT NULL COMMENT 'user_id từ auth_db.users',
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment LONGTEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_review_room_tenant (room_id, tenant_id),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  INDEX idx_room_id (room_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng review_reports (báo cáo đánh giá vi phạm)
CREATE TABLE review_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  review_id INT NOT NULL,
  reporter_id INT NOT NULL COMMENT 'user_id từ auth_db.users',
  reason VARCHAR(255) NOT NULL DEFAULT 'OTHER',
  description LONGTEXT,
  note VARCHAR(255),
  status ENUM('PENDING','RESOLVED','DISMISSED') DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  INDEX idx_review_id (review_id),
  INDEX idx_reporter_id (reporter_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for MEMBER 2
INSERT INTO provinces (code, name, division_type) VALUES
(1, 'Bình Định', 'tỉnh'),
(2, 'TP.HCM', 'thành phố trực thuộc trung ương'),
(3, 'Phú Yên', 'tỉnh'),
(4, 'Hà Nội', 'thành phố trực thuộc trung ương');

INSERT INTO districts (code, name, province_code, division_type) VALUES
(1, 'Quy Nhơn', 1, 'thành phố'),
(2, 'An Nhơn', 1, 'huyện'),
(3, 'Quận 7', 2, 'quận'),
(4, 'Quận 1', 2, 'quận'),
(5, 'Tuy Hòa', 3, 'thành phố'),
(6, 'Hoàn Kiếm', 4, 'quận');

INSERT INTO buildings (landlord_id, name, province_code, district_code, address, description) VALUES
(1, 'Dãy trọ Quy Nhơn', 1, 1, '69 Cần Vương, Quy Nhơn, Bình Định', 'Gần trung tâm, 10 phòng'),
(1, 'Dãy trọ An Nhơn', 1, 2, '47 Nguyễn Nhạc, An Nhơn, Bình Định', 'Phòng sinh viên giá rẻ'),
(2, 'Nhà trọ Quận 7', 2, 3, '789 Nguyễn Thị Thập, Quận 7, TP.HCM', 'Phòng gia đình cao cấp'),
(2, 'Dãy trọ Quận 1', 2, 4, '456 Nguyễn Thị Minh Khai, Quận 1, TP.HCM', 'Dân văn phòng');

INSERT INTO rooms (building_id, name, price, area, status, description) VALUES
(1, 'Phòng trọ trung tâm TP Quy Nhơn', 4500000, 25, 'AVAILABLE', 'Phòng sạch sẽ, gần trung tâm, có Wifi & máy lạnh'),
(2, 'Phòng trọ 47 Nguyễn Nhạc', 1500000, 20, 'AVAILABLE', 'Phòng nhỏ gọn, giá rẻ, phù hợp sinh viên'),
(3, 'Phòng gia đình Quận 7', 7800000, 45, 'AVAILABLE', 'Phòng rộng, có bếp nấu ăn, máy giặt'),
(4, 'Dãy trọ đường 102 Nguyễn Thị Minh Khai', 6200000, 35, 'AVAILABLE', 'Phòng hiện đại, có điều hòa, wifi'),
(1, 'Phòng VIP Quy Nhơn', 5500000, 30, 'OCCUPIED', 'Phòng view biển, full nội thất'),
(2, 'Phòng đôi An Nhơn', 2000000, 25, 'AVAILABLE', 'Phòng cho 2 người, có ban công');

INSERT INTO room_images (room_id, image_url) VALUES
(1, 'room1.jpg'), (1, 'room1-detail1.jpg'), (1, 'room1-detail2.jpg'),
(2, 'room2.jpg'), (2, 'room2-detail1.jpg'),
(3, 'room3.jpg'), (3, 'room3-detail1.jpg'), (3, 'room3-detail2.jpg'),
(4, 'room4.jpg'), (4, 'room4-detail1.jpg'),
(5, 'room5.jpg'), (5, 'room5-detail1.jpg'),
(6, 'room6.jpg');

INSERT INTO amenities (name, icon, description) VALUES
('Wifi miễn phí', 'fa-wifi', 'Internet tốc độ cao miễn phí'),
('Máy lạnh', 'fa-snowflake', 'Điều hòa không khí trong phòng'),
('Chỗ đậu xe', 'fa-car', 'Khu vực đỗ xe riêng cho cư dân'),
('Bếp nấu ăn', 'fa-utensils', 'Có bếp và bồn rửa riêng'),
('Máy giặt', 'fa-soap', 'Có sẵn máy giặt trong phòng hoặc khu chung'),
('Thang máy', 'fa-elevator', 'Hỗ trợ di chuyển giữa các tầng'),
('Ban công', 'fa-door-open', 'Ban công thoáng mát');

INSERT INTO room_amenities (room_id, amenity_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 4),
(3, 1), (3, 2), (3, 4), (3, 5),
(4, 1), (4, 2), (4, 3), (4, 6),
(5, 1), (5, 2), (5, 3), (5, 7),
(6, 1), (6, 7);

INSERT INTO reviews (room_id, tenant_id, rating, comment) VALUES
(1, 4, 5, 'Phòng rất sạch sẽ, view đẹp, wifi nhanh. Chủ trọ thân thiện, hỗ trợ tốt!'),
(2, 5, 4, 'Phòng nhỏ nhưng gọn gàng, tiện nghi cơ bản đầy đủ. Wifi hơi yếu vào giờ cao điểm.'),
(3, 6, 5, 'Phòng rộng rãi, bếp nấu ăn đầy đủ, máy giặt tiện lợi. Rất hài lòng!');


-- ============================================================
-- MEMBER 3: BOOKING_DB - Booking & Contract Management
-- Port: 8083
-- ============================================================
DROP DATABASE IF EXISTS booking_db;
CREATE DATABASE booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booking_db;

-- Bảng contracts (hợp đồng thuê phòng)
CREATE TABLE contracts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contract_code VARCHAR(20) UNIQUE,
  room_id INT NOT NULL COMMENT 'ID từ room_db.rooms',
  tenant_id INT NOT NULL COMMENT 'ID từ auth_db.tenants.id',
  landlord_id INT NOT NULL COMMENT 'ID từ auth_db.landlords.id',
  full_name VARCHAR(100) NOT NULL,
  cccd VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  deposit DECIMAL(12,2) DEFAULT 0,
  monthly_rent DECIMAL(12,2),
  notes TEXT,
  rejection_reason TEXT,
  status ENUM('PENDING','APPROVED','ACTIVE','EXPIRED','CANCELLED','REJECTED') DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_room_id (room_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_landlord_id (landlord_id),
  INDEX idx_status (status),
  INDEX idx_contract_code (contract_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for MEMBER 3
INSERT INTO contracts (contract_code, room_id, tenant_id, landlord_id, full_name, cccd, phone, address, start_date, end_date, deposit, monthly_rent, status) VALUES
('HD0000001', 5, 1, 1, 'Phạm Thị Dung', '079123456789', '0909222001', 'An Nhơn, Bình Định', '2025-01-01', '2025-06-01', 11000000, 5500000, 'ACTIVE'),
('HD0000002', 3, 2, 2, 'Hoàng Văn Em', '079987654321', '0909222002', 'Quận 7, TP.HCM', '2025-02-01', '2025-08-01', 15600000, 7800000, 'PENDING'),
('HD0000003', 1, 3, 1, 'Võ Thị Phượng', '080123456789', '0909222003', 'Tuy Hòa, Phú Yên', '2024-09-01', '2024-12-01', 9000000, 4500000, 'EXPIRED'),
('HD0000004', 2, 1, 1, 'Phạm Thị Dung', '079123456789', '0909222001', 'An Nhơn, Bình Định', '2025-03-01', '2025-09-01', 3000000, 1500000, 'PENDING');


-- ============================================================
-- ✅ VERIFY ALL DATABASES
-- ============================================================
SELECT '=== AUTH_DB (MEMBER 1) ===' as info, '' as table_name, NULL as count
UNION ALL SELECT '', 'Users', COUNT(*) FROM auth_db.users
UNION ALL SELECT '', 'Landlords', COUNT(*) FROM auth_db.landlords
UNION ALL SELECT '', 'Tenants', COUNT(*) FROM auth_db.tenants
UNION ALL SELECT '', 'Landlord Requests', COUNT(*) FROM auth_db.landlord_requests

UNION ALL SELECT '=== ROOM_DB (MEMBER 2) ===', '', NULL
UNION ALL SELECT '', 'Provinces', COUNT(*) FROM room_db.provinces
UNION ALL SELECT '', 'Districts', COUNT(*) FROM room_db.districts
UNION ALL SELECT '', 'Buildings', COUNT(*) FROM room_db.buildings
UNION ALL SELECT '', 'Rooms', COUNT(*) FROM room_db.rooms
UNION ALL SELECT '', 'Room Images', COUNT(*) FROM room_db.room_images
UNION ALL SELECT '', 'Amenities', COUNT(*) FROM room_db.amenities
UNION ALL SELECT '', 'Reviews', COUNT(*) FROM room_db.reviews

UNION ALL SELECT '=== BOOKING_DB (MEMBER 3) ===', '', NULL
UNION ALL SELECT '', 'Contracts', COUNT(*) FROM booking_db.contracts;