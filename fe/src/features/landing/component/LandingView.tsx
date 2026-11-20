'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from '@/core/providers/ThemeProvider';
import {
  FiMapPin,
  FiClock,
  FiPhone,
  FiArrowRight,
  FiLock,
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
  FiCheck,
} from 'react-icons/fi';

interface ThemeTokens {
  bg: string;
  surface: string;
  surfaceRaised: string;
  hairline: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentText: string;
  accentMuted: string;
  borderHover: string;
  cardHighlight: string;
  navBg: string;
  tagBg: string;
  imageOverlay: string;
}

const DARK_THEME: ThemeTokens = {
  bg: '#141311',
  surface: '#1c1a17',
  surfaceRaised: '#25221e',
  hairline: 'rgba(239, 233, 222, 0.08)',
  textPrimary: '#efe9de',
  textSecondary: '#a89f91',
  textMuted: '#787063',
  accent: '#d4af37',
  accentHover: '#dfbe4c',
  accentText: '#141311',
  accentMuted: 'rgba(212, 175, 55, 0.12)',
  borderHover: 'rgba(212, 175, 55, 0.35)',
  cardHighlight: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  navBg: 'rgba(20, 19, 17, 0.85)',
  tagBg: '#211e1a',
  imageOverlay: 'rgba(20, 19, 17, 0.4)',
};

const LIGHT_THEME: ThemeTokens = {
  bg: '#f7f4ee',
  surface: '#ffffff',
  surfaceRaised: '#efe9df',
  hairline: 'rgba(31, 27, 22, 0.08)',
  textPrimary: '#1f1b16',
  textSecondary: '#5e554a',
  textMuted: '#857a6e',
  accent: '#a8791e',
  accentHover: '#8e6516',
  accentText: '#ffffff',
  accentMuted: 'rgba(168, 121, 30, 0.1)',
  borderHover: 'rgba(168, 121, 30, 0.35)',
  cardHighlight: 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
  navBg: 'rgba(247, 244, 238, 0.88)',
  tagBg: '#ece6dc',
  imageOverlay: 'rgba(247, 244, 238, 0.25)',
};

// Component tiện ích kích hoạt hiệu ứng cuộn tới đâu hiện mềm mại tới đó
interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const Reveal: React.FC<RevealProps> = ({ children, className = '', delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const LandingView: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const t = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#141311] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen transition-colors duration-300 font-sans selection:bg-[#d4af37]/20"
      style={{
        backgroundColor: t.bg,
        color: t.textPrimary,
      }}
    >
      {/* 1. Header: Tối giản, mộc mạc, điểm xuyết thanh lịch */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md transition-colors duration-200"
        style={{
          backgroundColor: t.navBg,
          borderBottom: `1px solid ${t.hairline}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold tracking-wider transition-transform group-hover:scale-105"
              style={{
                backgroundColor: t.surfaceRaised,
                border: `1px solid ${t.hairline}`,
                color: t.accent,
                boxShadow: t.cardHighlight,
              }}
            >
              Z6
            </div>
            <span className="text-base font-semibold tracking-wide" style={{ color: t.textPrimary }}>
              Zone Six
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-normal">
            <a href="#gallery" className="transition-colors hover:opacity-100" style={{ color: t.textSecondary }}>
              Không gian
            </a>
            <a href="#menu" className="transition-colors hover:opacity-100" style={{ color: t.textSecondary }}>
              Thực đơn
            </a>
            <a href="#order" className="transition-colors hover:opacity-100" style={{ color: t.textSecondary }}>
              Gọi món tại bàn
            </a>
            <a href="#stores" className="transition-colors hover:opacity-100" style={{ color: t.textSecondary }}>
              Cơ sở
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
              title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              style={{
                backgroundColor: t.surfaceRaised,
                border: `1px solid ${t.hairline}`,
                color: t.textSecondary,
              }}
            >
              {theme === 'dark' ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
            </button>

            <Link
              href="/login"
              className="px-3.5 py-2 rounded-lg text-xs font-normal transition-colors flex items-center gap-1.5"
              style={{
                backgroundColor: t.surfaceRaised,
                border: `1px solid ${t.hairline}`,
                color: t.textPrimary,
              }}
            >
              <FiLock className="w-3.5 h-3.5" style={{ color: t.accent }} />
              <span className="hidden sm:inline">Nội bộ</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
              style={{
                backgroundColor: t.surfaceRaised,
                border: `1px solid ${t.hairline}`,
                color: t.textPrimary,
              }}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <FiX className="w-4 h-4" /> : <FiMenu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="md:hidden px-6 py-4 flex flex-col gap-3 text-xs animate-in fade-in duration-200"
            style={{
              backgroundColor: t.surface,
              borderTop: `1px solid ${t.hairline}`,
            }}
          >
            <a
              href="#gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 transition-colors"
              style={{ color: t.textSecondary }}
            >
              Không gian
            </a>
            <a
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 transition-colors"
              style={{ color: t.textSecondary }}
            >
              Thực đơn
            </a>
            <a
              href="#order"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 transition-colors"
              style={{ color: t.textSecondary }}
            >
              Gọi món tại bàn
            </a>
            <a
              href="#stores"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 transition-colors"
              style={{ color: t.textSecondary }}
            >
              Cơ sở
            </a>
          </div>
        )}
      </header>

      {/* 2. Hero Section: Bố cục Asymmetric Lookbook - Nhiều ảnh nghệ thuật, chữ ngắn gọn */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Cột chữ tinh giản (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Reveal delay={100}>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08]"
                style={{ color: t.textPrimary }}
              >
                Cà phê mộc &amp; Không gian tĩnh
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p
                className="text-sm sm:text-base leading-relaxed max-w-md"
                style={{ color: t.textSecondary }}
              >
                Nơi hương cà phê phin rang mộc hòa cùng khoảng lặng nhẹ nhàng giữa lòng Đà Nẵng.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="#menu"
                  className="px-5 py-3 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95 hover:opacity-90"
                  style={{
                    backgroundColor: t.accent,
                    color: t.accentText,
                  }}
                >
                  <span>Xem thực đơn</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </a>

                <a
                  href="#stores"
                  className="px-5 py-3 rounded-lg text-xs font-normal transition-colors inline-flex items-center gap-2 cursor-pointer"
                  style={{
                    backgroundColor: t.surfaceRaised,
                    border: `1px solid ${t.hairline}`,
                    color: t.textPrimary,
                  }}
                >
                  <FiMapPin className="w-3.5 h-3.5" style={{ color: t.textSecondary }} />
                  <span>2 Chi nhánh</span>
                </a>
              </div>
            </Reveal>
          </div>

          {/* Cụm ảnh ghép bất đối xứng (Asymmetric Collage 7 Cols) - Nghệ thuật, giàu chất liệu */}
          <div className="lg:col-span-7">
            <Reveal delay={200} className="grid grid-cols-12 gap-3 sm:gap-4 items-end">
              {/* Ảnh chính lớn (7 cols) */}
              <div
                className="col-span-7 rounded-2xl overflow-hidden shadow-lg transition-transform duration-500 hover:scale-[1.01]"
                style={{
                  border: `1px solid ${t.hairline}`,
                  boxShadow: t.cardHighlight,
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=85"
                  alt="Cà phê thủ công Zone Six"
                  loading="eager"
                  className="w-full aspect-[4/5] object-cover"
                />
              </div>

              {/* 2 Ảnh phụ xếp chồng lệch (5 cols) */}
              <div className="col-span-5 space-y-3 sm:space-y-4">
                <div
                  className="rounded-2xl overflow-hidden shadow-md transition-transform duration-500 hover:scale-[1.02]"
                  style={{
                    border: `1px solid ${t.hairline}`,
                    boxShadow: t.cardHighlight,
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=700&q=85"
                    alt="Góc quán gỗ mộc mạc"
                    loading="eager"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>

                <div
                  className="rounded-2xl overflow-hidden shadow-md transition-transform duration-500 hover:scale-[1.02]"
                  style={{
                    border: `1px solid ${t.hairline}`,
                    boxShadow: t.cardHighlight,
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=700&q=85"
                    alt="Hạt cà phê rang mộc"
                    loading="eager"
                    className="w-full aspect-square object-cover"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. Lookbook Không Gian & Nghệ Thuật Rang Mộc (Visual Masonry Grid) */}
      <section
        id="gallery"
        className="py-16 sm:py-24 transition-colors duration-200"
        style={{
          backgroundColor: t.surface,
          borderTop: `1px solid ${t.hairline}`,
          borderBottom: `1px solid ${t.hairline}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 space-y-10">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: t.textPrimary }}>
                  Khoảnh khắc Zone Six
                </h2>
                <p className="text-xs sm:text-sm mt-1" style={{ color: t.textSecondary }}>
                  Góc nhỏ bình yên, chất gỗ trầm ấm và những giọt cà phê chiết xuất chậm rãi.
                </p>
              </div>
              <span className="text-xs font-mono" style={{ color: t.textMuted }}>
                07:00 – 23:30
              </span>
            </div>
          </Reveal>

          {/* Lưới ảnh so le nghệ thuật 4 khung hình chất lượng cao */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Reveal delay={100}>
              <div
                className="group relative rounded-2xl overflow-hidden transition-transform duration-500 hover:-translate-y-1"
                style={{
                  border: `1px solid ${t.hairline}`,
                  boxShadow: t.cardHighlight,
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=85"
                  alt="Quầy bar thủ công"
                  loading="lazy"
                  className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent text-white"
                >
                  <p className="text-xs font-medium">Quầy Bar</p>
                  <p className="text-[11px] text-white/70">Pha chế thủ công</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div
                className="group relative rounded-2xl overflow-hidden transition-transform duration-500 hover:-translate-y-1"
                style={{
                  border: `1px solid ${t.hairline}`,
                  boxShadow: t.cardHighlight,
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=85"
                  alt="Hương vị mộc mạc"
                  loading="lazy"
                  className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent text-white"
                >
                  <p className="text-xs font-medium">Bọt Sữa &amp; Kem Béo</p>
                  <p className="text-[11px] text-white/70">Sánh mịn thơm đượm</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div
                className="group relative rounded-2xl overflow-hidden transition-transform duration-500 hover:-translate-y-1"
                style={{
                  border: `1px solid ${t.hairline}`,
                  boxShadow: t.cardHighlight,
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=85"
                  alt="Góc đọc sách thư thái"
                  loading="lazy"
                  className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent text-white"
                >
                  <p className="text-xs font-medium">Góc Tĩnh</p>
                  <p className="text-[11px] text-white/70">Đọc sách &amp; làm việc</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div
                className="group relative rounded-2xl overflow-hidden transition-transform duration-500 hover:-translate-y-1"
                style={{
                  border: `1px solid ${t.hairline}`,
                  boxShadow: t.cardHighlight,
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=800&q=85"
                  alt="Ánh đèn đêm lounge"
                  loading="lazy"
                  className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent text-white"
                >
                  <p className="text-xs font-medium">Đêm Lounge</p>
                  <p className="text-[11px] text-white/70">Ánh đèn vàng dịu</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4. Thực Đơn Tuyển Chọn (Curated Signature Drinks - Nhiều ảnh thức uống thật, tên & mô tả 1 câu) */}
      <section id="menu" className="py-16 sm:py-24 max-w-7xl mx-auto px-6 space-y-10">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: t.textPrimary }}>
                Thức uống đặc trưng
              </h2>
              <p className="text-xs sm:text-sm mt-1" style={{ color: t.textSecondary }}>
                Pha chế từ hạt rang mộc và trái cây tươi trong ngày.
              </p>
            </div>
            <p className="text-xs" style={{ color: t.textMuted }}>
              * Quét mã QR tại bàn để xem trọn bộ thực đơn
            </p>
          </div>
        </Reveal>

        {/* 4 Thẻ thức uống lớn bằng ảnh chân thực */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Món 1: Cà phê muối cố đô */}
          <Reveal delay={100}>
            <div
              className="rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: t.surface,
                border: `1px solid ${t.hairline}`,
                boxShadow: t.cardHighlight,
              }}
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=700&q=85"
                  alt="Cà phê muối cố đô"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold" style={{ color: t.textPrimary }}>
                    Cà phê muối cố đô
                  </h3>
                  <span className="text-xs font-mono font-semibold" style={{ color: t.accent }}>
                    29.000đ
                  </span>
                </div>
                <p className="text-xs line-clamp-1" style={{ color: t.textSecondary }}>
                  Kem muối béo mặn sánh mịn hòa quyện cà phê phin đậm đà.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Món 2: Trà dâu tây tươi */}
          <Reveal delay={200}>
            <div
              className="rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: t.surface,
                border: `1px solid ${t.hairline}`,
                boxShadow: t.cardHighlight,
              }}
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=700&q=85"
                  alt="Trà dâu tây tươi"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold" style={{ color: t.textPrimary }}>
                    Trà dâu tây tươi
                  </h3>
                  <span className="text-xs font-mono font-semibold" style={{ color: t.accent }}>
                    35.000đ
                  </span>
                </div>
                <p className="text-xs line-clamp-1" style={{ color: t.textSecondary }}>
                  Cốt trà lài ủ lạnh cùng dâu tây Đà Lạt chua ngọt mọng nước.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Món 3: Trà đào cam sả tươi */}
          <Reveal delay={300}>
            <div
              className="rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: t.surface,
                border: `1px solid ${t.hairline}`,
                boxShadow: t.cardHighlight,
              }}
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=85"
                  alt="Trà đào cam sả tươi"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold" style={{ color: t.textPrimary }}>
                    Trà đào cam sả
                  </h3>
                  <span className="text-xs font-mono font-semibold" style={{ color: t.accent }}>
                    32.000đ
                  </span>
                </div>
                <p className="text-xs line-clamp-1" style={{ color: t.textSecondary }}>
                  Cam vàng mọng nước, sả thơm nồng và những lát đào giòn.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Món 4: Cà phê Pour Over mộc */}
          <Reveal delay={400}>
            <div
              className="rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: t.surface,
                border: `1px solid ${t.hairline}`,
                boxShadow: t.cardHighlight,
              }}
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=85"
                  alt="Cà phê Pour Over thủ công"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold" style={{ color: t.textPrimary }}>
                    Cà phê Pour Over
                  </h3>
                  <span className="text-xs font-mono font-semibold" style={{ color: t.accent }}>
                    38.000đ
                  </span>
                </div>
                <p className="text-xs line-clamp-1" style={{ color: t.textSecondary }}>
                  Chiết xuất thủ công lưu trọn hương hoa trái tự nhiên của hạt Arabica.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5. Trải Nghiệm Gọi Món Tại Bàn (Visual Standee & Minimal 3 Steps) */}
      <section
        id="order"
        className="py-16 sm:py-24 transition-colors duration-200"
        style={{
          backgroundColor: t.surface,
          borderTop: `1px solid ${t.hairline}`,
          borderBottom: `1px solid ${t.hairline}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Ảnh chụp góc bàn và trải nghiệm thực tế (7 cols) */}
            <div className="lg:col-span-7">
              <Reveal>
                <div
                  className="rounded-2xl overflow-hidden relative shadow-lg"
                  style={{
                    border: `1px solid ${t.hairline}`,
                    boxShadow: t.cardHighlight,
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1100&q=85"
                    alt="Trải nghiệm gọi món tại bàn"
                    loading="lazy"
                    className="w-full aspect-[16/10] object-cover"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">Standee Mica Tại Bàn</p>
                      <p className="text-xs text-white/70">Quét mã gọi món &amp; thanh toán VietQR tức thì</p>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded bg-white/15 backdrop-blur-sm">
                      Bàn 06
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* 3 Bước tinh giản (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <Reveal delay={100}>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: t.textPrimary }}>
                    Gọi món tại bàn
                  </h2>
                  <p className="text-xs sm:text-sm mt-1" style={{ color: t.textSecondary }}>
                    Thuận tiện, chủ động và không phải xếp hàng chờ đợi.
                  </p>
                </div>
              </Reveal>

              <div className="space-y-4">
                <Reveal delay={200}>
                  <div
                    className="p-4 rounded-xl flex items-center gap-4 transition-colors"
                    style={{
                      backgroundColor: t.bg,
                      border: `1px solid ${t.hairline}`,
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-semibold shrink-0"
                      style={{
                        backgroundColor: t.accent,
                        color: t.accentText,
                      }}
                    >
                      1
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold" style={{ color: t.textPrimary }}>
                        Quét mã QR bàn
                      </h3>
                      <p className="text-[11px] mt-0.5" style={{ color: t.textSecondary }}>
                        Dùng camera điện thoại quét mã mica đặt ngay tại bàn bạn ngồi.
                      </p>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={300}>
                  <div
                    className="p-4 rounded-xl flex items-center gap-4 transition-colors"
                    style={{
                      backgroundColor: t.bg,
                      border: `1px solid ${t.hairline}`,
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-semibold shrink-0"
                      style={{
                        backgroundColor: t.accent,
                        color: t.accentText,
                      }}
                    >
                      2
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold" style={{ color: t.textPrimary }}>
                        Chọn món &amp; độ ngọt
                      </h3>
                      <p className="text-[11px] mt-0.5" style={{ color: t.textSecondary }}>
                        Tự chọn lượng đường, mức đá và topping yêu thích.
                      </p>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={400}>
                  <div
                    className="p-4 rounded-xl flex items-center gap-4 transition-colors"
                    style={{
                      backgroundColor: t.bg,
                      border: `1px solid ${t.hairline}`,
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-semibold shrink-0"
                      style={{
                        backgroundColor: t.accent,
                        color: t.accentText,
                      }}
                    >
                      3
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold" style={{ color: t.textPrimary }}>
                        Nhận món tận bàn
                      </h3>
                      <p className="text-[11px] mt-0.5" style={{ color: t.textSecondary }}>
                        Quét VietQR thanh toán, Barista pha chế và nhân viên mang tới bàn.
                      </p>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Hai Không Gian Tại Đà Nẵng (Ảnh lớn 2 chi nhánh thực tế, thông tin tối giản) */}
      <section id="stores" className="py-16 sm:py-24 max-w-7xl mx-auto px-6 space-y-10">
        <Reveal>
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: t.textPrimary }}>
              Hai góc quán
            </h2>
            <p className="text-xs sm:text-sm mt-1" style={{ color: t.textSecondary }}>
              Không gian rộng rãi, thoáng đãng dành cho bạn tại Đà Nẵng.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cơ sở 1: Lương Nhữ Học */}
          <Reveal delay={100}>
            <div
              className="rounded-2xl overflow-hidden group transition-all duration-300"
              style={{
                backgroundColor: t.surface,
                border: `1px solid ${t.hairline}`,
                boxShadow: t.cardHighlight,
              }}
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1000&q=85"
                  alt="Không gian Zone Six Lương Nhữ Học"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-md text-[11px] font-medium bg-black/60 text-emerald-400 backdrop-blur-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Mở cửa
                </div>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="text-base font-semibold" style={{ color: t.textPrimary }}>
                  Zone Six — Lương Nhữ Học
                </h3>
                <div className="space-y-1 text-xs" style={{ color: t.textSecondary }}>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-3.5 h-3.5 shrink-0" style={{ color: t.accent }} />
                    <span>212 Lương Nhữ Học, Khuê Trung, Cẩm Lệ, Đà Nẵng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="w-3.5 h-3.5 shrink-0" style={{ color: t.textMuted }} />
                    <span>07:00 – 23:30 mỗi ngày</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiPhone className="w-3.5 h-3.5 shrink-0" style={{ color: t.textMuted }} />
                    <span>0905 123 456</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Cơ sở 2: Hải Châu */}
          <Reveal delay={200}>
            <div
              className="rounded-2xl overflow-hidden group transition-all duration-300"
              style={{
                backgroundColor: t.surface,
                border: `1px solid ${t.hairline}`,
                boxShadow: t.cardHighlight,
              }}
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=85"
                  alt="Không gian Zone Six Hải Châu"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-md text-[11px] font-medium bg-black/60 text-emerald-400 backdrop-blur-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Mở cửa
                </div>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="text-base font-semibold" style={{ color: t.textPrimary }}>
                  Zone Six — Hải Châu
                </h3>
                <div className="space-y-1 text-xs" style={{ color: t.textSecondary }}>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-3.5 h-3.5 shrink-0" style={{ color: t.accent }} />
                    <span>56 Nguyễn Chí Thanh, Hải Châu 1, Hải Châu, Đà Nẵng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="w-3.5 h-3.5 shrink-0" style={{ color: t.textMuted }} />
                    <span>07:00 – 23:30 mỗi ngày</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiPhone className="w-3.5 h-3.5 shrink-0" style={{ color: t.textMuted }} />
                    <span>0905 654 321</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 7. Footer: Mộc mạc, yên bình, tinh tế */}
      <footer
        className="py-12 transition-colors duration-200"
        style={{
          borderTop: `1px solid ${t.hairline}`,
          backgroundColor: t.surface,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold tracking-wide" style={{ color: t.textPrimary }}>
              Zone Six
            </span>
            <span style={{ color: t.textMuted }}>•</span>
            <span style={{ color: t.textSecondary }}>Đà Nẵng</span>
          </div>

          <p style={{ color: t.textMuted }}>
            &copy; {new Date().getFullYear()} Zone Six. Tất cả các quyền được bảo lưu.
          </p>
        </div>
      </footer>
    </div>
  );
};
