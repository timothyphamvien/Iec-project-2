import React, { useState } from 'react';
import { 
  LayoutDashboard, FileText, Image as ImageIcon, 
  Users, Calendar, FileDown, Settings, 
  Plus, Search, Edit2, Trash2, ChevronRight,
  LogOut, Bell, Globe, FolderTree, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AdminApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  const menuItems = [
    { id: 'dashboard', name: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
    { id: 'homepage', name: 'Trang chủ', icon: <Globe size={20} /> },
    { id: 'hub', name: 'Trạm thông tin', icon: <FileText size={20} /> },
    { id: 'categories', name: 'Danh mục', icon: <FolderTree size={20} /> },
    { id: 'media', name: 'Thư viện Media', icon: <ImageIcon size={20} /> },
    { id: 'forms', name: 'Đăng ký & Đối tác', icon: <Users size={20} /> },
    { id: 'events', name: 'Workshop & Event', icon: <Calendar size={20} /> },
    { id: 'docs', name: 'Tài liệu', icon: <FileDown size={20} /> },
    { id: 'settings', name: 'Cài đặt', icon: <Settings size={20} /> },
  ];

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
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-iec-accent">Admin User</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-iec-primary/10 flex items-center justify-center text-iec-primary font-bold">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <DashboardOverview />}
              {activeTab === 'homepage' && <HomepageEditor />}
              {activeTab === 'hub' && <HubManager />}
              {activeTab === 'categories' && <CategoryManager />}
              {activeTab === 'media' && <MediaManager />}
              {activeTab === 'forms' && <FormManager />}
              {activeTab === 'events' && <EventManager />}
              {activeTab === 'docs' && <DocManager />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// --- Sub-components (Placeholders for now) ---

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

const HomepageEditor = () => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h3 className="text-xl font-bold text-iec-accent">Quản lý Trang chủ</h3>
        <p className="text-sm text-gray-400">Chỉnh sửa nội dung các section trên trang chủ</p>
      </div>
      <button className="bg-iec-primary text-white px-6 py-3 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-iec-primary/20 transition-all">
        Lưu thay đổi
      </button>
    </div>

    <div className="space-y-10">
      <section className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
        <h4 className="font-bold text-iec-accent mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-iec-primary rounded-full" />
          Hero Section
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tiêu đề chính</label>
            <input type="text" className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" defaultValue="Kiến tạo hệ sinh thái" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tiêu đề phụ</label>
            <input type="text" className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" defaultValue="Đổi mới sáng tạo Việt Nam" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mô tả</label>
            <textarea className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20 h-32" defaultValue="Chúng tôi kết nối các nguồn lực, chuyên gia và công nghệ để thúc đẩy sự phát triển bền vững." />
          </div>
        </div>
      </section>

      <section className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
        <h4 className="font-bold text-iec-accent mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-iec-primary rounded-full" />
          Đối tác & Logo
        </h4>
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="relative group w-32 h-20 bg-white rounded-xl border border-gray-200 flex items-center justify-center p-4">
              <img src={`https://picsum.photos/seed/logo${i}/100/50`} alt="" className="max-w-full max-h-full grayscale opacity-50" />
              <button className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button className="w-32 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-iec-primary hover:text-iec-primary transition-all gap-1">
            <Plus size={20} />
            <span className="text-[10px] font-bold uppercase">Thêm Logo</span>
          </button>
        </div>
      </section>
    </div>
  </div>
);

const HubManager = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  if (isEditing) {
    return <PostEditor post={editingPost} onBack={() => setIsEditing(false)} />;
  }

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-iec-accent">Quản lý Bài viết</h3>
          <p className="text-sm text-gray-400">Biên soạn và quản lý nội dung trạm thông tin</p>
        </div>
        <button 
          onClick={() => {
            setEditingPost(null);
            setIsEditing(true);
          }}
          className="bg-iec-primary text-white px-6 py-3 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-iec-primary/20 transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Thêm bài viết
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Bài viết</th>
              <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Danh mục</th>
              <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Ngày đăng</th>
              <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[1, 2, 3, 4, 5].map(i => (
              <tr key={i} className="group">
                <td className="py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-10 rounded-lg bg-gray-100 overflow-hidden">
                      <img src={`https://picsum.photos/seed/post${i}/100/60`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-iec-accent">Tiêu đề bài viết mẫu số {i}</p>
                      <p className="text-xs text-gray-400">8 phút đọc • 1.2k lượt xem</p>
                    </div>
                  </div>
                </td>
                <td className="py-6">
                  <span className="text-xs font-bold text-iec-primary bg-iec-primary/5 px-3 py-1 rounded-full">Tin tức</span>
                </td>
                <td className="py-6 text-sm text-gray-500">08/04/2026</td>
                <td className="py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => {
                        setEditingPost({ id: i, title: `Tiêu đề bài viết mẫu số ${i}` });
                        setIsEditing(true);
                      }}
                      className="p-2 text-gray-400 hover:text-iec-primary hover:bg-iec-primary/5 rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PostEditor = ({ post, onBack }: { post: any, onBack: () => void }) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    category: post?.category || 'Tin tức',
    description: post?.description || '',
    content: post?.content || '',
    videoUrl: post?.videoUrl || '',
    tags: post?.tags?.join(', ') || '',
  });

  const handleSave = () => {
    // In a real app, this would save to a database. 
    // Since Firebase was declined, we'll just simulate success.
    alert('Đã lưu bài viết thành công!');
    onBack();
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-iec-accent">
            <ArrowLeft size={20} />
          </button>
          <h3 className="text-xl font-bold text-iec-accent">{post ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}</h3>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold">Lưu nháp</button>
          <button 
            onClick={handleSave}
            className="px-6 py-3 bg-iec-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-iec-primary/20"
          >
            Xuất bản
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tiêu đề bài viết</label>
            <input 
              type="text" 
              className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-iec-primary/20 font-bold text-lg" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Nhập tiêu đề..." 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mô tả ngắn</label>
            <textarea 
              className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-iec-primary/20 h-24" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Nhập mô tả ngắn..." 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nội dung bài viết (HTML)</label>
            <textarea 
              className="w-full p-6 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-iec-primary/20 h-[500px] font-mono text-sm" 
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Nhập nội dung bài viết..." 
            />
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-6 bg-gray-50 rounded-3xl space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Danh mục</label>
              <select 
                className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option>Tin tức</option>
                <option>Workshop & Event</option>
                <option>E-learning</option>
                <option>Tài liệu</option>
                <option>Tài chính & Thị trường</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Video URL (YouTube/Vimeo)</label>
              <input 
                type="text" 
                className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" 
                value={formData.videoUrl}
                onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                placeholder="https://youtube.com/..." 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Hình ảnh đại diện</label>
              <div className="aspect-video bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-iec-primary hover:text-iec-primary transition-all cursor-pointer overflow-hidden">
                {post?.image ? (
                  <img src={post.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Plus size={24} />
                    <span className="text-[10px] font-bold uppercase mt-2">Tải ảnh lên</span>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tags (cách nhau bởi dấu phẩy)</label>
              <input 
                type="text" 
                className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-iec-primary/20" 
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="Startup, Công nghệ..." 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoryManager = () => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-xl font-bold text-iec-accent">Danh mục Trạm thông tin</h3>
      <button className="bg-iec-primary text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
        <Plus size={18} /> Thêm danh mục
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {['Workshop & Event', 'E-learning', 'Tin tức', 'Tài liệu', 'Tài chính & Thị trường'].map((cat, i) => (
        <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between group">
          <div>
            <p className="font-bold text-iec-accent">{cat}</p>
            <p className="text-xs text-gray-400">12 bài viết</p>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 text-gray-400 hover:text-iec-primary"><Edit2 size={14} /></button>
            <button className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MediaManager = () => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-xl font-bold text-iec-accent">Thư viện Media</h3>
      <button className="bg-iec-primary text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
        <Plus size={18} /> Tải lên
      </button>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="aspect-square rounded-2xl bg-gray-100 overflow-hidden relative group cursor-pointer">
          <img src={`https://picsum.photos/seed/media${i}/200/200`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button className="p-2 bg-white text-iec-accent rounded-lg"><Edit2 size={14} /></button>
            <button className="p-2 bg-white text-red-500 rounded-lg"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

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

const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'iecadminn' && password === 'Tim2026@') {
      onLogin();
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tên đăng nhập</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-iec-primary/20 transition-all font-medium"
              placeholder="iecadminn"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-iec-primary/20 transition-all font-medium"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-bold text-center">{error}</p>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-iec-primary text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-iec-primary/30 transition-all mt-4"
          >
            Đăng nhập
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminApp;
