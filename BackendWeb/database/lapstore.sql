-- Lapstore database schema (MySQL 8+)
-- Notes/assumptions:
-- - Frontend hiện có các luồng: listing sản phẩm, giỏ hàng, checkout, tài khoản, admin (products/orders/customers/promotions).
-- - "Cart" đang lưu localStorage nên không bắt buộc DB; DB tập trung vào orders và entities cốt lõi.
-- - Có snapshot dữ liệu sản phẩm trong order_items để tránh lệ thuộc thay đổi sau này.

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- ------------------------------------------------------------
-- Core: users & addresses
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NULL,
  role ENUM('admin','staff','user') NOT NULL DEFAULT 'user',
  status ENUM('active','blocked') NOT NULL DEFAULT 'active',
  loyalty_points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  KEY idx_users_role_status (role, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_addresses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  line1 VARCHAR(255) NOT NULL,
  line2 VARCHAR(255) NULL,
  ward VARCHAR(255) NULL,
  district VARCHAR(255) NULL,
  province VARCHAR(255) NOT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_addresses_user (user_id),
  KEY idx_user_addresses_default (user_id, is_default),
  CONSTRAINT fk_user_addresses_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  status ENUM('active','inactive','out_of_stock','coming_soon') NOT NULL DEFAULT 'active',
  -- pricing/stock: map theo admin form (salePrice/originalPrice/stockQuantity)
  sale_price INT NOT NULL DEFAULT 0,
  original_price INT NOT NULL DEFAULT 0,
  stock_quantity INT NOT NULL DEFAULT 0,
  short_description TEXT NULL,
  detail_html MEDIUMTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_status (status),
  KEY idx_products_price (sale_price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  url VARCHAR(1024) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_product_images_product (product_id),
  KEY idx_product_images_primary (product_id, is_primary),
  CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Flexible specs: lưu dạng key/value để map với ProductSpecsForm
CREATE TABLE IF NOT EXISTS product_specs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  spec_key VARCHAR(100) NOT NULL,
  spec_value VARCHAR(500) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_product_specs (product_id, spec_key),
  KEY idx_product_specs_product (product_id),
  CONSTRAINT fk_product_specs_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Promotions/Vouchers
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS vouchers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  discount_type ENUM('fixed','percent') NOT NULL,
  discount_value INT NOT NULL,
  max_discount_amount INT NULL,
  min_order_amount INT NULL,
  usage_limit INT NULL,
  used_count INT NOT NULL DEFAULT 0,
  start_at DATETIME NULL,
  end_at DATETIME NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_vouchers_code (code),
  KEY idx_vouchers_status_time (status, start_at, end_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Orders
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  status ENUM('pending','confirmed','shipping','completed','cancelled') NOT NULL DEFAULT 'pending',
  payment_method ENUM('cod','bank_transfer','card') NOT NULL DEFAULT 'cod',
  voucher_id BIGINT UNSIGNED NULL,
  subtotal_amount INT NOT NULL DEFAULT 0,
  shipping_fee INT NOT NULL DEFAULT 0,
  discount_amount INT NOT NULL DEFAULT 0,
  voucher_discount_amount INT NOT NULL DEFAULT 0,
  total_amount INT NOT NULL DEFAULT 0,
  -- shipping snapshot (đúng với flow ShippingInfo/Checkout)
  ship_recipient_name VARCHAR(255) NOT NULL,
  ship_phone VARCHAR(30) NOT NULL,
  ship_line1 VARCHAR(255) NOT NULL,
  ship_line2 VARCHAR(255) NULL,
  ship_ward VARCHAR(255) NULL,
  ship_district VARCHAR(255) NULL,
  ship_province VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_orders_code (code),
  KEY idx_orders_user (user_id),
  KEY idx_orders_status_created (status, created_at),
  KEY idx_orders_voucher (voucher_id),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_orders_voucher
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NULL,
  product_name VARCHAR(255) NOT NULL,
  variant_name VARCHAR(255) NULL,
  image_url VARCHAR(1024) NULL,
  unit_price INT NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  line_total INT AS (unit_price * quantity) STORED,
  PRIMARY KEY (id),
  KEY idx_order_items_order (order_id),
  KEY idx_order_items_product (product_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_status_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending','confirmed','shipping','completed','cancelled') NOT NULL,
  note VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_status_events_order (order_id, created_at),
  CONSTRAINT fk_order_status_events_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Seed data
-- ------------------------------------------------------------
-- Chạy cả file để tạo bảng + dữ liệu mẫu.
-- Nếu muốn nạp lại dữ liệu mẫu, chạy riêng đoạn dưới.

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_status_events;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE product_specs;
TRUNCATE TABLE product_images;
TRUNCATE TABLE products;
TRUNCATE TABLE user_addresses;
TRUNCATE TABLE vouchers;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (id, email, password_hash, full_name, phone, role, status, loyalty_points) VALUES
  (1, 'admin@gmail.com', NULL, 'Lapstore Admin', '0901234567', 'admin', 'active', 0),
  (2, 'staff@gmail.com', NULL, 'Lapstore Staff', '0909999999', 'staff', 'active', 0),
  (201, 'user@gmail.com', NULL, 'Nguyen Van A', '0912345678', 'user', 'active', 230),
  (202, 'b@lapstore.vn', NULL, 'Tran Thi B', '0988222111', 'user', 'blocked', 45);

INSERT INTO user_addresses (id, user_id, recipient_name, phone, line1, line2, ward, district, province, is_default) VALUES
  (1, 201, 'Nguyen Van A', '0912345678', '123 Le Loi', '', 'Phuong Ben Thanh', 'Quan 1', 'TP Ho Chi Minh', 1),
  (2, 201, 'Nguyen Van A', '0912345678', '56 Tran Phu', 'Tang 3', 'Phuong Dien Bien', 'Ba Dinh', 'Ha Noi', 0);

INSERT INTO products (id, name, status, sale_price, original_price, stock_quantity, short_description, detail_html) VALUES
  (101, 'ASUS Zenbook 14 OLED', 'active', 27990000, 29990000, 12,
   'Mau laptop OLED mong nhe cho cong viec va di chuyen.',
   '<p>Man hinh OLED 2.8K, pin ben bi va hieu nang on dinh cho cong viec hang ngay.</p>'),
  (102, 'Lenovo LOQ 15', 'active', 25990000, 27990000, 8,
   'Gaming laptop manh me voi RTX va tan nhiet on dinh.',
   '<p>Phu hop cho gaming va do hoa voi bo xu ly Intel Core i7 va RTX 4060.</p>'),
  (103, 'MacBook Air M3 13', 'coming_soon', 33990000, 33990000, 0,
   'Mau laptop Apple the he moi, pin dai va nhe.',
   '<p>Chip M3 tiet kiem dien nang, phu hop hoc tap va cong viec sang tao.</p>');

INSERT INTO product_images (id, product_id, url, sort_order, is_primary) VALUES
  (1001, 101, 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=960&q=80', 1, 1),
  (1002, 102, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=960&q=80', 1, 1),
  (1003, 103, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=960&q=80', 1, 1);

INSERT INTO product_specs (product_id, spec_key, spec_value) VALUES
  (101, 'cpu', 'Intel Core Ultra 7'),
  (101, 'ram', '16GB LPDDR5X'),
  (101, 'storage', '1TB SSD'),
  (101, 'screen_size', '14 inch'),
  (101, 'screen_resolution', '2880x1800'),
  (101, 'os', 'Windows 11'),
  (102, 'cpu', 'Intel Core i7-13620H'),
  (102, 'gpu_discrete', 'RTX 4060 8GB'),
  (102, 'ram', '16GB DDR5'),
  (102, 'storage', '512GB SSD'),
  (102, 'screen_size', '15.6 inch'),
  (102, 'os', 'Windows 11'),
  (103, 'cpu', 'Apple M3'),
  (103, 'ram', '16GB Unified'),
  (103, 'storage', '512GB SSD'),
  (103, 'screen_size', '13.6 inch'),
  (103, 'os', 'macOS');

INSERT INTO vouchers (id, code, name, discount_type, discount_value, max_discount_amount, min_order_amount, usage_limit, used_count, start_at, end_at, status) VALUES
  (1, 'WELCOME500K', 'Giam 500K cho don dau', 'fixed', 500000, NULL, 5000000, 1000, 12, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'active'),
  (2, 'SALE10', 'Giam 10% toi da 1 trieu', 'percent', 10, 1000000, 3000000, 5000, 128, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 'active');

INSERT INTO orders (
  id, code, user_id, status, payment_method, voucher_id,
  subtotal_amount, shipping_fee, discount_amount, voucher_discount_amount, total_amount,
  ship_recipient_name, ship_phone, ship_line1, ship_line2, ship_ward, ship_district, ship_province, customer_email
) VALUES
  (
    9001, 'ODR-9001', 201, 'pending', 'cod', 1,
    27990000, 50000, 500000, 500000, 27540000,
    'Nguyen Van A', '0912345678', '123 Le Loi', '', 'Phuong Ben Thanh', 'Quan 1', 'TP Ho Chi Minh', 'customer@lapstore.vn'
  ),
  (
    9002, 'ODR-9002', 201, 'confirmed', 'bank_transfer', 2,
    25990000, 0, 1000000, 1000000, 24990000,
    'Nguyen Van A', '0912345678', '56 Tran Phu', 'Tang 3', 'Phuong Dien Bien', 'Ba Dinh', 'Ha Noi', 'customer@lapstore.vn'
  );

INSERT INTO order_items (id, order_id, product_id, product_name, variant_name, image_url, unit_price, quantity) VALUES
  (1, 9001, 101, 'ASUS Zenbook 14 OLED', '16GB / 1TB / Bac', 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=960&q=80', 27990000, 1),
  (2, 9002, 102, 'Lenovo LOQ 15', '16GB / 512GB / Den', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=960&q=80', 25990000, 1);

INSERT INTO order_status_events (order_id, status, note, created_at) VALUES
  (9001, 'pending', 'Don hang moi tao', NOW() - INTERVAL 1 DAY),
  (9002, 'pending', 'Don hang moi tao', NOW() - INTERVAL 2 DAY),
  (9002, 'confirmed', 'Da xac nhan thanh toan', NOW() - INTERVAL 1 DAY);

