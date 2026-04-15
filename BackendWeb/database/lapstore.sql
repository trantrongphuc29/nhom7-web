CREATE DATABASE IF NOT EXISTS lapstore;
USE lapstore;

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th4 12, 2026 lúc 04:30 PM
-- Phiên bản máy phục vụ: 9.1.0
-- Phiên bản PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `lapstore`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `status` enum('pending','confirmed','shipping','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_method` enum('cod','bank_transfer','card') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cod',
  `subtotal_amount` int NOT NULL DEFAULT '0',
  `shipping_fee` int NOT NULL DEFAULT '0',
  `discount_amount` int NOT NULL DEFAULT '0',
  `total_amount` int NOT NULL DEFAULT '0',
  `ship_recipient_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ship_phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ship_line1` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ship_line2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ship_ward` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ship_district` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ship_province` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_orders_code` (`code`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_status_created` (`status`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=9002 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `code`, `user_id`, `status`, `payment_method`, `subtotal_amount`, `shipping_fee`, `discount_amount`, `total_amount`, `ship_recipient_name`, `ship_phone`, `ship_line1`, `ship_line2`, `ship_ward`, `ship_district`, `ship_province`, `customer_email`, `created_at`, `updated_at`) VALUES
(9001, 'ODR-001', 2, 'pending', 'cod', 0, 0, 0, 35000000, 'Nguyễn Văn Khách', '0901234567', 'Số 1 Lý Tự Trọng', NULL, NULL, NULL, 'Hồ Chí Minh', NULL, '2026-04-12 10:27:40', '2026-04-12 10:27:40');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED DEFAULT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `variant_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(1024) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit_price` int NOT NULL DEFAULT '0',
  `quantity` int NOT NULL DEFAULT '1',
  `line_total` int GENERATED ALWAYS AS ((`unit_price` * `quantity`)) STORED,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `variant_name`, `image_url`, `unit_price`, `quantity`) VALUES
(1, 9001, 101, 'Dell XPS 13', NULL, NULL, 35000000, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_status_events`
--

DROP TABLE IF EXISTS `order_status_events`;
CREATE TABLE IF NOT EXISTS `order_status_events` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` bigint UNSIGNED NOT NULL,
  `status` enum('pending','confirmed','shipping','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_status_events_order` (`order_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive','out_of_stock','coming_soon') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `sale_price` int NOT NULL DEFAULT '0',
  `original_price` int NOT NULL DEFAULT '0',
  `stock_quantity` int NOT NULL DEFAULT '0',
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `detail_html` mediumtext COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_status` (`status`),
  KEY `idx_products_price` (`sale_price`)
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `name`, `status`, `sale_price`, `original_price`, `stock_quantity`, `short_description`, `detail_html`, `created_at`, `updated_at`) VALUES
(101, 'Dell XPS 13', 'active', 35000000, 38000000, 5, NULL, NULL, '2026-04-12 10:27:40', '2026-04-12 10:27:40'),
(102, 'HP Spectre x360', 'active', 32000000, 34000000, 3, NULL, NULL, '2026-04-12 10:27:40', '2026-04-12 10:27:40'),
(103, 'Dell XPS 13 9340 (2024)', 'active', 45990000, 48990000, 5, 'Laptop doanh nhân siêu mỏng nhẹ, màn hình vô cực OLED.', '<p>Dell XPS 13 9340 là biểu tượng của sự sang trọng với chip Intel Core Ultra mới nhất...</p>', '2026-04-12 10:45:00', '2026-04-12 10:45:00'),
(104, 'ROG Strix G16 G614JI', 'active', 38500000, 42000000, 8, 'Quái vật gaming với RTX 4070 và màn hình 240Hz.', '<p>Được thiết kế cho game thủ chuyên nghiệp, hệ thống tản nhiệt 3 quạt siêu mát...</p>', '2026-04-12 10:45:00', '2026-04-12 10:45:00'),
(105, 'MacBook Pro 14 M3 Pro', 'active', 49990000, 52990000, 12, 'Sức mạnh khủng khiếp từ chip M3 Pro, màn hình Liquid Retina XDR.', '<p>Dành cho dân đồ họa và lập trình chuyên nghiệp, thời lượng pin lên tới 18h...</p>', '2026-04-12 10:45:00', '2026-04-12 10:45:00'),
(106, 'Acer Swift Go 14', 'active', 18990000, 21500000, 20, 'Laptop văn phòng ngon bổ rẻ, màn hình OLED 2.8K.', '<p>Trọng lượng chỉ 1.3kg, hỗ trợ đầy đủ cổng kết nối và Webcam QHD...</p>', '2026-04-12 10:45:00', '2026-04-12 10:45:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_images`
--

DROP TABLE IF EXISTS `product_images`;
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint UNSIGNED NOT NULL,
  `url` varchar(1024) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_images_product` (`product_id`),
  KEY `idx_product_images_primary` (`product_id`,`is_primary`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `url`, `sort_order`, `is_primary`, `created_at`) VALUES
(1, 103, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45', 1, 1, '2026-04-12 10:45:00'),
(2, 104, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0', 1, 1, '2026-04-12 10:45:00'),
(3, 105, 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8', 1, 1, '2026-04-12 10:45:00'),
(4, 106, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed', 1, 1, '2026-04-12 10:45:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_specs`
--

DROP TABLE IF EXISTS `product_specs`;
CREATE TABLE IF NOT EXISTS `product_specs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint UNSIGNED NOT NULL,
  `spec_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `spec_value` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_specs` (`product_id`,`spec_key`),
  KEY `idx_product_specs_product` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `product_specs`
--

INSERT INTO `product_specs` (`id`, `product_id`, `spec_key`, `spec_value`) VALUES
(1, 103, 'CPU', 'Intel Core Ultra 7 155H'),
(2, 103, 'RAM', '16GB LPDDR5x 7467MT/s'),
(3, 103, 'Ổ cứng', '512GB SSD NVMe Gen4'),
(4, 103, 'Màn hình', '13.4 inch FHD+ InfinityEdge'),
(5, 103, 'Trọng lượng', '1.19 kg'),
(6, 104, 'CPU', 'Intel Core i9-13980HX'),
(7, 104, 'GPU', 'NVIDIA GeForce RTX 4070 8GB'),
(8, 104, 'RAM', '32GB DDR5 4800MHz'),
(9, 104, 'Màn hình', '16 inch QHD+ 240Hz'),
(10, 104, 'Pin', '90Whrs'),
(11, 105, 'CPU', 'Apple M3 Pro (11-core CPU)'),
(12, 105, 'GPU', '14-core GPU'),
(13, 105, 'RAM', '18GB Unified Memory'),
(14, 105, 'Màn hình', '14.2 inch Liquid Retina XDR'),
(15, 105, 'Màu sắc', 'Space Black'),
(16, 106, 'CPU', 'Intel Core i5-13500H'),
(17, 106, 'RAM', '16GB LPDDR5'),
(18, 106, 'Màn hình', '14 inch OLED 2.8K 90Hz'),
(19, 106, 'Cổng kết nối', '2x USB-C (Thunderbolt 4), 2x USB-A');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('admin','staff','user') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `status` enum('active','blocked') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `loyalty_points` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_role_status` (`role`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `phone`, `role`, `status`, `loyalty_points`, `created_at`, `updated_at`) VALUES
(1, 'admin@gmail.com', '$2y$10$ydseodrBzbZek.zAGIJKseACw48P4Df/c0oRoIiLRTh9QSKTFGV/G', 'Quản trị viên', NULL, 'admin', 'active', 0, '2026-04-12 10:27:40', '2026-04-12 10:42:37'),
(2, 'user@gmail.com', NULL, 'Nguyễn Văn Khách', NULL, 'user', 'active', 0, '2026-04-12 10:27:40', '2026-04-12 10:27:40');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_addresses`
--

DROP TABLE IF EXISTS `user_addresses`;
CREATE TABLE IF NOT EXISTS `user_addresses` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `recipient_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `line1` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `line2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ward` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_addresses_user` (`user_id`),
  KEY `idx_user_addresses_default` (`user_id`,`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `order_status_events`
--
ALTER TABLE `order_status_events`
  ADD CONSTRAINT `fk_order_status_events_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `product_specs`
--
ALTER TABLE `product_specs`
  ADD CONSTRAINT `fk_product_specs_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD CONSTRAINT `fk_user_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
