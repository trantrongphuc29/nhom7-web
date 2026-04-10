# PHAN CONG 5 THANH VIEN - NHOM7 WEB

Repo GitHub: `trantrongphuc29/nhom7-web`  
Pham vi tai lieu: Backend (`BackendWeb`)

## Quy uoc tao nhanh GitHub

- Nhanh nen tao tu `develop` (hoac `main` neu nhom chua dung `develop`).
- Ten nhanh theo mau:
  - `feature/auth-user-management`
  - `feature/public-products-search`
  - `feature/admin-products-upload`
  - `feature/user-profile-address`
  - `feature/orders-vouchers`
- Tao Pull Request vao `develop`, review cheo truoc khi merge.

## Phan cong theo 5 thanh vien

> Ban co the thay `Thanh vien 1..5` bang ten that cua tung nguoi.

### 1) Thanh vien 1 - Auth + Phan quyen

- Nhanh GitHub: `feature/auth-user-management`
- Folder backend lam viec:
  - `app/Http/Controllers/Api/V1/AuthController.php`
  - `routes/api.php`
  - `app/Http/Middleware/*` (neu bo sung)
  - `app/Models/User.php`
- Nhiem vu:
  - Dang ky, dang nhap JWT.
  - Lay thong tin user hien tai (`me`), dang xuat.
  - Hoan thien validate + response format thong nhat.
- API phu trach:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/auth/me`
  - `POST /api/v1/auth/logout`

### 2) Thanh vien 2 - San pham public (trang khach hang)

- Nhanh GitHub: `feature/public-products-search`
- Folder backend lam viec:
  - `app/Http/Controllers/Api/V1/ProductController.php`
  - `routes/api.php`
  - `app/Models/Product.php`
- Nhiem vu:
  - API danh sach san pham public.
  - API chi tiet san pham.
  - Loc/tim kiem/phan trang theo nhu cau frontend.
- API phu trach:
  - `GET /api/v1/products`
  - `GET /api/v1/products/{id}`

### 3) Thanh vien 3 - Admin quan ly san pham + upload anh

- Nhanh GitHub: `feature/admin-products-upload`
- Folder backend lam viec:
  - `app/Http/Controllers/Api/V1/Admin/ProductController.php`
  - `app/Http/Controllers/Api/V1/Admin/UploadController.php`
  - `routes/api.php`
  - `app/Models/Product.php`
- Nhiem vu:
  - CRUD san pham ben admin.
  - Xoa nhieu san pham (`bulk delete`).
  - Upload anh (Cloudinary) va tra URL/public_id.
- API phu trach:
  - `GET /api/v1/admin/products`
  - `POST /api/v1/admin/products`
  - `GET /api/v1/admin/products/{id}`
  - `PUT /api/v1/admin/products/{id}`
  - `DELETE /api/v1/admin/products/{id}`
  - `DELETE /api/v1/admin/products/bulk-delete`
  - `POST /api/v1/admin/uploads/images`

### 4) Thanh vien 4 - Tai khoan user (Profile + Address)

- Nhanh GitHub: `feature/user-profile-address`
- Folder backend lam viec:
  - `app/Http/Controllers/Api/V1/Account/ProfileController.php`
  - `app/Http/Controllers/Api/V1/Account/AddressController.php` (tao moi)
  - `routes/api.php`
  - `app/Models/UserAddress.php` (tao moi neu chua co)
- Nhiem vu:
  - Lay/cap nhat profile user.
  - Doi mat khau.
  - CRUD dia chi giao hang cua user.
- API phu trach:
  - `GET /api/v1/account/profile`
  - `PATCH /api/v1/account/profile`
  - `POST /api/v1/account/password`
  - `GET /api/v1/account/addresses`
  - `POST /api/v1/account/addresses`
  - `PATCH /api/v1/account/addresses/{id}`
  - `DELETE /api/v1/account/addresses/{id}`

### 5) Thanh vien 5 - Don hang + Voucher

- Nhanh GitHub: `feature/orders-vouchers`
- Folder backend lam viec:
  - `app/Http/Controllers/Api/V1/OrderController.php` (tao moi)
  - `app/Http/Controllers/Api/V1/Admin/OrderController.php` (tao moi)
  - `app/Http/Controllers/Api/V1/VoucherController.php` (tao moi)
  - `app/Http/Controllers/Api/V1/Admin/PromotionController.php` (tao moi)
  - `routes/api.php`
  - `app/Models/Order.php`, `app/Models/Voucher.php` (neu chua co)
- Nhiem vu:
  - Tao don hang tu checkout.
  - User xem lich su don.
  - Admin quan ly trang thai don.
  - Admin CRUD voucher/khuyen mai + endpoint preview voucher.
- API phu trach:
  - `POST /api/v1/orders`
  - `GET /api/v1/account/orders`
  - `GET /api/v1/admin/orders`
  - `GET /api/v1/admin/orders/{id}`
  - `PATCH /api/v1/admin/orders/{id}/status`
  - `GET /api/v1/admin/promotions`
  - `POST /api/v1/admin/promotions/vouchers`
  - `PUT /api/v1/admin/promotions/vouchers/{id}`
  - `DELETE /api/v1/admin/promotions/vouchers/{id}`
  - `POST /api/v1/vouchers/preview`

---

## Nhanh de hotfix/chung

- Sua loi gap: `hotfix/<mo-ta-ngan>`
- Viec chung (tai lieu, cleanup): `chore/<mo-ta-ngan>`
- Khong code truc tiep len `main`.

## Goi y quy trinh lam viec

1. Pull code moi nhat tu `develop`.
2. Tao nhanh dung ten chuc nang.
3. Code trong pham vi duoc phan cong.
4. Tu test API bang Postman/Thunder Client.
5. Tao PR + mo ta endpoint da lam + hinh/chung minh test.
6. Sau khi duoc review moi merge.
