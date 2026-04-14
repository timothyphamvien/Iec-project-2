import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, ArrowRight, ArrowLeft, 
  Share2, Bookmark, User, ChevronRight,
  CheckCircle2, List, Quote, Info, ChevronDown,
  Menu, X, Facebook, Twitter, Linkedin
} from 'lucide-react';
import { Link, useSearchParams, useNavigate, useParams } from 'react-router-dom';

// --- Shared Components ---

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-iec-primary/5 rounded-lg ${className}`} />
);

const ImageWithSkeleton = ({ 
  src, 
  alt, 
  className, 
  referrerPolicy, 
  loading = "lazy",
  srcSet,
  sizes
}: { 
  src: string, 
  alt: string, 
  className?: string, 
  referrerPolicy?: "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url", 
  loading?: "lazy" | "eager",
  srcSet?: string,
  sizes?: string
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !hasError && (
        <Skeleton className="absolute inset-0 w-full h-full z-10" />
      )}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={`${className} transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        referrerPolicy={referrerPolicy}
        loading={loading}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-300 text-[10px] font-bold uppercase text-center p-4">
          Image Load Error
        </div>
      )}
    </div>
  );
};

// --- Types ---

interface Author {
  name: string;
  role: string;
  avatar: string;
}

interface Post {
  id: number;
  slug: string;
  categorySlug: string;
  title: string;
  excerpt: string;
  overview: string[];
  content: string;
  categoryLabel: string;
  author: Author;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
  tags: string[];
}

interface TOCItem {
  id: string;
  text: string;
}

// --- Mock Data ---

const CATEGORIES = [
  { id: 'all', name: 'Tất cả', slug: 'all' },
  { id: 'workshop', name: 'Workshop & Event', slug: 'workshop-event' },
  { id: 'elearning', name: 'E-learning', slug: 'elearning' },
  { id: 'news', name: 'Tin tức', slug: 'news' },
  { id: 'docs', name: 'Tài liệu', slug: 'docs' },
  { id: 'finance', name: 'Tài chính & Thị trường', slug: 'finance-market' },
];

const MOCK_POSTS: Post[] = [
  {
    id: 1,
    slug: "chinh-sach-ho-tro-startup-2026",
    categorySlug: "news",
    title: "Chính sách hỗ trợ Startup 2026: Những thay đổi mang tính đột phá",
    excerpt: "Chính phủ vừa ban hành nghị định mới nhằm thúc đẩy hệ sinh thái đổi mới sáng tạo, tập trung vào ưu đãi thuế và cơ chế sandbox.",
    overview: [
      "Miễn thuế thu nhập doanh nghiệp trong 5 năm đầu cho startup công nghệ cao.",
      "Cơ chế Sandbox chính thức áp dụng cho Fintech và Edtech.",
      "Gói hỗ trợ 500 tỷ đồng cho các hoạt động R&D tại các trung tâm đổi mới sáng tạo."
    ],
    content: `
      <h2 id="boi-canh">Bối cảnh mới cho hệ sinh thái khởi nghiệp</h2>
      <p>Năm 2026 đánh dấu một bước ngoặt quan trọng khi các rào cản pháp lý dần được gỡ bỏ. Nghị định mới không chỉ tập trung vào tài chính mà còn chú trọng vào việc tạo ra một môi trường thử nghiệm an toàn cho các công nghệ mới.</p>
      
      <div class="bg-iec-primary/5 p-8 rounded-2xl border-l-4 border-iec-primary my-10">
        <h4 class="font-bold text-iec-accent mb-2">Điểm nhấn quan trọng:</h4>
        <p class="text-sm">Các doanh nghiệp khởi nghiệp có thể đăng ký tham gia cơ chế Sandbox chỉ trong vòng 15 ngày làm việc, thay vì 6 tháng như trước đây.</p>
      </div>

      <h2 id="uu-dai">Ưu đãi thuế và nguồn vốn</h2>
      <p>Việc miễn thuế thu nhập doanh nghiệp là một đòn bẩy cực kỳ quan trọng. Điều này giúp các startup có thêm nguồn lực để tái đầu tư vào sản phẩm và con người trong giai đoạn đầu đầy khó khăn.</p>
      
      <img src="https://picsum.photos/seed/startup-policy/1200/600" alt="Startup Policy" class="rounded-3xl my-12 w-full" />

      <blockquote class="border-l-4 border-iec-primary pl-8 py-4 my-12 italic text-xl text-gray-700">
        "Chúng tôi không chỉ hỗ trợ bằng tiền, chúng tôi hỗ trợ bằng niềm tin và một hành lang pháp lý thông thoáng nhất."
      </blockquote>

      <h2 id="tac-dong">Tác động đến thị trường</h2>
      <p>Dự kiến trong năm tới, số lượng startup đăng ký mới sẽ tăng 30%. Các quỹ đầu tư quốc tế cũng đang đổ dồn sự chú ý vào Việt Nam như một điểm đến an toàn và tiềm năng nhất khu vực Đông Nam Á.</p>
    `,
    categoryLabel: "Tin tức",
    author: {
      name: "Nguyễn Minh Tuấn",
      role: "Chuyên gia Chính sách",
      avatar: "https://i.pravatar.cc/150?u=tuan"
    },
    date: "08/04/2026",
    readTime: "8 phút đọc",
    image: "https://picsum.photos/seed/policy/1200/800",
    featured: true,
    tags: ["Chính sách", "Startup", "2026"]
  },
  {
    id: 2,
    slug: "bao-cao-thi-truong-fintech-viet-nam",
    categorySlug: "finance-market",
    title: "Báo cáo thị trường Fintech Việt Nam: Kỷ nguyên của Embedded Finance",
    excerpt: "Tài chính nhúng đang trở thành xu hướng chủ đạo, thay đổi cách người dùng tiếp cận các dịch vụ ngân hàng và bảo hiểm.",
    overview: [
      "Thị trường Fintech Việt Nam đạt quy mô 18 tỷ USD vào cuối năm 2025.",
      "Embedded Finance tăng trưởng 45% mỗi năm.",
      "Thanh toán không tiền mặt chiếm 85% tổng giao dịch bán lẻ."
    ],
    content: `
      <h2 id="su-troi-day">Sự trỗi dậy của Tài chính nhúng</h2>
      <p>Embedded Finance (Tài chính nhúng) cho phép các doanh nghiệp phi tài chính tích hợp các dịch vụ ngân hàng trực tiếp vào nền tảng của họ. Từ việc mua trước trả sau trên các trang thương mại điện tử đến bảo hiểm chuyến đi trên các ứng dụng gọi xe.</p>
      
      <h2 id="cong-nghe">Công nghệ thúc đẩy sự thay đổi</h2>
      <p>Open Banking và API là những công nghệ cốt lõi giúp việc tích hợp trở nên dễ dàng và bảo mật hơn bao giờ hết. Các ngân hàng truyền thống đang chuyển mình thành các nhà cung cấp nền tảng (BaaS).</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
        <div class="bg-gray-50 p-6 rounded-2xl">
          <h4 class="font-bold mb-2">Lợi ích cho doanh nghiệp</h4>
          <p class="text-sm text-gray-600">Tăng tỷ lệ chuyển đổi, tạo thêm nguồn doanh thu mới và thấu hiểu khách hàng hơn.</p>
        </div>
        <div class="bg-gray-50 p-6 rounded-2xl">
          <h4 class="font-bold mb-2">Lợi ích cho người dùng</h4>
          <p class="text-sm text-gray-600">Trải nghiệm liền mạch, tiếp cận dịch vụ tài chính mọi lúc mọi nơi.</p>
        </div>
      </div>

      <h2 id="thach-thuc">Thách thức về bảo mật</h2>
      <p>Khi dữ liệu tài chính được chia sẻ rộng rãi hơn, vấn đề bảo mật và quyền riêng tư trở nên cấp thiết hơn bao giờ hết. Các startup cần đầu tư mạnh mẽ vào hệ thống phòng thủ số và tuân thủ các tiêu chuẩn quốc tế.</p>
    `,
    categoryLabel: "Tài chính & Thị trường",
    author: {
      name: "Lê Hồng Nhung",
      role: "Phân tích thị trường",
      avatar: "https://i.pravatar.cc/150?u=nhung"
    },
    date: "06/04/2026",
    readTime: "12 phút đọc",
    image: "https://picsum.photos/seed/fintech-report/1200/800",
    tags: ["Fintech", "Market Report", "Embedded Finance"]
  },
  {
    id: 3,
    slug: "workshop-doi-moi-sang-tao-trong-doanh-nghiep",
    categorySlug: "workshop-event",
    title: "Workshop: Thúc đẩy văn hóa đổi mới sáng tạo trong doanh nghiệp truyền thống",
    excerpt: "Làm thế nào để các doanh nghiệp lâu đời có thể thích nghi và bứt phá trong kỷ nguyên số đầy biến động?",
    overview: [
      "Nhận diện các rào cản đối với sự đổi mới trong tổ chức.",
      "Xây dựng quy trình thử nghiệm nhanh (Rapid Prototyping).",
      "Vai trò của lãnh đạo trong việc thúc đẩy tư duy sáng tạo."
    ],
    content: `
      <h2 id="doi-moi">Đổi mới không chỉ là công nghệ</h2>
      <p>Nhiều doanh nghiệp lầm tưởng rằng đổi mới sáng tạo chỉ là mua sắm phần mềm mới. Thực tế, đổi mới bắt đầu từ con người và văn hóa doanh nghiệp.</p>
      
      <h2 id="quy-trinh">Quy trình 3 bước để thay đổi</h2>
      <p>1. Lắng nghe từ cấp cơ sở. 2. Cho phép sai lầm trong tầm kiểm soát. 3. Khen thưởng những ý tưởng đột phá.</p>

      <blockquote class="bg-iec-primary text-white p-10 rounded-3xl my-12 text-2xl font-bold leading-tight">
        "Đổi mới sáng tạo là khả năng nhìn thấy sự thay đổi như một cơ hội, chứ không phải một mối đe dọa."
      </blockquote>

      <h2 id="ket-qua">Kết quả thực tế</h2>
      <p>Các doanh nghiệp áp dụng mô hình đổi mới sáng tạo mở đã giảm được 30% chi phí R&D và rút ngắn thời gian đưa sản phẩm ra thị trường xuống còn một nửa.</p>
    `,
    categoryLabel: "Workshop & Event",
    author: {
      name: "Phạm Hoàng Nam",
      role: "Cố vấn Chiến lược",
      avatar: "https://i.pravatar.cc/150?u=nam"
    },
    date: "04/04/2026",
    readTime: "10 phút đọc",
    image: "https://picsum.photos/seed/innovation/1200/800",
    tags: ["Workshop", "Innovation", "Management"]
  },
  {
    id: 4,
    slug: "cam-nang-goi-von-cho-startup",
    categorySlug: "docs",
    title: "Cẩm nang gọi vốn: Từ vòng Thiên thần đến Series A",
    excerpt: "Hướng dẫn chi tiết cách chuẩn bị Pitch Deck, định giá doanh nghiệp và đàm phán với các nhà đầu tư mạo hiểm.",
    overview: [
      "Cấu trúc một Pitch Deck hoàn hảo thu hút nhà đầu tư.",
      "Các phương pháp định giá startup phổ biến hiện nay.",
      "Những điều khoản cần lưu ý trong Term Sheet."
    ],
    content: `
      <h2 id="chuan-bi">Chuẩn bị là chìa khóa thành công</h2>
      <p>Gọi vốn là một hành trình dài và đòi hỏi sự chuẩn bị kỹ lưỡng. Bạn không chỉ bán một sản phẩm, bạn đang bán một tầm nhìn và một đội ngũ có khả năng thực thi tầm nhìn đó.</p>
      
      <h2 id="pitch-deck">Pitch Deck: Kể một câu chuyện hấp dẫn</h2>
      <p>Đừng chỉ đưa ra các con số khô khan. Hãy kể về vấn đề bạn đang giải quyết, nỗi đau của khách hàng và tại sao giải pháp của bạn là duy nhất.</p>

      <img src="https://picsum.photos/seed/fundraising/1200/600" alt="Fundraising" class="rounded-3xl my-12 w-full" />

      <h2 id="dam-phan">Đàm phán với nhà đầu tư</h2>
      <p>Hãy nhớ rằng nhà đầu tư không chỉ mang lại tiền, họ mang lại mạng lưới và kinh nghiệm. Hãy chọn người đồng hành phù hợp với giá trị cốt lõi của doanh nghiệp bạn.</p>
    `,
    categoryLabel: "Tài liệu",
    author: {
      name: "Trần Đức Anh",
      role: "Venture Capitalist",
      avatar: "https://i.pravatar.cc/150?u=anh"
    },
    date: "02/04/2026",
    readTime: "20 phút đọc",
    image: "https://picsum.photos/seed/pitch/1200/800",
    tags: ["Fundraising", "Startup", "VC"]
  },
  {
    id: 5,
    slug: "xu-huong-ai-2026",
    categorySlug: "news",
    title: "Xu hướng AI 2026: Từ Generative AI đến Agentic AI",
    excerpt: "Khám phá sự chuyển dịch từ các mô hình tạo nội dung sang các hệ thống AI có khả năng tự thực hiện nhiệm vụ phức tạp.",
    overview: ["Agentic AI là gì?", "Ứng dụng trong tự động hóa doanh nghiệp.", "Tương lai của việc làm trong kỷ nguyên AI."],
    content: "<h2>Agentic AI: Bước tiến tiếp theo</h2><p>Nội dung đang được cập nhật...</p>",
    categoryLabel: "Tin tức",
    author: { name: "Hoàng Anh", role: "AI Researcher", avatar: "https://i.pravatar.cc/150?u=hoanganh" },
    date: "01/04/2026",
    readTime: "15 phút đọc",
    image: "https://picsum.photos/seed/ai-2026/1200/800",
    tags: ["AI", "Technology", "Future"]
  },
  {
    id: 6,
    slug: "chuyen-doi-so-nong-nghiep",
    categorySlug: "news",
    title: "Chuyển đổi số trong nông nghiệp: Câu chuyện từ các trang trại thông minh",
    excerpt: "Ứng dụng IoT và Big Data để tối ưu hóa năng suất và giảm thiểu rủi ro cho nông dân Việt Nam.",
    overview: ["IoT trong giám sát cây trồng.", "Dự báo thời tiết bằng AI.", "Chuỗi cung ứng minh bạch với Blockchain."],
    content: "<h2>Nông nghiệp 4.0</h2><p>Nội dung đang được cập nhật...</p>",
    categoryLabel: "Tin tức",
    author: { name: "Lê Văn Nam", role: "AgriTech Expert", avatar: "https://i.pravatar.cc/150?u=namle" },
    date: "30/03/2026",
    readTime: "10 phút đọc",
    image: "https://picsum.photos/seed/agritech/1200/800",
    tags: ["AgriTech", "IoT", "Digital Transformation"]
  },
  {
    id: 7,
    slug: "ky-nang-lanh-dao-thoi-dai-so",
    categorySlug: "elearning",
    title: "Khóa học: Kỹ năng lãnh đạo trong thời đại số",
    excerpt: "Trang bị những tư duy và công cụ cần thiết để dẫn dắt đội ngũ trong môi trường làm việc hybrid và biến động.",
    overview: ["Tư duy linh hoạt (Agile Mindset).", "Quản trị đội ngũ từ xa.", "Xây dựng niềm tin trong môi trường số."],
    content: "<h2>Lãnh đạo 4.0</h2><p>Nội dung đang được cập nhật...</p>",
    categoryLabel: "E-learning",
    author: { name: "Trần Thị Kim", role: "Leadership Coach", avatar: "https://i.pravatar.cc/150?u=kim" },
    date: "28/03/2026",
    readTime: "25 phút đọc",
    image: "https://picsum.photos/seed/leadership/1200/800",
    tags: ["Leadership", "E-learning", "Soft Skills"]
  },
  {
    id: 8,
    slug: "bao-mat-du-lieu-startup",
    categorySlug: "docs",
    title: "Tài liệu: Hướng dẫn bảo mật dữ liệu cho Startup vừa và nhỏ",
    excerpt: "Những bước cơ bản để bảo vệ tài sản trí tuệ và thông tin khách hàng trước các cuộc tấn công mạng ngày càng tinh vi.",
    overview: ["Xây dựng chính sách bảo mật.", "Các công cụ mã hóa dữ liệu.", "Đào tạo nhận thức cho nhân viên."],
    content: "<h2>Bảo mật là sống còn</h2><p>Nội dung đang được cập nhật...</p>",
    categoryLabel: "Tài liệu",
    author: { name: "Ngô Quốc Bảo", role: "Cybersecurity Analyst", avatar: "https://i.pravatar.cc/150?u=bao" },
    date: "25/03/2026",
    readTime: "18 phút đọc",
    image: "https://picsum.photos/seed/security/1200/800",
    tags: ["Cybersecurity", "Startup", "Data Privacy"]
  },
  {
    id: 9,
    slug: "thi-truong-xe-dien-viet-nam",
    categorySlug: "finance-market",
    title: "Thị trường xe điện Việt Nam: Cơ hội và thách thức cho các tay chơi mới",
    excerpt: "Phân tích hạ tầng trạm sạc, chính sách ưu đãi và tâm lý người tiêu dùng đối với phương tiện xanh.",
    overview: ["Hạ tầng trạm sạc toàn quốc.", "Chính sách thuế tiêu thụ đặc biệt.", "Cạnh tranh từ các thương hiệu ngoại."],
    content: "<h2>Kỷ nguyên xe điện</h2><p>Nội dung đang được cập nhật...</p>",
    categoryLabel: "Tài chính & Thị trường",
    author: { name: "Vũ Minh Đức", role: "Auto Analyst", avatar: "https://i.pravatar.cc/150?u=duc" },
    date: "22/03/2026",
    readTime: "14 phút đọc",
    image: "https://picsum.photos/seed/ev-market/1200/800",
    tags: ["EV", "Green Economy", "Market Analysis"]
  },
  {
    id: 10,
    slug: "phat-trien-ben-vung-esg",
    categorySlug: "workshop-event",
    title: "Sự kiện: ESG và lộ trình Net Zero cho doanh nghiệp Việt",
    excerpt: "Thảo luận về cách tích hợp các tiêu chuẩn Môi trường, Xã hội và Quản trị vào chiến lược kinh doanh dài hạn.",
    overview: ["ESG là gì?", "Lợi ích khi tuân thủ ESG.", "Lộ trình giảm phát thải carbon."],
    content: "<h2>Kinh doanh bền vững</h2><p>Nội dung đang được cập nhật...</p>",
    categoryLabel: "Workshop & Event",
    author: { name: "Đặng Thu Thảo", role: "Sustainability Consultant", avatar: "https://i.pravatar.cc/150?u=thao" },
    date: "20/03/2026",
    readTime: "12 phút đọc",
    image: "https://picsum.photos/seed/esg/1200/800",
    tags: ["ESG", "Sustainability", "Net Zero"]
  },
  {
    id: 11,
    slug: "khoi-nghiep-xa-hoi",
    categorySlug: "news",
    title: "Khởi nghiệp xã hội: Khi lợi nhuận đi đôi với tác động cộng đồng",
    excerpt: "Những mô hình kinh doanh sáng tạo đang giải quyết các vấn đề nhức nhối của xã hội một cách bền vững.",
    overview: ["Mô hình Hybrid.", "Đo lường tác động xã hội.", "Huy động vốn cộng đồng."],
    content: "<h2>Kinh doanh vì cộng đồng</h2><p>Nội dung đang được cập nhật...</p>",
    categoryLabel: "Tin tức",
    author: { name: "Bùi Thanh Hải", role: "Social Entrepreneur", avatar: "https://i.pravatar.cc/150?u=hai" },
    date: "18/03/2026",
    readTime: "11 phút đọc",
    image: "https://picsum.photos/seed/social-startup/1200/800",
    tags: ["Social Impact", "Entrepreneurship", "Community"]
  },
  {
    id: 12,
    slug: "quan-tri-rui-ro-chuoi-cung-ung",
    categorySlug: "docs",
    title: "Tài liệu: Quản trị rủi ro chuỗi cung ứng trong bối cảnh địa chính trị phức tạp",
    excerpt: "Chiến lược đa dạng hóa nguồn cung và ứng dụng công nghệ để tăng cường khả năng chống chịu của doanh nghiệp.",
    overview: ["Đa dạng hóa nhà cung cấp.", "Dự báo rủi ro bằng dữ liệu.", "Xây dựng kho hàng thông minh."],
    content: "<h2>Chuỗi cung ứng linh hoạt</h2><p>Nội dung đang được cập nhật...</p>",
    categoryLabel: "Tài liệu",
    author: { name: "Lý Gia Thành", role: "Supply Chain Expert", avatar: "https://i.pravatar.cc/150?u=thanh" },
    date: "15/03/2026",
    readTime: "22 phút đọc",
    image: "https://picsum.photos/seed/supply-chain/1200/800",
    tags: ["Supply Chain", "Risk Management", "Logistics"]
  }
];

import { useSiteData, Language } from './context/SiteContext';

// --- Components ---

const TableOfContents = ({ items }: { items: TOCItem[] }) => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -70% 0px' }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <nav className="hidden lg:block sticky top-32 self-start w-64 pr-8">
      <div className="flex items-center gap-2 mb-6 text-iec-accent font-bold text-xs uppercase tracking-widest">
        <List size={16} />
        <span>Mục lục</span>
      </div>
      <ul className="space-y-4 border-l-2 border-gray-100">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => scrollToSection(item.id)}
              className={`text-left text-sm font-medium transition-all pl-4 -ml-[2px] border-l-2 ${
                activeId === item.id
                ? 'text-iec-primary border-iec-primary'
                : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const MobileTOC = ({ items }: { items: TOCItem[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="lg:hidden mb-12">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl text-iec-accent font-bold text-sm"
      >
        <div className="flex items-center gap-2">
          <List size={18} />
          <span>Mục lục bài viết</span>
        </div>
        <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ul className="mt-2 p-4 bg-white border border-gray-100 rounded-2xl space-y-3">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      const el = document.getElementById(item.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                      setIsOpen(false);
                    }}
                    className="text-left text-sm text-gray-600 hover:text-iec-primary transition-colors"
                  >
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ArticleOverview = ({ items }: { items: string[] }) => (
  <section className="bg-gray-50 rounded-3xl p-8 md:p-10 mb-16 border border-gray-100">
    <div className="flex items-center gap-3 mb-6 text-iec-accent">
      <CheckCircle2 size={24} className="text-iec-primary" />
      <h3 className="text-xl font-bold tracking-tight">Tổng quan bài viết</h3>
    </div>
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-iec-primary mt-2.5 flex-shrink-0" />
          <p className="text-gray-600 font-medium leading-relaxed">{item}</p>
        </li>
      ))}
    </ul>
  </section>
);

const PostCard = ({ post, onClick, lang }: { post: any, onClick: (slug: string) => void, lang: Language, key?: any }) => {
  const seed = post.image.split('seed/')[1]?.split('/')[0] || 'post';
  const srcSet = `
    https://picsum.photos/seed/${seed}/400/250 400w,
    https://picsum.photos/seed/${seed}/800/500 800w,
    https://picsum.photos/seed/${seed}/1200/750 1200w
  `;
  const sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

  return (
    <article 
      className="group cursor-pointer flex flex-col h-full bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500"
      onClick={() => onClick(post.slug)}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <ImageWithSkeleton 
          src={post.image} 
          srcSet={srcSet}
          sizes={sizes}
          alt={post.title[lang]}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-6 left-6">
          <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-xl text-[10px] font-bold text-iec-primary uppercase tracking-widest shadow-sm">
            {post.categoryLabel}
          </span>
        </div>
      </div>
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          <span>{post.date}</span>
          <span className="text-gray-200">•</span>
          <span>{post.readTime || '5 min read'}</span>
        </div>
        <h3 className="text-xl font-bold text-iec-accent mb-4 group-hover:text-iec-primary transition-colors line-clamp-2 leading-snug tracking-tight">
          {post.title[lang]}
        </h3>
        <p className="text-gray-500 line-clamp-2 mb-8 flex-grow leading-relaxed font-medium text-sm">
          {post.excerpt[lang] || (post.content[lang] ? post.content[lang].replace(/<[^>]*>/g, '').substring(0, 160) + '...' : '')}
        </p>
        <div className="flex items-center text-iec-primary font-bold text-sm gap-2 group-hover:gap-3 transition-all mt-auto">
          {lang === 'vi' ? 'Đọc chi tiết' : 'Read more'} <ArrowRight size={16} />
        </div>
      </div>
    </article>
  );
};

const PostDetail = ({ post, onBack, lang, data }: { post: any, onBack: () => void, lang: Language, data: any }) => {
  const navigate = useNavigate();
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const relatedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('iec_bookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(post.id));
  }, [post.id]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('iec_bookmarks') || '[]');
    let newBookmarks;
    if (bookmarks.includes(post.id)) {
      newBookmarks = bookmarks.filter((id: string) => id !== post.id);
      setIsBookmarked(false);
    } else {
      newBookmarks = [...bookmarks, post.id];
      setIsBookmarked(true);
    }
    localStorage.setItem('iec_bookmarks', JSON.stringify(newBookmarks));
  };

  const shareUrl = window.location.href;
  const shareTitle = post.title[lang];

  const socialShares = [
    { name: 'Facebook', icon: <Facebook size={18} />, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: 'Twitter', icon: <Twitter size={18} />, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}` },
    { name: 'LinkedIn', icon: <Linkedin size={18} />, url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
  ];

  const relatedPosts = useMemo(() => {
    return data.posts.filter((p: any) => p.id !== post.id && p.categoryId === post.categoryId).slice(0, 3);
  }, [post.id, post.categoryId, data.posts]);

  useEffect(() => {
    if (contentRef.current) {
      const headings = contentRef.current.querySelectorAll('h2');
      const items: TOCItem[] = Array.from(headings).map((h, i) => {
        const id = `section-${i}`;
        (h as HTMLElement).id = id;
        return {
          id,
          text: (h as HTMLElement).innerText
        };
      });
      setTocItems(items);
    }
  }, [post.content, lang]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white min-h-screen pt-32 pb-24"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-iec-primary font-bold text-sm uppercase tracking-widest mb-12 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          {lang === 'vi' ? 'Quay lại trạm thông tin' : 'Back to hub'}
        </button>

        {/* Article Header */}
        <header className="max-w-[1200px] mb-16 text-center">
          <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-iec-primary uppercase tracking-[0.2em] mb-6">
            <span className="bg-iec-primary/10 px-3 py-1 rounded-lg">
              {data.categories?.find((c: any) => c.id === post.categoryId)?.name[lang]}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-400">{post.date}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-iec-accent mb-10 leading-[1.1] tracking-tight w-full italic">
            {post.title[lang]}
          </h1>
        </header>

        {/* Article Media */}
        <div className="mb-16">
          <ImageWithSkeleton 
            src={post.image} 
            alt={post.title[lang]} 
            className="w-full aspect-[21/9] object-cover rounded-[2.5rem] shadow-2xl shadow-black/5" 
            loading="eager"
          />
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar TOC */}
          <TableOfContents items={tocItems} />

          {/* Article Content */}
          <main className="flex-grow max-w-[800px]">
            <MobileTOC items={tocItems} />
            
            <article 
              ref={contentRef}
              className="prose prose-lg max-w-none text-gray-600 leading-[1.8]
                prose-headings:text-iec-accent prose-headings:font-bold prose-headings:tracking-tight prose-headings:mt-16 prose-headings:mb-8
                prose-h2:text-3xl prose-h2:border-b prose-h2:pb-4 prose-h2:border-gray-100
                prose-p:mb-8 prose-li:mb-4
                prose-strong:text-iec-accent prose-strong:font-bold
                prose-img:rounded-[2rem] prose-img:shadow-xl prose-img:my-16"
              dangerouslySetInnerHTML={{ __html: post.content[lang] }}
            />

            {/* Share & Tags */}
            <div className="mt-24 pt-12 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="px-5 py-2 bg-gray-50 text-gray-500 text-xs font-bold rounded-full hover:bg-iec-primary hover:text-white transition-colors cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{lang === 'vi' ? 'Chia sẻ:' : 'Share:'}</span>
                <div className="flex gap-2">
                  {socialShares.map(social => (
                    <a 
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-iec-primary hover:text-white transition-all"
                      title={`Chia sẻ qua ${social.name}`}
                    >
                      {social.icon}
                    </a>
                  ))}
                  <button 
                    onClick={toggleBookmark}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isBookmarked ? 'bg-iec-primary text-white' : 'bg-gray-50 text-gray-400 hover:bg-iec-primary hover:text-white'}`}
                    title={isBookmarked ? "Bỏ lưu bài viết" : "Lưu bài viết"}
                  >
                    <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 py-32 mt-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <h3 className="text-3xl font-bold text-iec-accent tracking-tight mb-16">{lang === 'vi' ? 'Bài viết liên quan' : 'Related articles'}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedPosts.map((p: any) => (
              <PostCard 
                key={p.id} 
                post={{
                  ...p,
                  categoryLabel: data.categories?.find((c: any) => c.id === p.categoryId)?.name[lang] || ''
                }} 
                lang={lang}
                onClick={() => {
                  navigate(`/hub/${p.slug}`);
                  window.scrollTo(0, 0);
                }} 
              />
            ))}
            </div>
          </div>
        </section>
      )}
    </motion.div>
  );
};

export default function InformationHub() {
  const { data, lang } = useSiteData();
  const { category, slug } = useParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  
  const posts = data.posts || [];
  const categories = data.categories || [];

  const selectedPost = useMemo(() => posts.find(p => p.slug === slug), [slug, posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesCategory = activeCategory === 'all' || post.categoryId === activeCategory;
      return matchesCategory;
    });
  }, [activeCategory, posts]);

  const displayPosts = useMemo(() => {
    return filteredPosts.filter(p => activeCategory !== 'all' || !p.featured);
  }, [filteredPosts, activeCategory]);

  const totalPages = Math.ceil(displayPosts.length / postsPerPage);
  
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return displayPosts.slice(startIndex, startIndex + postsPerPage);
  }, [displayPosts, currentPage]);

  const featuredPost = useMemo(() => posts.find(p => p.featured), [posts]);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const handlePostClick = (post: Post) => {
    navigate(`/hub/${post.categorySlug}/${post.slug}`);
    window.scrollTo(0, 0);
  };

  if (selectedPost) {
    return (
      <PostDetail 
        post={selectedPost} 
        onBack={() => navigate('/hub')} 
        lang={lang}
        data={data}
      />
    );
  }

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Hero Header Section */}
      <header className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden mb-20">
        <div className="absolute inset-0 z-0">
          <ImageWithSkeleton 
            src="https://picsum.photos/seed/iec-hub/1920/1080" 
            alt="Information Hub Header" 
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-iec-accent/80 backdrop-blur-[2px]" />
        </div>
        
        <div className="container-custom relative z-10 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6">
              {lang === 'vi' ? 'Trạm Thông Tin' : 'Information Hub'}
            </h1>
            <p className="text-xl text-white/70 font-medium max-w-2xl mx-auto leading-relaxed">
              {lang === 'vi' 
                ? 'Nơi hội tụ tri thức, xu hướng công nghệ và những phân tích chuyên sâu từ hệ sinh thái đổi mới sáng tạo IEC.'
                : 'Where knowledge, technology trends, and in-depth analysis from the IEC innovation ecosystem converge.'}
            </p>
          </motion.div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6">
        {/* Category Filter */}
        <nav className="mb-16">
          <div className="flex gap-10 overflow-x-auto scrollbar-hide pb-2 border-b border-gray-100">
            <button
              onClick={() => setActiveCategory('all')}
              className={`relative pb-4 text-sm font-bold transition-all whitespace-nowrap tracking-tight ${
                activeCategory === 'all' 
                ? 'text-iec-primary' 
                : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {lang === 'vi' ? 'Tất cả' : 'All'}
              {activeCategory === 'all' && (
                <motion.div 
                  layoutId="activeCategory"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-iec-primary"
                />
              )}
            </button>
            {categories.filter(c => c.type === 'post').map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative pb-4 text-sm font-bold transition-all whitespace-nowrap tracking-tight ${
                  activeCategory === cat.id 
                  ? 'text-iec-primary' 
                  : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {cat.name[lang]}
                {activeCategory === cat.id && (
                  <motion.div 
                    layoutId="activeCategory"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-iec-primary"
                  />
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Featured Post */}
        {activeCategory === 'all' && featuredPost && (
          <section className="mb-24 group cursor-pointer" onClick={() => handlePostClick(featuredPost as any)}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7">
                <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <ImageWithSkeleton 
                    src={featuredPost.image} 
                    alt={featuredPost.title[lang]}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="flex items-center gap-3 text-[10px] font-bold text-iec-primary uppercase tracking-[0.2em] mb-6">
                  <span className="bg-iec-primary/10 px-3 py-1 rounded-full">
                    {categories.find(c => c.id === featuredPost.categoryId)?.name[lang]}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-400">{featuredPost.date}</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-iec-accent mb-8 leading-[1.1] tracking-tight group-hover:text-iec-primary transition-colors">
                  {featuredPost.title[lang]}
                </h2>
                <p className="text-lg text-gray-500 mb-10 leading-relaxed line-clamp-3 font-medium">
                  {featuredPost.excerpt[lang]}
                </p>
                <div className="flex items-center text-iec-primary font-bold text-sm gap-2 group-hover:gap-3 transition-all">
                  {lang === 'vi' ? 'Đọc bài viết nổi bật' : 'Read featured post'} <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
            {paginatedPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={{
                  ...post,
                  categoryLabel: categories.find(c => c.id === post.categoryId)?.name[lang] || ''
                }} 
                lang={lang}
                onClick={() => handlePostClick(post as any)} 
              />
            ))}
        </div>

        {/* Empty State */}
        {displayPosts.length === 0 && (
          <div className="text-center py-40">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300">
              <Info size={48} />
            </div>
            <h3 className="text-2xl font-bold text-iec-accent mb-3 tracking-tight">Không tìm thấy bài viết</h3>
            <p className="text-gray-400 font-medium">Thử chọn danh mục khác để khám phá thêm nội dung.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-32 flex justify-center items-center gap-4">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-4 rounded-xl bg-gray-50 text-gray-400 hover:text-iec-primary disabled:opacity-30 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-12 h-12 rounded-xl text-sm font-bold transition-all ${
                    currentPage === i + 1 
                    ? 'bg-iec-primary text-white shadow-lg shadow-iec-primary/20' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-4 rounded-xl bg-gray-50 text-gray-400 hover:text-iec-primary disabled:opacity-30 transition-all"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Modern Newsletter CTA */}
      <section className="mt-48 bg-gray-50 py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="bg-white rounded-[3.5rem] p-12 md:p-24 shadow-2xl shadow-black/5 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-iec-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="lg:w-1/2 relative z-10 text-center mx-auto">
              <div className="inline-flex items-center gap-2 text-iec-primary font-bold text-xs uppercase tracking-[0.3em] mb-6">
                <Info size={16} />
                <span>Đăng ký bản tin</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-iec-accent mb-8 leading-tight tracking-tight">
                <span className="block whitespace-nowrap">Tri thức mới nhất</span>
                <span className="block text-iec-primary whitespace-nowrap">trong tầm tay bạn</span>
              </h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-md mx-auto">
                Nhận những phân tích thị trường, báo cáo hệ sinh thái và thông tin sự kiện độc quyền hàng tuần từ IEC.
              </p>
            </div>

            <div className="lg:w-1/2 w-full relative z-10">
              <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Địa chỉ email của bạn"
                  className="flex-grow bg-gray-50 border-none rounded-2xl px-8 py-6 text-iec-accent placeholder:text-gray-400 focus:ring-2 focus:ring-iec-primary/20 transition-all outline-none font-medium"
                />
                <button className="bg-iec-primary text-white font-bold py-6 px-12 rounded-2xl hover:shadow-2xl hover:shadow-iec-primary/30 transition-all whitespace-nowrap">
                  Đăng ký ngay
                </button>
              </form>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6 text-center sm:text-left">
                * Chúng tôi cam kết bảo mật thông tin của bạn.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
