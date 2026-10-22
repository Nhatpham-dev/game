import { SkillDefinition } from '../types/game';

export const SKILL_SECTIONS = [
  { id: 'all', name: 'Tất cả 100 kỹ năng' },
  { id: 'section_1', name: 'I. Sở thích (1-30)' },
  { id: 'section_2', name: 'II. Kỹ năng chuyên môn & Hard Skills (31-65)' },
  { id: 'section_3', name: 'III. Năng lực & Kỹ năng mềm (66-100)' },
] as const;

export const ONE_HUNDRED_SKILLS: SkillDefinition[] = [
  // ==========================================
  // I. Sở thích (Interests & Hobbies) – 30 mục
  // ==========================================
  // Sáng tạo & Nghệ thuật (1-7)
  {
    id: 'skill_1',
    orderNumber: 1,
    name: 'Hội họa và minh họa kỹ thuật số (Digital Art)',
    section: 'I. Sở thích',
    subgroup: 'Sáng tạo & Nghệ thuật',
    icon: '🎨',
    acceptedWorkplaceTypes: ['workshop', 'tech']
  },
  {
    id: 'skill_2',
    orderNumber: 2,
    name: 'Chụp ảnh (Nhiếp ảnh đường phố, phong cảnh, chân dung)',
    section: 'I. Sở thích',
    subgroup: 'Sáng tạo & Nghệ thuật',
    icon: '📷',
    acceptedWorkplaceTypes: ['park', 'restaurant', 'market']
  },
  {
    id: 'skill_3',
    orderNumber: 3,
    name: 'Chơi nhạc cụ (Guitar, Piano, Ukulele)',
    section: 'I. Sở thích',
    subgroup: 'Sáng tạo & Nghệ thuật',
    icon: '🎸',
    acceptedWorkplaceTypes: ['restaurant', 'park']
  },
  {
    id: 'skill_4',
    orderNumber: 4,
    name: 'Sáng tác nhạc hoặc viết lyrics',
    section: 'I. Sở thích',
    subgroup: 'Sáng tạo & Nghệ thuật',
    icon: '🎵',
    acceptedWorkplaceTypes: ['restaurant', 'park', 'tech']
  },
  {
    id: 'skill_5',
    orderNumber: 5,
    name: 'Viết lách (Viết blog, sáng tác truyện, làm thơ)',
    section: 'I. Sở thích',
    subgroup: 'Sáng tạo & Nghệ thuật',
    icon: '✍️',
    acceptedWorkplaceTypes: ['tech', 'market']
  },
  {
    id: 'skill_6',
    orderNumber: 6,
    name: 'Thiết kế đồ họa và sáng tạo nội dung video (Vlog, TikTok)',
    section: 'I. Sở thích',
    subgroup: 'Sáng tạo & Nghệ thuật',
    icon: '🎬',
    acceptedWorkplaceTypes: ['tech', 'market']
  },
  {
    id: 'skill_7',
    orderNumber: 7,
    name: 'Làm đồ thủ công (Handmade, đan móc, làm gốm)',
    section: 'I. Sở thích',
    subgroup: 'Sáng tạo & Nghệ thuật',
    icon: '🧶',
    acceptedWorkplaceTypes: ['workshop', 'market']
  },

  // Vận động & Thể thao (8-14)
  {
    id: 'skill_8',
    orderNumber: 8,
    name: 'Chạy bộ (Marathon, Jogging)',
    section: 'I. Sở thích',
    subgroup: 'Vận động & Thể thao',
    icon: '🏃',
    acceptedWorkplaceTypes: ['park', 'hospital']
  },
  {
    id: 'skill_9',
    orderNumber: 9,
    name: 'Tập Gym / Fitness / Bodybuilding',
    section: 'I. Sở thích',
    subgroup: 'Vận động & Thể thao',
    icon: '🏋️',
    acceptedWorkplaceTypes: ['park', 'workshop']
  },
  {
    id: 'skill_10',
    orderNumber: 10,
    name: 'Yoga và Meditation (Thiền)',
    section: 'I. Sở thích',
    subgroup: 'Vận động & Thể thao',
    icon: '🧘',
    acceptedWorkplaceTypes: ['hospital', 'park']
  },
  {
    id: 'skill_11',
    orderNumber: 11,
    name: 'Bơi lội',
    section: 'I. Sở thích',
    subgroup: 'Vận động & Thể thao',
    icon: '🏊',
    acceptedWorkplaceTypes: ['park', 'farm']
  },
  {
    id: 'skill_12',
    orderNumber: 12,
    name: 'Leo núi / Treking / Đạp xe đường dài',
    section: 'I. Sở thích',
    subgroup: 'Vận động & Thể thao',
    icon: '🚴',
    acceptedWorkplaceTypes: ['park', 'farm']
  },
  {
    id: 'skill_13',
    orderNumber: 13,
    name: 'Các môn thể thao đồng đội (Bóng đá, bóng rổ, cầu lông)',
    section: 'I. Sở thích',
    subgroup: 'Vận động & Thể thao',
    icon: '⚽',
    acceptedWorkplaceTypes: ['park']
  },
  {
    id: 'skill_14',
    orderNumber: 14,
    name: 'Võ thuật (BJJ, Taekwondo, Boxing)',
    section: 'I. Sở thích',
    subgroup: 'Vận động & Thể thao',
    icon: '🥊',
    acceptedWorkplaceTypes: ['park', 'market']
  },

  // Trí tuệ & Khám phá (15-20)
  {
    id: 'skill_15',
    orderNumber: 15,
    name: 'Đọc sách (Sách kinh tế, văn học, tâm lý, khoa học)',
    section: 'I. Sở thích',
    subgroup: 'Trí tuệ & Khám phá',
    icon: '📚',
    acceptedWorkplaceTypes: ['tech', 'hospital', 'bank']
  },
  {
    id: 'skill_16',
    orderNumber: 16,
    name: 'Chơi cờ (Cờ vua, cờ tướng, cờ go)',
    section: 'I. Sở thích',
    subgroup: 'Trí tuệ & Khám phá',
    icon: '♟️',
    acceptedWorkplaceTypes: ['bank', 'tech', 'park']
  },
  {
    id: 'skill_17',
    orderNumber: 17,
    name: 'Giải đố (Sudoku, Rubik, crossword)',
    section: 'I. Sở thích',
    subgroup: 'Trí tuệ & Khám phá',
    icon: '🧩',
    acceptedWorkplaceTypes: ['tech', 'bank']
  },
  {
    id: 'skill_18',
    orderNumber: 18,
    name: 'Học ngoại ngữ mới',
    section: 'I. Sở thích',
    subgroup: 'Trí tuệ & Khám phá',
    icon: '🌐',
    acceptedWorkplaceTypes: ['market', 'tech', 'restaurant']
  },
  {
    id: 'skill_19',
    orderNumber: 19,
    name: 'Du lịch trải nghiệm và khám phá văn hóa',
    section: 'I. Sở thích',
    subgroup: 'Trí tuệ & Khám phá',
    icon: '✈️',
    acceptedWorkplaceTypes: ['restaurant', 'market', 'park']
  },
  {
    id: 'skill_20',
    orderNumber: 20,
    name: 'Tìm hiểu lịch sử và thiên văn học',
    section: 'I. Sở thích',
    subgroup: 'Trí tuệ & Khám phá',
    icon: '🔭',
    acceptedWorkplaceTypes: ['tech', 'park']
  },

  // LIFESTYLE & Giải trí (21-30)
  {
    id: 'skill_21',
    orderNumber: 21,
    name: 'Nấu ăn và làm bánh (Culinary art)',
    section: 'I. Sở thích',
    subgroup: 'Lifestyle & Giải trí',
    icon: '🍳',
    acceptedWorkplaceTypes: ['restaurant', 'market']
  },
  {
    id: 'skill_22',
    orderNumber: 22,
    name: 'Pha chế đồ uống (Thử nghiệm cà phê, pha cocktail)',
    section: 'I. Sở thích',
    subgroup: 'Lifestyle & Giải trí',
    icon: '☕',
    acceptedWorkplaceTypes: ['restaurant']
  },
  {
    id: 'skill_23',
    orderNumber: 23,
    name: 'Chăm sóc cây cảnh / Làm vườn (Bonsai, Terrarium)',
    section: 'I. Sở thích',
    subgroup: 'Lifestyle & Giải trí',
    icon: '🪴',
    acceptedWorkplaceTypes: ['farm', 'park']
  },
  {
    id: 'skill_24',
    orderNumber: 24,
    name: 'Thưởng thức và đánh giá phim ảnh (Cinephile)',
    section: 'I. Sở thích',
    subgroup: 'Lifestyle & Giải trí',
    icon: '🍿',
    acceptedWorkplaceTypes: ['restaurant', 'tech']
  },
  {
    id: 'skill_25',
    orderNumber: 25,
    name: 'Chơi Board game (Chó sói, Catan, Uno)',
    section: 'I. Sở thích',
    subgroup: 'Lifestyle & Giải trí',
    icon: '🎲',
    acceptedWorkplaceTypes: ['restaurant', 'park', 'market']
  },
  {
    id: 'skill_26',
    orderNumber: 26,
    name: 'Chơi Game chiến thuật / Esport',
    section: 'I. Sở thích',
    subgroup: 'Lifestyle & Giải trí',
    icon: '🎮',
    acceptedWorkplaceTypes: ['tech']
  },
  {
    id: 'skill_27',
    orderNumber: 27,
    name: 'Sưu tầm (Tem, tiền xu, mô hình, đĩa than)',
    section: 'I. Sở thích',
    subgroup: 'Lifestyle & Giải trí',
    icon: '🪙',
    acceptedWorkplaceTypes: ['market', 'bank']
  },
  {
    id: 'skill_28',
    orderNumber: 28,
    name: 'Tham gia hoạt động tình nguyện / Tác động xã hội',
    section: 'I. Sở thích',
    subgroup: 'Lifestyle & Giải trí',
    icon: '🤝',
    acceptedWorkplaceTypes: ['hospital', 'park']
  },
  {
    id: 'skill_29',
    orderNumber: 29,
    name: 'Nghe Podcast và Audiobooks',
    section: 'I. Sở thích',
    subgroup: 'Lifestyle & Giải trí',
    icon: '🎧',
    acceptedWorkplaceTypes: ['tech', 'hospital']
  },
  {
    id: 'skill_30',
    orderNumber: 30,
    name: 'Tối ưu hóa không gian sống (Decor nội thất)',
    section: 'I. Sở thích',
    subgroup: 'Lifestyle & Giải trí',
    icon: '🛋️',
    acceptedWorkplaceTypes: ['workshop', 'market']
  },

  // ==========================================
  // II. Kỹ năng chuyên môn & Kỹ thuật (Hard Skills) – 35 mục
  // ==========================================
  // Công nghệ & Công nghệ thông tin (31-37)
  {
    id: 'skill_31',
    orderNumber: 31,
    name: 'Lập trình máy tính (Python, JavaScript, C++, Java)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Công nghệ & CNTT',
    icon: '💻',
    acceptedWorkplaceTypes: ['tech']
  },
  {
    id: 'skill_32',
    orderNumber: 32,
    name: 'Phát triển Web (Frontend / Backend / Fullstack)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Công nghệ & CNTT',
    icon: '🌐',
    acceptedWorkplaceTypes: ['tech']
  },
  {
    id: 'skill_33',
    orderNumber: 33,
    name: 'Quản trị cơ sở dữ liệu (SQL, NoSQL)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Công nghệ & CNTT',
    icon: '🗄️',
    acceptedWorkplaceTypes: ['tech', 'bank']
  },
  {
    id: 'skill_34',
    orderNumber: 34,
    name: 'Phân tích dữ liệu (Data Analysis: Excel nâng cao, Power BI, Tableau)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Công nghệ & CNTT',
    icon: '📊',
    acceptedWorkplaceTypes: ['tech', 'bank']
  },
  {
    id: 'skill_35',
    orderNumber: 35,
    name: 'Học máy và Trí tuệ nhân tạo (Machine Learning / AI Prompts)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Công nghệ & CNTT',
    icon: '🤖',
    acceptedWorkplaceTypes: ['tech']
  },
  {
    id: 'skill_36',
    orderNumber: 36,
    name: 'Bảo mật thông tin và An ninh mạng (Cybersecurity)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Công nghệ & CNTT',
    icon: '🔒',
    acceptedWorkplaceTypes: ['tech', 'bank']
  },
  {
    id: 'skill_37',
    orderNumber: 37,
    name: 'Điện toán đám mây (AWS, Google Cloud, Azure)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Công nghệ & CNTT',
    icon: '☁️',
    acceptedWorkplaceTypes: ['tech']
  },

  // Kinh doanh, Marketing & Tài chính (38-45)
  {
    id: 'skill_38',
    orderNumber: 38,
    name: 'Tối ưu hóa công cụ tìm kiếm (SEO) và SEM',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Kinh doanh, Marketing & Tài chính',
    icon: '📈',
    acceptedWorkplaceTypes: ['tech', 'market']
  },
  {
    id: 'skill_39',
    orderNumber: 39,
    name: 'Quản trị truyền thông xã hội (Social Media Management)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Kinh doanh, Marketing & Tài chính',
    icon: '📱',
    acceptedWorkplaceTypes: ['market', 'restaurant', 'tech']
  },
  {
    id: 'skill_40',
    orderNumber: 40,
    name: 'Sáng tạo nội dung & Copywriting',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Kinh doanh, Marketing & Tài chính',
    icon: '📝',
    acceptedWorkplaceTypes: ['market', 'tech']
  },
  {
    id: 'skill_41',
    orderNumber: 41,
    name: 'Lập kế hoạch và triển khai chiến dịch Marketing',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Kinh doanh, Marketing & Tài chính',
    icon: '🎯',
    acceptedWorkplaceTypes: ['market', 'tech']
  },
  {
    id: 'skill_42',
    orderNumber: 42,
    name: 'Quản lý tài chính cá nhân & Đổi mới đầu tư',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Kinh doanh, Marketing & Tài chính',
    icon: '💰',
    acceptedWorkplaceTypes: ['bank', 'market']
  },
  {
    id: 'skill_43',
    orderNumber: 43,
    name: 'Phân tích báo cáo tài chính doanh nghiệp',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Kinh doanh, Marketing & Tài chính',
    icon: '📑',
    acceptedWorkplaceTypes: ['bank']
  },
  {
    id: 'skill_44',
    orderNumber: 44,
    name: 'Nghiên cứu thị trường (Market Research)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Kinh doanh, Marketing & Tài chính',
    icon: '🔍',
    acceptedWorkplaceTypes: ['market', 'bank']
  },
  {
    id: 'skill_45',
    orderNumber: 45,
    name: 'Kỹ năng bán hàng (Sales) và đàm phán thương mại',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Kinh doanh, Marketing & Tài chính',
    icon: '🤝',
    acceptedWorkplaceTypes: ['market', 'bank']
  },

  // Thiết kế & Sản xuất (46-50)
  {
    id: 'skill_46',
    orderNumber: 46,
    name: 'Thiết kế giao diện & trải nghiệm người dùng (UI/UX Design)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Thiết kế & Sản xuất',
    icon: '🖥️',
    acceptedWorkplaceTypes: ['tech']
  },
  {
    id: 'skill_47',
    orderNumber: 47,
    name: 'Sử dụng công cụ thiết kế (Adobe Photoshop, Illustrator, Canva)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Thiết kế & Sản xuất',
    icon: '🖌️',
    acceptedWorkplaceTypes: ['workshop', 'tech', 'market']
  },
  {
    id: 'skill_48',
    orderNumber: 48,
    name: 'Dựng phim và biên tập video (Premiere, CapCut, DaVinci Resolve)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Thiết kế & Sản xuất',
    icon: '🎞️',
    acceptedWorkplaceTypes: ['tech', 'restaurant']
  },
  {
    id: 'skill_49',
    orderNumber: 49,
    name: 'Thiết kế mô hình 3D (Blender, AutoCAD, SolidWorks)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Thiết kế & Sản xuất',
    icon: '📐',
    acceptedWorkplaceTypes: ['workshop', 'tech']
  },
  {
    id: 'skill_50',
    orderNumber: 50,
    name: 'Biên tập và dàn trang sách/tạp chí (InDesign)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Thiết kế & Sản xuất',
    icon: '📰',
    acceptedWorkplaceTypes: ['workshop', 'tech']
  },

  // Quản lý & Vận hành (51-55)
  {
    id: 'skill_51',
    orderNumber: 51,
    name: 'Quản lý dự án (Agile, Scrum, Waterfall)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Quản lý & Vận hành',
    icon: '📋',
    acceptedWorkplaceTypes: ['tech', 'workshop', 'bank']
  },
  {
    id: 'skill_52',
    orderNumber: 52,
    name: 'Quản trị chuỗi cung ứng (Supply Chain) và Logistics',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Quản lý & Vận hành',
    icon: '🚚',
    acceptedWorkplaceTypes: ['market', 'farm', 'workshop']
  },
  {
    id: 'skill_53',
    orderNumber: 53,
    name: 'Quản trị vận hành doanh nghiệp (Operations Management)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Quản lý & Vận hành',
    icon: '⚙️',
    acceptedWorkplaceTypes: ['bank', 'market', 'workshop']
  },
  {
    id: 'skill_54',
    orderNumber: 54,
    name: 'Kiểm soát chất lượng (Quality Assurance/Control)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Quản lý & Vận hành',
    icon: '✅',
    acceptedWorkplaceTypes: ['workshop', 'hospital', 'farm']
  },
  {
    id: 'skill_55',
    orderNumber: 55,
    name: 'Kế toán & Kiểm toán cơ bản',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Quản lý & Vận hành',
    icon: '🧮',
    acceptedWorkplaceTypes: ['bank', 'market']
  },

  // Ngôn ngữ & Nghiên cứu (56-65)
  {
    id: 'skill_56',
    orderNumber: 56,
    name: 'Soạn thảo văn bản và hợp đồng pháp lý',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Ngôn ngữ & Nghiên cứu',
    icon: '📜',
    acceptedWorkplaceTypes: ['bank', 'tech']
  },
  {
    id: 'skill_57',
    orderNumber: 57,
    name: 'Biên - phiên dịch song ngữ',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Ngôn ngữ & Nghiên cứu',
    icon: '🗣️',
    acceptedWorkplaceTypes: ['market', 'hospital', 'restaurant']
  },
  {
    id: 'skill_58',
    orderNumber: 58,
    name: 'Ngoại ngữ (Tiếng Anh, Tiếng Trung, Tiếng Nhật, Tiếng Hàn, v.v.)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Ngôn ngữ & Nghiên cứu',
    icon: '🌏',
    acceptedWorkplaceTypes: ['market', 'restaurant', 'tech']
  },
  {
    id: 'skill_59',
    orderNumber: 59,
    name: 'Trích xuất và xử lý tài liệu tự động (OCR Data Processing)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Ngôn ngữ & Nghiên cứu',
    icon: '📄',
    acceptedWorkplaceTypes: ['tech', 'bank']
  },
  {
    id: 'skill_60',
    orderNumber: 60,
    name: 'Phương pháp nghiên cứu định lượng & định tính',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Ngôn ngữ & Nghiên cứu',
    icon: '🔬',
    acceptedWorkplaceTypes: ['hospital', 'tech']
  },
  {
    id: 'skill_61',
    orderNumber: 61,
    name: 'Tính toán carbon & Kế toán môi trường (Carbon Accounting)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Ngôn ngữ & Nghiên cứu',
    icon: '🌱',
    acceptedWorkplaceTypes: ['farm', 'bank']
  },
  {
    id: 'skill_62',
    orderNumber: 62,
    name: 'Đánh giá tuân thủ quy định pháp lý (Compliance Management)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Ngôn ngữ & Nghiên cứu',
    icon: '⚖️',
    acceptedWorkplaceTypes: ['bank', 'hospital']
  },
  {
    id: 'skill_63',
    orderNumber: 63,
    name: 'Thống kê và xác suất ứng dụng',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Ngôn ngữ & Nghiên cứu',
    icon: '📉',
    acceptedWorkplaceTypes: ['bank', 'tech']
  },
  {
    id: 'skill_64',
    orderNumber: 64,
    name: 'Kỹ năng gõ bàn phím tốc độ cao (Touch Typing)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Ngôn ngữ & Nghiên cứu',
    icon: '⌨️',
    acceptedWorkplaceTypes: ['tech', 'bank']
  },
  {
    id: 'skill_65',
    orderNumber: 65,
    name: 'Quản trị hệ thống ERP (SAP, Odoo, Oracle)',
    section: 'II. Kỹ năng chuyên môn',
    subgroup: 'Ngôn ngữ & Nghiên cứu',
    icon: '🏢',
    acceptedWorkplaceTypes: ['tech', 'bank', 'workshop']
  },

  // ==========================================
  // III. Năng lực & Kỹ năng mềm (Soft Skills & Core Competencies) – 35 mục
  // ==========================================
  // Giao tiếp & Tương tác cá nhân (66-72)
  {
    id: 'skill_66',
    orderNumber: 66,
    name: 'Thuyết trình và phát biểu trước công chúng (Public Speaking)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Giao tiếp & Tương tác cá nhân',
    icon: '🎙️',
    acceptedWorkplaceTypes: ['park', 'market', 'tech']
  },
  {
    id: 'skill_67',
    orderNumber: 67,
    name: 'Lắng nghe chủ động (Active Listening)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Giao tiếp & Tương tác cá nhân',
    icon: '👂',
    acceptedWorkplaceTypes: ['hospital', 'restaurant']
  },
  {
    id: 'skill_68',
    orderNumber: 68,
    name: 'Đàm phán và thuyết phục (Negotiation)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Giao tiếp & Tương tác cá nhân',
    icon: '🤝',
    acceptedWorkplaceTypes: ['market', 'bank']
  },
  {
    id: 'skill_69',
    orderNumber: 69,
    name: 'Giao tiếp liên văn hóa (Cross-cultural Communication)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Giao tiếp & Tương tác cá nhân',
    icon: '🗺️',
    acceptedWorkplaceTypes: ['market', 'restaurant', 'park']
  },
  {
    id: 'skill_70',
    orderNumber: 70,
    name: 'Xây dựng và mở rộng mối quan hệ (Networking)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Giao tiếp & Tương tác cá nhân',
    icon: '🌐',
    acceptedWorkplaceTypes: ['market', 'restaurant', 'bank']
  },
  {
    id: 'skill_71',
    orderNumber: 71,
    name: 'Trí tuệ cảm xúc (Emotional Intelligence - EQ)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Giao tiếp & Tương tác cá nhân',
    icon: '❤️',
    acceptedWorkplaceTypes: ['hospital', 'restaurant']
  },
  {
    id: 'skill_72',
    orderNumber: 72,
    name: 'Giải quyết xung đột (Conflict Resolution)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Giao tiếp & Tương tác cá nhân',
    icon: '🕊️',
    acceptedWorkplaceTypes: ['park', 'hospital', 'market']
  },

  // Tư duy & Giải quyết vấn đề (73-79)
  {
    id: 'skill_73',
    orderNumber: 73,
    name: 'Tư duy phản biện (Critical Thinking)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Tư duy & Giải quyết vấn đề',
    icon: '💡',
    acceptedWorkplaceTypes: ['tech', 'bank']
  },
  {
    id: 'skill_74',
    orderNumber: 74,
    name: 'Tư duy logic và phân tích nguyên nhân gốc rễ',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Tư duy & Giải quyết vấn đề',
    icon: '🔍',
    acceptedWorkplaceTypes: ['tech', 'workshop', 'bank']
  },
  {
    id: 'skill_75',
    orderNumber: 75,
    name: 'Tư duy sáng tạo và phát kiến đổi mới (Innovation)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Tư duy & Giải quyết vấn đề',
    icon: '✨',
    acceptedWorkplaceTypes: ['tech', 'workshop']
  },
  {
    id: 'skill_76',
    orderNumber: 76,
    name: 'Tư duy hệ thống (Systems Thinking)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Tư duy & Giải quyết vấn đề',
    icon: '🔄',
    acceptedWorkplaceTypes: ['tech', 'bank', 'workshop']
  },
  {
    id: 'skill_77',
    orderNumber: 77,
    name: 'Tư duy thiết kế (Design Thinking)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Tư duy & Giải quyết vấn đề',
    icon: '🎨',
    acceptedWorkplaceTypes: ['tech', 'workshop']
  },
  {
    id: 'skill_78',
    orderNumber: 78,
    name: 'Ra quyết định dựa trên dữ liệu (Data-driven Decision Making)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Tư duy & Giải quyết vấn đề',
    icon: '📊',
    acceptedWorkplaceTypes: ['bank', 'tech']
  },
  {
    id: 'skill_79',
    orderNumber: 79,
    name: 'Khả năng thích ứng và linh hoạt (Adaptability)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Tư duy & Giải quyết vấn đề',
    icon: '🦎',
    acceptedWorkplaceTypes: ['farm', 'market', 'park', 'workshop']
  },

  // Lãnh đạo & Quản lý bản thân (80-86)
  {
    id: 'skill_80',
    orderNumber: 80,
    name: 'Lãnh đạo và truyền cảm hứng (Leadership)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Lãnh đạo & Quản lý bản thân',
    icon: '👑',
    acceptedWorkplaceTypes: ['tech', 'bank', 'park']
  },
  {
    id: 'skill_81',
    orderNumber: 81,
    name: 'Quản lý thời gian và sắp xếp thứ tự ưu tiên (Time Management)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Lãnh đạo & Quản lý bản thân',
    icon: '⏰',
    acceptedWorkplaceTypes: ['hospital', 'tech', 'bank']
  },
  {
    id: 'skill_82',
    orderNumber: 82,
    name: 'Tự học và tư duy phát triển (Growth Mindset)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Lãnh đạo & Quản lý bản thân',
    icon: '🌱',
    acceptedWorkplaceTypes: ['tech', 'hospital', 'workshop']
  },
  {
    id: 'skill_83',
    orderNumber: 83,
    name: 'Quản lý stress và giữ sức bền tinh thần (Resilience)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Lãnh đạo & Quản lý bản thân',
    icon: '🛡️',
    acceptedWorkplaceTypes: ['hospital', 'park']
  },
  {
    id: 'skill_84',
    orderNumber: 84,
    name: 'Làm việc nhóm và hợp tác (Teamwork & Collaboration)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Lãnh đạo & Quản lý bản thân',
    icon: '👥',
    acceptedWorkplaceTypes: ['restaurant', 'tech', 'workshop']
  },
  {
    id: 'skill_85',
    orderNumber: 85,
    name: 'Ủy quyền và quản lý công việc (Delegation)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Lãnh đạo & Quản lý bản thân',
    icon: '📌',
    acceptedWorkplaceTypes: ['bank', 'market']
  },
  {
    id: 'skill_86',
    orderNumber: 86,
    name: 'Tư duy làm chủ và trách nhiệm (Accountability)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Lãnh đạo & Quản lý bản thân',
    icon: '🎯',
    acceptedWorkplaceTypes: ['bank', 'workshop', 'farm']
  },

  // Năng lực làm việc & Hiệu suất (87-100)
  {
    id: 'skill_87',
    orderNumber: 87,
    name: 'Chú ý đến chi tiết (Detail-oriented)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Năng lực làm việc & Hiệu suất',
    icon: '🔍',
    acceptedWorkplaceTypes: ['hospital', 'tech', 'bank', 'workshop']
  },
  {
    id: 'skill_88',
    orderNumber: 88,
    name: 'Khả năng chịu áp lực cao',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Năng lực làm việc & Hiệu suất',
    icon: '⚡',
    acceptedWorkplaceTypes: ['hospital', 'restaurant', 'bank']
  },
  {
    id: 'skill_89',
    orderNumber: 89,
    name: 'Làm việc độc lập',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Năng lực làm việc & Hiệu suất',
    icon: '👤',
    acceptedWorkplaceTypes: ['tech', 'farm', 'workshop']
  },
  {
    id: 'skill_90',
    orderNumber: 90,
    name: 'Kỹ năng làm việc từ xa / kết nối hybrid',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Năng lực làm việc & Hiệu suất',
    icon: '💻',
    acceptedWorkplaceTypes: ['tech']
  },
  {
    id: 'skill_91',
    orderNumber: 91,
    name: 'Khả năng tổng hợp và đơn giản hóa thông tin phức tạp',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Năng lực làm việc & Hiệu suất',
    icon: '📑',
    acceptedWorkplaceTypes: ['tech', 'bank', 'hospital']
  },
  {
    id: 'skill_92',
    orderNumber: 92,
    name: 'Kỹ năng tự phản tư (Self-reflection)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Năng lực làm việc & Hiệu suất',
    icon: '🪞',
    acceptedWorkplaceTypes: ['hospital', 'park']
  },
  {
    id: 'skill_93',
    orderNumber: 93,
    name: 'Định hướng dịch vụ và chăm sóc khách hàng (Customer Orientation)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Năng lực làm việc & Hiệu suất',
    icon: '🤝',
    acceptedWorkplaceTypes: ['restaurant', 'market', 'hospital']
  },
  {
    id: 'skill_94',
    orderNumber: 94,
    name: 'Quản lý rủi ro (Risk Management)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Năng lực làm việc & Hiệu suất',
    icon: '⚠️',
    acceptedWorkplaceTypes: ['bank', 'hospital']
  },
  {
    id: 'skill_95',
    orderNumber: 95,
    name: 'Kỹ năng Mentoring và Coaching (Hướng dẫn, đào tạo người khác)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Năng lực làm việc & Hiệu suất',
    icon: '🎓',
    acceptedWorkplaceTypes: ['park', 'tech', 'hospital']
  },
  {
    id: 'skill_96',
    orderNumber: 96,
    name: 'Khả năng tổ chức và lập kế hoạch chiến lược',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Năng lực làm việc & Hiệu suất',
    icon: '🗺️',
    acceptedWorkplaceTypes: ['bank', 'tech']
  },
  {
    id: 'skill_97',
    orderNumber: 97,
    name: 'Sự nhạy bén về kinh doanh (Business Acumen)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Năng lực làm việc & Hiệu suất',
    icon: '💼',
    acceptedWorkplaceTypes: ['market', 'bank']
  },
  {
    id: 'skill_98',
    orderNumber: 98,
    name: 'Khả năng bao quát vấn đề (Big-picture Thinking)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Năng lực làm việc & Hiệu suất',
    icon: '🌐',
    acceptedWorkplaceTypes: ['bank', 'tech']
  },
  {
    id: 'skill_99',
    orderNumber: 99,
    name: 'Kiên trì và bền bỉ đuổi theo mục tiêu (Grit)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Năng lực làm việc & Hiệu suất',
    icon: '🏔️',
    acceptedWorkplaceTypes: ['farm', 'workshop', 'tech', 'park']
  },
  {
    id: 'skill_100',
    orderNumber: 100,
    name: 'Đạo đức nghề nghiệp và sự trung thực (Integrity)',
    section: 'III. Kỹ năng mềm',
    subgroup: 'Năng lực làm việc & Hiệu suất',
    icon: '💎',
    acceptedWorkplaceTypes: ['bank', 'hospital', 'market', 'farm', 'workshop', 'tech', 'restaurant', 'park']
  }
];
