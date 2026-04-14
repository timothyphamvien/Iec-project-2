import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll, useInView } from 'motion/react';
import { 
  ArrowRight, ArrowUpRight, Globe, Zap, GraduationCap, Rocket, 
  Layers, Users, Network, Briefcase, Calendar, Building2, 
  Landmark, DollarSign, Search, ChevronRight, ChevronLeft, Star, Shield, 
  Cpu, Activity, TrendingUp, Award, Mail, Phone, MapPin,
  Facebook, Twitter, Linkedin, Instagram, X, Menu,
  ExternalLink, Share2, Database, Languages, Handshake
} from 'lucide-react';
import { translations } from './translations';
import { useSiteData, initialData } from './context/SiteContext';
import InformationHub from './InformationHub';
import AdminApp from './admin/AdminApp';

// --- Shared Components ---

const Counter = ({ value, duration = 2 }: { value: string, duration?: number }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const target = parseInt(value.replace(/\D/g, ''));
  const isPlus = value.includes('+');
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        const currentCount = Math.floor(progress * target);
        
        if (currentCount !== countRef.current) {
          setCount(currentCount);
          countRef.current = currentCount;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, target, duration]);

  return (
    <span ref={nodeRef}>
      {count}{isPlus ? '+' : ''}
    </span>
  );
};

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-iec-primary/5 rounded-lg ${className}`} />
);

const ImageWithSkeleton = ({ src, alt, className, referrerPolicy, loading = "lazy" }: { src: string, alt: string, className?: string, referrerPolicy?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url", loading?: "lazy" | "eager" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-iec-primary/5 rounded-lg z-10" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        referrerPolicy={referrerPolicy}
        loading={loading}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-iec-bg text-iec-accent/20 text-[8px] font-bold uppercase text-center p-2">
          Logo
        </div>
      )}
    </div>
  );
};


const PartnerModal = ({ isOpen, onClose, t }: { isOpen: boolean, onClose: () => void, t: any }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-iec-accent/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-8 md:p-12">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black text-iec-accent mb-2">{t.modal.title}</h2>
                <p className="text-sm text-iec-accent/60">{t.modal.subtitle}</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-iec-bg flex items-center justify-center text-iec-accent/40 hover:bg-iec-primary hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-iec-accent/40 ml-1">{t.modal.company}</label>
                  <input type="text" className="w-full bg-iec-bg border border-iec-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-iec-primary transition-colors" placeholder="e.g. TechCorp" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-iec-accent/40 ml-1">{t.modal.contact}</label>
                  <input type="text" className="w-full bg-iec-bg border border-iec-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-iec-primary transition-colors" placeholder="e.g. John Doe" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-iec-accent/40 ml-1">{t.modal.email}</label>
                  <input type="email" className="w-full bg-iec-bg border border-iec-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-iec-primary transition-colors" placeholder="john@example.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-iec-accent/40 ml-1">{t.modal.phone}</label>
                  <input type="tel" className="w-full bg-iec-bg border border-iec-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-iec-primary transition-colors" placeholder="+84 ..." />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-iec-accent/40 ml-1">{t.modal.message}</label>
                <textarea className="w-full bg-iec-bg border border-iec-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-iec-primary transition-colors min-h-[120px]" placeholder={t.modal.placeholderMsg} />
              </div>
              <button className="btn-primary w-full py-4 mt-4">{t.modal.submit}</button>
            </form>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const SectionHeader = ({ title, subtitle, badge, centered = true, className = "", id }: { title: string, subtitle?: string, badge?: string, centered?: boolean, className?: string, id?: string }) => (
  <div className={`mb-16 ${centered ? 'text-center' : 'text-left'} ${className}`}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {badge && (
        <div className="inline-block mb-6">
          <span className="px-4 py-1.5 rounded-full bg-iec-primary/10 border border-iec-primary/20 text-[11px] font-black uppercase tracking-[0.3em] text-iec-primary">
            {badge}
          </span>
        </div>
      )}
      <h2 id={id} className="text-4xl md:text-5xl font-black text-iec-accent mb-6 uppercase tracking-tight italic" dangerouslySetInnerHTML={{ __html: title }} />
      {subtitle && (
        <p className={`max-w-2xl text-iec-accent/80 font-medium text-lg ${centered ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
      <div className={`h-1.5 bg-iec-primary w-24 mt-8 rounded-full ${centered ? 'mx-auto' : 'mr-auto'}`} aria-hidden="true" />
    </motion.div>
  </div>
);

const Navbar = ({ onPartnerClick, lang, setLang, t }: { onPartnerClick: () => void, lang: 'vi' | 'en', setLang: (l: 'vi' | 'en') => void, t: any }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHubListPage = location.pathname === '/hub';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: t.nav.about, id: "about" },
    { name: t.nav.ecosystem, id: "ecosystem" },
    { name: t.nav.team, id: "team" },
    { name: t.nav.partners, id: "partners" }
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Determine if we should use light text (white) for the navbar
  // This happens on the Hub list page when not scrolled (over the dark hero background)
  const isLightMode = isHubListPage && !isScrolled && !isMenuOpen;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <nav 
        className={`transition-all duration-300 h-20 flex items-center ${
          isScrolled || isMenuOpen ? 'bg-white/95 backdrop-blur-md border-b border-iec-primary/10 shadow-sm' : 'bg-transparent'
        }`}
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="container-custom w-full flex justify-between items-center">
          <Link 
            to="/" 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 group cursor-pointer z-50"
            aria-label="IEC Home"
          >
            <div className="flex flex-col">
              <div className="flex items-baseline leading-none" aria-hidden="true">
                <span className={`text-4xl font-black tracking-tighter transition-colors ${isLightMode ? 'text-white' : 'text-[#03629D]'}`}>I</span>
                <span className={`text-4xl font-black tracking-tighter transition-colors ${isLightMode ? 'text-white/90' : 'text-[#08A3E4]'}`}>E</span>
                <span className={`text-4xl font-black tracking-tighter transition-colors ${isLightMode ? 'text-white/80' : 'text-[#034A6D]'}`}>C</span>
              </div>
              <span className={`text-[7px] font-bold uppercase tracking-widest leading-none mt-1 transition-colors ${isLightMode ? 'text-white/60' : 'text-[#08A3E4]'}`}>{t.nav.logoSubtitle}</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8" role="menubar">
            {menuItems.map((item) => (
              <a 
                key={item.id} 
                href={`#${item.id}`} 
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== '/') {
                    navigate(`/#${item.id}`);
                  } else {
                    scrollToSection(item.id);
                  }
                }}
                className={`text-sm font-semibold transition-all tracking-tight relative group whitespace-nowrap ${
                  isLightMode ? 'text-white/90 hover:text-white' : (isScrolled ? 'text-iec-accent/70 hover:text-iec-primary' : 'text-iec-accent/80 hover:text-iec-primary')
                }`}
                role="menuitem"
                aria-label={`Navigate to ${item.name} section`}
              >
                {item.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-iec-primary transition-all group-hover:w-full ${isLightMode ? 'bg-white' : 'bg-iec-primary'}`} aria-hidden="true" />
              </a>
            ))}

            <Link 
              to="/hub"
              className={`text-sm font-semibold transition-all tracking-tight relative group whitespace-nowrap ${
                isLightMode ? 'text-white/90 hover:text-white' : (isScrolled ? 'text-iec-accent/70 hover:text-iec-primary' : 'text-iec-accent/80 hover:text-iec-primary')
              }`}
            >
              {t.nav.hub}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-iec-primary transition-all group-hover:w-full ${isLightMode ? 'bg-white' : 'bg-iec-primary'}`} aria-hidden="true" />
            </Link>
            
            {/* Language Switcher */}
            <div className={`flex items-center rounded-full p-1 border transition-colors ${isLightMode ? 'bg-white/10 border-white/20' : 'bg-iec-bg/50 border-iec-primary/10'}`}>
              <button 
                onClick={() => setLang('vi')}
                className={`px-3 py-1 text-[10px] font-black rounded-full transition-all ${lang === 'vi' ? (isLightMode ? 'bg-white text-iec-accent shadow-sm' : 'bg-iec-primary text-white shadow-sm') : (isLightMode ? 'text-white/60 hover:text-white' : 'text-iec-accent/40 hover:text-iec-primary')}`}
              >
                VN
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-[10px] font-black rounded-full transition-all ${lang === 'en' ? (isLightMode ? 'bg-white text-iec-accent shadow-sm' : 'bg-iec-primary text-white shadow-sm') : (isLightMode ? 'text-white/60 hover:text-white' : 'text-iec-accent/40 hover:text-iec-primary')}`}
              >
                EN
              </button>
            </div>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={onPartnerClick}
              className={`btn-primary py-2.5 px-6 lg:px-8 text-xs transition-all whitespace-nowrap ${isLightMode ? 'bg-white text-iec-accent hover:bg-white/90' : 'hover:bg-iec-primary hover:shadow-lg hover:shadow-iec-primary/30'}`}
              aria-label={t.nav.partnerBtn}
            >
              {t.nav.partnerBtn}
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden z-50">
            <div className={`flex items-center rounded-full p-1 border transition-colors ${isLightMode ? 'bg-white/10 border-white/20' : 'bg-iec-bg/50 border-iec-primary/10'}`}>
              <button 
                onClick={() => setLang('vi')}
                className={`px-2 py-1 text-[9px] font-black rounded-full transition-all ${lang === 'vi' ? (isLightMode ? 'bg-white text-iec-accent' : 'bg-iec-primary text-white') : (isLightMode ? 'text-white/60' : 'text-iec-accent/40')}`}
              >
                VN
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`px-2 py-1 text-[9px] font-black rounded-full transition-all ${lang === 'en' ? (isLightMode ? 'bg-white text-iec-accent' : 'bg-iec-primary text-white') : (isLightMode ? 'text-white/60' : 'text-iec-accent/40')}`}
              >
                EN
              </button>
            </div>
            <button 
              className={`p-2 transition-colors ${isLightMode ? 'text-white hover:text-white/80' : 'text-iec-accent hover:text-iec-primary'}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-xl z-40 flex flex-col pt-20 px-8 md:hidden"
          >
            {/* Logo in Menu */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12 flex justify-center"
            >
              <div className="flex flex-col items-center">
                <div className="flex items-baseline leading-none">
                  <span className="text-5xl font-black text-[#03629D] tracking-tighter">I</span>
                  <span className="text-5xl font-black text-[#08A3E4] tracking-tighter">E</span>
                  <span className="text-5xl font-black text-[#034A6D] tracking-tighter">C</span>
                </div>
                <span className="text-[8px] font-bold text-[#08A3E4] uppercase tracking-[0.2em] leading-none mt-2">{t.nav.logoSubtitle}</span>
              </div>
            </motion.div>

            <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
              {menuItems.map((item, idx) => (
                <motion.a
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                    scrollToSection(item.id);
                  }}
                  className="text-3xl font-semibold text-iec-accent hover:text-iec-primary transition-colors tracking-tight"
                >
                  {item.name}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + menuItems.length * 0.05 }}
              >
                <Link 
                  to="/hub"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-3xl font-semibold text-iec-accent hover:text-iec-primary transition-colors tracking-tight"
                >
                  {t.nav.hub}
                </Link>
              </motion.div>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsMenuOpen(false);
                  onPartnerClick();
                }}
                className="btn-primary w-full py-4 mt-6 text-base font-bold rounded-2xl"
              >
                {t.nav.partnerBtn}
              </motion.button>
            </div>

            <div className="mt-auto pb-12 flex flex-col gap-4">
              <div className="h-px bg-iec-primary/10 w-full mb-4" />
              <div className="flex gap-6 justify-center">
                {[
                  { Icon: Globe, url: "https://iec.com.vn" },
                  { Icon: Facebook, url: "https://www.facebook.com/IECdoimoisangtaovakhoinghiep/" },
                  { Icon: Linkedin, url: "https://www.linkedin.com/company/vietnam-iec/about/?viewAsMember=true" }
                ].map((item, i) => (
                  <a 
                    key={i} 
                    href={item.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-iec-accent/40 hover:text-iec-primary transition-colors"
                  >
                    <item.Icon size={20} />
                  </a>
                ))}
              </div>
              <p className="text-[10px] text-center text-iec-accent/30 font-bold uppercase tracking-widest">
                Info@iec.com.vn
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Hero = ({ onPartnerClick, t }: { onPartnerClick: () => void, t: any }) => {
  const { data, lang } = useSiteData();
  const heroData = data.homepage.hero;
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);
  const y3 = useTransform(scrollY, [0, 1000], [0, 150]);

  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  const moveX = useTransform(springX, [0, 1920], [-20, 20]);
  const moveY = useTransform(springY, [0, 1080], [-20, 20]);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden"
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <ImageWithSkeleton 
          src={heroData.image} 
          alt="Hero Background" 
          className="w-full h-full object-cover opacity-20"
          referrerPolicy="no-referrer"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#D1F5F9]/60 via-[#D1F5F9]/30 to-[#D1F5F9]/60" />
      </div>

      {/* Modern Visual Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div 
          style={{ x: moveX, y: moveY, opacity: 0.4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-iec-primary/10 rounded-full blur-[120px]" 
        />
        
        {/* Floating Glassmorphism Cards with Parallax */}
        <motion.div
          style={{ y: y1 }}
          animate={{ 
            rotate: [0, 10, 0],
            x: [0, 10, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] left-[10%] w-16 h-16 bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl flex items-center justify-center text-cyan-500 hidden lg:flex"
        >
          <Cpu size={32} />
        </motion.div>

        <motion.div
          style={{ y: y2 }}
          animate={{ 
            rotate: [0, -10, 0],
            x: [0, -10, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[20%] right-[20%] w-14 h-14 bg-white/60 backdrop-blur-xl border border-white/40 rounded-full shadow-xl flex items-center justify-center text-rose-500 hidden lg:flex"
        >
          <Share2 size={24} />
        </motion.div>

        <motion.div
          style={{ y: y3 }}
          animate={{ 
            rotate: [0, 15, 0],
            x: [0, -15, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-[20%] right-[10%] w-16 h-16 bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl flex items-center justify-center text-amber-500 hidden lg:flex"
        >
          <Database size={32} />
        </motion.div>
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.2, ease: "backOut" }}
              className="inline-flex items-center px-6 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/40 text-iec-primary text-[10px] font-black uppercase tracking-[0.3em] mb-12 shadow-sm"
            >
              <span>{heroData.badge[lang]}</span>
            </motion.div>
            
            <motion.h1 
              className="mb-10 text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] flex flex-col items-center"
            >
              <div className="flex flex-wrap justify-center gap-x-4">
                <motion.span 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.215, 0.61, 0.355, 1] }}
                  className="text-iec-accent"
                >
                  {heroData.title1[lang]}
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
                  className="text-iec-primary"
                >
                  {heroData.title2[lang]}
                </motion.span>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4">
                <motion.span 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
                  className="text-iec-accent"
                >
                  {heroData.title3[lang]}
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: [0.215, 0.61, 0.355, 1] }}
                  className="text-iec-accent"
                >
                  {heroData.title4[lang]}
                </motion.span>
              </div>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-iec-accent/60 mb-12 max-w-2xl mx-auto font-medium"
            >
              {heroData.subtitle[lang]}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6"
            >
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(8, 163, 228, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const element = document.getElementById('ecosystem');
                  if (element) {
                    const offset = 80;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = element.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                  }
                }}
                className="btn-primary px-10 py-5 text-lg"
              >
                {t.hero.ctaPrimary}
                <ArrowRight size={20} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={onPartnerClick}
                className="btn-outline px-10 py-5 text-lg border-2 bg-white/20 backdrop-blur-sm"
              >
                {t.hero.ctaSecondary}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const About = ({ t }: { t: any }) => {
  const { data, lang } = useSiteData();
  const aboutData = data.homepage.about;

  if (!aboutData) return null;

  const highlights = [
    { 
      title: aboutData.highlights[0]?.title[lang] || "", 
      icon: <Zap />, 
      desc: aboutData.highlights[0]?.desc[lang] || "", 
      color: "text-iec-primary", 
      bgColor: "bg-iec-primary/5" 
    },
    { 
      title: aboutData.highlights[1]?.title[lang] || "", 
      icon: <GraduationCap />, 
      desc: aboutData.highlights[1]?.desc[lang] || "", 
      color: "text-blue-600", 
      bgColor: "bg-blue-50" 
    },
    { 
      icon: <Rocket />, 
      title: aboutData.highlights[2]?.title[lang] || "", 
      desc: aboutData.highlights[2]?.desc[lang] || "", 
      color: "text-indigo-600", 
      bgColor: "bg-indigo-50" 
    },
    { 
      icon: <Layers />, 
      title: aboutData.highlights[3]?.title[lang] || "", 
      desc: aboutData.highlights[3]?.desc[lang] || "", 
      color: "text-teal-600", 
      bgColor: "bg-teal-50" 
    },
  ];

  return (
    <section id="about" className="section-spacing bg-white scroll-mt-20 relative overflow-hidden" aria-labelledby="about-title">
      {/* Professional Background Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#F8FBFE] -skew-x-12 translate-x-1/4 -z-0" aria-hidden="true" />
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-iec-primary/5 rounded-full blur-[120px] -translate-x-1/2" aria-hidden="true" />

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-6">
              <span className="px-4 py-1.5 rounded-full bg-iec-primary/10 border border-iec-primary/20 text-[11px] font-black uppercase tracking-[0.3em] text-iec-primary" role="doc-subtitle">
                {aboutData.badge[lang]}
              </span>
            </div>
            <h2 id="about-title" className="text-4xl md:text-5xl font-black text-iec-accent mb-8 uppercase tracking-tight italic leading-[1.1]" dangerouslySetInnerHTML={{ __html: aboutData.title[lang] }} />
            
            <div className="space-y-6 text-lg text-iec-accent/80 font-medium leading-relaxed">
              <p>
                {aboutData.description[lang]}
              </p>
              <p className="text-base text-iec-accent/60 italic">
                {aboutData.quote[lang]}
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white shadow-sm border border-iec-primary/5">
                <div className="w-2 h-2 rounded-full bg-iec-primary animate-pulse" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider text-iec-accent">{aboutData.h1[lang]}</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white shadow-sm border border-iec-primary/5">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider text-iec-accent">{aboutData.h2[lang]}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group">
              <div className="absolute inset-0 bg-iec-primary/10 group-hover:bg-transparent transition-colors duration-500 z-10" aria-hidden="true" />
              <img 
                src={aboutData.image} 
                alt="IEC Innovation Center" 
                className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-iec-accent/90 to-transparent z-20">
                <p className="text-white text-sm font-bold uppercase tracking-widest">IEC Headquarters</p>
                <p className="text-white/60 text-xs">Innovation District, Vietnam</p>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-iec-primary/10 rounded-full blur-3xl -z-0" aria-hidden="true" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -z-0" aria-hidden="true" />
            
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-8 top-1/4 z-30 bg-white p-6 rounded-3xl shadow-xl border border-iec-primary/10 hidden md:block"
              aria-hidden="true"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-iec-primary/10 flex items-center justify-center text-iec-primary">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-iec-accent/40">Active Projects</p>
                  <p className="text-xl font-black text-iec-accent">250+</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2rem] bg-white border border-iec-primary/5 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group"
            >
              <div className={`w-14 h-14 ${item.bgColor} rounded-2xl flex items-center justify-center ${item.color} mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm`}>
                {React.cloneElement(item.icon as React.ReactElement, { size: 28 })}
              </div>
              <h3 className="text-xl font-black text-iec-accent mb-4 uppercase tracking-tight">{item.title}</h3>
              <p className="text-sm text-iec-accent/60 leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CoreValues = ({ t }: { t: any }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const values = [
    { 
      title: t.services.items[0].title, 
      desc: t.services.items[0].desc, 
      icon: <GraduationCap />, 
      color: "text-blue-600", 
      bgColor: "bg-blue-50" 
    },
    { 
      title: t.services.items[1].title, 
      desc: t.services.items[1].desc, 
      icon: <Zap />, 
      color: "text-green-600", 
      bgColor: "bg-green-50" 
    },
    { 
      title: t.services.items[2].title, 
      desc: t.services.items[2].desc, 
      icon: <Rocket />, 
      color: "text-indigo-600", 
      bgColor: "bg-indigo-50" 
    },
    { 
      title: t.services.items[3].title, 
      desc: t.services.items[3].desc, 
      icon: <Users />, 
      color: "text-orange-600", 
      bgColor: "bg-orange-50" 
    },
    { 
      title: t.services.items[4].title, 
      desc: t.services.items[4].desc, 
      icon: <Globe />, 
      color: "text-rose-600", 
      bgColor: "bg-rose-50" 
    },
    { 
      title: t.services.items[5].title, 
      desc: t.services.items[5].desc, 
      icon: <Briefcase />, 
      color: "text-iec-primary", 
      bgColor: "bg-iec-primary/5" 
    },
  ];

  return (
    <section id="services" className="section-spacing bg-[#F8FBFE] scroll-mt-20 relative overflow-hidden" aria-labelledby="services-title">
      {/* Professional Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-iec-primary/10 rounded-full blur-[120px] -translate-x-1/2" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] translate-x-1/2" />
      </div>

      <div className="container-custom relative z-10">
        <SectionHeader 
          id="services-title"
          badge={t.services.badge}
          title={t.services.title}
          subtitle={t.services.subtitle}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-white border border-iec-primary/5 space-y-6">
                <Skeleton className="h-12 w-12 rounded-2xl bg-iec-accent/5" />
                <Skeleton className="h-8 w-3/4 bg-iec-accent/5" />
                <Skeleton className="h-20 w-full bg-iec-accent/5" />
              </div>
            ))
          ) : (
            values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="p-10 rounded-[2.5rem] bg-white border border-iec-primary/5 shadow-sm hover:shadow-2xl hover:shadow-iec-primary/10 hover:-translate-y-2 transition-all duration-500 group"
                role="article"
                aria-labelledby={`value-title-${i}`}
              >
                <div className={`w-14 h-14 ${value.bgColor} rounded-2xl flex items-center justify-center ${value.color} mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm`} aria-hidden="true">
                  {React.cloneElement(value.icon as React.ReactElement, { size: 28 })}
                </div>
                <h3 id={`value-title-${i}`} className="text-2xl font-black text-iec-accent mb-4 group-hover:text-iec-primary transition-colors uppercase tracking-tight">{value.title}</h3>
                <p className="text-iec-accent/60 text-base leading-relaxed font-medium">{value.desc}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};



const Ecosystem = ({ t }: { t: any }) => {
  const { data, lang } = useSiteData();
  const ecosystemData = data.homepage.ecosystem;
  const [activeNode, setActiveNode] = useState<number | null>(1); // Default to Startups

  if (!ecosystemData) return null;

  const stakeholders = [
    { 
      label: t.ecosystem.stakeholders.universities.label, 
      icon: <GraduationCap />, 
      desc: t.ecosystem.stakeholders.universities.desc,
      color: "#3b82f6",
      concept: t.ecosystem.stakeholders.universities.concept
    },
    { 
      label: t.ecosystem.stakeholders.startups.label, 
      icon: <Rocket />, 
      desc: t.ecosystem.stakeholders.startups.desc,
      color: "#8b5cf6",
      concept: t.ecosystem.stakeholders.startups.concept
    },
    { 
      label: t.ecosystem.stakeholders.enterprises.label, 
      icon: <Building2 />, 
      desc: t.ecosystem.stakeholders.enterprises.desc,
      color: "#0d9488",
      concept: t.ecosystem.stakeholders.enterprises.concept
    },
    { 
      label: t.ecosystem.stakeholders.investors.label, 
      icon: <DollarSign />, 
      desc: t.ecosystem.stakeholders.investors.desc,
      color: "#f59e0b",
      concept: t.ecosystem.stakeholders.investors.concept
    },
    { 
      label: t.ecosystem.stakeholders.government.label, 
      icon: <Landmark />, 
      desc: t.ecosystem.stakeholders.government.desc,
      color: "#ef4444",
      concept: t.ecosystem.stakeholders.government.concept
    },
  ];

  return (
    <section id="ecosystem" className="section-spacing bg-iec-bg overflow-hidden relative scroll-mt-20" aria-labelledby="ecosystem-title">
      {/* Background Infographic Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-5" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-[20px] border-iec-primary rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border-[10px] border-iec-primary rounded-full" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #08A3E4 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="container-custom relative z-10">
        <SectionHeader 
          id="ecosystem-title"
          badge={ecosystemData.badge[lang]}
          title={ecosystemData.title[lang]} 
          subtitle={ecosystemData.subtitle[lang]}
        />
        
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 min-h-[600px] max-w-6xl mx-auto">
          {/* Infographic Visual */}
          <div className="relative w-full max-w-[550px] aspect-square flex items-center justify-center" role="img" aria-label="Interactive Innovation Ecosystem Diagram">
            {/* Visual Hover Concepts - Floating around the hub */}
            <AnimatePresence>
              {activeNode !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 20 }}
                  className="absolute inset-0 pointer-events-none z-50"
                >
                  <div 
                    style={{ backgroundColor: `${stakeholders[activeNode].color}dd` }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-16 px-6 py-2 rounded-full shadow-2xl border border-white/20 text-[12px] font-black uppercase tracking-[0.3em] text-white backdrop-blur-md"
                  >
                    {stakeholders[activeNode].concept}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pulsing Background Circles */}
            <motion.div 
              animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute w-80 h-80 bg-iec-primary rounded-full blur-[100px]"
            />

            {/* Central Hub - Moved to higher Z-index and rendered after lines */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="relative z-40 w-32 h-32 md:w-44 md:h-44 bg-gradient-to-br from-iec-primary via-[#08A3E4] to-iec-secondary rounded-full flex flex-col items-center justify-center text-white shadow-[0_0_60px_rgba(8,163,228,0.4)] border-4 border-white cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setActiveNode(null)}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-full" />
              <Cpu size={48} className="mb-1 relative z-10 drop-shadow-lg" />
              <span className="text-xl font-black tracking-tight relative z-10 drop-shadow-md">IEC HUB</span>
            </motion.div>

            {/* Stakeholder Nodes and Lines */}
            {stakeholders.map((node, i) => {
              const angle = (i * (360 / stakeholders.length) - 90) * (Math.PI / 180);
              const radius = typeof window !== 'undefined' && window.innerWidth < 768 ? 140 : 210;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const isActive = activeNode === i;

              return (
                <React.Fragment key={i}>
                  {/* Connection Line - Lower Z-index than Hub */}
                  <div 
                    className={`absolute h-0.5 origin-left transition-all duration-500 ${isActive ? 'bg-iec-primary z-10 h-1.5' : 'bg-iec-primary/10 z-0'}`}
                    style={{ 
                      width: radius,
                      left: '50%',
                      top: '50%',
                      transform: `rotate(${angle}rad)`
                    }}
                  >
                    {/* Flow Animation */}
                    <motion.div
                      animate={{ 
                        left: ['0%', '100%'],
                        opacity: [0, 1, 0]
                      }}
                      transition={{ 
                        duration: 2.5, 
                        repeat: Infinity, 
                        ease: "linear",
                        delay: i * 0.4
                      }}
                      className={`absolute top-0 h-full w-16 bg-gradient-to-r from-transparent ${isActive ? 'via-white' : 'via-iec-primary/30'} to-transparent -translate-y-1/2`}
                    />
                  </div>
                  
                  {/* Node */}
                  <motion.div
                    initial={{ opacity: 0, x: 0, y: 0 }}
                    whileInView={{ opacity: 1, x, y }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 60 }}
                    className="absolute z-30"
                  >
                    <button 
                      onClick={() => setActiveNode(i)}
                      onMouseEnter={() => setActiveNode(i)}
                      className={`flex flex-col items-center gap-3 group transition-all duration-300 ${isActive ? 'scale-115' : 'hover:scale-110'}`}
                      aria-label={`View details for ${node.label}`}
                      aria-expanded={isActive}
                    >
                      <div 
                        style={{ 
                          backgroundColor: isActive ? node.color : 'white',
                          color: isActive ? 'white' : node.color,
                          borderColor: isActive ? 'white' : `${node.color}30`,
                          boxShadow: isActive ? `0 20px 40px ${node.color}40` : '0 10px 20px rgba(0,0,0,0.05)'
                        }}
                        className={`w-16 h-16 md:w-24 md:h-24 rounded-[2rem] flex items-center justify-center shadow-xl border-2 transition-all duration-500 ${isActive ? 'rotate-12' : 'group-hover:border-current group-hover:-rotate-6'}`}
                      >
                        {React.cloneElement(node.icon as React.ReactElement, { size: isActive ? 40 : 32 })}
                      </div>
                      <span 
                        style={{ color: isActive ? node.color : undefined }}
                        className={`text-[12px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-colors ${isActive ? 'opacity-100' : 'text-iec-accent/40 group-hover:text-iec-accent'}`}
                      >
                        {node.label}
                      </span>
                    </button>
                  </motion.div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Information Panel */}
          <div className="w-full lg:w-[450px] min-h-[300px] flex items-center">
            <AnimatePresence mode="wait">
              {activeNode !== null && (
                <motion.div
                  key={activeNode}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl border border-iec-primary/10 relative overflow-hidden w-full"
                >
                  <div 
                    className="absolute top-0 right-0 w-40 h-40 rounded-full -mr-20 -mt-20 opacity-10"
                    style={{ backgroundColor: stakeholders[activeNode].color }}
                  />
                  <div className="relative z-10">
                    <div 
                      className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-8 shadow-lg"
                      style={{ backgroundColor: `${stakeholders[activeNode].color}15`, color: stakeholders[activeNode].color }}
                    >
                      {React.cloneElement(stakeholders[activeNode].icon as React.ReactElement, { size: 32 })}
                    </div>
                    <h3 className="text-3xl font-black text-iec-accent mb-6 uppercase tracking-tighter">
                      {stakeholders[activeNode].label}
                    </h3>
                    <p className="text-lg text-iec-accent/70 leading-relaxed mb-10 font-medium">
                      {stakeholders[activeNode].desc}
                    </p>
                    <button 
                      style={{ backgroundColor: stakeholders[activeNode].color }}
                      className="flex items-center gap-3 text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest group shadow-xl hover:scale-105 transition-all"
                    >
                      {t.ecosystem.explore} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

const Impact = ({ t }: { t: any }) => {
  const { data, lang } = useSiteData();
  const impactData = data.homepage.impact;

  if (!impactData) return null;

  const stats = [
    { label: impactData.stats[0]?.label[lang] || "", value: impactData.stats[0]?.value || "", icon: <Calendar />, color: "text-blue-400" },
    { label: impactData.stats[1]?.label[lang] || "", value: impactData.stats[1]?.value || "", icon: <Handshake />, color: "text-teal-400" },
    { label: impactData.stats[2]?.label[lang] || "", value: impactData.stats[2]?.value || "", icon: <Rocket />, color: "text-orange-400" },
    { label: impactData.stats[3]?.label[lang] || "", value: impactData.stats[3]?.value || "", icon: <Users />, color: "text-rose-400" },
  ];

  return (
    <section id="impact" className="py-24 bg-iec-accent text-white relative overflow-hidden">
      {/* Visual Accents */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-iec-primary rounded-full blur-[100px]" />
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-[0.3em] text-iec-primary">
              {impactData.badge[lang]}
            </span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic"
            dangerouslySetInnerHTML={{ __html: impactData.title[lang] }}
          />
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: 100 }}
            viewport={{ once: true }}
            className="h-1.5 bg-iec-primary mx-auto mt-6 rounded-full"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="text-center group"
            >
              <div className={`mb-6 flex justify-center ${stat.color} group-hover:scale-125 transition-transform duration-500`}>
                {React.cloneElement(stat.icon as React.ReactElement, { size: 48 })}
              </div>
              <div className="text-5xl md:text-7xl font-black mb-2 tracking-tighter">
                <Counter value={stat.value} />
              </div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white/80 transition-colors">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturedPartners = ({ t }: { t: any }) => {
  const { data, lang } = useSiteData();
  const featuredPartners = data.partners.filter(p => p.featured);

  if (featuredPartners.length === 0) return null;

  return (
    <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {featuredPartners.map((p) => (
        <div key={p.id} className="bg-[#F8FBFE] rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 border border-iec-primary/5 hover:bg-white hover:shadow-xl transition-all duration-500">
          <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center bg-white rounded-3xl p-4 shadow-sm">
            <ImageWithSkeleton 
              src={p.logo} 
              alt={p.name} 
              className="max-w-full max-h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-grow text-center md:text-left">
            <h3 className="text-xl font-black text-iec-accent uppercase tracking-tight mb-3 italic">{p.name}</h3>
            <p className="text-sm text-iec-accent/60 font-medium leading-relaxed mb-6">
              {p.description[lang]}
            </p>
            <a 
              href={p.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-iec-primary hover:gap-3 transition-all"
            >
              {t.specialPartners.visit} <ArrowRight size={14} />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

const Partners = ({ t }: { t: any }) => {
  const { data, lang } = useSiteData();
  const partnersData = data.homepage?.partners || initialData.homepage.partners;
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      // Scroll by exactly the width of the visible grid (6 columns)
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const partnersList = useMemo(() => {
    return data.partners.length > 0 ? data.partners : initialData.partners;
  }, [data.partners]);

  const regularPartners = useMemo(() => {
    return partnersList
      .filter(p => !p.isSpecial)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [partnersList]);

  const specialPartners = useMemo(() => {
    return partnersList.filter(p => p.isSpecial).slice(0, 2);
  }, [partnersList]);

  useEffect(() => {
    const current = scrollRef.current;
    if (current) {
      current.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      setTimeout(checkScroll, 1000);
    }
    return () => {
      current?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [isLoading, regularPartners]);

  const renderPartnerLogo = (p: any, i: number) => (
    <motion.a
      key={p.id}
      href={p.link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8,
        borderColor: "rgba(8, 163, 228, 0.3)",
        boxShadow: "0 25px 50px -12px rgba(8, 163, 228, 0.15)"
      }}
      viewport={{ once: true }}
      transition={{ 
        delay: (i % 6) * 0.05, 
        type: "spring", 
        stiffness: 260, 
        damping: 20 
      }}
      className="relative flex items-center justify-center w-full aspect-square bg-white rounded-[2rem] p-8 border border-gray-100/50 transition-all duration-500 group shadow-sm cursor-pointer overflow-hidden"
      role="listitem"
      aria-label={`Partner: ${p.name}`}
    >
      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-iec-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <ImageWithSkeleton 
        src={p.logo} 
        alt={`${p.name} logo`}
        className="max-w-full max-h-full object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
        referrerPolicy="no-referrer"
      />
      
      <div className="absolute inset-x-0 bottom-0 h-1 bg-iec-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      
      <div className="absolute inset-x-0 -bottom-2 opacity-0 group-hover:opacity-100 transition-all duration-500 flex justify-center z-10 translate-y-2 group-hover:translate-y-0">
        <span className="bg-iec-primary text-white text-[7px] font-black px-3 py-1 rounded-full shadow-xl uppercase tracking-[0.2em] backdrop-blur-sm">Visit Website</span>
      </div>
    </motion.a>
  );

  if (!partnersData) return null;

  return (
    <section id="partners" className="section-spacing bg-[#F8FBFE] scroll-mt-20 overflow-hidden relative" aria-labelledby="partners-title">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white -skew-x-12 translate-x-1/4" />
      </div>

      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-3xl">
            <SectionHeader 
              id="partners-title"
              badge={partnersData.badge[lang]}
              title={partnersData.title[lang]}
              subtitle={partnersData.subtitle[lang]}
              centered={false}
              className="mb-0"
            />
          </div>
          
          <div className="flex gap-4 mb-8 md:mb-0">
            <button 
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 ${
                canScrollLeft ? 'border-iec-primary text-iec-primary hover:bg-iec-primary hover:text-white shadow-lg shadow-iec-primary/20' : 'border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Previous partners"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 ${
                canScrollRight ? 'border-iec-primary text-iec-primary hover:bg-iec-primary hover:text-white shadow-lg shadow-iec-primary/20' : 'border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Next partners"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Strategic Partners (2 Cards) */}
        {specialPartners.length > 0 && (
          <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
            {specialPartners.map((p, i) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 border border-iec-primary/10 hover:shadow-[0_20px_50px_rgba(8,163,228,0.15)] transition-all duration-500 group relative overflow-hidden"
              >
                {/* Decorative background for card */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-iec-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-iec-primary/10 transition-colors" />
                
                <div className="w-36 h-36 flex-shrink-0 flex items-center justify-center bg-[#F8FBFE] rounded-3xl p-6 shadow-inner group-hover:scale-105 transition-transform duration-500">
                  <ImageWithSkeleton 
                    src={p.logo} 
                    alt={p.name} 
                    className="max-w-full max-h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-grow text-center md:text-left relative z-10">
                  <div className="inline-block mb-3">
                    <span className="px-3 py-1 rounded-full bg-iec-primary/10 text-[9px] font-black uppercase tracking-widest text-iec-primary border border-iec-primary/20">
                      Strategic Partner
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-iec-accent uppercase tracking-tight mb-3 italic group-hover:text-iec-primary transition-colors">{p.name}</h3>
                  <p className="text-sm text-iec-accent/60 font-medium leading-relaxed mb-6 line-clamp-2">
                    {p.description[lang]}
                  </p>
                  <a 
                    href={p.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-iec-primary hover:gap-4 transition-all"
                  >
                    {t.specialPartners?.visit || 'Truy cập website'} <ArrowRight size={16} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Partner Logo Carousel Grid */}
        <div className="relative">
          <div 
            ref={scrollRef}
            className="overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-12"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="grid grid-rows-2 grid-flow-col gap-6 w-max min-w-full">
              {isLoading && regularPartners.length === 0 ? (
                Array(12).fill(0).map((_, i) => (
                  <div key={i} className="w-[calc((100vw-4rem)/2)] md:w-[calc((100vw-8rem)/4)] lg:w-[calc((1200px-10rem)/6)] aspect-square bg-white rounded-3xl p-6 flex items-center justify-center border border-gray-50" role="listitem">
                    <Skeleton className="w-full h-full opacity-50" />
                  </div>
                ))
              ) : (
                regularPartners.map((p, i) => (
                  <div 
                    key={p.id} 
                    className="snap-start w-[calc((100vw-4rem)/2)] md:w-[calc((100vw-8rem)/4)] lg:w-[calc((1200px-10rem)/6)]"
                  >
                    {renderPartnerLogo(p, i)}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Subtle fade effects for carousel */}
          <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-[#F8FBFE] to-transparent pointer-events-none z-10 opacity-50" />
          <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-[#F8FBFE] to-transparent pointer-events-none z-10 opacity-50" />
        </div>
      </div>
    </section>
  );
};

const Team = ({ t }: { t: any }) => {
  const { data, lang } = useSiteData();
  const teamData = data.homepage.team;
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!teamData) return null;

  const members = teamData.members;

  return (
    <section id="team" className="section-spacing bg-white scroll-mt-20 relative overflow-hidden">
      {/* Visual background elements */}
      <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-iec-primary/5 rounded-full blur-[120px] translate-x-1/2" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] -translate-x-1/2" />
      </div>

      <div className="container-custom relative z-10">
        <SectionHeader 
          id="team-title"
          badge={teamData.badge[lang]}
          title={teamData.title[lang]} 
          subtitle={teamData.subtitle[lang]}
          centered={true}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="p-10 rounded-[3rem] bg-[#F8FBFE] border border-iec-primary/5 space-y-6">
                <Skeleton className="w-40 h-40 rounded-full mx-auto" />
                <div className="space-y-3">
                  <Skeleton className="h-8 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
              </div>
            ))
          ) : (
            members.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group relative"
              >
                <div className="p-10 rounded-[3rem] bg-[#F8FBFE] border border-iec-primary/5 hover:bg-white hover:shadow-2xl hover:shadow-iec-primary/10 transition-all duration-500 text-center h-full flex flex-col items-center">
                  {/* Image Container */}
                  <div className="relative mb-8">
                    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500 relative z-10">
                      <ImageWithSkeleton 
                        src={member.img} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {/* Decorative Ring */}
                    <div className="absolute -inset-2 border-2 border-dashed border-iec-primary/20 rounded-full group-hover:rotate-90 transition-transform duration-1000" />
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-2xl font-black text-iec-accent mb-3 group-hover:text-iec-primary transition-colors tracking-tight uppercase italic">{member.name}</h3>
                    <p className="text-iec-primary text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed px-4 opacity-80 mb-6">{member.role[lang]}</p>
                  </div>

                  {/* Professional Links */}
                  <div className="flex justify-center gap-4 pt-6 border-t border-iec-primary/5 w-full">
                    <a 
                      href={member.linkedin} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-iec-accent hover:bg-iec-primary hover:text-white shadow-sm transition-all duration-300"
                      aria-label={`${member.name}'s LinkedIn`}
                    >
                      <Linkedin size={18} />
                    </a>
                    <a 
                      href={`mailto:partner@iec.com.vn`}
                      className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-iec-accent hover:bg-iec-primary hover:text-white shadow-sm transition-all duration-300"
                      aria-label={`Email ${member.name}`}
                    >
                      <Mail size={18} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

const JoinWithUs = ({ onPartnerClick, t }: { onPartnerClick: () => void, t: any }) => {
  const { data, lang } = useSiteData();
  const joinData = data.homepage.join;

  if (!joinData) return null;

  return (
    <section id="join" className="py-24 bg-iec-primary relative overflow-hidden" aria-labelledby="join-title">
      {/* Visual background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" aria-hidden="true">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 border border-white/10 rounded-full"
        />
        <motion.div 
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] border border-white/5 rounded-full"
        />
        
        {/* Floating Icons for "sinh động" feel */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-[15%] text-cyan-300/40 hidden lg:block"
        >
          <Cpu size={48} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-[15%] text-emerald-300/40 hidden lg:block"
        >
          <Globe size={48} />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-[20%] text-orange-300/40 hidden lg:block"
        >
          <Zap size={32} />
        </motion.div>
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          >
            <Rocket size={14} className="animate-bounce" />
            <span>{joinData.badge[lang]}</span>
          </motion.div>
          
          <motion.h2
            id="join-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight"
          >
            {joinData.title1[lang]} <br className="hidden md:block" /> {joinData.title2[lang]}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/80 mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            {joinData.subtitle[lang]}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: "#fff", 
                color: "#08A3E4",
                boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)"
              }}
              whileTap={{ scale: 0.98 }}
              onClick={onPartnerClick}
              className="bg-white text-iec-primary font-black py-6 px-14 rounded-2xl shadow-2xl shadow-iec-accent/20 transition-all flex items-center gap-3 text-xl group"
            >
              {t.join.cta}
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ t }: { t: any }) => {
  const { data } = useSiteData();
  const { settings } = data;

  return (
    <footer className="bg-white border-t border-iec-primary/10 pt-20 pb-10">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-3">
            <div className="flex flex-col mb-6">
              <div className="flex items-baseline leading-none">
                <span className="text-4xl font-black text-[#03629D] tracking-tighter">I</span>
                <span className="text-4xl font-black text-[#08A3E4] tracking-tighter">E</span>
                <span className="text-4xl font-black text-[#034A6D] tracking-tighter">C</span>
              </div>
              <span className="text-[7px] font-bold text-[#08A3E4] uppercase tracking-widest leading-none mt-1">{t.footer.tagline}</span>
            </div>
            <p className="text-sm text-iec-accent/60 mb-8 leading-relaxed max-w-sm">
              {t.footer.desc}
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Globe, color: "text-blue-500", bg: "bg-blue-50", url: settings.socialLinks.website || "https://iec.com.vn" },
                { Icon: Facebook, color: "text-blue-600", bg: "bg-blue-50", url: settings.socialLinks.facebook || "https://www.facebook.com/IECdoimoisangtaovakhoinghiep/" },
                { Icon: Linkedin, color: "text-blue-700", bg: "bg-blue-50", url: settings.socialLinks.linkedin || "https://www.linkedin.com/company/vietnam-iec/about/?viewAsMember=true" }
              ].map((item, i) => (
                <a 
                  key={i} 
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center ${item.color} hover:bg-iec-primary hover:text-white transition-all cursor-pointer shadow-sm`}
                >
                  <item.Icon size={18} strokeWidth={2.5} />
                </a>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-widest mb-6 text-iec-accent">{t.footer.gatewaysTitle}</h4>
            <ul className="space-y-4 text-sm text-iec-accent/60 font-medium">
              {t.footer.gateways.map((item: string, i: number) => (
                <li key={i} className="hover:text-iec-primary transition-colors cursor-pointer flex items-center gap-2 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-iec-primary/30 group-hover:bg-iec-primary transition-colors" />
                  {i === 3 ? (
                    <Link to="/hub" className="flex-grow">{item}</Link>
                  ) : (
                    <span className="flex-grow">{item}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="md:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-widest mb-6 text-iec-accent">{t.footer.contactTitle}</h4>
            <ul className="space-y-4 text-sm text-iec-accent/60 font-medium">
              <li className="flex items-center gap-3 hover:text-iec-primary transition-colors cursor-pointer">
                <Mail size={14} className="text-orange-500" /> 
                <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
              </li>
              <li className="flex items-center gap-3 hover:text-iec-primary transition-colors cursor-pointer">
                <Phone size={14} className="text-green-500" /> 
                <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a>
              </li>
              <li className="flex items-center gap-3 hover:text-iec-primary transition-colors cursor-pointer">
                <MapPin size={14} className="text-red-500" /> 
                {settings.address}
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="mb-6">
              <ImageWithSkeleton 
                src="https://isted.edu.vn/wp-content/uploads/2026/01/logo-ISTED.png" 
                alt={t.footer.instituteTitle}
                className="h-12 w-auto mb-4"
                referrerPolicy="no-referrer"
              />
              <h4 className="text-xs font-black uppercase tracking-widest mb-4 text-iec-accent">{t.footer.instituteTitle}</h4>
            </div>
            <p className="text-xs text-iec-accent/60 font-medium leading-relaxed mb-6">
              {t.footer.instituteDesc}
            </p>
            <a 
              href={t.footer.instituteLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] text-iec-primary font-black uppercase tracking-widest hover:gap-3 transition-all"
            >
              Visit Website <ExternalLink size={14} />
            </a>
          </div>
        </div>
        
        <div className="pt-8 border-t border-iec-primary/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-iec-accent/40 font-bold uppercase tracking-widest">
            {t.footer.copyright} <span className="ml-2 opacity-50">v1.0.6</span>
          </p>
          <div className="flex gap-8 text-[10px] text-iec-accent/40 font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-iec-primary transition-colors">{t.footer.privacy}</a>
            <a href="#" className="hover:text-iec-primary transition-colors">{t.footer.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const Activities = ({ t }: { t: any }) => {
  const { data, lang } = useSiteData();
  const activitiesData = data.homepage.activities;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  if (!activitiesData) return null;

  const activities = activitiesData.items;

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const current = scrollRef.current;
    if (current) {
      current.addEventListener('scroll', checkScroll);
      checkScroll();
    }
    return () => current?.removeEventListener('scroll', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="activities" className="section-spacing bg-white overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-block mb-4">
              <span className="px-4 py-1.5 rounded-full bg-iec-primary/10 border border-iec-primary/20 text-[11px] font-black uppercase tracking-[0.3em] text-iec-primary">
                {activitiesData.badge[lang]}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-iec-accent uppercase tracking-tight italic" dangerouslySetInnerHTML={{ __html: activitiesData.title[lang] }} />
            <p className="mt-4 text-iec-accent/60 font-medium max-w-xl">
              {activitiesData.subtitle[lang]}
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                canScrollLeft ? 'border-iec-primary text-iec-primary hover:bg-iec-primary hover:text-white' : 'border-iec-accent/10 text-iec-accent/20 cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                canScrollRight ? 'border-iec-primary text-iec-primary hover:bg-iec-primary hover:text-white' : 'border-iec-accent/10 text-iec-accent/20 cursor-not-allowed'
              }`}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              className="min-w-full md:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] snap-start group"
            >
              <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-lg">
                <ImageWithSkeleton 
                  src={activity.image} 
                  alt={activity.title[lang]}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-iec-accent via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight">
                    {activity.title[lang]}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const MainLayout = ({ t, onPartnerClick }: { t: any, onPartnerClick: () => void }) => {
  const { data, lang, setLang } = useSiteData();
  const location = useLocation();
  
  useEffect(() => {
    if (location.state && (location.state as any).scrollTo) {
      const id = (location.state as any).scrollTo;
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [location]);

  const sectionComponents: { [key: string]: React.ReactNode } = {
    hero: <Hero onPartnerClick={onPartnerClick} t={t} />,
    about: <About t={t} />,
    values: <CoreValues t={t} />,
    ecosystem: <Ecosystem t={t} />,
    impact: <Impact t={t} />,
    activities: <Activities t={t} />,
    team: <Team t={t} />,
    partners: <Partners t={t} />,
    join: <JoinWithUs onPartnerClick={onPartnerClick} t={t} />,
  };

  const sortedSections = [...data.homepage.sections].sort((a, b) => a.order - b.order);

  return (
    <>
      <Navbar 
        onPartnerClick={onPartnerClick} 
        lang={lang} 
        setLang={setLang} 
        t={t}
      />
      <main>
        {sortedSections.map(section => (
          section.enabled && sectionComponents[section.id] ? (
            <React.Fragment key={section.id}>
              {sectionComponents[section.id]}
            </React.Fragment>
          ) : null
        ))}
      </main>
      <Footer t={t} />
    </>
  );
};

export default function App() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const { lang, setLang } = useSiteData();
  const t = translations[lang];

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen selection:bg-iec-primary selection:text-white">
        <Routes>
          <Route path="/" element={<MainLayout t={t} onPartnerClick={() => setIsPartnerModalOpen(true)} />} />
          <Route path="/hub" element={
            <>
              <Navbar 
                onPartnerClick={() => setIsPartnerModalOpen(true)} 
                lang={lang} 
                setLang={setLang} 
                t={t}
              />
              <InformationHub />
              <Footer t={t} />
            </>
          } />
          <Route path="/hub/:slug" element={
            <>
              <Navbar 
                onPartnerClick={() => setIsPartnerModalOpen(true)} 
                lang={lang} 
                setLang={setLang} 
                t={t}
              />
              <InformationHub />
              <Footer t={t} />
            </>
          } />
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
        <PartnerModal isOpen={isPartnerModalOpen} onClose={() => setIsPartnerModalOpen(false)} t={t} />
      </div>
    </Router>
  );
}
