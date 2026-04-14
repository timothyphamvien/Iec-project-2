import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, FileText, Image as ImageIcon, 
  Users, Calendar, FileDown, Settings, 
  Plus, Search, Edit2, Trash2, ChevronRight, X,
  LogOut, Bell, Globe, FolderTree, ArrowLeft,
  GripVertical, ChevronDown, ChevronUp, Star,
  Eye, Save, Layout, Info as InfoIcon, Target,
  Network, Handshake, Mail, Share2, Search as SearchIcon,
  Image, Play, RefreshCcw, Link, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import { useSiteData, Language, initialData, Partner, MediaItem, User } from '../context/SiteContext';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

const AdminApp = () => {
  const { data, updateData, user: currentUser, loadingAuth: isLoadingAuth } = useSiteData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const bypassUser: User = {
    id: 'dev-bypass',
    username: 'Admin (Bypass Mode)',
    email: 'Designer.Vien@gmail.com',
    role: 'admin',
    permissions: {
      homepage: 'edit',
      hub: 'edit',
      partners: 'edit',
      users: 'edit',
      settings: 'edit'
    }
  };

  const user = currentUser || bypassUser;
  const isAuthenticated = true; // Forced true for bypass mode

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (isLoadingAuth && !currentUser) {
    // Still show loading if auth is in progress, but if it finishes and no user, we continue anyway
    return (
      <div className="min-h-screen bg-iec-accent flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-iec-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Removed the !isAuthenticated check to bypass login screen

  const hasPermission = (section: keyof typeof user.permissions, level: 'view' | 'edit' = 'view') => {
    const userPerm = user.permissions[section];
    if (level === 'edit') return userPerm === 'edit';
    return userPerm === 'view' || userPerm === 'edit';
  };

  const menuItems = [
    { id: 'dashboard', name: 'Tổng quan', icon: <LayoutDashboard size={20} />, show: true },
    { id: 'homepage', name: 'Trang chủ', icon: <Globe size={20} />, show: hasPermission('homepage') },
    { id: 'hub', name: 'Trạm thông tin', icon: <FileText size={20} />, show: hasPermission('hub') },
    { id: 'events', name: 'Workshop & Event', icon: <Calendar size={20} />, show: hasPermission('hub') },
    { id: 'docs', name: 'Tài liệu', icon: <FileDown size={20} />, show: hasPermission('hub') },
    { id: 'media', name: 'Thư viện Media', icon: <ImageIcon size={20} />, show: hasPermission('hub') },
    { id: 'partners', name: 'Đối tác', icon: <Handshake size={20} />, show: hasPermission('partners') },
    { id: 'forms', name: 'Đăng ký', icon: <Mail size={20} />, show: hasPermission('partners') },
    { id: 'users', name: 'Người dùng', icon: <Users size={20} />, show: hasPermission('users') },
    { id: 'settings', name: 'Cài đặt', icon: <Settings size={20} />, show: hasPermission('settings') },
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-iec-accent text-white transition-all duration-300 flex flex-col sticky top-0 h-screen z-50`}>
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 bg-iec-primary rounded-lg flex items-center justify-center font-black text-xl">I</div>
          {isSidebarOpen && <span className="font-bold tracking-tight text-lg">IEC Admin</span>}
        </div>

        <nav className="flex-grow py-6 px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-iec-primary text-white shadow-lg shadow-iec-primary/20' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {isSidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
              {isSidebarOpen && activeTab === item.id && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium text-sm">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-iec-accent">
              {menuItems.find(item => item.id === activeTab)?.name}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-iec-primary/20 transition-all outline-none w-64"
              />
            </div>
            <button className="relative text-gray-400 hover:text-iec-accent transition-colors">
              <Bell size={22} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
              <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                {!currentUser && (
                  <div className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full animate-pulse">
                    BYPASS MODE
                  </div>
                )}
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-iec-accent">{user?.username}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user?.role}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-iec-primary/10 flex items-center justify-center text-iec-primary font-bold">
                  {user?.username.substring(0, 2).toUpperCase()}
                </div>
              </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {!currentUser && (
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4 text-amber-800 shadow-sm">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <InfoIcon size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">Chế độ Bypass (Phát triển)</p>
                <p className="text-xs opacity-80">Bạn đang truy cập không cần đăng nhập. Lưu ý: Dữ liệu có thể không lưu được vào Cloud nếu bạn chưa đăng nhập Google thực tế.</p>
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <DashboardOverview />}
              {activeTab === 'homepage' && <HomepageManager />}
              {activeTab === 'hub' && <HubManager type="post" />}
              {activeTab === 'events' && <HubManager type="event" />}
              {activeTab === 'docs' && <HubManager type="doc" />}
              {activeTab === 'media' && <HubManager type="media" />}
              {activeTab === 'partners' && <PartnerManager />}
              {activeTab === 'forms' && <FormManager />}
              {activeTab === 'users' && <UserManager />}
              {activeTab === 'settings' && <SettingsEditor />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// --- Sub-components ---

const MediaSelector = ({ onSelect, onClose, multiSelect = false }: { onSelect: (url: string | string[]) => void, onClose: () => void, multiSelect?: boolean }) => {
  const { data, updateData } = useSiteData();
  const [isUploading, setIsUploading] = useState(false);
  const [activeType, setActiveType] = useState<'image' | 'video' | 'file'>('image');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  const filteredItems = useMemo(() => {
    return data.media.filter(item => {
      const matchesType = item.type === activeType;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [data.media, activeType, searchQuery]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
      const newMedia: MediaItem = {
        id: 'm-' + Date.now(),
        url: reader.result as string,
        name: file.name,
        type: type as any,
        date: new Date().toLocaleDateString('vi-VN')
      };
      updateData({ media: [...data.media, newMedia] });
      if (multiSelect) {
        setSelectedUrls(prev => [...prev, newMedia.url]);
      } else {
        onSelect(newMedia.url);
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const toggleSelect = (url: string) => {
    if (multiSelect) {
      setSelectedUrls(prev => 
        prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
      );
    } else {
      onSelect(url);
    }
  };

  const handleConfirm = () => {
    if (multiSelect) {
      onSelect(selectedUrls);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-5xl rounded-[2.5rem] p-8 relative z-10 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-iec-accent">Thư viện Media</h3>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveType('image')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeType === 'image' ? 'bg-white text-iec-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Hình ảnh
              </button>
              <button 
                onClick={() => setActiveType('video')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeType === 'video' ? 'bg-white text-iec-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Video
              </button>
              <button 
                onClick={() => setActiveType('file')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeType === 'file' ? 'bg-white text-iec-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Tài liệu
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {multiSelect && selectedUrls.length > 0 && (
              <button 
                onClick={handleConfirm}
                className="bg-iec-primary text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-iec-primary/20"
              >
                Chọn {selectedUrls.length} mục
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X size={20} /></button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={`Tìm kiếm ${activeType === 'image' ? 'hình ảnh' : activeType === 'video' ? 'video' : 'tài liệu'}...`} 
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <label className="bg-iec-primary text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer">
            <Plus size={18} /> {isUploading ? 'Đang tải...' : 'Tải lên mới'}
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        </div>

        <div className="flex-grow overflow-y-auto pr-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => toggleSelect(item.url)}
                className={`aspect-square rounded-2xl bg-gray-50 border-2 overflow-hidden relative group cursor-pointer transition-all ${selectedUrls.includes(item.url) ? 'border-iec-primary ring-2 ring-iec-primary/20' : 'border-gray-100 hover:border-iec-primary'}`}
              >
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                ) : item.type === 'video' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-4">
                    <Play size={32} className="mb-2 opacity-50" />
                    <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Video</span>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-4">
                    <FileText size={32} className="mb-2 opacity-50" />
                    <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Document</span>
                  </div>
                )}
                
                {selectedUrls.includes(item.url) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-iec-primary text-white rounded-full flex items-center justify-center shadow-lg">
                    <Plus size={14} className="rotate-45" />
                  </div>
                )}

                <div className="absolute inset-0 bg-iec-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-iec-primary px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-lg uppercase">
                    {selectedUrls.includes(item.url) ? 'Bỏ chọn' : 'Chọn'}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-[10px] text-white font-medium truncate">{item.name}</p>
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-400 font-medium">Không tìm thấy media nào phù hợp</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const HomepageManager = () => {
  const { data, updateData } = useSiteData();
  const [sections, setSections] = useState(data.homepage.sections);
  const [activeSection, setActiveSection] = useState('hero');
  const [heroData, setHeroData] = useState(data.homepage.hero);
  const [aboutData, setAboutData] = useState(data.homepage.about);
  const [impactData, setImpactData] = useState(data.homepage.impact);
  const [valuesData, setValuesData] = useState(data.homepage.values);
  const [activitiesData, setActivitiesData] = useState(data.homepage.activities);
  const [teamData, setTeamData] = useState(data.homepage.team);
  const [joinData, setJoinData] = useState(data.homepage.join);
  const [ecosystemData, setEcosystemData] = useState(data.homepage.ecosystem);
  const [partnersSectionData, setPartnersSectionData] = useState(data.homepage.partners);
  const [footerData, setFooterData] = useState(data.settings);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    
    const updatedSections = newSections.map((s, i) => ({ ...s, order: i }));
    setSections(updatedSections);
    updateData({ homepage: { ...data.homepage, sections: updatedSections } });
  };

  const restoreDefaultSections = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục cấu trúc trang chủ mặc định?')) {
      setSections(initialData.homepage.sections);
      updateData({ homepage: { ...data.homepage, sections: initialData.homepage.sections } });
    }
  };

  const handleSave = () => {
    if (activeSection === 'hero') {
      updateData({ homepage: { ...data.homepage, hero: heroData } });
      alert('Đã lưu Hero Section thành công!');
    } else if (activeSection === 'about') {
      updateData({ homepage: { ...data.homepage, about: aboutData } });
      alert('Đã lưu About Section thành công!');
    } else if (activeSection === 'impact') {
      updateData({ homepage: { ...data.homepage, impact: impactData } });
      alert('Đã lưu Impact Section thành công!');
    } else if (activeSection === 'values') {
      updateData({ homepage: { ...data.homepage, values: valuesData } });
      alert('Đã lưu Giá trị cốt lõi thành công!');
    } else if (activeSection === 'activities') {
      updateData({ homepage: { ...data.homepage, activities: activitiesData } });
      alert('Đã lưu Hoạt động thành công!');
    } else if (activeSection === 'team') {
      updateData({ homepage: { ...data.homepage, team: teamData } });
      alert('Đã lưu Đội ngũ thành công!');
    } else if (activeSection === 'ecosystem') {
      updateData({ homepage: { ...data.homepage, ecosystem: ecosystemData } });
      alert('Đã lưu Hệ sinh thái thành công!');
    } else if (activeSection === 'join') {
      updateData({ homepage: { ...data.homepage, join: joinData } });
      alert('Đã lưu Gia nhập thành công!');
    } else if (activeSection === 'partners') {
      updateData({ homepage: { ...data.homepage, partners: partnersSectionData } });
      alert('Đã lưu Cài đặt Đối tác thành công!');
    } else if (activeSection === 'footer') {
      updateData({ settings: footerData });
      alert('Đã lưu Footer & Settings thành công!');
    }
  };

  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<string | null>(null);

  const openMediaSelector = (target: string, index?: number) => {
    setMediaTarget(index !== undefined ? `${target}-${index}` : target);
    setIsMediaSelectorOpen(true);
  };

  const handleMediaSelect = (url: string | string[]) => {
    const singleUrl = Array.isArray(url) ? url[0] : url;
    if (mediaTarget === 'hero') {
      setHeroData({ ...heroData, image: singleUrl });
    } else if (mediaTarget === 'about') {
      setAboutData({ ...aboutData, image: singleUrl });
    } else if (mediaTarget?.startsWith('activity-')) {
      const index = parseInt(mediaTarget.split('-')[1]);
      const newItems = [...activitiesData.items];
      newItems[index].image = singleUrl;
      setActivitiesData({ ...activitiesData, items: newItems });
    } else if (mediaTarget?.startsWith('team-')) {
      const index = parseInt(mediaTarget.split('-')[1]);
      const newMembers = [...teamData.members];
      newMembers[index].img = singleUrl;
      setTeamData({ ...teamData, members: newMembers });
    }
    setIsMediaSelectorOpen(false);
  };

  const addValue = () => {
    const newItems = [...valuesData.items, { title: { vi: 'Giá trị mới', en: 'New Value' }, desc: { vi: '', en: '' } }];
    setValuesData({ ...valuesData, items: newItems });
  };
  const deleteValue = (index: number) => {
    const newItems = valuesData.items.filter((_, i) => i !== index);
    setValuesData({ ...valuesData, items: newItems });
  };

  const addStat = () => {
    const newStats = [...impactData.stats, { value: '0', label: { vi: 'Nhãn mới', en: 'New Label' } }];
    setImpactData({ ...impactData, stats: newStats });
  };
  const deleteStat = (index: number) => {
    const newStats = impactData.stats.filter((_, i) => i !== index);
    setImpactData({ ...impactData, stats: newStats });
  };

  const addActivity = () => {
    const newItems = [...activitiesData.items, { id: Date.now(), image: 'https://picsum.photos/seed/activity/800/600', title: { vi: 'Hoạt động mới', en: 'New Activity' } }];
    setActivitiesData({ ...activitiesData, items: newItems });
  };
  const deleteActivity = (index: number) => {
    const newItems = activitiesData.items.filter((_, i) => i !== index);
    setActivitiesData({ ...activitiesData, items: newItems });
  };

  const addMember = () => {
    const newMembers = [...teamData.members, { name: 'Thành viên mới', role: { vi: 'Chức vụ', en: 'Role' }, img: 'https://picsum.photos/seed/member/400/400', linkedin: '' }];
    setTeamData({ ...teamData, members: newMembers });
  };
  const deleteMember = (index: number) => {
    const newMembers = teamData.members.filter((_, i) => i !== index);
    setTeamData({ ...teamData, members: newMembers });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Section List & Reordering */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-iec-accent">Cấu trúc trang chủ</h3>
            <button 
              onClick={restoreDefaultSections}
              className="p-2 text-gray-400 hover:text-iec-primary transition-colors"
              title="Khôi phục mặc định"
            >
              <RefreshCcw size={16} />
            </button>
          </div>
          <div className="space-y-2">
            {sections.sort((a, b) => a.order - b.order).map((section, index) => (
              <div 
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border ${
                  activeSection === section.id 
                  ? 'bg-iec-primary/5 border-iec-primary/20 text-iec-primary' 
                  : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                }`}
              >
                <div className="cursor-grab active:cursor-grabbing text-gray-300">
                  <GripVertical size={16} />
                </div>
                <Layout size={18} />
                <span className="font-bold text-sm flex-grow">{section.name}</span>
                <div className="flex flex-col gap-1">
                  <button onClick={(e) => { e.stopPropagation(); moveSection(index, 'up'); }} className="p-0.5 hover:text-iec-primary disabled:opacity-20" disabled={index === 0}><ChevronUp size={14} /></button>
                  <button onClick={(e) => { e.stopPropagation(); moveSection(index, 'down'); }} className="p-0.5 hover:text-iec-primary disabled:opacity-20" disabled={index === sections.length - 1}><ChevronDown size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="lg:col-span-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[600px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-iec-accent">Chỉnh sửa: {sections.find(s => s.id === activeSection)?.name}</h3>
              <p className="text-sm text-gray-400">Cập nhật nội dung và hình ảnh cho phần này</p>
            </div>
            <button 
              onClick={handleSave}
              className="bg-iec-primary text-white px-6 py-3 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-iec-primary/20 transition-all flex items-center gap-2"
            >
              <Save size={18} /> Lưu thay đổi
            </button>
          </div>

          {activeSection === 'hero' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2"><span className="w-6 h-4 bg-red-600 rounded-sm"></span><span className="text-xs font-bold uppercase tracking-widest text-iec-accent">Tiếng Việt</span></div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Badge</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={heroData.badge.vi} onChange={(e) => setHeroData({...heroData, badge: {...heroData.badge, vi: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Title (Dòng 1, 2, 3, 4)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={heroData.title1.vi} onChange={(e) => setHeroData({...heroData, title1: {...heroData.title1, vi: e.target.value}})} />
                      <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={heroData.title2.vi} onChange={(e) => setHeroData({...heroData, title2: {...heroData.title2, vi: e.target.value}})} />
                      <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={heroData.title3.vi} onChange={(e) => setHeroData({...heroData, title3: {...heroData.title3, vi: e.target.value}})} />
                      <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={heroData.title4.vi} onChange={(e) => setHeroData({...heroData, title4: {...heroData.title4, vi: e.target.value}})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mô tả</label>
                    <textarea className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20 h-24 resize-none" value={heroData.subtitle.vi} onChange={(e) => setHeroData({...heroData, subtitle: {...heroData.subtitle, vi: e.target.value}})} />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2"><span className="w-6 h-4 bg-blue-600 rounded-sm"></span><span className="text-xs font-bold uppercase tracking-widest text-iec-accent">English</span></div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Badge</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={heroData.badge.en} onChange={(e) => setHeroData({...heroData, badge: {...heroData.badge, en: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Title (Line 1, 2, 3, 4)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={heroData.title1.en} onChange={(e) => setHeroData({...heroData, title1: {...heroData.title1, en: e.target.value}})} />
                      <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={heroData.title2.en} onChange={(e) => setHeroData({...heroData, title2: {...heroData.title2, en: e.target.value}})} />
                      <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={heroData.title3.en} onChange={(e) => setHeroData({...heroData, title3: {...heroData.title3, en: e.target.value}})} />
                      <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={heroData.title4.en} onChange={(e) => setHeroData({...heroData, title4: {...heroData.title4, en: e.target.value}})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subtitle</label>
                    <textarea className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20 h-24 resize-none" value={heroData.subtitle.en} onChange={(e) => setHeroData({...heroData, subtitle: {...heroData.subtitle, en: e.target.value}})} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hình ảnh nền</label>
                <div className="relative aspect-video rounded-3xl overflow-hidden group border-2 border-dashed border-gray-200">
                  <img src={heroData.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => openMediaSelector('hero')} className="bg-white text-iec-accent px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                      <ImageIcon size={18} /> Chọn từ thư viện
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'about' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tiêu đề (VI)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={aboutData.title.vi} onChange={(e) => setAboutData({...aboutData, title: {...aboutData.title, vi: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mô tả (VI)</label>
                    <textarea className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20 h-40 resize-none" value={aboutData.description.vi} onChange={(e) => setAboutData({...aboutData, description: {...aboutData.description, vi: e.target.value}})} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Title (EN)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={aboutData.title.en} onChange={(e) => setAboutData({...aboutData, title: {...aboutData.title, en: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description (EN)</label>
                    <textarea className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20 h-40 resize-none" value={aboutData.description.en} onChange={(e) => setAboutData({...aboutData, description: {...aboutData.description, en: e.target.value}})} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hình ảnh minh họa</label>
                <div className="relative aspect-video rounded-3xl overflow-hidden group border-2 border-dashed border-gray-200">
                  <img src={aboutData.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => openMediaSelector('about')} className="bg-white text-iec-accent px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                      <ImageIcon size={18} /> Chọn từ thư viện
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'values' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tiêu đề (VI)</label>
                  <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={valuesData.title.vi} onChange={(e) => setValuesData({...valuesData, title: {...valuesData.title, vi: e.target.value}})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Title (EN)</label>
                  <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={valuesData.title.en} onChange={(e) => setValuesData({...valuesData, title: {...valuesData.title, en: e.target.value}})} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Danh sách giá trị</label>
                  <button onClick={addValue} className="text-iec-primary text-xs font-bold flex items-center gap-1 hover:underline">
                    <Plus size={14} /> Thêm giá trị
                  </button>
                </div>
                {valuesData.items.map((item, index) => (
                  <div key={index} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 relative group">
                    <button 
                      onClick={() => deleteValue(index)}
                      className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Tiêu đề (VI)</label>
                        <input type="text" className="w-full p-3 bg-white rounded-xl outline-none border border-gray-100" value={item.title.vi} onChange={(e) => {
                          const newItems = [...valuesData.items];
                          newItems[index] = {...item, title: {...item.title, vi: e.target.value}};
                          setValuesData({...valuesData, items: newItems});
                        }} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Title (EN)</label>
                        <input type="text" className="w-full p-3 bg-white rounded-xl outline-none border border-gray-100" value={item.title.en} onChange={(e) => {
                          const newItems = [...valuesData.items];
                          newItems[index] = {...item, title: {...item.title, en: e.target.value}};
                          setValuesData({...valuesData, items: newItems});
                        }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Mô tả (VI)</label>
                        <textarea className="w-full p-3 bg-white rounded-xl outline-none border border-gray-100 h-20 resize-none" value={item.desc.vi} onChange={(e) => {
                          const newItems = [...valuesData.items];
                          newItems[index] = {...item, desc: {...item.desc, vi: e.target.value}};
                          setValuesData({...valuesData, items: newItems});
                        }} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Description (EN)</label>
                        <textarea className="w-full p-3 bg-white rounded-xl outline-none border border-gray-100 h-20 resize-none" value={item.desc.en} onChange={(e) => {
                          const newItems = [...valuesData.items];
                          newItems[index] = {...item, desc: {...item.desc, en: e.target.value}};
                          setValuesData({...valuesData, items: newItems});
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'impact' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Badge (VI)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={impactData.badge.vi} onChange={(e) => setImpactData({...impactData, badge: {...impactData.badge, vi: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tiêu đề (VI)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={impactData.title.vi} onChange={(e) => setImpactData({...impactData, title: {...impactData.title, vi: e.target.value}})} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Badge (EN)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={impactData.badge.en} onChange={(e) => setImpactData({...impactData, badge: {...impactData.badge, en: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Title (EN)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={impactData.title.en} onChange={(e) => setImpactData({...impactData, title: {...impactData.title, en: e.target.value}})} />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Thống kê (Stats)</label>
                  <button onClick={addStat} className="text-iec-primary text-xs font-bold flex items-center gap-1 hover:underline">
                    <Plus size={14} /> Thêm thống kê
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {impactData.stats.map((stat, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 relative group">
                      <button 
                        onClick={() => deleteStat(index)}
                        className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Giá trị</label>
                        <input type="text" className="w-full p-2 bg-white rounded-lg outline-none border border-gray-100 text-sm font-bold" value={stat.value} onChange={(e) => {
                          const newStats = [...impactData.stats];
                          newStats[index] = {...stat, value: e.target.value};
                          setImpactData({...impactData, stats: newStats});
                        }} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Nhãn (VI)</label>
                        <input type="text" className="w-full p-2 bg-white rounded-lg outline-none border border-gray-100 text-xs" value={stat.label.vi} onChange={(e) => {
                          const newStats = [...impactData.stats];
                          newStats[index] = {...stat, label: {...stat.label, vi: e.target.value}};
                          setImpactData({...impactData, stats: newStats});
                        }} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Label (EN)</label>
                        <input type="text" className="w-full p-2 bg-white rounded-lg outline-none border border-gray-100 text-xs" value={stat.label.en} onChange={(e) => {
                          const newStats = [...impactData.stats];
                          newStats[index] = {...stat, label: {...stat.label, en: e.target.value}};
                          setImpactData({...impactData, stats: newStats});
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'activities' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Badge (VI)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={activitiesData.badge.vi} onChange={(e) => setActivitiesData({...activitiesData, badge: {...activitiesData.badge, vi: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tiêu đề (VI)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={activitiesData.title.vi} onChange={(e) => setActivitiesData({...activitiesData, title: {...activitiesData.title, vi: e.target.value}})} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Badge (EN)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={activitiesData.badge.en} onChange={(e) => setActivitiesData({...activitiesData, badge: {...activitiesData.badge, en: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Title (EN)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={activitiesData.title.en} onChange={(e) => setActivitiesData({...activitiesData, title: {...activitiesData.title, en: e.target.value}})} />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Danh sách hoạt động</label>
                  <button onClick={addActivity} className="text-iec-primary text-xs font-bold flex items-center gap-1 hover:underline">
                    <Plus size={14} /> Thêm hoạt động
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activitiesData.items.map((item, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 relative group">
                      <button 
                        onClick={() => deleteActivity(index)}
                        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="relative aspect-video rounded-xl overflow-hidden group">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={() => openMediaSelector('activity', index)} className="bg-white text-iec-accent p-2 rounded-lg font-bold text-xs">
                            Đổi ảnh
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Tiêu đề (VI)</label>
                        <input type="text" className="w-full p-2 bg-white rounded-lg outline-none border border-gray-100 text-sm" value={item.title.vi} onChange={(e) => {
                          const newItems = [...activitiesData.items];
                          newItems[index] = {...item, title: {...item.title, vi: e.target.value}};
                          setActivitiesData({...activitiesData, items: newItems});
                        }} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Title (EN)</label>
                        <input type="text" className="w-full p-2 bg-white rounded-lg outline-none border border-gray-100 text-sm" value={item.title.en} onChange={(e) => {
                          const newItems = [...activitiesData.items];
                          newItems[index] = {...item, title: {...item.title, en: e.target.value}};
                          setActivitiesData({...activitiesData, items: newItems});
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'team' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tiêu đề (VI)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={teamData.title.vi} onChange={(e) => setTeamData({...teamData, title: {...teamData.title, vi: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mô tả (VI)</label>
                    <textarea className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20 h-24 resize-none" value={teamData.subtitle.vi} onChange={(e) => setTeamData({...teamData, subtitle: {...teamData.subtitle, vi: e.target.value}})} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Title (EN)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={teamData.title.en} onChange={(e) => setTeamData({...teamData, title: {...teamData.title, en: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subtitle (EN)</label>
                    <textarea className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20 h-24 resize-none" value={teamData.subtitle.en} onChange={(e) => setTeamData({...teamData, subtitle: {...teamData.subtitle, en: e.target.value}})} />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Thành viên nòng cốt</label>
                  <button onClick={addMember} className="text-iec-primary text-xs font-bold flex items-center gap-1 hover:underline">
                    <Plus size={14} /> Thêm thành viên
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teamData.members.map((member, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 relative group">
                      <button 
                        onClick={() => deleteMember(index)}
                        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden group">
                          <img src={member.img} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => openMediaSelector('team', index)} className="text-white p-1">
                              <ImageIcon size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="flex-grow space-y-2">
                          <input type="text" className="w-full p-2 bg-white rounded-lg outline-none border border-gray-100 text-sm font-bold" value={member.name} onChange={(e) => {
                            const newMembers = [...teamData.members];
                            newMembers[index] = {...member, name: e.target.value};
                            setTeamData({...teamData, members: newMembers});
                          }} />
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" className="w-full p-2 bg-white rounded-lg outline-none border border-gray-100 text-[10px]" value={member.role.vi} onChange={(e) => {
                              const newMembers = [...teamData.members];
                              newMembers[index] = {...member, role: {...member.role, vi: e.target.value}};
                              setTeamData({...teamData, members: newMembers});
                            }} placeholder="Vai trò (VI)" />
                            <input type="text" className="w-full p-2 bg-white rounded-lg outline-none border border-gray-100 text-[10px]" value={member.role.en} onChange={(e) => {
                              const newMembers = [...teamData.members];
                              newMembers[index] = {...member, role: {...member.role, en: e.target.value}};
                              setTeamData({...teamData, members: newMembers});
                            }} placeholder="Role (EN)" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">LinkedIn URL</label>
                        <input type="text" className="w-full p-2 bg-white rounded-lg outline-none border border-gray-100 text-[10px]" value={member.linkedin} onChange={(e) => {
                          const newMembers = [...teamData.members];
                          newMembers[index] = {...member, linkedin: e.target.value};
                          setTeamData({...teamData, members: newMembers});
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'join' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Badge (VI)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={joinData.badge.vi} onChange={(e) => setJoinData({...joinData, badge: {...joinData.badge, vi: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tiêu đề Dòng 1 (VI)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={joinData.title1.vi} onChange={(e) => setJoinData({...joinData, title1: {...joinData.title1, vi: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tiêu đề Dòng 2 (VI)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={joinData.title2.vi} onChange={(e) => setJoinData({...joinData, title2: {...joinData.title2, vi: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mô tả (VI)</label>
                    <textarea className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20 h-24 resize-none" value={joinData.subtitle.vi} onChange={(e) => setJoinData({...joinData, subtitle: {...joinData.subtitle, vi: e.target.value}})} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Badge (EN)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={joinData.badge.en} onChange={(e) => setJoinData({...joinData, badge: {...joinData.badge, en: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Title Line 1 (EN)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={joinData.title1.en} onChange={(e) => setJoinData({...joinData, title1: {...joinData.title1, en: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Title Line 2 (EN)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={joinData.title2.en} onChange={(e) => setJoinData({...joinData, title2: {...joinData.title2, en: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subtitle (EN)</label>
                    <textarea className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20 h-24 resize-none" value={joinData.subtitle.en} onChange={(e) => setJoinData({...joinData, subtitle: {...joinData.subtitle, en: e.target.value}})} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'ecosystem' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Badge (VI)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={ecosystemData.badge.vi} onChange={(e) => setEcosystemData({...ecosystemData, badge: {...ecosystemData.badge, vi: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tiêu đề (VI)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={ecosystemData.title.vi} onChange={(e) => setEcosystemData({...ecosystemData, title: {...ecosystemData.title, vi: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mô tả (VI)</label>
                    <textarea className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20 h-24 resize-none" value={ecosystemData.subtitle.vi} onChange={(e) => setEcosystemData({...ecosystemData, subtitle: {...ecosystemData.subtitle, vi: e.target.value}})} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Badge (EN)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={ecosystemData.badge.en} onChange={(e) => setEcosystemData({...ecosystemData, badge: {...ecosystemData.badge, en: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Title (EN)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={ecosystemData.title.en} onChange={(e) => setEcosystemData({...ecosystemData, title: {...ecosystemData.title, en: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subtitle (EN)</label>
                    <textarea className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20 h-24 resize-none" value={ecosystemData.subtitle.en} onChange={(e) => setEcosystemData({...ecosystemData, subtitle: {...ecosystemData.subtitle, en: e.target.value}})} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'partners' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Badge (VI)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={partnersSectionData.badge.vi} onChange={(e) => setPartnersSectionData({...partnersSectionData, badge: {...partnersSectionData.badge, vi: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tiêu đề (VI)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={partnersSectionData.title.vi} onChange={(e) => setPartnersSectionData({...partnersSectionData, title: {...partnersSectionData.title, vi: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mô tả (VI)</label>
                    <textarea className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20 h-24 resize-none" value={partnersSectionData.subtitle.vi} onChange={(e) => setPartnersSectionData({...partnersSectionData, subtitle: {...partnersSectionData.subtitle, vi: e.target.value}})} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Badge (EN)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={partnersSectionData.badge.en} onChange={(e) => setPartnersSectionData({...partnersSectionData, badge: {...partnersSectionData.badge, en: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Title (EN)</label>
                    <input type="text" className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={partnersSectionData.title.en} onChange={(e) => setPartnersSectionData({...partnersSectionData, title: {...partnersSectionData.title, en: e.target.value}})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subtitle (EN)</label>
                    <textarea className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20 h-24 resize-none" value={partnersSectionData.subtitle.en} onChange={(e) => setPartnersSectionData({...partnersSectionData, subtitle: {...partnersSectionData.subtitle, en: e.target.value}})} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {!['hero', 'about', 'values', 'impact', 'activities', 'team', 'join', 'ecosystem', 'partners'].includes(activeSection) && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
              <Settings size={48} className="animate-spin-slow" />
              <p className="font-medium">Form chỉnh sửa cho "{sections.find(s => s.id === activeSection)?.name}" đang được cập nhật...</p>
            </div>
          )}
        </div>
      </div>

      {isMediaSelectorOpen && (
        <MediaSelector 
          onSelect={handleMediaSelect}
          onClose={() => setIsMediaSelectorOpen(false)}
        />
      )}
    </div>
  );
};

const DashboardOverview = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Bài viết', value: '24', change: '+3 tuần này', color: 'bg-blue-500' },
        { label: 'Lượt xem', value: '1,284', change: '+12%', color: 'bg-purple-500' },
        { label: 'Đăng ký mới', value: '12', change: '+2 hôm nay', color: 'bg-green-500' },
        { label: 'Media', value: '156', change: '840 MB', color: 'bg-orange-500' },
      ].map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-iec-accent">{stat.value}</h3>
            <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">{stat.change}</span>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-iec-accent mb-6">Bài viết mới nhất</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden">
                <img src={`https://picsum.photos/seed/${i}/100/100`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow">
                <p className="text-sm font-bold text-iec-accent">Chính sách hỗ trợ Startup 2026</p>
                <p className="text-xs text-gray-400">Đăng bởi Admin • 2 giờ trước</p>
              </div>
              <button className="p-2 text-gray-400 hover:text-iec-primary transition-colors"><Edit2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-iec-accent mb-6">Đăng ký mới nhất</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors">
              <div className="w-10 h-10 rounded-full bg-iec-primary/10 flex items-center justify-center text-iec-primary font-bold text-xs">
                JD
              </div>
              <div className="flex-grow">
                <p className="text-sm font-bold text-iec-accent">John Doe</p>
                <p className="text-xs text-gray-400">john@example.com • Đối tác</p>
              </div>
              <span className="text-[10px] font-bold text-iec-primary bg-iec-primary/5 px-3 py-1 rounded-full">Chờ duyệt</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const HubManager = ({ type = 'post' }: { type?: 'post' | 'event' | 'doc' | 'media' }) => {
  const { data, updateData } = useSiteData();
  const [activeTab, setActiveTab] = useState('list');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const items = useMemo(() => {
    // Filter posts by the type of their category
    return data.posts.filter(post => {
      const category = data.categories.find(c => c.id === post.categoryId);
      return category?.type === type;
    });
  }, [type, data.posts, data.categories]);

  const typeLabel = {
    post: 'bài viết',
    event: 'sự kiện',
    doc: 'tài liệu',
    media: 'media'
  }[type];

  const handleDeleteItem = (id: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${typeLabel} này?`)) {
      const updatedPosts = data.posts.filter(p => p.id !== id);
      updateData({ posts: updatedPosts });
    }
  };

  if (isEditing) {
    return <PostEditor type={type} item={editingItem} onBack={() => { setIsEditing(false); setEditingItem(null); }} />;
  }

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit">
        <button 
          onClick={() => setActiveTab('list')}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-iec-primary text-white shadow-lg shadow-iec-primary/20' : 'text-gray-400 hover:text-iec-accent'}`}
        >
          Quản lý {typeLabel}
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-iec-primary text-white shadow-lg shadow-iec-primary/20' : 'text-gray-400 hover:text-iec-accent'}`}
        >
          Quản lý danh mục
        </button>
      </div>

      {activeTab === 'list' ? (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-iec-accent text-capitalize">Danh sách {typeLabel}</h3>
              <p className="text-sm text-gray-400">Biên soạn và quản lý nội dung {typeLabel}</p>
            </div>
            <button 
              onClick={() => {
                setEditingItem(null);
                setIsEditing(true);
              }}
              className="bg-iec-primary text-white px-6 py-3 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-iec-primary/20 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Thêm {typeLabel}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Tiêu đề</th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Danh mục</th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Ngày đăng</th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.length > 0 ? items.map(item => (
                  <tr key={item.id} className="group">
                    <td className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 rounded-lg bg-gray-100 overflow-hidden">
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-iec-accent">{item.title.vi}</p>
                          <p className="text-xs text-gray-400">{item.author} • {item.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6">
                      <span className="text-xs font-bold text-iec-primary bg-iec-primary/5 px-3 py-1 rounded-full">
                        {data.categories.find(c => c.id === item.categoryId)?.name.vi || 'N/A'}
                      </span>
                    </td>
                    <td className="py-6 text-sm text-gray-500">{item.date}</td>
                    <td className="py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditingItem(item);
                            setIsEditing(true);
                          }}
                          className="p-2 text-gray-400 hover:text-iec-primary hover:bg-iec-primary/5 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-gray-400">Chưa có {typeLabel} nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <CategoryTab type={type} />
      )}
    </div>
  );
};

const CategoryTab = ({ type }: { type: string }) => {
  const { data, updateData } = useSiteData();
  const categories = useMemo(() => data.categories.filter(c => c.type === type), [data.categories, type]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState({ name: { vi: '', en: '' }, slug: '' });

  const [editingCat, setEditingCat] = useState<any>(null);

  const handleAdd = () => {
    if (!newCat.name.vi || !newCat.slug) return;
    const cat = {
      id: type + '-' + Date.now(),
      type,
      ...newCat
    };
    updateData({ categories: [...data.categories, cat] });
    setIsAdding(false);
    setNewCat({ name: { vi: '', en: '' }, slug: '' });
  };

  const handleEdit = (cat: any) => {
    setEditingCat(cat);
    setIsAdding(true);
    setNewCat({ name: cat.name, slug: cat.slug });
  };

  const handleUpdate = () => {
    if (!newCat.name.vi || !newCat.slug || !editingCat) return;
    const updatedCategories = data.categories.map(c => 
      c.id === editingCat.id ? { ...c, name: newCat.name, slug: newCat.slug } : c
    );
    updateData({ categories: updatedCategories });
    setIsAdding(false);
    setEditingCat(null);
    setNewCat({ name: { vi: '', en: '' }, slug: '' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Xóa danh mục này?')) {
      updateData({ categories: data.categories.filter(c => c.id !== id) });
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-iec-accent text-capitalize">Cấu trúc danh mục {type}</h3>
          <p className="text-sm text-gray-400">Quản lý danh mục cha, con và thứ tự hiển thị</p>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="bg-iec-primary text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
            <Plus size={18} /> Thêm danh mục mới
          </button>
        )}
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-6 bg-gray-50 rounded-3xl border border-iec-primary/20 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tên (VI)</label>
              <input type="text" value={newCat.name.vi} onChange={(e) => setNewCat({...newCat, name: {...newCat.name, vi: e.target.value}, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tên (EN)</label>
              <input type="text" value={newCat.name.en} onChange={(e) => setNewCat({...newCat, name: {...newCat.name, en: e.target.value}})} className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Slug</label>
              <input type="text" value={newCat.slug} onChange={(e) => setNewCat({...newCat, slug: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setIsAdding(false); setEditingCat(null); }} className="px-4 py-2 text-sm font-bold text-gray-400">Hủy</button>
            <button onClick={editingCat ? handleUpdate : handleAdd} className="px-6 py-2 bg-iec-primary text-white rounded-xl text-sm font-bold">
              {editingCat ? 'Cập nhật danh mục' : 'Lưu danh mục'}
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {categories.length > 0 ? categories.map((cat) => (
          <div key={cat.id} className="space-y-2">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-iec-primary/10">
              <div className="text-gray-300 cursor-grab"><GripVertical size={16} /></div>
              <div className="flex-grow">
                <p className="font-bold text-iec-accent">{cat.name.vi} <span className="text-gray-300 font-normal mx-2">|</span> <span className="text-gray-400 font-medium">{cat.name.en}</span></p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Slug: {cat.slug}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(cat)}
                  className="p-2 text-gray-400 hover:text-iec-primary hover:bg-iec-primary/5 rounded-lg"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center text-gray-400">Chưa có danh mục nào cho {type}.</div>
        )}
      </div>
    </div>
  );
};

const PostEditor = ({ type, item, onBack }: { type: string, item: any, onBack: () => void }) => {
  const { data, updateData } = useSiteData();
  const [formData, setFormData] = useState({
    id: item?.id || Date.now().toString(),
    title: item?.title || { vi: '', en: '' },
    categoryId: item?.categoryId || '',
    excerpt: item?.excerpt || { vi: '', en: '' },
    content: item?.content || { vi: '', en: '' },
    image: item?.image || 'https://picsum.photos/seed/post/800/600',
    date: item?.date || new Date().toLocaleDateString('vi-VN'),
    author: item?.author || 'Admin',
    featured: item?.featured || false,
    slug: item?.slug || '',
    tags: item?.tags || [],
    seo: item?.seo || {
      title: { vi: '', en: '' },
      description: { vi: '', en: '' },
      keywords: { vi: '', en: '' }
    }
  });

  const [activeTab, setActiveTab] = useState('vi');
  const [activeSubTab, setActiveSubTab] = useState('content');
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [newTag, setNewTag] = useState('');

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleSave = () => {
    const updatedPosts = [...data.posts];
    
    // Auto-generate excerpt if empty
    const finalFormData = { ...formData };
    (['vi', 'en'] as const).forEach(l => {
      if (!finalFormData.excerpt[l] && finalFormData.content[l]) {
        const plainText = stripHtml(finalFormData.content[l]);
        finalFormData.excerpt[l] = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
      }
    });

    const index = updatedPosts.findIndex(p => p.id === finalFormData.id);
    
    if (index >= 0) {
      updatedPosts[index] = finalFormData as any;
    } else {
      updatedPosts.push(finalFormData as any);
    }

    updateData({ posts: updatedPosts });
    alert('Đã lưu thành công!');
    onBack();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-iec-accent">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-xl font-bold text-iec-accent text-capitalize">{item ? 'Chỉnh sửa' : 'Thêm mới'} {type}</h3>
            <p className="text-xs text-gray-400">Biên soạn nội dung đa ngôn ngữ và tối ưu SEO</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSave}
            className="px-6 py-3 bg-iec-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-iec-primary/20 flex items-center gap-2"
          >
            <Save size={18} /> Lưu & Xuất bản
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        <button 
          onClick={() => setActiveTab('vi')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'vi' ? 'bg-red-50 text-red-600' : 'text-gray-400'}`}
        >
          <span className="w-4 h-3 bg-red-600 rounded-sm"></span> Tiếng Việt
        </button>
        <button 
          onClick={() => setActiveTab('en')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'en' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
        >
          <span className="w-4 h-3 bg-blue-600 rounded-sm"></span> English
        </button>
      </div>

      <div className="flex gap-2 mb-8 border-b border-gray-100 pb-4">
        <button 
          onClick={() => setActiveSubTab('content')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeSubTab === 'content' ? 'text-iec-primary bg-iec-primary/5' : 'text-gray-400 hover:text-iec-accent'}`}
        >
          <FileText size={16} /> Nội dung
        </button>
        <button 
          onClick={() => setActiveSubTab('seo')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeSubTab === 'seo' ? 'text-iec-primary bg-iec-primary/5' : 'text-gray-400 hover:text-iec-accent'}`}
        >
          <SearchIcon size={16} /> Tối ưu SEO
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'content' ? (
          <motion.div 
            key="content"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-12"
          >
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tiêu đề ({activeTab.toUpperCase()})</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-iec-primary/20 font-bold text-lg" 
                  value={formData.title[activeTab as Language]}
                  onChange={(e) => setFormData({...formData, title: {...formData.title, [activeTab]: e.target.value}})}
                  placeholder="Nhập tiêu đề..." 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nội dung ({activeTab.toUpperCase()})</label>
                <div className="bg-gray-50 rounded-2xl overflow-hidden border border-transparent focus-within:ring-2 focus-within:ring-iec-primary/20 transition-all">
                  <ReactQuill 
                    theme="snow" 
                    value={formData.content[activeTab as Language]} 
                    onChange={(val) => setFormData({...formData, content: {...formData.content, [activeTab]: val}})}
                    modules={quillModules}
                    className="h-[500px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mô tả ngắn ({activeTab.toUpperCase()})</label>
                <textarea 
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-iec-primary/20 h-24" 
                  value={formData.excerpt[activeTab as Language]}
                  onChange={(e) => setFormData({...formData, excerpt: {...formData.excerpt, [activeTab]: e.target.value}})}
                  placeholder="Nhập mô tả ngắn..." 
                />
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-6 bg-gray-50 rounded-3xl space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Danh mục</label>
                  <select 
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  >
                    <option value="">Chọn danh mục...</option>
                    {data.categories.filter(c => c.type === type).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name.vi}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Star size={16} className={formData.featured ? 'text-yellow-500' : 'text-gray-300'} />
                    <span className="text-sm font-bold text-iec-accent">Nổi bật</span>
                  </div>
                  <button 
                    onClick={() => setFormData({...formData, featured: !formData.featured})}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.featured ? 'bg-iec-primary' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.featured ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Thẻ (Tags)</label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-grow p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20 text-sm" 
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Thêm thẻ mới..." 
                      />
                      <button 
                        onClick={addTag}
                        className="p-3 bg-iec-primary text-white rounded-xl hover:bg-iec-primary/90 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, i) => (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-iec-accent group">
                          <Tag size={12} className="text-iec-primary" />
                          {tag}
                          <button onClick={() => removeTag(tag)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                      {formData.tags.length === 0 && (
                        <p className="text-[10px] text-gray-400 italic">Chưa có thẻ nào</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Slug</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" 
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    placeholder="post-slug-url" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Hình ảnh đại diện</label>
                  <div className="space-y-4">
                    <div className="relative aspect-video bg-white border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden group">
                      <img src={formData.image} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => setIsMediaSelectorOpen(true)}
                          className="bg-white text-iec-accent px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                        >
                          <ImageIcon size={16} /> Chọn từ thư viện
                        </button>
                      </div>
                    </div>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20 text-xs" 
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      placeholder="Hoặc nhập URL hình ảnh..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="seo"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="max-w-4xl space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">SEO Title ({activeTab.toUpperCase()})</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" 
                  value={formData.seo.title[activeTab as Language]}
                  onChange={(e) => setFormData({...formData, seo: {...formData.seo, title: {...formData.seo.title, [activeTab]: e.target.value}}})}
                  placeholder="Nhập tiêu đề SEO..." 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">SEO Keywords ({activeTab.toUpperCase()})</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" 
                  value={formData.seo.keywords[activeTab as Language]}
                  onChange={(e) => setFormData({...formData, seo: {...formData.seo, keywords: {...formData.seo.keywords, [activeTab]: e.target.value}}})}
                  placeholder="startup, đổi mới sáng tạo..." 
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">SEO Meta Description ({activeTab.toUpperCase()})</label>
                <textarea 
                  className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20 h-24" 
                  value={formData.seo.description[activeTab as Language]}
                  onChange={(e) => setFormData({...formData, seo: {...formData.seo, description: {...formData.seo.description, [activeTab]: e.target.value}}})}
                  placeholder="Nhập mô tả SEO..." 
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Canonical URL</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" 
                  value={formData.seo.canonicalUrl}
                  onChange={(e) => setFormData({...formData, seo: {...formData.seo, canonicalUrl: e.target.value}})}
                  placeholder="https://iechub.vn/bai-viet-goc" 
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isMediaSelectorOpen && (
        <MediaSelector 
          onSelect={(url) => {
            const singleUrl = Array.isArray(url) ? url[0] : url;
            setFormData({ ...formData, image: singleUrl });
            setIsMediaSelectorOpen(false);
          }}
          onClose={() => setIsMediaSelectorOpen(false)}
        />
      )}
    </div>
  );
};

const UserManager = () => {
  const { data, updateData } = useSiteData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const userData = {
      id: editingUser?.id || Date.now().toString(),
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as any,
      permissions: {
        homepage: formData.get('perm_homepage') as any,
        hub: formData.get('perm_hub') as any,
        partners: formData.get('perm_partners') as any,
        users: formData.get('perm_users') as any,
        settings: formData.get('perm_settings') as any,
      }
    };

    const updatedUsers = [...data.users];
    const index = updatedUsers.findIndex(u => u.id === userData.id);
    if (index >= 0) updatedUsers[index] = userData;
    else updatedUsers.push(userData);

    updateData({ users: updatedUsers });
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-iec-accent">Quản lý người dùng</h3>
          <p className="text-sm text-gray-400">Phân quyền và quản lý tài khoản truy cập hệ thống</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="bg-iec-primary text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <Plus size={18} /> Thêm người dùng
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Người dùng</th>
              <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Vai trò</th>
              <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Quyền hạn</th>
              <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.users.map(user => (
              <tr key={user.id} className="group">
                <td className="py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-iec-primary/10 flex items-center justify-center text-iec-primary font-bold text-xs">
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-iec-accent">{user.username}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-6">
                  <span className="text-xs font-bold text-iec-accent bg-gray-100 px-3 py-1 rounded-full capitalize">{user.role}</span>
                </td>
                <td className="py-6">
                  <div className="flex gap-1">
                    {Object.entries(user.permissions).map(([key, val]) => (
                      <span key={key} className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${val === 'edit' ? 'bg-green-100 text-green-600' : val === 'view' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        {key[0]}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                      className="p-2 text-gray-400 hover:text-iec-primary hover:bg-iec-primary/5 rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Xóa người dùng này?')) {
                          updateData({ users: data.users.filter(u => u.id !== user.id) });
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 relative z-10 shadow-2xl">
              <h3 className="text-xl font-bold text-iec-accent mb-6">{editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h3>
              <form onSubmit={handleSaveUser} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Username</label>
                    <input name="username" defaultValue={editingUser?.username} required className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vai trò</label>
                    <select name="role" defaultValue={editingUser?.role || 'viewer'} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20">
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</label>
                  <input name="email" type="email" defaultValue={editingUser?.email} required className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" />
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quyền hạn chi tiết</label>
                  <div className="grid grid-cols-1 gap-3">
                    {['homepage', 'hub', 'partners', 'users', 'settings'].map(section => (
                      <div key={section} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-sm font-bold text-iec-accent capitalize">{section}</span>
                        <div className="flex gap-2">
                          {['none', 'view', 'edit'].map(level => (
                            <label key={level} className="flex items-center gap-1 cursor-pointer">
                              <input 
                                type="radio" 
                                name={`perm_${section}`} 
                                value={level} 
                                defaultChecked={(editingUser?.permissions?.[section] || 'none') === level}
                                className="text-iec-primary focus:ring-iec-primary"
                              />
                              <span className="text-[10px] font-bold uppercase text-gray-500">{level}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-grow py-3 bg-gray-100 text-gray-500 font-bold rounded-xl">Hủy</button>
                  <button type="submit" className="flex-grow py-3 bg-iec-primary text-white font-bold rounded-xl shadow-lg shadow-iec-primary/20">Lưu thông tin</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SettingsEditor = () => {
  const { data, updateData } = useSiteData();
  const [settings, setSettings] = useState(data.settings);

  const handleSave = () => {
    updateData({ settings });
    alert('Đã lưu cài đặt hệ thống!');
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-iec-accent">Cài đặt hệ thống</h3>
            <p className="text-sm text-gray-400">Cấu hình thông tin chung và SEO cho website</p>
          </div>
          <button 
            onClick={handleSave}
            className="bg-iec-primary text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2"
          >
            <Save size={18} /> Lưu cài đặt
          </button>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tên website</label>
              <input type="text" className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={settings.siteName} onChange={(e) => setSettings({...settings, siteName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email liên hệ</label>
              <input type="email" className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={settings.contactEmail} onChange={(e) => setSettings({...settings, contactEmail: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Số điện thoại</label>
              <input type="text" className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={settings.contactPhone} onChange={(e) => setSettings({...settings, contactPhone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Địa chỉ</label>
              <input type="text" className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={settings.address} onChange={(e) => setSettings({...settings, address: e.target.value})} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-iec-accent border-b border-gray-100 pb-2">Mạng xã hội</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Facebook URL</label>
                <input type="text" className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={settings.socialLinks.facebook} onChange={(e) => setSettings({...settings, socialLinks: {...settings.socialLinks, facebook: e.target.value}})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">LinkedIn URL</label>
                <input type="text" className="w-full p-4 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" value={settings.socialLinks.linkedin} onChange={(e) => setSettings({...settings, socialLinks: {...settings.socialLinks, linkedin: e.target.value}})} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PartnerManager = () => {
  const { data, updateData } = useSiteData();
  const [activeTab, setActiveTab] = useState('list');
  const [isAdding, setIsAdding] = useState(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: '',
    logo: 'https://picsum.photos/seed/newpartner/200/100',
    description: { vi: '', en: '' },
    link: '',
    featured: false,
    isSpecial: false,
    categoryId: '',
    order: 0
  });

  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const sortedPartners = useMemo(() => {
    return [...data.partners].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [data.partners]);

  const toggleFeatured = (id: string) => {
    const updatedPartners = data.partners.map(p => 
      p.id === id ? { ...p, featured: !p.featured } : p
    );
    updateData({ partners: updatedPartners });
  };

  const toggleSpecial = (id: string) => {
    const specialCount = data.partners.filter(p => p.isSpecial).length;
    const partner = data.partners.find(p => p.id === id);
    
    if (!partner?.isSpecial && specialCount >= 2) {
      alert('Chỉ được phép chọn tối đa 2 đối tác đặc biệt.');
      return;
    }

    const updatedPartners = data.partners.map(p => 
      p.id === id ? { ...p, isSpecial: !p.isSpecial } : p
    );
    updateData({ partners: updatedPartners });
  };

  const movePartner = (id: string, direction: 'up' | 'down') => {
    const items = [...sortedPartners];
    const index = items.findIndex(p => p.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const [movedItem] = items.splice(index, 1);
    items.splice(newIndex, 0, movedItem);

    // Re-assign orders
    const updatedPartners = items.map((p, i) => ({ ...p, order: i }));
    updateData({ partners: updatedPartners });
  };

  const handleUpdatePartner = () => {
    if (!editingPartner) return;
    const updatedPartners = data.partners.map(p => 
      p.id === editingPartner.id ? editingPartner : p
    );
    updateData({ partners: updatedPartners });
    setEditingPartner(null);
  };

  const handleDeletePartner = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đối tác này?')) {
      const updatedPartners = data.partners.filter(p => p.id !== id);
      updateData({ partners: updatedPartners });
    }
  };

  const handleAddPartner = () => {
    if (!newPartner.name || !newPartner.categoryId) return;
    const partner = {
      id: 'p-' + Date.now(),
      ...newPartner,
      order: data.partners.length
    };
    updateData({ partners: [...data.partners, partner] });
    setIsAdding(false);
    setNewPartner({
      name: '',
      logo: 'https://picsum.photos/seed/newpartner/200/100',
      description: { vi: '', en: '' },
      link: '',
      featured: false,
      isSpecial: false,
      categoryId: '',
      order: 0
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit">
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-iec-primary text-white shadow-lg shadow-iec-primary/20' : 'text-gray-400 hover:text-iec-accent'}`}
          >
            Danh sách đối tác
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-iec-primary text-white shadow-lg shadow-iec-primary/20' : 'text-gray-400 hover:text-iec-accent'}`}
          >
            Danh mục đối tác
          </button>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              if (window.confirm('Khôi phục danh sách đối tác mặc định? Thao tác này sẽ xóa các đối tác hiện tại.')) {
                updateData({ partners: initialData.partners });
              }
            }}
            className="bg-white text-gray-400 px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-gray-100 hover:text-iec-accent transition-all"
          >
            <RefreshCcw size={18} /> Khôi phục mặc định
          </button>
          {activeTab === 'list' && !isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-iec-primary text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-iec-primary/20"
            >
              <Plus size={18} /> Thêm đối tác
            </button>
          )}
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="space-y-8">
          {(isAdding || editingPartner) && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-iec-primary/20"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-iec-accent">{isAdding ? 'Thêm Đối tác mới' : 'Chỉnh sửa Đối tác'}</h3>
                <button onClick={() => { setIsAdding(false); setEditingPartner(null); }} className="text-gray-400 hover:text-iec-accent"><X size={24} /></button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Logo Đối tác</label>
                    <div className="aspect-square rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 group relative overflow-hidden">
                      {(isAdding ? newPartner.logo : editingPartner?.logo) ? (
                        <>
                          <img src={isAdding ? newPartner.logo : editingPartner?.logo} alt="Preview" className="w-full h-full object-contain p-8" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => setIsMediaSelectorOpen(true)} className="bg-white text-iec-accent px-4 py-2 rounded-xl text-xs font-bold">Thay đổi</button>
                          </div>
                        </>
                      ) : (
                        <button onClick={() => setIsMediaSelectorOpen(true)} className="flex flex-col items-center gap-2 text-gray-400 hover:text-iec-primary transition-colors">
                          <Image size={32} />
                          <span className="text-xs font-bold">Chọn Logo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tên đối tác</label>
                      <input 
                        type="text" 
                        value={isAdding ? newPartner.name : editingPartner?.name}
                        onChange={(e) => isAdding ? setNewPartner({ ...newPartner, name: e.target.value }) : setEditingPartner({ ...editingPartner!, name: e.target.value })}
                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-iec-primary/20 transition-all font-medium"
                        placeholder="VD: Google Cloud"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Danh mục</label>
                      <select 
                        value={isAdding ? newPartner.categoryId : editingPartner?.categoryId}
                        onChange={(e) => isAdding ? setNewPartner({ ...newPartner, categoryId: e.target.value }) : setEditingPartner({ ...editingPartner!, categoryId: e.target.value })}
                        className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-iec-primary/20 transition-all font-medium appearance-none"
                      >
                        <option value="">Chọn danh mục</option>
                        {data.categories.filter(c => c.type === 'partner').map(c => (
                          <option key={c.id} value={c.id}>{c.name.vi}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Website Link</label>
                    <input 
                      type="text" 
                      value={isAdding ? newPartner.link : editingPartner?.link}
                      onChange={(e) => isAdding ? setNewPartner({ ...newPartner, link: e.target.value }) : setEditingPartner({ ...editingPartner!, link: e.target.value })}
                      className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-iec-primary/20 transition-all font-medium"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mô tả ngắn (VI)</label>
                    <textarea 
                      rows={3}
                      value={isAdding ? newPartner.description.vi : editingPartner?.description.vi}
                      onChange={(e) => isAdding ? setNewPartner({ ...newPartner, description: { ...newPartner.description, vi: e.target.value } }) : setEditingPartner({ ...editingPartner!, description: { ...editingPartner!.description, vi: e.target.value } })}
                      className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-iec-primary/20 transition-all font-medium resize-none"
                      placeholder="Mô tả về đối tác..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                      <input 
                        type="checkbox" 
                        id="featured"
                        checked={isAdding ? newPartner.featured : editingPartner?.featured}
                        onChange={(e) => isAdding ? setNewPartner({ ...newPartner, featured: e.target.checked }) : setEditingPartner({ ...editingPartner!, featured: e.target.checked })}
                        className="w-5 h-5 rounded-lg text-iec-primary focus:ring-iec-primary border-gray-300"
                      />
                      <label htmlFor="featured" className="text-sm font-bold text-yellow-700 cursor-pointer">Đối tác Chiến lược</label>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                      <input 
                        type="checkbox" 
                        id="special"
                        checked={isAdding ? newPartner.isSpecial : editingPartner?.isSpecial}
                        onChange={(e) => {
                          const val = e.target.checked;
                          if (val) {
                            const specialCount = data.partners.filter(p => p.isSpecial).length;
                            if (specialCount >= 2 && (!editingPartner || !editingPartner.isSpecial)) {
                              alert('Chỉ được phép chọn tối đa 2 đối tác đặc biệt.');
                              return;
                            }
                          }
                          isAdding ? setNewPartner({ ...newPartner, isSpecial: val }) : setEditingPartner({ ...editingPartner!, isSpecial: val });
                        }}
                        className="w-5 h-5 rounded-lg text-purple-600 focus:ring-purple-600 border-gray-300"
                      />
                      <label htmlFor="special" className="text-sm font-bold text-purple-700 cursor-pointer">Đối tác Đặc biệt (Max 2)</label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button onClick={() => { setIsAdding(false); setEditingPartner(null); }} className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-iec-accent">Hủy bỏ</button>
                    <button onClick={isAdding ? handleAddPartner : handleUpdatePartner} className="bg-iec-primary text-white px-10 py-3 rounded-xl text-sm font-bold shadow-lg shadow-iec-primary/20">
                      {isAdding ? 'Lưu đối tác' : 'Cập nhật đối tác'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-iec-accent">Danh sách Đối tác</h3>
                <p className="text-sm text-gray-400">Quản lý logo và thông tin đối tác chiến lược</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPartners.map((partner, index) => (
                <div key={partner.id} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 group relative">
                  {partner.isSpecial && (
                    <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg z-10">
                      ĐẶC BIỆT
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-20 h-20 bg-white rounded-2xl p-4 flex items-center justify-center shadow-sm">
                      <img src={partner.logo} alt={partner.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toggleSpecial(partner.id)}
                          className={`p-2 rounded-xl transition-all ${partner.isSpecial ? 'text-purple-600 bg-purple-50' : 'text-gray-300 bg-white hover:text-purple-600'}`}
                          title="Đối tác đặc biệt"
                        >
                          <Star size={18} fill={partner.isSpecial ? "currentColor" : "none"} />
                        </button>
                        <button 
                          onClick={() => toggleFeatured(partner.id)}
                          className={`p-2 rounded-xl transition-all ${partner.featured ? 'text-yellow-500 bg-yellow-50' : 'text-gray-300 bg-white hover:text-yellow-500'}`}
                          title="Đối tác chiến lược"
                        >
                          <Star size={18} fill={partner.featured ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => movePartner(partner.id, 'up')}
                          disabled={index === 0}
                          className="p-2 text-gray-300 bg-white hover:text-iec-primary rounded-xl transition-all disabled:opacity-30"
                        >
                          <ChevronUp size={18} />
                        </button>
                        <button 
                          onClick={() => movePartner(partner.id, 'down')}
                          disabled={index === sortedPartners.length - 1}
                          className="p-2 text-gray-300 bg-white hover:text-iec-primary rounded-xl transition-all disabled:opacity-30"
                        >
                          <ChevronDown size={18} />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setEditingPartner(partner)}
                          className="p-2 text-gray-300 bg-white hover:text-iec-primary rounded-xl transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeletePartner(partner.id)}
                          className="p-2 text-gray-300 bg-white hover:text-red-500 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <h4 className="font-bold text-iec-accent mb-1">{partner.name}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4">{partner.description.vi}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-iec-primary bg-iec-primary/5 px-2 py-1 rounded-lg uppercase tracking-wider">
                      {data.categories.find(c => c.id === partner.categoryId)?.name.vi || 'Chưa phân loại'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <CategoryTab type="partner" />
      )}

          {isMediaSelectorOpen && (
            <MediaSelector 
              onSelect={(url) => {
                const singleUrl = Array.isArray(url) ? url[0] : url;
                if (isAdding) {
                  setNewPartner({ ...newPartner, logo: singleUrl });
                } else if (editingPartner) {
                  setEditingPartner({ ...editingPartner, logo: singleUrl });
                }
                setIsMediaSelectorOpen(false);
              }}
              onClose={() => setIsMediaSelectorOpen(false)}
            />
          )}
    </div>
  );
};

const MediaManager = () => {
  const { data, updateData } = useSiteData();
  const [isUploading, setIsUploading] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    
    const uploadPromises = (Array.from(files) as File[]).map(file => {
      return new Promise<MediaItem>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            id: 'm-' + Date.now().toString() + Math.random().toString(36).substring(7),
            url: reader.result as string,
            name: file.name,
            date: new Date().toLocaleDateString('vi-VN')
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(uploadPromises).then(newMediaItems => {
      updateData({ media: [...data.media, ...newMediaItems] });
      setIsUploading(false);
    });
  };

  const handleDeleteMedia = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tệp này?')) {
      updateData({ media: data.media.filter(m => m.id !== id) });
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-iec-accent">Thư viện Media</h3>
            <p className="text-sm text-gray-400">Quản lý hình ảnh và tệp tin hệ thống</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsSelectorOpen(true)}
              className="bg-white text-iec-accent border border-gray-200 px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-all"
            >
              <ImageIcon size={18} /> Chọn từ thư viện
            </button>
            <label className="bg-iec-primary text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer hover:shadow-lg hover:shadow-iec-primary/20 transition-all">
              <Plus size={18} /> {isUploading ? 'Đang tải...' : 'Tải lên mới'}
              <input type="file" className="hidden" multiple accept="image/*" onChange={handleUpload} disabled={isUploading} />
            </label>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.media.map((item) => (
            <div key={item.id} className="aspect-square rounded-2xl bg-gray-100 overflow-hidden relative group cursor-pointer border border-gray-100">
              <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(item.url);
                    alert('Đã sao chép URL!');
                  }}
                  className="p-2 bg-white text-iec-accent rounded-lg hover:bg-iec-primary hover:text-white transition-colors"
                  title="Copy URL"
                >
                  <Link size={14} />
                </button>
                <button 
                  onClick={() => handleDeleteMedia(item.id)}
                  className="p-2 bg-white text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-white font-medium truncate">{item.name}</p>
                <p className="text-[8px] text-gray-300">{item.date}</p>
              </div>
            </div>
          ))}
          {data.media.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400">
              <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
              <p>Chưa có tệp media nào. Hãy tải lên ngay!</p>
            </div>
          )}
        </div>
      </div>

      {isSelectorOpen && (
        <MediaSelector 
          onSelect={(url) => {
            setIsSelectorOpen(false);
            // In a real app, maybe show details or something
          }}
          onClose={() => setIsSelectorOpen(false)}
        />
      )}
    </div>
  );
};

const FormManager = () => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
    <h3 className="text-xl font-bold text-iec-accent mb-8">Quản lý Đăng ký & Đối tác</h3>
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-iec-primary/10 flex items-center justify-center text-iec-primary font-bold">JD</div>
            <div>
              <p className="font-bold text-iec-accent">Nguyễn Văn A</p>
              <p className="text-xs text-gray-400">vana@company.com • 0901234567</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loại đăng ký</p>
              <p className="text-sm font-bold text-iec-accent">Hợp tác Đối tác</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-xl">Duyệt</button>
              <button className="px-4 py-2 bg-red-50 text-red-500 text-xs font-bold rounded-xl">Từ chối</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const EventManager = () => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-xl font-bold text-iec-accent">Workshop & Event</h3>
      <button className="bg-iec-primary text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
        <Plus size={18} /> Tạo sự kiện
      </button>
    </div>
    <div className="space-y-4">
      {[1, 2].map(i => (
        <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-6">
          <div className="w-32 h-20 rounded-xl bg-gray-200 overflow-hidden">
            <img src={`https://picsum.photos/seed/event${i}/200/120`} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-grow">
            <p className="font-bold text-iec-accent">Workshop: Đổi mới sáng tạo trong Doanh nghiệp</p>
            <p className="text-xs text-gray-400">20/04/2026 • 09:00 - 12:00 • Trực tuyến</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-iec-primary"><Edit2 size={18} /></button>
            <button className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DocManager = () => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-xl font-bold text-iec-accent">Quản lý Tài liệu</h3>
      <button className="bg-iec-primary text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
        <Plus size={18} /> Thêm tài liệu
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm">
            <FileDown size={24} />
          </div>
          <div className="flex-grow">
            <p className="font-bold text-iec-accent text-sm">Báo cáo thị trường Fintech 2026.pdf</p>
            <p className="text-xs text-gray-400">PDF • 4.2 MB • 128 lượt tải</p>
          </div>
          <button className="p-2 text-gray-400 hover:text-iec-primary"><Edit2 size={16} /></button>
        </div>
      ))}
    </div>
  </div>
);

const AdminLogin = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentUser } = useSiteData();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  // Auto-trigger if already authenticated with Firebase but context not yet ready
  useEffect(() => {
    if (auth.currentUser && !currentUser) {
      setIsLoading(true);
    }
  }, [currentUser]);

  if (isLoading && auth.currentUser) {
    return (
      <div className="min-h-screen bg-iec-accent flex flex-col items-center justify-center p-6 text-white">
        <div className="w-16 h-16 border-4 border-iec-primary border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold">Đang xác thực quyền truy cập...</h2>
        <p className="text-white/60 mt-2">Vui lòng đợi trong giây lát</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-iec-accent flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-12 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-iec-primary rounded-2xl flex items-center justify-center font-black text-3xl text-white mx-auto mb-6 shadow-xl shadow-iec-primary/20">I</div>
          <h2 className="text-2xl font-bold text-iec-accent">Quản trị hệ thống</h2>
          <p className="text-gray-400 mt-2 font-medium">Vui lòng đăng nhập để tiếp tục</p>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-4 bg-white border-2 border-gray-100 text-iec-accent font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-iec-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Đăng nhập với Google
              </>
            )}
          </button>

          {/* Dev Auto-Login for Designer.Vien@gmail.com */}
          <button 
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-iec-primary/10 text-iec-primary font-bold rounded-2xl hover:bg-iec-primary/20 transition-all text-xs"
          >
            Tự động đăng nhập (Designer.Vien@gmail.com)
          </button>

          {error && (
            <p className="text-red-500 text-xs font-bold text-center">{error}</p>
          )}

          <div className="pt-6 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 text-center uppercase font-bold tracking-widest">
              Chỉ dành cho quản trị viên IEC
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminApp;
