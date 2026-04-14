import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc,
  getDocFromServer,
  query,
  where,
  deleteDoc
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { db, auth } from '../lib/firebase';

// --- Types ---

export type Language = 'vi' | 'en';

export interface Category {
  id: string;
  name: { vi: string; en: string };
  slug: string;
  parentId?: string;
  type: 'post' | 'event' | 'doc' | 'partner' | 'media';
}

export interface Post {
  id: string;
  slug: string;
  title: { vi: string; en: string };
  excerpt: { vi: string; en: string };
  content: { vi: string; en: string };
  image: string;
  categoryId: string;
  date: string;
  author: string;
  featured: boolean;
  tags: string[];
  seo: {
    title: { vi: string; en: string };
    description: { vi: string; en: string };
    keywords: { vi: string; en: string };
    canonicalUrl: string;
  };
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  description: { vi: string; en: string };
  link: string;
  featured: boolean;
  categoryId: string;
  order?: number;
  isSpecial?: boolean;
}

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface UserPermissions {
  homepage: 'none' | 'view' | 'edit';
  hub: 'none' | 'view' | 'edit';
  partners: 'none' | 'view' | 'edit';
  users: 'none' | 'view' | 'edit';
  settings: 'none' | 'view' | 'edit';
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  lastLogin?: string;
}

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  date: string;
  type?: 'image' | 'video' | 'file';
}

export interface SiteData {
  homepage: {
    hero: {
      title1: { vi: string; en: string };
      title2: { vi: string; en: string };
      title3: { vi: string; en: string };
      title4: { vi: string; en: string };
      subtitle: { vi: string; en: string };
      badge: { vi: string; en: string };
      image: string;
    };
    about: {
      badge: { vi: string; en: string };
      title: { vi: string; en: string };
      description: { vi: string; en: string };
      quote: { vi: string; en: string };
      h1: { vi: string; en: string };
      h2: { vi: string; en: string };
      image: string;
      highlights: { title: { vi: string; en: string }; desc: { vi: string; en: string } }[];
    };
    impact: {
      badge: { vi: string; en: string };
      title: { vi: string; en: string };
      stats: { label: { vi: string; en: string }; value: string }[];
    };
    values: {
      title: { vi: string; en: string };
      items: { title: { vi: string; en: string }; desc: { vi: string; en: string } }[];
    };
    activities: {
      badge: { vi: string; en: string };
      title: { vi: string; en: string };
      subtitle: { vi: string; en: string };
      items: { id: number; image: string; title: { vi: string; en: string } }[];
    };
    team: {
      badge: { vi: string; en: string };
      title: { vi: string; en: string };
      subtitle: { vi: string; en: string };
      members: { name: string; role: { vi: string; en: string }; img: string; linkedin: string }[];
    };
    ecosystem: {
      badge: { vi: string; en: string };
      title: { vi: string; en: string };
      subtitle: { vi: string; en: string };
    };
    partners: {
      badge: { vi: string; en: string };
      title: { vi: string; en: string };
      subtitle: { vi: string; en: string };
    };
    join: {
      badge: { vi: string; en: string };
      title1: { vi: string; en: string };
      title2: { vi: string; en: string };
      subtitle: { vi: string; en: string };
    };
    sections: { id: string; name: string; enabled: boolean; order: number }[];
  };
  categories: Category[];
  posts: Post[];
  media: MediaItem[];
  partners: Partner[];
  users: User[];
  settings: {
    siteName: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    socialLinks: { facebook: string; linkedin: string; website?: string };
  };
}

interface SiteContextType {
  data: SiteData;
  updateData: (newData: Partial<SiteData>) => void;
  lang: Language;
  setLang: (l: Language) => void;
  user: User | null;
  loadingAuth: boolean;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

// --- Error Handling ---

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Initial Data ---

export const initialData: SiteData = {
  homepage: {
    hero: {
      title1: { vi: "Tri thức", en: "Knowledge" },
      title2: { vi: "Công nghệ", en: "Technology" },
      title3: { vi: "Doanh nghiệp", en: "Enterprise" },
      title4: { vi: "Tăng trưởng", en: "Growth" },
      subtitle: { vi: "Cầu nối giữa đổi mới công nghệ - sáng tạo tiên phong - ứng dụng thực tiễn - thị trường toàn cầu", en: "Bridging the gap between tech innovation - pioneering creativity - practical application - global market" },
      badge: { vi: "Hệ sinh thái đổi mới sáng tạo và khởi nghiệp quốc gia", en: "National Innovation & Entrepreneurship Ecosystem" },
      image: "https://ifc-media.bstarsolutions.com/hinh_ifc_dai_dien_vn_uk_1050x700_original_6fa379678f_e02872c518.jpg"
    },
    about: {
      badge: { vi: "Về IEC", en: "About IEC" },
      title: { vi: "Giao điểm của <span class='text-iec-primary'>đổi mới</span> - giá trị và ứng dụng thực tế", en: "The Nexus of <span class='text-iec-primary'>Innovation</span> - Value and Practical Application" },
      description: { vi: "Trung tâm đổi mới sáng tạo và khởi nghiệp (IEC) là đơn vị hoạt động trực thuộc Viện Phát triển khoa học và sáng tạo, là hệ sinh thái cấp quốc gia hàng đầu nhằm thu hẹp khoảng cách giữa nghiên cứu học thuật, công nghệ tiên tiến và các giải pháp kinh doanh theo định hướng thị trường.", en: "The Innovation & Entrepreneurship Center (IEC) is a subsidiary of the Institute for Science and Innovation Development, a premier national-level ecosystem dedicated to bridging the gap between academic research, cutting-edge technology, and market-driven business solutions." },
      quote: { vi: "\"Sứ mệnh của chúng tôi là đảm bảo rằng các tiến bộ công nghệ chuyển hóa thành tác động thực tế và giá trị kinh tế bền vững.\"", en: "\"Our mission is to ensure that technological advancements translate into real-world impact and sustainable economic value.\"" },
      h1: { vi: "Trung tâm Quốc gia", en: "National Hub" },
      h2: { vi: "Mạng lưới Toàn cầu", en: "Global Network" },
      image: "https://picsum.photos/seed/iec/1200/1500",
      highlights: [
        { title: { vi: "Đổi mới Sáng tạo", en: "Innovation" }, desc: { vi: "Thúc đẩy văn hóa tư duy đột phá để giải quyết các thách thức toàn cầu phức tạp thông qua nghiên cứu và phát triển.", en: "Fostering a culture of breakthrough thinking to solve complex global challenges through research and development." } },
        { title: { vi: "Phát triển Tài năng", en: "Talent Development" }, desc: { vi: "Trang bị cho thế hệ tiếp theo các kỹ năng sẵn sàng cho tương lai, chuyên môn kỹ thuật và năng lực lãnh đạo.", en: "Equipping the next generation with future-ready skills, technical expertise, and leadership capabilities." } },
        { title: { vi: "Ươm tạo Doanh nghiệp", en: "Venture Incubation" }, desc: { vi: "Cung cấp cơ sở hạ tầng, cố vấn và mạng lưới toàn cầu để mở rộng quy mô các startup và dự án tiềm năng cao.", en: "Providing the infrastructure, mentorship, and global network to scale high-potential startups and projects." } },
        { title: { vi: "Tăng tốc Kỹ thuật số", en: "Digital Acceleration" }, desc: { vi: "Dẫn đầu quá trình chuyển đổi sang các chiến lược ưu tiên kỹ thuật số cho các doanh nghiệp hiện đại và tổ chức công.", en: "Leading the transition to digital-first strategies for modern enterprises and public sector organizations." } }
      ]
    },
    impact: {
      badge: { vi: "Dấu ấn IEC", en: "IEC Footprint" },
      title: { vi: "Tạo ra Tác động <span class='text-iec-primary'>Thực tế</span>", en: "Driving <span class='text-iec-primary'>Real-World</span> Impact" },
      stats: [
        { label: { vi: "SỰ KIỆN", en: "EVENTS" }, value: "50+" },
        { label: { vi: "Đối tác", en: "Partners" }, value: "200+" },
        { label: { vi: "Dự án", en: "Projects" }, value: "200+" },
        { label: { vi: "Chuyên gia", en: "Experts" }, value: "50+" }
      ]
    },
    values: {
      title: { vi: "Giá trị cốt lõi", en: "Core Values" },
      items: [
        { title: { vi: "Đào tạo doanh nghiệp", en: "Enterprise Training" }, desc: { vi: "Nâng tầm năng lực quản trị, chuẩn hóa quy trình vận hành và tối ưu hóa hiệu suất thông qua các chương trình đào tạo chuyên sâu.", en: "Elevating management capacity, standardizing operations, and optimizing performance through intensive training programs." } },
        { title: { vi: "Chuyển đổi xanh", en: "Green Transformation" }, desc: { vi: "Tiên phong kiến tạo tương lai bền vững, hỗ trợ doanh nghiệp áp dụng các giải pháp ESG và công nghệ xanh để bứt phá trong nền kinh tế mới.", en: "Pioneering a sustainable future, supporting businesses in applying ESG solutions and green tech to break through in the new economy." } },
        { title: { vi: "Thúc đẩy tinh thần khởi nghiệp", en: "Entrepreneurship Promotion" }, desc: { vi: "Khơi dậy khát vọng sáng tạo, ươm mầm những ý tưởng đột phá và đồng hành cùng các nhà sáng lập trên hành trình chinh phục thị trường.", en: "Igniting creative aspirations, nurturing breakthrough ideas, and accompanying founders on their journey to conquer the market." } },
        { title: { vi: "Kết nối tinh hoa", en: "Elite Connection" }, desc: { vi: "Diễn đàn hội tụ các chuyên gia, nhà lãnh đạo và cộng đồng đổi mới sáng tạo, nơi những ý tưởng lớn gặp gỡ và tạo nên giá trị cộng hưởng.", en: "A forum converging experts, leaders, and the innovation community, where big ideas meet and create synergistic value." } },
        { title: { vi: "Hợp tác quốc tế", en: "International Cooperation" }, desc: { vi: "Mở rộng mạng lưới kết nối toàn cầu, đưa trí tuệ Việt vươn tầm quốc tế thông qua các chương trình hợp tác chiến lược và trao đổi công nghệ.", en: "Expanding global networks, bringing Vietnamese intelligence to the international stage through strategic partnerships and tech exchange." } },
        { title: { vi: "Cung ứng nhân tài", en: "Talent Supply" }, desc: { vi: "Nguồn lực nhân sự chất lượng cao, được đào tạo thực chiến và sẵn sàng đáp ứng những yêu cầu khắt khe nhất của thị trường lao động hiện đại.", en: "High-quality human resources, practically trained and ready to meet the most demanding requirements of the modern labor market." } }
      ]
    },
    activities: {
      badge: { vi: "Hoạt động", en: "Activities" },
      title: { vi: "Hoạt động <span class='text-iec-primary'>IEC</span>", en: "IEC <span class='text-iec-primary'>Activities</span>" },
      subtitle: { vi: "Ghi lại những khoảnh khắc ấn tượng trong hành trình kết nối và thúc đẩy đổi mới sáng tạo.", en: "Capturing impactful moments in our journey of connecting and driving innovation." },
      items: [
        { id: 1, image: "https://lh3.googleusercontent.com/d/1X_U_85_Wnkd7puRWP2zXSq3wx6zVyJJ", title: { vi: "Sự kiện Techfest 2024", en: "Techfest 2024 Event" } },
        { id: 2, image: "https://lh3.googleusercontent.com/d/1KK_8QtTLUhUFSYk4XjCKGCgqCkAqpHW7", title: { vi: "Workshop Chuyển đổi số", en: "Digital Transformation Workshop" } },
        { id: 3, image: "https://lh3.googleusercontent.com/d/1ZVZhF_VELLx9beTvJCMhij3Di5fmTwk-", title: { vi: "Hoạt động khởi nghiệp tại HUTech", en: "Entrepreneurship at HUTech" } },
        { id: 4, image: "https://lh3.googleusercontent.com/d/1nfBhy-U1CB66nF2F-5VlL7gvmthPdBB4", title: { vi: "Hoạt động hợp tác với VCCI", en: "Collaboration with VCCI" } },
      ]
    },
    team: {
      badge: { vi: "Đội ngũ", en: "Our Team" },
      title: { vi: "Đội ngũ <span class='text-iec-primary'>Nòng cốt</span>", en: "Our <span class='text-iec-primary'>Core Team</span>" },
      subtitle: { vi: "Những chuyên gia tận tâm, kết nối tri thức và công nghệ để tạo ra giá trị đột phá cho hệ sinh thái đổi mới sáng tạo.", en: "Dedicated experts bridging knowledge and technology to create breakthrough value for the innovation ecosystem." },
      members: [
        { name: "HOANG DANG KHOA", role: { vi: "Giám đốc điều hành", en: "Executive Director" }, img: "https://lh3.googleusercontent.com/d/1_KM3EA5_Wnkd7puRWP2zXSq3wx6zVyJJ", linkedin: "https://www.linkedin.com/in/sky-hoang-9a22b0245/" },
        { name: "Tran Thai Thi Hong Thanh", role: { vi: "Phó Giám đốc", en: "Deputy Director" }, img: "https://lh3.googleusercontent.com/d/1KK_8QtTLUhUFSYk4XjCKGCgqCkAqpHW7", linkedin: "https://www.linkedin.com/me?trk=p_mwlite_feed-secondary_nav" },
        { name: "Nguyen Phuoc Huy", role: { vi: "Phó Giám đốc", en: "Deputy Director" }, img: "https://lh3.googleusercontent.com/d/1054qNERsBFUDcQ7eaH8jIduPnvMnQ_PN", linkedin: "https://www.linkedin.com/in/huy-nguyen-nft/" },
        { name: "Vien Pham", role: { vi: "Quản lý Kinh doanh & Sản phẩm", en: "Business & Product Manager" }, img: "https://lh3.googleusercontent.com/d/1r9Q6Tl8BgyZoF4eDpyr5WU5DJmftcUre", linkedin: "https://www.linkedin.com/in/timphamtech/" }
      ]
    },
    ecosystem: {
      badge: { vi: "Hệ sinh thái", en: "Ecosystem" },
      title: { vi: "Hệ sinh thái <span class='text-iec-primary'>Đổi mới sáng tạo</span>", en: "Innovation <span class='text-iec-primary'>Ecosystem</span>" },
      subtitle: { vi: "Chúng tôi kết nối các nguồn lực để thúc đẩy sự phát triển bền vững.", en: "We connect resources to drive sustainable growth." }
    },
    partners: {
      badge: { vi: "Đối tác", en: "Partners" },
      title: { vi: "Đối tác <span class='text-iec-primary'>Chiến lược</span>", en: "Strategic <span class='text-iec-primary'>Partners</span>" },
      subtitle: { vi: "Mạng lưới đối tác toàn cầu đồng hành cùng IEC.", en: "Global partner network accompanying IEC." }
    },
    join: {
      badge: { vi: "Sẵn sàng bứt phá?", en: "Ready to Scale?" },
      title1: { vi: "Gia nhập Hệ sinh thái", en: "Join the Innovation" },
      title2: { vi: "Đổi mới ngay hôm nay", en: "Ecosystem Today" },
      subtitle: { vi: "Dù bạn là startup, nhà nghiên cứu hay doanh nghiệp, chúng tôi luôn có nguồn lực và mạng lưới để giúp bạn thành công.", en: "Whether you are a startup, a researcher, or an enterprise, we have the resources and network to help you thrive." }
    },
    sections: [
      { id: 'hero', name: 'Hero Section', enabled: true, order: 0 },
      { id: 'about', name: 'Về IEC', enabled: true, order: 1 },
      { id: 'values', name: 'Giá trị cốt lõi', enabled: true, order: 2 },
      { id: 'ecosystem', name: 'Hệ sinh thái', enabled: true, order: 3 },
      { id: 'impact', name: 'Dấu ấn IEC', enabled: true, order: 4 },
      { id: 'activities', name: 'Hoạt động', enabled: true, order: 5 },
      { id: 'team', name: 'Đội ngũ', enabled: true, order: 6 },
      { id: 'partners', name: 'Đối tác & Logo', enabled: true, order: 7 },
      { id: 'join', name: 'Gia nhập', enabled: true, order: 8 },
      { id: 'footer', name: 'Footer', enabled: true, order: 9 },
    ]
  },
  categories: [
    { id: 'cat-1', name: { vi: 'Tin tức', en: 'News' }, slug: 'news', type: 'post' },
    { id: 'cat-2', name: { vi: 'Workshop', en: 'Workshop' }, slug: 'workshop', type: 'event' },
    { id: 'cat-3', name: { vi: 'Tài liệu', en: 'Documents' }, slug: 'docs', type: 'doc' },
    { id: 'cat-partner', name: { vi: 'Đối tác chiến lược', en: 'Strategic Partners' }, slug: 'strategic-partners', type: 'partner' },
    { id: 'cat-tech', name: { vi: 'Công nghệ', en: 'Technology' }, slug: 'tech', type: 'partner' },
  ],
  posts: [
    {
      id: '1',
      slug: 'chinh-sach-ho-tro-startup-2026',
      title: { vi: "Chính sách hỗ trợ Startup 2026", en: "Startup Support Policy 2026" },
      excerpt: { vi: "Nghị định mới nhằm thúc đẩy hệ sinh thái đổi mới sáng tạo.", en: "New decree to promote innovation ecosystem." },
      content: { vi: "<p>Nội dung chi tiết...</p>", en: "<p>Detailed content...</p>" },
      image: "https://picsum.photos/seed/policy/1200/800",
      categoryId: 'cat-1',
      date: '08/04/2026',
      author: 'Admin',
      featured: true,
      tags: ['Policy', 'Startup'],
      seo: { 
        title: { vi: '', en: '' }, 
        description: { vi: '', en: '' }, 
        keywords: { vi: '', en: '' },
        canonicalUrl: ''
      }
    },
    {
      id: '2',
      slug: 'quan-tri-rui-ro-chuoi-cung-ung',
      title: { vi: "Bài viết Quản trị Rủi ro Chuỗi cung ứng", en: "Supply Chain Risk Management" },
      excerpt: { vi: "Chiến lược quản lý rủi ro chuỗi cung ứng...", en: "Supply chain risk management strategies..." },
      content: { vi: "<p>Nội dung bài viết Quản trị Rủi ro Chuỗi cung ứng...</p>", en: "<p>Content for Supply Chain Risk Management...</p>" },
      image: "https://picsum.photos/seed/supplychain/1200/800",
      categoryId: 'cat-1',
      date: '14/04/2026',
      author: 'Admin',
      featured: false,
      tags: ['Supply Chain', 'Risk Management'],
      seo: { 
        title: { vi: '', en: '' }, 
        description: { vi: '', en: '' }, 
        keywords: { vi: '', en: '' },
        canonicalUrl: ''
      }
    }
  ],
  partners: [
    { id: 'p1', name: 'ISTED', logo: 'https://drive.google.com/uc?id=17Yk7phywA3oMz6HqeOQE6HRKoVLSDHkN', description: { vi: 'Viện Phát triển Khoa học Công nghệ và Giáo dục là tổ chức khoa học, có tư cách pháp nhân và hoạt động theo Luật Khoa học và Công nghệ năm 2013', en: 'Institute for Science, Technology and Education Development is a scientific organization with legal status operating under the 2013 Law on Science and Technology.' }, link: 'https://www.isted.edu.vn', featured: true, isSpecial: true, order: 1, categoryId: 'cat-partner' },
    { id: 'p2', name: 'Vietnix', logo: 'https://drive.google.com/uc?id=1t5R7k9ro0B39PWIeiFv-D5yHutW5XX7U', description: { vi: 'Vietnix là một nhà cung cấp dịch vụ lưu trữ web và đăng ký tên miền. Vietnix hiện đang phục vụ hơn 50000 khách hàng trên toàn Việt Nam.', en: 'Vietnix is a web hosting and domain registration provider. Vietnix currently serves more than 50,000 customers throughout Vietnam.' }, link: 'https://www.vietnix.vn', featured: true, isSpecial: true, order: 2, categoryId: 'cat-partner' },
    { id: 'p3', name: 'Unicom Hub', logo: 'https://drive.google.com/uc?id=1X_U_85_Wnkd7puRWP2zXSq3wx6zVyJJ', description: { vi: 'Hệ sinh thái kết nối tri thức, công nghệ và doanh nghiệp, thúc đẩy đổi mới sáng tạo.', en: 'Ecosystem connecting knowledge, technology, and enterprises, driving innovation.' }, link: 'https://unicomhub.com/', featured: true, order: 3, categoryId: 'cat-partner' },
    { id: 'p4', name: 'VIFC', logo: 'https://drive.google.com/uc?id=1KK_8QtTLUhUFSYk4XjCKGCgqCkAqpHW7', description: { vi: 'Trung tâm Đổi mới Sáng tạo và Tài chính Việt Nam, hỗ trợ vốn và giải pháp tài chính.', en: 'Vietnam Innovation & Finance Center, supporting capital and financial solutions.' }, link: 'https://vifc.org.vn/', featured: true, order: 4, categoryId: 'cat-partner' },
    { id: 'p5', name: 'HUTech University', logo: 'https://drive.google.com/uc?id=1p88TyjrVCKN46yWGDY9xI_cZlMAv3UYE', description: { vi: 'Đối tác chiến lược trong đào tạo và cung ứng nguồn nhân lực chất lượng cao.', en: 'Strategic partner in training and supplying high-quality human resources.' }, link: 'https://www.hutech.edu.vn/', featured: true, order: 5, categoryId: 'cat-tech' },
    { id: 'p6', name: 'VCCI', logo: 'https://drive.google.com/uc?id=1t5R7k9ro0B39PWIeiFv-D5yHutW5XX7U', description: { vi: 'Liên đoàn Thương mại và Công nghiệp Việt Nam, kết nối cộng đồng doanh nghiệp.', en: 'Vietnam Chamber of Commerce and Industry, connecting the business community.' }, link: 'https://vcci.com.vn/', featured: true, order: 6, categoryId: 'cat-partner' },
    { id: 'p7', name: 'Google for Startups', logo: 'https://drive.google.com/uc?id=17Yk7phywA3oMz6HqeOQE6HRKoVLSDHkN', description: { vi: 'Hỗ trợ công nghệ và hạ tầng đám mây cho các dự án khởi nghiệp tiềm năng.', en: 'Supporting technology and cloud infrastructure for high-potential startup projects.' }, link: 'https://startups.google.com/', featured: true, order: 7, categoryId: 'cat-tech' },
    { id: 'p8', name: 'Amazon Web Services', logo: 'https://drive.google.com/uc?id=1BiU76Su3cX6QXDRilRIUqvUPTKjEZIpO', description: { vi: 'Cung cấp nền tảng điện toán đám mây và các dịch vụ hỗ trợ startup bứt phá.', en: 'Providing cloud computing platforms and services to help startups scale.' }, link: 'https://aws.amazon.com/', featured: true, order: 8, categoryId: 'cat-tech' },
    { id: 'p9', name: 'FPT Software', logo: 'https://drive.google.com/uc?id=1oVC1Y7nwTXeoWhOh7sk_xXW9Wpa5g1yA', description: { vi: 'Tập đoàn công nghệ hàng đầu Việt Nam, đối tác chiến lược trong chuyển đổi số.', en: 'Leading technology corporation in Vietnam, strategic partner in digital transformation.' }, link: 'https://fptsoftware.com/', featured: true, order: 9, categoryId: 'cat-tech' },
    { id: 'p10', name: 'Viettel', logo: 'https://drive.google.com/uc?id=1484WKrzQAQo9zw6cQCwkJU7MljKjxiJm', description: { vi: 'Tập đoàn Công nghiệp - Viễn thông Quân đội, hỗ trợ hạ tầng số quốc gia.', en: 'Military Industry and Telecoms Group, supporting national digital infrastructure.' }, link: 'https://viettel.com.vn/', featured: true, order: 10, categoryId: 'cat-tech' },
    { id: 'p11', name: 'VinGroup', logo: 'https://drive.google.com/uc?id=1ZVZhF_VELLx9beTvJCMhij3Di5fmTwk-', description: { vi: 'Tập đoàn đa ngành hàng đầu Việt Nam.', en: 'Leading multi-sector corporation in Vietnam.' }, link: 'https://vingroup.net/', featured: true, order: 11, categoryId: 'cat-partner' },
    { id: 'p12', name: 'Techcombank', logo: 'https://drive.google.com/uc?id=1nfBhy-U1CB66nF2F-5VlL7gvmthPdBB4', description: { vi: 'Ngân hàng thương mại cổ phần Kỹ Thương Việt Nam.', en: 'Vietnam Technological and Commercial Joint Stock Bank.' }, link: 'https://techcombank.com/', featured: true, order: 12, categoryId: 'cat-partner' },
    { id: 'p13', name: 'Shopee', logo: 'https://drive.google.com/uc?id=1X_U_85_Wnkd7puRWP2zXSq3wx6zVyJJ', description: { vi: 'Nền tảng thương mại điện tử hàng đầu.', en: 'Leading e-commerce platform.' }, link: 'https://shopee.vn/', featured: true, order: 13, categoryId: 'cat-tech' },
    { id: 'p14', name: 'Grab', logo: 'https://drive.google.com/uc?id=1KK_8QtTLUhUFSYk4XjCKGCgqCkAqpHW7', description: { vi: 'Siêu ứng dụng hàng đầu Đông Nam Á.', en: 'Leading super-app in Southeast Asia.' }, link: 'https://grab.com/', featured: true, order: 14, categoryId: 'cat-tech' },
    { id: 'p15', name: 'Lazada', logo: 'https://drive.google.com/uc?id=1Eu1j8LgaCf2SkjxBoqiSFWesvl1S8val', description: { vi: 'Nền tảng thương mại điện tử đa quốc gia.', en: 'Multnational e-commerce platform.' }, link: 'https://lazada.vn/', featured: true, order: 15, categoryId: 'cat-tech' },
    { id: 'p16', name: 'Tiki', logo: 'https://drive.google.com/uc?id=1p88TyjrVCKN46yWGDY9xI_cZlMAv3UYE', description: { vi: 'Nền tảng thương mại điện tử Việt Nam.', en: 'Vietnamese e-commerce platform.' }, link: 'https://tiki.vn/', featured: true, order: 16, categoryId: 'cat-tech' },
  ],
  media: [
    { id: 'm1', url: 'https://lh3.googleusercontent.com/d/1X_U_85_Wnkd7puRWP2zXSq3wx6zVyJJ', name: 'techfest.jpg', date: '10/04/2026', type: 'image' },
    { id: 'm2', url: 'https://lh3.googleusercontent.com/d/1KK_8QtTLUhUFSYk4XjCKGCgqCkAqpHW7', name: 'workshop.jpg', date: '10/04/2026', type: 'image' },
    { id: 'm3', url: 'https://lh3.googleusercontent.com/d/1ZVZhF_VELLx9beTvJCMhij3Di5fmTwk-', name: 'startup.jpg', date: '10/04/2026', type: 'image' },
    { id: 'm4', url: 'https://lh3.googleusercontent.com/d/1nfBhy-U1CB66nF2F-5VlL7gvmthPdBB4', name: 'collaboration.jpg', date: '10/04/2026', type: 'image' },
  ],
  users: [
    {
      id: 'u1',
      username: 'iecadminn',
      email: 'admin@iec.com.vn',
      role: 'admin',
      permissions: {
        homepage: 'edit',
        hub: 'edit',
        partners: 'edit',
        users: 'edit',
        settings: 'edit'
      }
    }
  ],
  settings: {
    siteName: 'IEC HUB',
    contactEmail: 'info@iec.com.vn',
    contactPhone: '0916781444',
    address: '224 Điện Biên Phủ, Phường Xuân Hòa, Thành phố Hồ Chí Minh',
    socialLinks: {
      facebook: 'https://www.facebook.com/IECdoimoisangtaovakhoinghiep/',
      linkedin: 'https://www.linkedin.com/company/vietnam-iec/about/?viewAsMember=true',
      website: 'https://iec.com.vn'
    }
  }
};

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<SiteData>(initialData);
  const [lang, setLang] = useState<Language>('vi');
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Try to get user from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else if (firebaseUser.email === 'Designer.Vien@gmail.com') {
            // Bootstrap super admin
            const adminUser: User = {
              id: firebaseUser.uid,
              username: firebaseUser.displayName || 'Admin',
              email: firebaseUser.email!,
              role: 'admin',
              permissions: {
                homepage: 'edit',
                hub: 'edit',
                partners: 'edit',
                users: 'edit',
                settings: 'edit'
              }
            };
            setUser(adminUser);
            // We'll save this to DB in the bootstrap logic or updateData
          }
        } catch (e) {
          console.error("Error fetching user profile:", e);
        }
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Test connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Sync with Firestore
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Helper to check if user can bootstrap
    const canBootstrap = () => {
      // Allow bootstrap in bypass mode (no user and no auth user) or if user is admin/editor
      return (!user && !auth.currentUser) || (user && (user.role === 'admin' || user.role === 'editor'));
    };

    // Homepage config
    unsubscribers.push(onSnapshot(doc(db, 'config', 'homepage'), (snap) => {
      if (snap.exists()) {
        setData(prev => ({ ...prev, homepage: { ...initialData.homepage, ...snap.data() as any } }));
      } else if (canBootstrap()) {
        setDoc(doc(db, 'config', 'homepage'), initialData.homepage);
      }
    }, (e) => {
      // Don't throw error for public listeners if it's just a permission issue for unauth
      if (auth.currentUser) handleFirestoreError(e, OperationType.GET, 'config/homepage');
    }));

    // Settings config
    unsubscribers.push(onSnapshot(doc(db, 'config', 'settings'), (snap) => {
      if (snap.exists()) {
        setData(prev => ({ ...prev, settings: { ...initialData.settings, ...snap.data() as any } }));
      } else if (canBootstrap()) {
        setDoc(doc(db, 'config', 'settings'), initialData.settings);
      }
    }, (e) => {
      if (auth.currentUser) handleFirestoreError(e, OperationType.GET, 'config/settings');
    }));

    // Public Collections
    const publicCollections = ['categories', 'posts', 'partners'] as const;
    publicCollections.forEach(colName => {
      unsubscribers.push(onSnapshot(collection(db, colName), (snap) => {
        const items = snap.docs.map(doc => ({ ...doc.data() } as any));
        setData(prev => {
          if (JSON.stringify(prev[colName]) === JSON.stringify(items)) return prev;
          return { ...prev, [colName]: items };
        });
        
        if (snap.empty && canBootstrap()) {
          initialData[colName].forEach(item => {
            setDoc(doc(db, colName, item.id), item);
          });
        }
      }, (e) => {
        if (auth.currentUser) handleFirestoreError(e, OperationType.LIST, colName);
      }));
    });

    // Sensitive Collections - Only for Admins/Editors
    if (user && (user.role === 'admin' || user.role === 'editor')) {
      unsubscribers.push(onSnapshot(collection(db, 'users'), (snap) => {
        const items = snap.docs.map(doc => ({ ...doc.data() } as any));
        setData(prev => {
          if (JSON.stringify(prev.users) === JSON.stringify(items)) return prev;
          return { ...prev, users: items };
        });

        // Bootstrap the current admin user if not in DB
        if (user.role === 'admin' && !items.find(u => u.id === user.id)) {
          setDoc(doc(db, 'users', user.id), user).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.id}`));
        }
      }, (e) => handleFirestoreError(e, OperationType.LIST, 'users')));
    }

    setIsReady(true);
    return () => unsubscribers.forEach(unsub => unsub());
  }, [user]);

  const updateData = async (newData: Partial<SiteData>) => {
    const oldData = data;
    // Optimistic update
    setData(prev => ({ ...prev, ...newData }));

    // Bypass check for development - allow admin/editor role if user is null (bypass mode)
    const effectiveUser = user || { role: 'admin' };
    if (effectiveUser.role !== 'admin' && effectiveUser.role !== 'editor') return;

    try {
      if (newData.homepage) {
        await setDoc(doc(db, 'config', 'homepage'), newData.homepage);
      }
      if (newData.settings) {
        await setDoc(doc(db, 'config', 'settings'), newData.settings);
      }
      
      // Handle collections (with deletions)
      const collections = ['categories', 'posts', 'partners', 'users'] as const;
      for (const col of collections) {
        if (newData[col]) {
          const newList = newData[col] as any[];
          const oldList = oldData[col] as any[];
          
          // Find deleted items
          const deletedItems = oldList.filter(oldItem => !newList.find(newItem => newItem.id === oldItem.id));
          for (const item of deletedItems) {
            await deleteDoc(doc(db, col, item.id));
          }
          
          // Update/Create items
          for (const item of newList) {
            await setDoc(doc(db, col, item.id), item);
          }
        }
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'multiple');
    }
  };

  return (
    <SiteContext.Provider value={{ data, updateData, lang, setLang, user, loadingAuth }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSiteData = () => {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSiteData must be used within a SiteProvider');
  return context;
};
