---
name: Zone 6 Signature Design System
description: Luxury Lounge & Cafe scheduling, procurement, and management system. Metallic Gold accents on deep obsidian carbon surfaces with high-density hierarchy and purposeful micro-interactions.
metadata:
  version: 1.0.0
  format: impeccable
colors:
  # Brand Anchors
  gold-primary: "#d4af37"         # Primary metallic gold
  gold-highlight: "#f7d77b"       # Gold gradient high stop
  gold-deep: "#906b18"            # Gold gradient deep stop
  gold-glow: "rgba(212, 175, 55, 0.35)" # Focused luminous accent

  # Surfaces (Carbon Black & Obsidian)
  bg-void: "#0b0c10"              # Deepest page background
  surface-card: "#12141a"         # Card background
  surface-elevated: "#181b24"     # Dropdowns, modals, elevated panels
  surface-hover: "#2c3242"        # Hover state on cards and rows
  border-subtle: "#212532"        # 1px border separation
  border-gold-glow: "rgba(212, 175, 55, 0.3)"

  # Text & Typography
  text-primary: "#f4f5f8"         # High-contrast headings and body
  text-muted: "#a0a5b5"           # Subtitles, labels, descriptions
  text-faint: "#6c7280"           # Placeholders, disabled states
  text-gold: "#fae29c"            # Special highlights and metrics

  # Status Accents
  status-success: "#10b981"       # Approved, in-shift, checked-in
  status-warning: "#f59e0b"       # Pending review, requisition sent
  status-error: "#ef4444"         # Rejected, late check-in, alert
  status-info: "#3b82f6"          # Informational tags, bot ping
typography:
  font-sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  font-mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
  scale:
    xs: "0.75rem / 1rem"
    sm: "0.875rem / 1.25rem"
    base: "1rem / 1.5rem"
    lg: "1.125rem / 1.75rem"
    xl: "1.25rem / 1.75rem"
    "2xl": "1.5rem / 2rem"
    "3xl": "1.875rem / 2.25rem"
elevation:
  card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)"
  modal: "0 10px 40px -4px rgba(0, 0, 0, 0.7)"
  glow-gold: "0 0 25px -4px rgba(212, 175, 55, 0.35)"
---

# Zone 6 Signature Design System & Craft Specification

Hệ thống thiết kế chuẩn hóa cho toàn bộ giao diện Zone Six (Next.js 14+ App Router, Tailwind CSS v4, TypeScript). Tuân thủ bộ quy chuẩn Impeccable Design:

## 1. Triết lý Thiết Kế Cốt Lõi (Core Principles)
- **Luxury Restraint (Sang trọng & Tiết chế):** Nền đen Carbon sâu (`#0b0c10`) làm nổi bật chi tiết vàng Gold (`#d4af37`). Tránh lạm dụng vàng ở mọi nơi; vàng chỉ dành cho Primary Action, Key Metric, và đường viền active/focus tinh tế.
- **High-Density Information Architecture (Kiến trúc mật độ cao):** Là phần mềm vận hành nhà hàng/lounge, giao diện cần hiển thị rõ ràng, dễ quét mắt (scanability) cho nhân viên ca, bếp trưởng và quản lý kho.
- **Tactile Feedback & Micro-Interactions:** Mọi nút bấm, card, tab đều có phản hồi trạng thái: `hover`, `active`, `focus-visible`, và chuyển cảnh mượt mà 150ms-200ms `ease-out`.

## 2. Quy Tắc Chế Tác Giao Diện (Craft Floor)
- **Cấm hoàn toàn:**
  - Không dùng viền trắng thô (`border-white`). Luôn dùng `border-[#212532]` hoặc `border-gold-500/20`.
  - Không dùng text xám xịt khó đọc (`text-gray-400` trên nền xám). Luôn đảm bảo độ tương phản WCAG AA tối thiểu 4.5:1.
  - Không để các nút bấm không có loading state khi đang mutation API (`isPending`).
- **Trạng thái rỗng & Chờ dữ liệu (Empty & Loading States):**
  - Mọi bảng biểu/danh sách bắt buộc phải có Skeleton Loader khi đang tải dữ liệu.
  - Khi không có dữ liệu, hiển thị Empty State có icon chỉ dẫn và nút hành động kêu gọi tạo mới (Call To Action).

## 3. Các Lệnh Thiết Kế Có Sẵn (Impeccable Skills Suite)
Thư mục `.agents/skills/impeccable/` cung cấp 25+ lệnh chuyên biệt:
- `shape [feature]`: Phác thảo cấu trúc UX trước khi viết code.
- `polish [target]`: Tinh chỉnh độ hoàn thiện, padding, visual rhythm trước khi release.
- `critique [target]`: Đánh giá UX/UI theo thang điểm chuẩn.
- `audit [target]`: Kiểm toán a11y (khả năng tiếp cận), responsive và performance.
- `bolder` / `quieter`: Tăng cường điểm nhấn hoặc hạ bớt sự rối mắt.
- `animate [target]`: Thêm chuyển động tinh tế, purposeful motion.
- `clarify [target]`: Chuẩn hóa câu chữ UX copy, thông báo lỗi và nhãn nút.
- `harden [target]`: Bổ sung edge cases (mạng yếu, text quá dài, lỗi server).
