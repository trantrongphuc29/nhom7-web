# Lapstore Backend API - Theo Chuc Nang

Tai lieu nay dung de giao viec va tich hop Frontend.
Base URL mac dinh: `/api/v1`

## 1) Auth va Phan quyen (Session Cookie)

### POST `/auth/register`
- Mo ta: Dang ky tai khoan moi.
- Auth: Khong can token.
- Body:
```json
{
  "full_name": "Nguyen Van A",
  "email": "user@gmail.com",
  "phone": "0912345678",
  "password": "123456",
  "password_confirmation": "123456"
}
```
- Response 201:
```json
{
  "success": true,
  "message": "Register successful",
  "data": {
    "user": {
      "id": 1,
      "full_name": "Nguyen Van A",
      "email": "user@gmail.com"
    }
  },
  "meta": {}
}
```

### POST `/auth/login`
- Mo ta: Dang nhap tao session cookie.
- Auth: Khong can token.
- Body:
```json
{
  "email": "user@gmail.com",
  "password": "123456"
}
```

### GET `/auth/me`
- Mo ta: Lay thong tin user hien tai.
- Auth: Yeu cau session cookie hop le.

### POST `/auth/logout`
- Mo ta: Dang xuat va huy session.
- Auth: Yeu cau session cookie hop le.

## 2) San pham Public (Storefront)

### GET `/products`
- Mo ta: Danh sach san pham cho trang home/search.
- Query:
  - `keyword` (optional)
  - `status` (optional)
  - `page`, `per_page` (optional)
- Response:
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "records": [],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 0,
      "last_page": 1
    }
  },
  "meta": {}
}
```

### GET `/products/{id}`
- Mo ta: Chi tiet san pham.
- Auth: Khong can token.

## 3) Quan tri San pham (Admin/Staff)

Tat ca endpoint ben duoi deu can:
- Auth: Session cookie hop le
- Role: `admin` hoac `staff`

### GET `/admin/products`
- Mo ta: Danh sach san pham admin (phan trang).

### POST `/admin/products`
- Mo ta: Tao moi san pham.
- Body:
```json
{
  "name": "ASUS Zenbook 14 OLED",
  "status": "active",
  "sale_price": 27990000,
  "original_price": 29990000,
  "stock_quantity": 12,
  "short_description": "Laptop mong nhe",
  "detail_html": "<p>Chi tiet san pham</p>"
}
```

### GET `/admin/products/{id}`
- Mo ta: Lay chi tiet 1 san pham trong admin.

### PUT `/admin/products/{id}`
- Mo ta: Cap nhat san pham.

### DELETE `/admin/products/{id}`
- Mo ta: Xoa 1 san pham.

### DELETE `/admin/products/bulk-delete`
- Mo ta: Xoa nhieu san pham.
- Body:
```json
{
  "ids": [101, 102, 103]
}
```

## 4) Upload anh san pham (Cloudinary)

### POST `/admin/uploads/images`
- Mo ta: Upload nhieu anh len Cloudinary.
- Auth: Session cookie hop le (admin/staff)
- Content-Type: `multipart/form-data`
- Form fields:
  - `images[]`: file image (bat buoc, toi da 5MB/anh)
- Response:
```json
{
  "success": true,
  "message": "Upload successful",
  "data": {
    "records": [
      {
        "url": "https://res.cloudinary.com/.../image/upload/v....jpg",
        "public_id": "lapstore/products/abc123"
      }
    ]
  },
  "meta": {}
}
```

## 5) Tai khoan nguoi dung (Account) - De trien khai tiep

> Nhom nay chua code route/controller day du trong backend hien tai.

### GET `/account/profile`
- Mo ta: Lay profile user dang nhap.

### PATCH `/account/profile`
- Mo ta: Cap nhat ho ten, so dien thoai.

### POST `/account/password`
- Mo ta: Doi mat khau.

### GET `/account/addresses`
### POST `/account/addresses`
### PATCH `/account/addresses/{id}`
### DELETE `/account/addresses/{id}`
- Mo ta: CRUD so dia chi.

## 6) Don hang (Orders) - De trien khai tiep

> Nhom nay chua code route/controller day du trong backend hien tai.

### POST `/orders`
- Mo ta: Tao don hang tu checkout.

## Quy uoc loi

- `401`: Chua dang nhap hoac session het han.
- `403`: Khong du quyen role.
- `404`: Khong tim thay tai nguyen.
- `422`: Loi validate input.
- `500`: Loi he thong.
