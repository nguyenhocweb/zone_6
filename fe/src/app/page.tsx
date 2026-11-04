import React from 'react';
import Link from 'next/link';
import {
  FiCoffee,
  FiShoppingBag,
  FiMapPin,
  FiClock,
  FiPhone,
  FiCheckCircle,
  FiArrowRight,
  FiShield,
  FiAward,
  FiLock,
  FiSmartphone,
} from 'react-icons/fi';
import { FaCrown, FaQrcode, FaWifi, FaParking, FaPlug } from 'react-icons/fa';

export const metadata = {
  title: 'Zone 6 Signature - Lounge & Cafe Đẳng Cấp',
  description:
    'Không gian Lounge & Cafe Obsidian Gold sang trọng tại Đà Nẵng. Trải nghiệm Cà Phê Muối Cố Đô, Trà Trái Cây Tươi và công nghệ tự gọi món QR tại bàn tức thì.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#f4f5f8] selection:bg-[#d4af37] selection:text-black font-sans">
      {/* 1. Header / Navbar Glassmorphism */}
      <header className="sticky top-0 z-50 bg-[#0b0c10]/85 backdrop-blur-md border-b border-[#212532]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d4af37] via-[#f7d77b] to-[#906b18] flex items-center justify-center text-black font-extrabold text-xl shadow-lg shadow-[#d4af37]/20 group-hover:scale-105 transition-transform">
              <FaCrown className="text-black text-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-white group-hover:text-[#fae29c] transition-colors">
                  ZONE 6
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 tracking-widest uppercase">
                  Signature
                </span>
              </div>
              <p className="text-[11px] text-[#a0a5b5] font-medium tracking-wide">
                Lounge & Cafe Experience
              </p>
            </div>
          </Link>

          {/* Nav Links Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wider uppercase text-[#a0a5b5]">
            <a href="#about" className="hover:text-[#fae29c] transition-colors">
              Trải Nghiệm
            </a>
            <a href="#menu" className="hover:text-[#fae29c] transition-colors">
              Thực Đơn
            </a>
            <a href="#guide" className="hover:text-[#fae29c] transition-colors">
              Hướng Dẫn Gọi Món
            </a>
            <a href="#stores" className="hover:text-[#fae29c] transition-colors">
              Chi Nhánh
            </a>
          </nav>

          {/* Action CTAs: Bỏ nút Gọi Món Tại Bàn khỏi Navbar, chỉ để Cổng Nhân Sự */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2.5 rounded-xl bg-[#12141a] hover:bg-[#181b24] border border-[#212532] hover:border-[#d4af37]/50 text-xs font-bold text-white transition-all flex items-center gap-2 shadow-sm"
              title="Cổng Đăng Nhập Nhân Sự Nội Bộ"
            >
              <FiLock className="text-xs text-[#d4af37]" />
              <span>Cổng Nhân Sự</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 sm:pt-20 sm:pb-32">
        {/* Glow Background Gradient */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#d4af37]/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-8">
          {/* Badge Luxury */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#12141a] border border-[#d4af37]/40 text-[#fae29c] text-xs font-extrabold tracking-widest uppercase shadow-lg shadow-[#d4af37]/5 animate-fadeIn">
            <FaCrown className="text-[#d4af37] text-xs" />
            <span>Nghệ Thuật Thư Giãn & Cà Phê Thượng Hạng</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] sm:leading-[1.15]">
            Không Gian Lounge Sang Trọng <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#fae29c] to-[#906b18]">
              Đậm Chất Nghệ Thuật & Thư Giãn
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#a0a5b5] leading-relaxed">
            Thưởng thức Cà Phê Muối Cố Đô béo ngậy, những ly Trà Trái Cây Tươi mọng nước
            trong không gian kiến trúc Obsidian Gold ấm cúng cùng trải nghiệm tự gọi món QR tại bàn tức thì.
          </p>

          {/* Action Buttons: Không liên kết trực tiếp /order, hướng dẫn quét QR tại bàn */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="#menu"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#fae29c] to-[#b58d22] text-[#0b0c10] font-black text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-2xl shadow-[#d4af37]/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <FiCoffee className="text-base" />
              <span>Khám Phá Menu Signature</span>
              <FiArrowRight className="text-base" />
            </a>

            <a
              href="#stores"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#12141a] hover:bg-[#181b24] border border-[#212532] hover:border-[#d4af37]/50 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FiMapPin className="text-[#d4af37] text-base" />
              <span>Hệ Thống Chi Nhánh</span>
            </a>
          </div>

          <p className="text-[11px] text-[#6c7280]">
            *Quý khách vui lòng quét mã QR Standee mica tại bàn khi ngồi tại quán để tự gọi món.
          </p>

          {/* 4 Stats Chips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-8 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-[#12141a] border border-[#212532] text-center">
              <div className="text-2xl font-black text-[#d4af37] font-mono">100%</div>
              <div className="text-[11px] text-[#a0a5b5] mt-1 font-medium">Hạt Cà Phê Rang Mộc</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#12141a] border border-[#212532] text-center">
              <div className="text-2xl font-black text-[#d4af37] font-mono">24/7</div>
              <div className="text-[11px] text-[#a0a5b5] mt-1 font-medium">Tự Động Gọi Món & VietQR</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#12141a] border border-[#212532] text-center">
              <div className="text-2xl font-black text-[#d4af37] font-mono">4.9 ★</div>
              <div className="text-[11px] text-[#a0a5b5] mt-1 font-medium">Đánh Giá Từ Khách Hàng</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#12141a] border border-[#212532] text-center">
              <div className="text-2xl font-black text-[#d4af37] font-mono">02</div>
              <div className="text-[11px] text-[#a0a5b5] mt-1 font-medium">Cơ Sở Sang Trọng Tại Đà Nẵng</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section: Trải Nghiệm Độc Bản Tại Zone Six */}
      <section id="about" className="py-20 bg-[#0e1015] border-y border-[#212532]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
              Trải Nghiệm Khác Biệt
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Tại Sao Khách Hàng Chọn Zone Six?
            </h2>
            <p className="text-xs sm:text-sm text-[#a0a5b5]">
              Sự kết hợp hoàn mỹ giữa nghệ thuật pha chế đỉnh cao và dịch vụ chu đáo tinh tế.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-[#12141a] border border-[#212532] hover:border-[#d4af37]/40 rounded-3xl p-6 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] text-xl mb-4 group-hover:scale-110 transition-transform">
                <FiCoffee />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Cà Phê Muối Cố Đô</h3>
              <p className="text-xs text-[#a0a5b5] leading-relaxed">
                Chiết xuất từ hạt cà phê mộc đậm đà kết hợp với lớp kem béo mặn sánh mịn độc quyền theo công thức Zone Six.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#12141a] border border-[#212532] hover:border-[#d4af37]/40 rounded-3xl p-6 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] text-xl mb-4 group-hover:scale-110 transition-transform">
                <FiAward />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Trà Trái Cây Tươi 100%</h3>
              <p className="text-xs text-[#a0a5b5] leading-relaxed">
                Dâu tây tươi Đà Lạt, Đào miếng giòn Cronos cùng các loại Topping thạch củ năng, trân châu 3Q giòn dai thanh mát.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#12141a] border border-[#212532] hover:border-[#d4af37]/40 rounded-3xl p-6 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] text-xl mb-4 group-hover:scale-110 transition-transform">
                <FaCrown />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Không Gian Obsidian Gold</h3>
              <p className="text-xs text-[#a0a5b5] leading-relaxed">
                Tông màu đen huyền bí kết hợp ánh sáng vàng kim tinh tế, ghế sofa êm ái, âm thanh acoustic êm dịu thích hợp làm việc & gặp gỡ.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#12141a] border border-[#212532] hover:border-[#d4af37]/40 rounded-3xl p-6 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] text-xl mb-4 group-hover:scale-110 transition-transform">
                <FaQrcode />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Quét Mã Gọi Món Tức Thì</h3>
              <p className="text-xs text-[#a0a5b5] leading-relaxed">
                Không cần xếp hàng chờ đợi, quét mã QR mica tại bàn để đặt món, chọn mức đường/đá, thanh toán VietQR động và nhận món tận bàn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section: Thực Đơn Signature Đậm Đà */}
      <section id="menu" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
                Thực Đơn Tinh Tuyển
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Món Đồ Uống Được Yêu Thích Nhất
              </h2>
              <p className="text-xs sm:text-sm text-[#a0a5b5]">
                Dữ liệu thực đơn chuẩn từ công thức bí quyết pha chế Zone Six.
              </p>
            </div>

            <span className="text-xs font-semibold text-[#a0a5b5]">
              *Quý khách vui lòng quét mã QR tại bàn để xem chi tiết và gọi món
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Drink 1 */}
            <div className="bg-[#12141a] border border-[#212532] rounded-3xl p-6 flex flex-col justify-between hover:border-[#d4af37]/50 transition-all shadow-lg hover:shadow-[#d4af37]/5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#181b24] text-[#a0a5b5] border border-[#212532] uppercase">
                    Cà Phê Signature
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Size M
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#d4af37]/15 text-[#d4af37]">
                      Lạnh
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-black text-white mb-2">
                  Cà Phê Muối Cố Đô Zone 6
                </h3>
                <p className="text-xs text-[#a0a5b5] leading-relaxed line-clamp-3">
                  Cà phê pha phin truyền thống thơm nồng kết hợp lớp kem muối béo mặn sánh mịn đặc trưng xứ Huế, tạo nên hậu vị quyến rũ khó quên.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#212532] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#6c7280] block">GIÁ NIÊM YẾT</span>
                  <span className="text-xl font-black text-[#d4af37]">29.000đ</span>
                </div>
                <span className="px-3.5 py-1.5 rounded-xl bg-[#181b24] border border-[#212532] text-[#fae29c] text-xs font-bold">
                  Phục vụ tại bàn
                </span>
              </div>
            </div>

            {/* Drink 2 */}
            <div className="bg-[#12141a] border border-[#d4af37]/40 rounded-3xl p-6 flex flex-col justify-between relative shadow-xl shadow-[#d4af37]/5">
              <div className="absolute -top-3 right-6 bg-gradient-to-r from-[#d4af37] to-[#b58d22] text-black text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                BÁN CHẠY NHẤT ★
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#181b24] text-[#a0a5b5] border border-[#212532] uppercase">
                    Trà Trái Cây Tươi
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Size L
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#d4af37]/15 text-[#d4af37]">
                      Lạnh
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-black text-white mb-2">
                  Trà Dâu Tây Tươi Zone 6
                </h3>
                <p className="text-xs text-[#a0a5b5] leading-relaxed line-clamp-3">
                  Cốt trà lài thanh nhẹ kết hợp mứt dâu tây tươi và những lát dâu đỏ mọng Đà Lạt, mang lại hương vị chua ngọt sảng khoái từng ngụm.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#212532] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#6c7280] block">GIÁ NIÊM YẾT</span>
                  <span className="text-xl font-black text-[#d4af37]">35.000đ</span>
                </div>
                <span className="px-3.5 py-1.5 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] text-xs font-bold">
                  Phục vụ tại bàn
                </span>
              </div>
            </div>

            {/* Drink 3 */}
            <div className="bg-[#12141a] border border-[#212532] rounded-3xl p-6 flex flex-col justify-between hover:border-[#d4af37]/50 transition-all shadow-lg hover:shadow-[#d4af37]/5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#181b24] text-[#a0a5b5] border border-[#212532] uppercase">
                    Trà Trái Cây Tươi
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Size L
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#d4af37]/15 text-[#d4af37]">
                      Lạnh
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-black text-white mb-2">
                  Trà Đào Cam Sả Tươi
                </h3>
                <p className="text-xs text-[#a0a5b5] leading-relaxed line-clamp-3">
                  Vị thơm ấm nồng của sả tươi, cam vàng thanh mát quyện cùng những miếng đào ngâm Cronos giòn ngọt trứ danh, sảng khoái tức thì.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#212532] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#6c7280] block">GIÁ NIÊM YẾT</span>
                  <span className="text-xl font-black text-[#d4af37]">32.000đ</span>
                </div>
                <span className="px-3.5 py-1.5 rounded-xl bg-[#181b24] border border-[#212532] text-[#fae29c] text-xs font-bold">
                  Phục vụ tại bàn
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section: Hướng Dẫn Tự Gọi Món Tại Bàn Qua Mã QR */}
      <section id="guide" className="py-20 bg-gradient-to-b from-[#0e1015] to-[#0b0c10] border-t border-[#212532]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#181b24] to-[#12141a] border border-[#d4af37]/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            {/* Background Icon */}
            <FaQrcode className="absolute -right-8 -bottom-8 text-[#212532]/40 text-9xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] text-xs font-bold uppercase tracking-wider">
                <FiSmartphone />
                <span>Quy Trình Tự Phục Vụ • Không Cần Đăng Nhập</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Hướng Dẫn Tự Gọi Món <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#fae29c] to-[#906b18]">
                  Bằng Mã QR Trên Standee Tại Bàn
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-[#a0a5b5] leading-relaxed">
                Để phục vụ quý khách nhanh nhất mà không cần phải chờ đợi nhân viên order hay xếp hàng tại quầy thu ngân,
                Zone Six trang bị mã QR trên từng bàn với 3 bước đơn giản:
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#12141a] border border-[#212532]">
                  <span className="w-6 h-6 rounded-full bg-[#d4af37] text-[#0b0c10] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quét Mã QR Tại Bàn</h4>
                    <p className="text-[11px] text-[#a0a5b5] mt-0.5">
                      Mở Camera hoặc Zalo trên điện thoại và hướng vào mã QR trên tấm Standee Mica đặt trên bàn bạn đang ngồi.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#12141a] border border-[#212532]">
                  <span className="w-6 h-6 rounded-full bg-[#d4af37] text-[#0b0c10] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Chọn Món & Tùy Chỉnh Topping</h4>
                    <p className="text-[11px] text-[#a0a5b5] mt-0.5">
                      Hệ thống tự động nhận diện đúng số bàn của bạn. Bạn có thể thoải mái chọn mức đường, đá, thêm topping và ghi chú.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#12141a] border border-[#212532]">
                  <span className="w-6 h-6 rounded-full bg-[#d4af37] text-[#0b0c10] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Thanh Toán VietQR & Nhận Món Tận Bàn</h4>
                    <p className="text-[11px] text-[#a0a5b5] mt-0.5">
                      Quét mã VietQR động trực tiếp để thanh toán. Barista nhận lệnh pha chế tức thì và nhân viên mang đồ uống đến tận bàn.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs text-[#fae29c]">
                <FiCheckCircle className="text-[#d4af37]" />
                <span>Bảo vệ chống đặt troll đơn từ xa bằng định vị GPS Geofence chuẩn xác</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section: Chi Nhánh & Không Gian */}
      <section id="stores" className="py-20 border-t border-[#212532]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#d4af37]">
              Hệ Thống Chi Nhánh
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ghé Thăm Zone Six Signature
            </h2>
            <p className="text-xs sm:text-sm text-[#a0a5b5]">
              Không gian lý tưởng cho những buổi trò chuyện thân mật, làm việc và thưởng thức cà phê.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store 1 */}
            <div className="bg-[#12141a] border border-[#212532] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#d4af37]/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaCrown className="text-[#d4af37] text-base" />
                  <h3 className="text-lg font-bold text-white">Zone Six Cafe & Lounge</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                  Đang Mở Cửa
                </span>
              </div>

              <div className="space-y-2 text-xs text-[#a0a5b5]">
                <div className="flex items-start gap-2.5">
                  <FiMapPin className="text-[#d4af37] shrink-0 mt-0.5" />
                  <span>Đường Lương Nhữ Học, Quận Hải Châu, TP. Đà Nẵng</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FiClock className="text-[#d4af37] shrink-0" />
                  <span>07:00 - 23:30 (Mở cửa tất cả các ngày trong tuần)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FiPhone className="text-[#d4af37] shrink-0" />
                  <span>Hotline: 0912 345 678</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#212532] flex items-center gap-4 text-xs text-[#6c7280]">
                <span className="flex items-center gap-1.5"><FaWifi className="text-[#a0a5b5]" /> Wifi 300Mbps</span>
                <span className="flex items-center gap-1.5"><FaPlug className="text-[#a0a5b5]" /> Ổ sạc từng bàn</span>
                <span className="flex items-center gap-1.5"><FaParking className="text-[#a0a5b5]" /> Đỗ xe miễn phí</span>
              </div>
            </div>

            {/* Store 2 */}
            <div className="bg-[#12141a] border border-[#212532] rounded-3xl p-6 sm:p-8 space-y-4 hover:border-[#d4af37]/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaCrown className="text-[#d4af37] text-base" />
                  <h3 className="text-lg font-bold text-white">Zone Six Signature</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                  Đang Mở Cửa
                </span>
              </div>

              <div className="space-y-2 text-xs text-[#a0a5b5]">
                <div className="flex items-start gap-2.5">
                  <FiMapPin className="text-[#d4af37] shrink-0 mt-0.5" />
                  <span>214 Lê Ninh, Quận Hải Châu, TP. Đà Nẵng</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FiClock className="text-[#d4af37] shrink-0" />
                  <span>07:00 - 23:30 (Mở cửa tất cả các ngày trong tuần)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FiPhone className="text-[#d4af37] shrink-0" />
                  <span>Hotline: 0987 654 321</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#212532] flex items-center gap-4 text-xs text-[#6c7280]">
                <span className="flex items-center gap-1.5"><FaWifi className="text-[#a0a5b5]" /> Wifi 300Mbps</span>
                <span className="flex items-center gap-1.5"><FaPlug className="text-[#a0a5b5]" /> Ổ sạc từng bàn</span>
                <span className="flex items-center gap-1.5"><FaParking className="text-[#a0a5b5]" /> Đỗ xe miễn phí</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-[#0b0c10] border-t border-[#212532] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <FaCrown className="text-xs" />
            </div>
            <div>
              <span className="text-sm font-black text-white tracking-wide">ZONE 6 SIGNATURE</span>
              <p className="text-[11px] text-[#6c7280]">Lounge & Cafe Experience © 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#a0a5b5]">
            <a href="#guide" className="hover:text-[#fae29c] transition-colors">
              Hướng Dẫn Gọi Món
            </a>
            <a href="#menu" className="hover:text-[#fae29c] transition-colors">
              Thực Đơn
            </a>
            <a href="#stores" className="hover:text-[#fae29c] transition-colors">
              Cơ Sở
            </a>
            <Link
              href="/login"
              className="text-[#d4af37] hover:underline flex items-center gap-1"
            >
              <FiLock className="text-[10px]" />
              <span>Cổng Nhân Sự Nội Bộ</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
