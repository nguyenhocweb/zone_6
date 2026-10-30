# 🏛️ HỆ THỐNG PHÂN TÍCH NGHIỆP VỤ & TÀI LIỆU GỐC (PLANE)
# DỰ ÁN QUẢN LÝ VẬN HÀNH CHUỖI ĐA CƠ SỞ ZONE SIX (MULTI-STORE)

> **QUY CHUẨN BẮT BUỘC (ARCHITECTURAL CONSTITUTION):**  
> Thư mục `plane/` là **Single Source of Truth (Tài liệu gốc tối cao)** cho toàn bộ quy trình vận hành và nghiệp vụ của chuỗi Zone Six.  
> Mọi AI Agent và lập trình viên khi **thêm code, sửa logic, hoặc xóa bỏ chức năng** BẮT BUỘC:
> 1. Đọc tài liệu tại đây để nắm rõ Vai Trò, Chức Năng, Phạm Vi Cơ Sở (Store Scope) và Luồng Hoạt Động.
> 2. Cập nhật ngay tình trạng vào `plane/giam_sat/tien_do_chuc_nang.md`.
> 3. Ghi log vào `plane/giam_sat/nhat_ky_cap_nhat.md` và `.agents/session_state.json`.

---

## 🏢 NGUYÊN TẮC VẬN HÀNH CHUỖI ĐA CƠ SỞ (MULTI-STORE ARCHITECTURE)

Hệ thống Zone Six vận hành theo mô hình chuỗi đa cơ sở (Multi-store / Multi-branch) với cơ chế phân định phạm vi cơ sở (Store Scope) rõ rệt:
1. **Admin Hệ Thống (`admin_he_thong`):**
   - Quản trị toàn bộ chuỗi hệ thống (Super Admin).
   - Có thể quản lý **tất cả các cơ sở** hoặc **nhiều cơ sở / một vài cơ sở** cụ thể.
   - Độc quyền tạo, sửa, cấu hình danh mục cơ sở và phân quyền cơ sở quản lý cho từng tài khoản Quản lý / Admin chi nhánh.
   - Sử dụng bộ chuyển đổi cơ sở (Store Switcher) trên thanh điều hướng để xem và điều hành dữ liệu theo từng cơ sở hoặc xem tổng hợp toàn hệ thống.
2. **Quản Lý Quán (`quan_ly`):**
   - Được Admin phân quyền quản lý **1 cơ sở** hoặc **vài / nhiều cơ sở** cụ thể.
   - Chỉ có quyền xem nhân sự, duyệt lịch, xem bảng lương và cấu hình GPS của **đúng các cơ sở được phân công**.
3. **Trưởng Ca (`truong_ca`):**
   - **RÀNG BUỘC CỨNG (STRICT 1-STORE SCOPE):** Chỉ làm việc và phụ trách tại **ĐÚNG 1 CƠ SỞ DUY NHẤT** cố định.
   - Không được chuyển cơ sở tự do, không quản lý chéo sang cơ sở khác.
   - Mọi quyền hạn (tích điểm danh trên ô ca, điều phối ca trực, xem bảng lương, xem nhân sự cấp dưới) chỉ giới hạn tuyệt đối trong phạm vi cơ sở được phân công.
4. **Phó Ca & Nhân Viên (`pho_ca_lam_lich`, `pho_ca_vat_lieu`, `nhan_vien`):**
   - Thuộc về biên chế của 1 cơ sở cụ thể, check-in GPS tại tọa độ của đúng cơ sở đó.

---

## 📂 CẤU TRÚC PHÂN CẤP 5 TẦNG THƯ MỤC `plane/`

```text
plane/
├── README.md                                  # [File chỉ dẫn quy chuẩn tài liệu gốc này]
│
├── vai_tro/                                   # [1. MÔ TẢ CHI TIẾT TỪNG VAI TRÒ & PHẠM VI CƠ SỞ]
│   ├── README.md                              # Tổng quan 6 vai trò & Ma trận phân quyền đa cơ sở
│   ├── 01_admin_he_thong.md                   # Role: Admin Hệ Thống (Toàn quyền chuỗi, Zalo Bot, Phân cơ sở quản lý)
│   ├── 02_quan_ly.md                          # Role: Quản Lý (Quản lý 1 hoặc vài/nhiều cơ sở được phân quyền)
│   ├── 03_truong_ca.md                        # Role: Trưởng Ca (Ràng buộc chặt: Chỉ làm việc tại ĐÚNG 1 cơ sở duy nhất)
│   ├── 04_pho_ca_lam_lich.md                  # Role: Phó Ca Làm Lịch (AutoScheduler cho cơ sở, ẨN DẤU TÍCH & LƯƠNG)
│   ├── 05_pho_ca_vat_lieu.md                  # Role: Phó Ca Vật Liệu (Kho nguyên vật liệu theo từng cơ sở, chỉ xem lịch)
│   └── 06_nhan_vien.md                        # Role: Nhân Viên (Đăng ký ca cơ sở, Check-in Camera+GPS tại cơ sở)
│
├── co_so_du_lieu/                             # [2. KIẾN TRÚC CƠ SỞ DỮ LIỆU & ERD ĐA CƠ SỞ]
│   ├── README.md                              # Tổng quan MongoDB Atlas, danh bạ 16 collections
│   ├── 01_so_do_thuc_the_erd.md               # Sơ đồ thực thể ERD chi tiết, liên kết đa cơ sở
│   ├── 02_chi_tiet_cac_collection.md          # Đặc tả chi tiết 16 schemas, fields, kiểu & indexes
│   └── 03_quy_trinh_seed_va_migration.md      # Quy trình nạp seed phân tầng, clean & sync Prisma
│
├── chuc_nang/                                 # [3. MÔ TẢ CHI TIẾT TỪNG TÍNH NĂNG (CN01 -> CN11)]
│   ├── README.md                              # Bảng danh mục và hiện trạng 11 tính năng đa cơ sở
│   ├── CN01_xac_thuc_va_tai_khoan.md          # Đăng nhập, JWT Cookie đính kèm phạm vi cơ sở (Store Scope)
│   ├── CN02_quan_ly_nhan_su.md                # Phân cấp xem/sửa, phân bổ nhân sự vào cơ sở, thêm NV tự sinh pass
│   ├── CN03_dang_ky_ca_tuan.md                # Đăng ký nguyện vọng ca tuần theo từng cơ sở cụ thể
│   ├── CN04_xep_lich_va_auto_scheduler.md     # Ma trận ca tuần theo cơ sở, AutoScheduler, xuất Excel theo cơ sở
│   ├── CN05_diem_danh_gps_camera.md           # Camera trực tiếp, Geofence GPS đối chiếu theo tọa độ từng cơ sở
│   ├── CN06_cau_hinh_checkin_va_quan.md       # Quản lý danh mục đa cơ sở, tọa độ GPS & Geofence riêng từng cơ sở
│   ├── CN07_tich_diem_danh_truc_tiep.md       # Admin/Quản lý/Trưởng ca tích điểm danh (Trưởng ca chỉ tích ở đúng 1 cơ sở)
│   ├── CN08_trung_tam_thong_bao.md            # 6 collection riêng theo Role gắn ngữ cảnh cơ sở, modal dead-center
│   ├── CN09_quan_ly_bang_luong.md             # Xem bảng lương tháng theo cơ sở, Trưởng ca chỉ xem cơ sở mình
│   ├── CN10_zalo_automation_bot.md            # Zalo personal bot qua zca-js, gửi tin theo nhóm cơ sở, độc quyền Admin
│   └── CN11_quan_ly_vat_lieu_kho.md           # Quản lý tồn kho nguyên vật liệu phân lập theo từng cơ sở (Phó ca VL)
│
├── luong_hoat_dong/                           # [4. LUỒNG HOẠT ĐỘNG NGHIỆP VỤ (WORKFLOWS)]
│   ├── README.md                              # Bản đồ tổng quan các luồng nghiệp vụ end-to-end
│   ├── luong_01_xac_thuc_va_phan_quyen.md     # Luồng đăng nhập, nạp Store Scope, bảo vệ route & phân quyền role
│   ├── luong_02_chu_ky_xep_lich_tuan.md       # Chu kỳ tuần theo cơ sở: Mở -> Gửi ca -> AutoScheduler -> Duyệt -> Excel
│   ├── luong_03_checkin_gps_va_camera.md      # Luồng Camera + GPS đối chiếu Geofence theo cơ sở làm việc -> Lưu DB
│   ├── luong_04_tich_checkin_truc_tiep.md     # Luồng bấm tích điểm danh trên ô ca cơ sở -> Optimistic update
│   ├── luong_05_quan_ly_va_them_nhan_su.md    # Luồng phân bổ nhân sự vào cơ sở & tạo tài khoản tự sinh mật khẩu
│   ├── luong_06_trung_tam_thong_bao.md        # Luồng sinh sự kiện theo cơ sở -> Lưu vào collection Role -> Modal
│   ├── luong_07_cau_hinh_va_kiem_tra_gps.md   # Luồng quản lý cơ sở, lấy GPS cơ sở -> Cấu hình geofence -> Test khoảng cách
│   ├── luong_08_xem_va_tinh_bang_luong.md     # Luồng tính lương theo cơ sở -> Áp dụng bộ lọc bảo mật & phân quyền
│   └── luong_09_zalo_bot_gui_thong_bao.md     # Luồng quét QR Zalo -> Lưu config vào DB -> Gửi tin theo cơ sở
│
├── giam_sat/                                  # [5. THEO DÕI TIẾN ĐỘ & BẮT BUỘC CẬP NHẬT]
│   ├── README.md                              # Quy chuẩn giám sát và quy trình 3 bước cập nhật bắt buộc
│   ├── tien_do_chuc_nang.md                   # Bảng theo dõi tình trạng từng chức năng (ĐÃ LÀM / ĐANG LÀM / KẾ HOẠCH)
│   └── nhat_ky_cap_nhat.md                    # Nhật ký kiểm toán (Audit Log) ghi nhận mỗi phiên can thiệp code
│
└── tai_lieu/                                  # [6. TÀI LIỆU NỀN TẢNG VẬN HÀNH]
    └── tong_quan_he_thong.md                  # Bối cảnh, mục tiêu và phạm vi vận hành chuỗi đa cơ sở Zone Six
```

---

## 📜 QUY ĐỊNH BẤT DI BẤT DỊCH CHO AI AGENT
1. **Lấy `plane/` làm căn cứ duy nhất:** Không tự ý bịa đặt hoặc thay đổi luồng phân quyền và chức năng khi chưa tham chiếu tài liệu này.
2. **Tuân thủ phân định Cơ sở (Store Scope):**
   - Admin hệ thống có thể quản lý tất cả hoặc được phân quyền vài/nhiều cơ sở.
   - Quản lý có thể quản lý 1 hoặc vài/nhiều cơ sở được Admin phân quyền.
   - **Trưởng ca bắt buộc gắn cố định với ĐÚNG 1 CƠ SỞ DUY NHẤT**, không thao tác chéo cơ sở khác.
3. **Cập nhật tình trạng bắt buộc:** Sau mỗi lần viết hoặc sửa code, BẮT BUỘC phải cập nhật bảng trạng thái tại [tien_do_chuc_nang.md](./giam_sat/tien_do_chuc_nang.md) và ghi nhận vào [nhat_ky_cap_nhat.md](./giam_sat/nhat_ky_cap_nhat.md).
4. **Tuân thủ phân ly trách nhiệm:** Phó ca làm lịch không được hiển thị dấu tích điểm danh và không được xem bảng lương; Zalo Bot là đặc quyền duy nhất của Admin Hệ Thống.
