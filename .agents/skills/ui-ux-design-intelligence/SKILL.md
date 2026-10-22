---
name: ui-ux-design-intelligence
description: >-
  Use this skill when designing, building, or styling Frontend interfaces in Next.js, selecting color palettes, typography, spacing scales, micro-animations, accessibility (WCAG), and responsive layouts.
---

# 🎨 UI/UX Design Intelligence & Aesthetic Excellence Skill

Skill này đóng vai trò Giám Đốc Thiết Kế Giao Diện (Design Director), bảo đảm mọi sản phẩm xây dựng bằng Next.js đạt tính thẩm mỹ đỉnh cao (WOW First Impression), hiện đại và chuẩn trải nghiệm người dùng.

---

## 💎 NGUYÊN TẮC THIẾT KẾ ĐỈNH CAO (AESTHETIC PILLARS)

1. **Tuyệt đối KHÔNG dùng màu mặc định thô kệch:**
   - Tránh dùng màu thuần đỏ `#ff0000`, xanh `#0000ff`.
   - Sử dụng bảng màu phối hợp hài hòa (Curated Tailwind Palettes): Slate/Zinc cho dark/neutral, Indigo/Violet/Emerald làm điểm nhấn (Primary Accent).
2. **Typography Hiện Đại:**
   - Sử dụng font hiện đại từ `next/font/google` (Inter, Plus Jakarta Sans, Outfit, Roboto).
   - Thiết lập cấp bậc font rõ ràng (H1 $\rightarrow$ H6) với line-height và letter-spacing cân đối.
3. **Hiệu Ứng Micro-animations & Feedback:**
   - Mọi nút bấm (Button) phải có trạng thái hover, active và loading rõ ràng.
   - Các card và danh sách phải xuất hiện mượt mà với hiệu ứng Fade/Slide.
4. **Chuẩn Trợ Năng WCAG 2.1 AA:**
   - Tỷ lệ tương phản màu chữ với nền tối thiểu 4.5:1.
   - Mọi input form phải có label rõ ràng, thông báo lỗi màu đỏ nổi bật và icon trực quan.

---

## 🧩 QUY CHUẨN TRẠNG THÁI COMPONENT (COMPONENT STATES)

Mỗi component giao diện BẮT BUỘC có đủ 4 trạng thái:
1. **Loading State:** Skeleton loader hoặc Spinner tinh tế (tránh để màn hình trắng trống trơn).
2. **Empty State:** Hình minh họa hoặc icon kèm thông điệp thân thiện và nút hành động kêu gọi (CTA).
3. **Error State:** Thông báo lỗi lịch sự kèm nút "Thử lại" (Retry).
4. **Success State:** Toast thông báo hoặc modal phản hồi tức thì.
