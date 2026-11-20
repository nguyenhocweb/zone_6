# QUY CHUẨN THIẾT KẾ LANDING PAGE ZONE SIX (EDITORIAL, IMAGERY & SOFT MOTION)

Tài liệu này là bộ quy chuẩn kỹ thuật và mỹ thuật bắt buộc đối với toàn bộ giao diện công khai và trang chủ (Landing Page `/`) của Zone Six.

---

## 🏛️ 1. NGUYÊN TẮC CỐT LÕI (CORE PRINCIPLES)

### 1.1 Triết Lý "Less Text, More Soul" (Ít Chữ, Giàu Cảm Xúc)
- **CẤM TUYỆT ĐỐI:** Các đoạn văn thuyết minh dài dòng, thuật ngữ phóng đại sáo rỗng ("trải nghiệm đỉnh cao", "công nghệ tiên phong", "đột phá số 1").
- **CẤM:** Các nhãn/badge vụn vặt thừa thãi làm loãng thị giác (ví dụ: các tag kiểu "Cà phê thủ công • Lounge Đà Nẵng", các khối bullet point dày đặc).
- **QUY CHUẨN VĂN BẢN:**
  - Chỉ giữ lại **Title** dứt khoát, điềm đạm.
  - **Tên món / Tên không gian** chính xác, tinh gọn.
  - **Mô tả ngắn gọn**: Tối đa 1 dòng súc tích, gợi cảm giác mộc mạc và chân thực.

### 1.2 Ưu Tiên Thị Giác Bằng Hình Ảnh (Photography-First & Mộc Mạc)
- Trang chủ phải giàu hình ảnh chất lượng cao, có chiều sâu không gian và ánh sáng ấm áp.
- Chủ đề hình ảnh tập trung vào:
  - Cà phê thủ công: hạt rang mộc, phin truyền thống, espresso quầy bar, lớp kem muối sánh mịn.
  - Trà trái cây tươi mát: dâu tây, đào cam sả với màu sắc tự nhiên, sảng khoái.
  - Không gian quán & Lounge: bàn ghế gỗ tối, sofa êm ái, góc đọc sách ngập nắng dịu, ánh đèn vàng ấm về đêm.
  - Trải nghiệm thực tế: Standee QR mica tại bàn, chiếc điện thoại gọi món tiện lợi.

### 1.3 Bố Cục Sáng Tạo Thoát Ly Khuôn Mẫu AI (Creative Non-Generic Layout)
- **CẤM RẬP KHUÔN AI:** Tuyệt đối không sao chép bố cục 3 thẻ đối xứng vô hồn của các mẫu SaaS AI thông thường, không dùng gradient cầu vồng, không đổ bóng neon, không icon tròn đơn điệu.
- **PHONG CÁCH CHỦ ĐẠO:** Lookbook nghệ thuật / Tạp chí ẩm thực & kiến trúc (Editorial Layout):
  - Khối ảnh ghép bất đối xứng (Asymmetric Photo Collage / Masonry).
  - Tỷ lệ khung hình điện ảnh (`aspect-[16/10]`, `aspect-[4/3]`, `aspect-square`).
  - Đường phân cách tóc mảnh (Hairline borders) thanh tao, tinh tế.
  - Nhận diện thương hiệu Zone Six sắc nét: biểu trưng `Z6`, chữ viết trang nhã, màu sắc ấm áp đặc trưng.

### 1.4 Hiệu Ứng Mềm Mại (Silky Soft Opening & Scroll-Triggered Reveal)
- **Hiệu ứng mở đầu (Opening Transition):** Khi vừa tải trang, toàn bộ layout xuất hiện bằng chuyển động fade-in nhẹ nhàng, dịu mắt, không chớp giật.
- **Hiệu ứng cuộn trang (Scroll Reveal):**
  - Tích hợp cơ chế Intersection Observer để lắng nghe vị trí cuộn.
  - Khối hình ảnh và nội dung khi lọt vào khung nhìn sẽ nhẹ nhàng trôi lên và hiện rõ (`opacity: 1; transform: translateY(0)` từ `opacity: 0; transform: translateY(24px)`).
  - Đường cong gia tốc chuyển động mềm (`cubic-bezier(0.16, 1, 0.3, 1)` với thời lượng `0.7s - 0.9s`).
  - Hiệu ứng tương tác rê chuột (Hover): Phóng to ảnh siêu êm `scale-[1.03]`, thời gian chuyển tiếp `duration-500`.

### 1.5 Hệ Thống Màu Đôi Mộc Mạc (Dual-Tone Harmony)
1. **Warm Espresso (Dark Mode - Mặc định):**
   - Nền: `#141311` (nâu đen cà phê đậm).
   - Thẻ nổi: `#1c1a17` & `#25221e`.
   - Chữ chính: `#efe9de` (kem sáng).
   - Điểm nhấn: Vàng đồng chải xước `#d4af37`.
2. **Warm Linen (Light Mode):**
   - Nền: `#f7f4ee` (vải lanh hữu cơ sáng ấm).
   - Thẻ nổi: `#ffffff` & `#efe9df`.
   - Chữ chính: `#1f1b16` (nâu đen đậm).
   - Điểm nhấn: Hổ phách `#a8791e`.
- Nút chuyển chế độ Mặt Trời / Mặt Trăng đặt tại Header, lưu lựa chọn vào `localStorage`.

---

## ⚡ 2. CẤU TRÚC PHÂN ĐOẠN LANDING TRANG CHỦ

1. **Navigation:** Tối giản, trong suốt nhẹ, logo Z6 craft mark, nút chuyển theme và link Cổng nhân sự.
2. **Hero Lookbook:** Bố cục bất đối xứng: Cột chữ tinh giản (Title lớn + 1 câu mô tả ngắn + 2 nút hành động) kết hợp Cụm ảnh ghép nghệ thuật (Hero Photo Collage) với ảnh ly cà phê muối sánh mịn, góc quán ấm áp và quầy bar.
3. **Atmosphere Visual Gallery:** Dải ảnh nghệ thuật mộc mạc (hạt cà phê rang mộc, nghệ thuật pour-over, góc sofa lounge thư giãn, ánh đèn đêm ấm cúng) mang đậm hơi thở không gian.
4. **Curated Menu Showcase:** Thẻ ảnh lớn trực quan (Visual Cards) cho các thức uống tiêu biểu: ảnh thực tế sắc nét, tên món, giá niêm yết và 1 dòng cảm nhận hương vị.
5. **Table Experience (Gọi món tại bàn):** Ảnh chụp góc bàn có standee QR mica thực tế kèm 3 bước tinh gọn (1. Quét mã QR - 2. Tùy chỉnh vị - 3. Thưởng thức tại bàn).
6. **Không Gian & Cơ Sở:** 2 thẻ ảnh kiến trúc không gian thực tế tại Đà Nẵng kèm địa chỉ và trạng thái hoạt động.
7. **Footer:** Mộc mạc, yên tĩnh, cung cấp thông tin liên hệ và bản quyền thương hiệu.
