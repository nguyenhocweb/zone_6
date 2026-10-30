# 📋 HỆ THỐNG GIÁM SÁT TIẾN ĐỘ & QUY TRÌNH CẬP NHẬT TÌNH TRẠNG (PLANE AUDIT)

> **QUY ĐỊNH BẮT BUỘC DÀNH CHO TẤT CẢ AI AGENTS & DEVELOPERS:**  
> Thư mục `plane/giam_sat/` là sổ cái theo dõi tình trạng vận hành thực tế của dự án Zone Six.  
> **MỖI LẦN VIẾT CODE, SỬA LOGIC HOẶC THAY ĐỔI SCHEMA/API, BẮT BUỘC PHẢI CẬP NHẬT TÌNH TRẠNG VÀO ĐÂY.**

---

## 1. CẤU TRÚC THƯ MỤC GIÁM SÁT

```text
plane/giam_sat/
├── README.md              # Quy chuẩn và hướng dẫn cập nhật bắt buộc này
├── tien_do_chuc_nang.md   # Bảng ma trận theo dõi trạng thái tất cả chức năng (ĐÃ LÀM / ĐANG LÀM / KẾ HOẠCH)
└── nhat_ky_cap_nhat.md    # Nhật ký kiểm toán (Audit Log) ghi nhận chi tiết mỗi phiên làm việc
```

---

## 2. QUY TRÌNH 3 BƯỚC BẮT BUỘC KHI CODE (MANDATORY 3-STEP PROTOCOL)

```text
┌────────────────────────────────────────────────────────┐
│ BƯỚC 1: TRƯỚC KHI CODE (PRE-FLIGHT CHECK)              │
│ - Đọc tài liệu vai trò tại plane/vai_tro/               │
│ - Đọc mô tả chức năng tại plane/chuc_nang/              │
│ - Đọc luồng hoạt động tại plane/luong_hoat_dong/        │
│ ➔ Đảm bảo hiểu rõ ranh giới quyền hạn & luồng dữ liệu   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ BƯỚC 2: TIẾN HÀNH VIẾT CODE & KIỂM THỬ                 │
│ - Tuân thủ Hiến pháp Kỹ thuật (.agents/AGENTS.md)       │
│ - Phân rã CRUD granular, không gộp file                │
│ - Kiểm thử chạy thực tế hoặc kiểm tra lỗi cú pháp     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ BƯỚC 3: SAU KHI CODE (POST-CODING AUDIT) [BẮT BUỘC]    │
│ 1. Cập nhật trạng thái vào plane/giam_sat/tien_do_chuc_nang.md │
│ 2. Ghi 1 dòng nhật ký vào plane/giam_sat/nhat_ky_cap_nhat.md    │
│ 3. Cập nhật completed_tasks tại .agents/session_state.json     │
└────────────────────────────────────────────────────────┘
```

---

## 3. NỘI DUNG CẦN CẬP NHẬT TRONG MỖI BƯỚC

### 3.1 Cập nhật `plane/giam_sat/tien_do_chuc_nang.md`
- Cập nhật cột **Trạng Thái**: `✅ ĐÃ LÀM`, `⏳ ĐANG LÀM`, hoặc `📌 KẾ HOẠCH`.
- Cập nhật cột **Files Liên Quan (BE & FE)**: Ghi rõ đường dẫn file controller/service/component vừa tạo hoặc sửa.
- Cập nhật cột **Ngày Cập Nhật Cuối**.

### 3.2 Ghi nhật ký vào `plane/giam_sat/nhat_ky_cap_nhat.md`
- Cấu trúc 1 mục nhật ký:
  ```markdown
  ### [YYYY-MM-DD HH:mm] - [Tên chức năng / Tác vụ]
  - **Người/Agent thực hiện:** [Tên Agent hoặc Developer]
  - **Mã chức năng liên quan:** CNxx
  - **Tệp thay đổi:** danh sách file
  - **Nội dung thay đổi:** Tóm tắt logic đã thêm/sửa/xóa
  - **Trạng thái:** Hoàn tất / Đang kiểm thử
  ```

### 3.3 Cập nhật `.agents/session_state.json`
- Đưa nhiệm vụ vừa hoàn thành vào mảng `completed_tasks`.
- Cập nhật trường `last_updated`.
