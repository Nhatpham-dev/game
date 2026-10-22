import { BusinessSector, SkillDefinition, StoreProduct } from '../types/game';

// =========================================================================
// GIAN HÀNG ĂN SINH TỒN TRUNG TÂM (CHỈ GỒM 3 MÓN THỰC PHẨM DUY NHẤT ĐỂ SỐNG CÒN)
// Cơm: 25.000₫ (Độ no: +30%, Thể lực: +35%)
// Nước: 10.000₫ (Độ no: +15%, Thể lực: +20%)
// Thịt: 30.000₫ (Độ no: +45%, Thể lực: +50%)
// TẤT CẢ ĐỀU PHẢI MUA Ở ĐÂY - KHÔNG THỂ MUA TỪ BÊN KHÁC ĐỂ TĂNG ĐỘ NO VÀ THỂ LỰC!
// =========================================================================
export const CENTRAL_FOOD_ITEMS: StoreProduct[] = [
  {
    id: 'central_rice',
    name: 'Cơm Trắng Nóng Hổi',
    icon: '🍚',
    price: 25000,
    description: 'Bát cơm trắng nóng hổi, dẻo thơm chắc dạ giúp phục hồi thể lực và độ no.',
    hungerRestore: 30, // +30% độ no (theo đúng yêu cầu)
    energyRestore: 35, // +35% thể lực (theo đúng yêu cầu)
    comfortRestore: 10
  },
  {
    id: 'central_water',
    name: 'Nước Khoáng Tinh Khiết',
    icon: '💧',
    price: 10000,
    description: 'Chai nước khoáng thanh mát tinh khiết giải khát cấp tốc, hồi phục sinh lực.',
    hungerRestore: 15, // +15% độ no (theo đúng yêu cầu)
    energyRestore: 20, // +20% thể lực (theo đúng yêu cầu)
    comfortRestore: 5
  },
  {
    id: 'central_meat',
    name: 'Thịt Nướng Đậm Đà',
    icon: '🥩',
    price: 30000,
    description: 'Đĩa thịt nướng thơm lừng giàu đạm, tiếp thêm nguồn năng lượng dồi dào nhất.',
    hungerRestore: 45, // +45% độ no (theo đúng yêu cầu)
    energyRestore: 50, // +50% thể lực (theo đúng yêu cầu)
    comfortRestore: 15
  }
];

// =========================================================================
// 10 LĨNH VỰC KINH DOANH CHO CỬA HÀNG NGƯỜI CHƠI (ĐÃ TĂNG NHIỀU SẢN PHẨM / DỊCH VỤ)
// LƯU Ý: Sản phẩm ở gian hàng người chơi KHÔNG TĂNG độ no và thể lực
// mà phục vụ phục hồi ĐỘ THOẢI MÁI (Tinh thần) và tạo doanh thu kinh doanh!
// =========================================================================
export const BUSINESS_SECTORS: BusinessSector[] = [
  {
    id: 'culinary_food',
    name: 'Nhà Hàng & Ẩm Thực Đặc Sắc',
    category: 'culinary',
    icon: '🍲',
    color: '#7C2D12',
    roofColor: '#EA580C',
    description: 'Kinh doanh quán ăn, phục vụ những món ngon ấm lòng và trải nghiệm bàn ăn gia đình.',
    defaultProducts: [
      {
        id: 'p_food_1',
        name: 'Mâm Cơm Canh Đặc Biệt',
        icon: '🍲',
        price: 35000,
        description: 'Món ăn gia đình ấm áp, gia vị hài hòa giúp xoa dịu mọi muộn phiền.',
        comfortRestore: 60
      },
      {
        id: 'p_food_2',
        name: 'Món Tráng Miệng Thượng Hạng',
        icon: '🍮',
        price: 20000,
        description: 'Hương vị ngọt ngào thanh tao mang lại nụ cười sảng khoái.',
        comfortRestore: 40
      },
      {
        id: 'p_food_3',
        name: 'Set Tiệc Đoàn Viên Thân Mật',
        icon: '🍱',
        price: 65000,
        description: 'Bữa tiệc thịnh soạn gắn kết tình bạn, nâng cao tinh thần trọn vẹn.',
        comfortRestore: 85
      },
      {
        id: 'p_food_4',
        name: 'Lẩu Gia Đình Ấm Cúng',
        icon: '🥘',
        price: 85000,
        description: 'Nồi lẩu bốc khói nghi ngút cho buổi sum họp đầm ấm khó quên.',
        comfortRestore: 95
      },
      {
        id: 'p_food_5',
        name: 'Đĩa Hoa Quả Ướp Lạnh',
        icon: '🍉',
        price: 22000,
        description: 'Trái cây nhiệt đới tươi mát ngọt lành giải nhiệt tinh thần.',
        comfortRestore: 45
      },
      {
        id: 'p_food_6',
        name: 'Trà Thảo Mộc Cung Đình',
        icon: '🫖',
        price: 18000,
        description: 'Thức trà an thần từ thảo dược thiên nhiên thư thái tâm trí.',
        comfortRestore: 38
      }
    ]
  },
  {
    id: 'culinary_cafe',
    name: 'Tiệm Cà Phê & Đồ Uống Chill',
    category: 'culinary',
    icon: '☕',
    color: '#451A03',
    roofColor: '#D97706',
    description: 'Không gian thưởng thức cà phê thơm phức và các món trà giải nhiệt thư thái.',
    defaultProducts: [
      {
        id: 'p_cafe_1',
        name: 'Cà Phê Muối Đặc Biệt',
        icon: '☕',
        price: 25000,
        description: 'Vị đắng dịu hòa cùng lớp kem mặn béo ngậy, bừng tỉnh cảm hứng.',
        comfortRestore: 50
      },
      {
        id: 'p_cafe_2',
        name: 'Trà Sữa Trân Châu Hoàng Kim',
        icon: '🧋',
        price: 32000,
        description: 'Trà thơm đậm vị, trân châu dẻo dai làm bừng sáng tâm trạng.',
        comfortRestore: 55
      },
      {
        id: 'p_cafe_3',
        name: 'Nước Ép Trái Cây Nhiệt Đới',
        icon: '🍹',
        price: 28000,
        description: 'Vị chua ngọt thanh khiết xua tan mọi mỏi mệt trong tích tắc.',
        comfortRestore: 45
      },
      {
        id: 'p_cafe_4',
        name: 'Cà Phê Trứng Hà Nội',
        icon: '🧁',
        price: 35000,
        description: 'Lớp bọt trứng béo mịn ngậy mùi thơm kết hợp cà phê truyền thống.',
        comfortRestore: 60
      },
      {
        id: 'p_cafe_5',
        name: 'Bánh Croissant Bơ Nướng Giòn',
        icon: '🥐',
        price: 26000,
        description: 'Vỏ bánh ngàn lớp thơm lừng bơ Pháp ăn kèm cà phê cực đỉnh.',
        comfortRestore: 52
      },
      {
        id: 'p_cafe_6',
        name: 'Trà Đào Cam Sả Tươi Mát',
        icon: '🍑',
        price: 30000,
        description: 'Hương thơm tinh dầu sả cam và những lát đào giòn ngọt sảng khoái.',
        comfortRestore: 50
      }
    ]
  },
  {
    id: 'art_creative',
    name: 'Studio Mỹ Thuật & Tranh Sáng Tạo',
    category: 'art',
    icon: '🎨',
    color: '#312E81',
    roofColor: '#8B5CF6',
    description: 'Không gian nghệ thuật hội họa, sáng tạo mỹ thuật và giải tỏa căng thẳng.',
    defaultProducts: [
      {
        id: 'p_art_1',
        name: 'Trải Nghiệm Vẽ Tranh Thư Giãn',
        icon: '🎨',
        price: 40000,
        description: 'Hòa mình vào màu sắc tự do, chữa lành tâm hồn nghệ sĩ.',
        comfortRestore: 70
      },
      {
        id: 'p_art_2',
        name: 'Bộ Thiệp Mỹ Thuật Handmade',
        icon: '💌',
        price: 25000,
        description: 'Món quà tinh tế gửi gắm tình cảm và sự trân trọng.',
        comfortRestore: 45
      },
      {
        id: 'p_art_3',
        name: 'Chân Dung Ký Họa Độc Bản',
        icon: '🖼️',
        price: 60000,
        description: 'Bức họa chân dung lưu giữ khoảnh khắc rạng rỡ của bạn.',
        comfortRestore: 85
      },
      {
        id: 'p_art_4',
        name: 'Workshop Tự Nặn Gốm Sáng Tạo',
        icon: '🏺',
        price: 55000,
        description: 'Trải nghiệm bàn xoay gốm tạo nên chiếc cốc kỷ niệm của riêng bạn.',
        comfortRestore: 80
      },
      {
        id: 'p_art_5',
        name: 'Khung Tranh Canvas Phong Cảnh',
        icon: '🌄',
        price: 48000,
        description: 'Tranh sơn dầu phong cảnh thanh bình tô điểm tổ ấm thêm rực rỡ.',
        comfortRestore: 75
      },
      {
        id: 'p_art_6',
        name: 'Bộ Cọ & Màu Nước Nghệ Thuật',
        icon: '🖌️',
        price: 36000,
        description: 'Dụng cụ vẽ tranh cao cấp đánh thức niềm cảm hứng tiềm ẩn.',
        comfortRestore: 60
      }
    ]
  },
  {
    id: 'art_music',
    name: 'Phòng Thu & Âm Nhạc Acoustic',
    category: 'art',
    icon: '🎵',
    color: '#581C87',
    roofColor: '#A855F7',
    description: 'Sân khấu acoustic và phòng thu giai điệu êm dịu phục vụ cư dân.',
    defaultProducts: [
      {
        id: 'p_music_1',
        name: 'Buổi Hòa Tấu Guitar Thư Thái',
        icon: '🎸',
        price: 30000,
        description: 'Tiếng đàn mộc mạc ru êm tâm trí, xóa nhòa mọi căng thẳng.',
        comfortRestore: 65
      },
      {
        id: 'p_music_2',
        name: 'Đêm Nhạc Acoustic Cảm Xúc',
        icon: '🎤',
        price: 45000,
        description: 'Giọng ca truyền cảm đưa bạn vào hành trình âm thanh lãng mạn.',
        comfortRestore: 75
      },
      {
        id: 'p_music_3',
        name: 'Bản Nhạc Thu Âm Độc Quyền',
        icon: '💿',
        price: 55000,
        description: 'Tác phẩm âm nhạc được phối khí riêng mang lại niềm vui bất tận.',
        comfortRestore: 85
      },
      {
        id: 'p_music_4',
        name: 'Khóa Học Đàn Guitar Cấp Tốc',
        icon: '🎼',
        price: 65000,
        description: 'Học những hợp âm cơ bản để tự tin đàn hát những bài ca yêu thích.',
        comfortRestore: 80
      },
      {
        id: 'p_music_5',
        name: 'Vé Xem Hòa Nhạc Cuối Tuần',
        icon: '🎟️',
        price: 40000,
        description: 'Không gian ấm cúng ánh nến và âm vang du dương của dàn nhạc.',
        comfortRestore: 70
      },
      {
        id: 'p_music_6',
        name: 'Tai Nghe Vintage Âm Thanh Chuẩn',
        icon: '🎧',
        price: 50000,
        description: 'Chiếc tai nghe phong cách cổ điển mang lại trải nghiệm âm nhạc trọn vẹn.',
        comfortRestore: 68
      }
    ]
  },
  {
    id: 'intellect_tech',
    name: 'Tổ Hợp Công Nghệ & Phần Mềm Số',
    category: 'intellect',
    icon: '💻',
    color: '#0F172A',
    roofColor: '#3B82F6',
    description: 'Trung tâm nghiên cứu giải pháp số, lập trình phần mềm và tự động hóa thông minh.',
    defaultProducts: [
      {
        id: 'p_tech_1',
        name: 'Tối Ưu Hóa Thiết Bị Cá Nhân',
        icon: '📱',
        price: 35000,
        description: 'Dọn rác, tăng tốc hệ thống giúp trải nghiệm mượt mà không ức chế.',
        comfortRestore: 55
      },
      {
        id: 'p_tech_2',
        name: 'Khóa Kỹ Năng Số Thực Chiến',
        icon: '🖥️',
        price: 50000,
        description: 'Nâng cao sự tự tin và tư duy công nghệ trong kỷ nguyên mới.',
        comfortRestore: 70
      },
      {
        id: 'p_tech_3',
        name: 'Thiết Kế Trang Cá Nhân Độc Bản',
        icon: '🌐',
        price: 75000,
        description: 'Không gian số chuyên nghiệp khẳng định thương hiệu cá nhân.',
        comfortRestore: 90
      },
      {
        id: 'p_tech_4',
        name: 'Gói Bảo Vệ Dữ Liệu An Ninh Mạng',
        icon: '🔒',
        price: 45000,
        description: 'An tâm tuyệt đối với lá chắn bảo mật dữ liệu riêng tư tối ưu.',
        comfortRestore: 65
      },
      {
        id: 'p_tech_5',
        name: 'Bộ Phụ Kiện Công Nghệ Tiện Lợi',
        icon: '🔌',
        price: 30000,
        description: 'Cáp sạc thông minh và phụ kiện giúp công việc thông suốt.',
        comfortRestore: 50
      },
      {
        id: 'p_tech_6',
        name: 'Tư Vấn Tự Động Hóa Công Việc',
        icon: '⚙️',
        price: 60000,
        description: 'Giải phóng thời gian làm việc nhờ các công cụ thông minh.',
        comfortRestore: 80
      }
    ]
  },
  {
    id: 'craft_workshop',
    name: 'Xưởng Cơ Khí, Chế Tạo & Sửa Chữa',
    category: 'craft',
    icon: '🛠️',
    color: '#1E293B',
    roofColor: '#64748B',
    description: 'Gia công máy móc, chế tác vật dụng tiện ích và sửa chữa kỹ thuật đáng tin cậy.',
    defaultProducts: [
      {
        id: 'p_craft_1',
        name: 'Bảo Dưỡng & Sửa Chữa Đồ Đạc',
        icon: '🔧',
        price: 35000,
        description: 'Khắc phục trục trặc đồ dùng, mang lại sự an tâm tuyệt đối.',
        comfortRestore: 50
      },
      {
        id: 'p_craft_2',
        name: 'Chế Tác Đồ Gỗ Thủ Công Xinh Xắn',
        icon: '🪑',
        price: 50000,
        description: 'Vật dụng thủ công mộc mạc trang trí không gian sống thêm ấm cúng.',
        comfortRestore: 65
      },
      {
        id: 'p_craft_3',
        name: 'Nâng Cấp Bộ Dụng Cụ Đa Năng',
        icon: '🧰',
        price: 70000,
        description: 'Bộ công cụ bền bỉ giúp bạn tự tin giải quyết mọi việc trong đời sống.',
        comfortRestore: 80
      },
      {
        id: 'p_craft_4',
        name: 'Đèn Ngủ Gỗ Khắc Hoa Văn Nghệ Thuật',
        icon: '💡',
        price: 45000,
        description: 'Ánh sáng vàng ấm dịu lan tỏa khắp căn phòng cho giấc ngủ an lành.',
        comfortRestore: 62
      },
      {
        id: 'p_craft_5',
        name: 'Khắc Laser Chữ Kỷ Niệm Cá Nhân',
        icon: '🖋️',
        price: 25000,
        description: 'Ghi dấu ấn riêng biệt lên móc khóa hoặc đồ dùng thân thương.',
        comfortRestore: 48
      },
      {
        id: 'p_craft_6',
        name: 'Gia Cố Thiết Bị An Toàn Cửa Nhà',
        icon: '🚪',
        price: 55000,
        description: 'Tăng cường sự an tâm và vững chãi cho căn hộ của bạn.',
        comfortRestore: 70
      }
    ]
  },
  {
    id: 'nature_farm',
    name: 'Cửa Hàng Nông Sản Sạch & Sinh Thái',
    category: 'nature',
    icon: '🌾',
    color: '#064E3B',
    roofColor: '#10B981',
    description: 'Cung cấp hoa tươi, chậu cây cảnh và trải nghiệm nông nghiệp sinh thái.',
    defaultProducts: [
      {
        id: 'p_nature_1',
        name: 'Bó Hoa Dại Đồng Quê Thơm Ngát',
        icon: '💐',
        price: 25000,
        description: 'Hương hoa thanh nhã dịu dàng đem lại cảm giác bình yên.',
        comfortRestore: 50
      },
      {
        id: 'p_nature_2',
        name: 'Chậu Cây Xanh Để Bàn Sinh Thái',
        icon: '🪴',
        price: 40000,
        description: 'Màu xanh tươi mát thanh lọc không khí và xua tan mỏi mắt.',
        comfortRestore: 65
      },
      {
        id: 'p_nature_3',
        name: 'Trải Nghiệm Làm Vườn Trị Liệu',
        icon: '🌱',
        price: 55000,
        description: 'Chạm tay vào đất mẹ và ngắm mầm non lớn lên đầy kỳ diệu.',
        comfortRestore: 85
      },
      {
        id: 'p_nature_4',
        name: 'Bình Terrarium Hệ Sinh Thái Mini',
        icon: '🌿',
        price: 65000,
        description: 'Khu rừng nhiệt đới thu nhỏ trong bình thủy tinh tinh xảo.',
        comfortRestore: 88
      },
      {
        id: 'p_nature_5',
        name: 'Gói Hạt Giống Hoa Thơm Tự Trồng',
        icon: '🌻',
        price: 18000,
        description: 'Niềm vui chăm bón từng ngày chờ hoa hướng dương bung nở rạng ngời.',
        comfortRestore: 42
      },
      {
        id: 'p_nature_6',
        name: 'Túi Thơm Hoa Khô Oải Hương Tự Nhiên',
        icon: '🌾',
        price: 22000,
        description: 'Hương thơm thảo mộc dịu dàng giúp tinh thần luôn thư thái và dễ ngủ.',
        comfortRestore: 48
      }
    ]
  },
  {
    id: 'empathy_wellness',
    name: 'Trung Tâm Trị Liệu & Chăm Sóc Sức Khỏe',
    category: 'empathy',
    icon: '🩺',
    color: '#831843',
    roofColor: '#EC4899',
    description: 'Không gian điều dưỡng, tư vấn tâm lý và phục hồi năng lượng sống tích cực.',
    defaultProducts: [
      {
        id: 'p_well_1',
        name: 'Massage Cổ Vai Gáy Thư Giãn',
        icon: '💆',
        price: 40000,
        description: 'Kỹ thuật xoa bóp điêu luyện giải tỏa cơn đau mỏi tức thì.',
        comfortRestore: 70
      },
      {
        id: 'p_well_2',
        name: 'Buổi Trò Chuyện & Lắng Nghe Tâm Tình',
        icon: '💖',
        price: 55000,
        description: 'Trút bỏ gánh nặng lòng cùng chuyên gia tâm lý thấu hiểu.',
        comfortRestore: 85
      },
      {
        id: 'p_well_3',
        name: 'Trà Thảo Mộc Dưỡng Nhan Dưỡng Thần',
        icon: '🫖',
        price: 25000,
        description: 'Thức uống an thần từ hoa cúc và táo đỏ giúp giấc ngủ an lành.',
        comfortRestore: 50
      },
      {
        id: 'p_well_4',
        name: 'Liệu Trình Xông Hơi Tinh Dầu Bưởi',
        icon: '🌸',
        price: 50000,
        description: 'Làn sương ấm áp cùng tinh dầu bưởi đào thải độc tố thư thái.',
        comfortRestore: 78
      },
      {
        id: 'p_well_5',
        name: 'Ngâm Chân Muối Khoáng Thảo Dược',
        icon: '🦶',
        price: 32000,
        description: 'Hương quế gừng làm ấm kinh lạc và lưu thông khí huyết toàn thân.',
        comfortRestore: 62
      },
      {
        id: 'p_well_6',
        name: 'Khóa Thiền Chuông Xoay Tây Tạng',
        icon: '🧘',
        price: 65000,
        description: 'Sóng âm chuông xoay chữa lành đưa não bộ về trạng thái tĩnh tại sâu.',
        comfortRestore: 92
      }
    ]
  },
  {
    id: 'physical_fitness',
    name: 'Trung Tâm Thể Thao & Vận Động Năng Động',
    category: 'physical',
    icon: '🏃',
    color: '#14532D',
    roofColor: '#22C55E',
    description: 'Rèn luyện sức khỏe, đào tạo thể lực và nâng cao sự dẻo dai.',
    defaultProducts: [
      {
        id: 'p_fit_1',
        name: 'Vé Tập Gym & Thể Lực Tự Do',
        icon: '🏋️',
        price: 30000,
        description: 'Không gian tập luyện hiện đại giải phóng năng lượng ứ đọng.',
        comfortRestore: 55
      },
      {
        id: 'p_fit_2',
        name: 'Lớp Yoga & Kéo Giãn Khớp',
        icon: '🧘',
        price: 45000,
        description: 'Hít thở sâu và kéo dãn cơ bắp tái tạo sự mềm dẻo thanh thoát.',
        comfortRestore: 75
      },
      {
        id: 'p_fit_3',
        name: 'Nước Detox Trái Cây Thanh Lọc',
        icon: '🥒',
        price: 20000,
        description: 'Bù nước và khoáng chất tự nhiên giúp cơ thể tràn trề sức sống.',
        comfortRestore: 40
      },
      {
        id: 'p_fit_4',
        name: 'Buổi Tập Boxing Giải Tỏa Căng Thẳng',
        icon: '🥊',
        price: 45000,
        description: 'Đấm bao cát cực đã tay, trút bỏ toàn bộ bực dọc và stress.',
        comfortRestore: 72
      },
      {
        id: 'p_fit_5',
        name: 'Khóa Bơi Lội Thư Thái Bể Nước Ấm',
        icon: '🏊',
        price: 55000,
        description: 'Làn nước mát lành nâng đỡ cơ thể xua tan mọi mỏi mệt cột sống.',
        comfortRestore: 82
      },
      {
        id: 'p_fit_6',
        name: 'Thẻ Xông Hơi Hồng Ngoại Phục Hồi',
        icon: '🧖',
        price: 40000,
        description: 'Nhiệt hồng ngoại thấu sâu làm mềm cơ bắp sau ngày dài di chuyển.',
        comfortRestore: 68
      }
    ]
  },
  {
    id: 'social_trading',
    name: 'Cửa Hàng Thương Mại & Dịch Vụ Đời Sống',
    category: 'social',
    icon: '🏪',
    color: '#713F12',
    roofColor: '#F59E0B',
    description: 'Kinh doanh các mặt hàng tiêu dùng, quà tặng và dịch vụ tiện ích cộng đồng.',
    defaultProducts: [
      {
        id: 'p_trade_1',
        name: 'Gói Quà Lưu Niệm Đô Thị Sinh Tồn',
        icon: '🎁',
        price: 35000,
        description: 'Món quà ý nghĩa lưu giữ kỷ niệm những ngày tháng cùng nhau sinh tồn.',
        comfortRestore: 60
      },
      {
        id: 'p_trade_2',
        name: 'Vé Tham Gia Dạ Tiệc Kết Nối Cư Dân',
        icon: '🎟️',
        price: 50000,
        description: 'Gặp gỡ những người bạn mới, chuyện trò cười vui suốt buổi tối.',
        comfortRestore: 75
      },
      {
        id: 'p_trade_3',
        name: 'Dịch Vụ Hỗ Trợ Đời Sống Tiện Lợi',
        icon: '🛍️',
        price: 25000,
        description: 'Giải quyết các nhu cầu vặt trong sinh hoạt hằng ngày dễ dàng.',
        comfortRestore: 45
      },
      {
        id: 'p_trade_4',
        name: 'Bộ Boardgame Tình Bạn Đầy Kịch Tính',
        icon: '🎲',
        price: 42000,
        description: 'Trò chơi đấu trí vui nhộn mang lại những tràng cười rôm rả.',
        comfortRestore: 70
      },
      {
        id: 'p_trade_5',
        name: 'Sổ Tay Nhật Ký Hành Trình Sinh Tồn',
        icon: '📓',
        price: 28000,
        description: 'Cuốn sổ bìa da mộc mạc ghi lại những thành tựu và trải nghiệm quý giá.',
        comfortRestore: 52
      },
      {
        id: 'p_trade_6',
        name: 'Dịch Vụ Giao Hàng & Dọn Dẹp Nhanh',
        icon: '🛵',
        price: 32000,
        description: 'Nhận việc hộ và giao hàng hỏa tốc trong phố tiện lợi tối đa.',
        comfortRestore: 58
      }
    ]
  }
];

export interface RecommendedSectorResult {
  sector: BusinessSector;
  matchedSkillName: string;
  reason: string;
}

/**
 * Recommends EXACTLY 2 distinct business sectors based on player's chosen skills
 */
export function getRecommendedSectorsForPlayer(
  playerSkills: SkillDefinition[]
): [RecommendedSectorResult, RecommendedSectorResult] {
  const scoredSectors: Array<{
    sector: BusinessSector;
    score: number;
    matchedSkillName: string;
    reason: string;
  }> = [];

  // Map each sector against player's chosen skills
  for (const sector of BUSINESS_SECTORS) {
    let score = 0;
    let bestMatchedSkill: SkillDefinition | null = null;

    for (const skill of playerSkills) {
      let currentScore = 0;

      // Exact workplace type or category match
      if (skill.acceptedWorkplaceTypes && skill.acceptedWorkplaceTypes.some(t => sector.id.includes(t) || t.includes(sector.category))) {
        currentScore += 30;
      }

      const skillNameLower = skill.name.toLowerCase();
      if (sector.category === 'culinary' && (skillNameLower.includes('nấu') || skillNameLower.includes('bánh') || skillNameLower.includes('uống') || skillNameLower.includes('vị giác') || skillNameLower.includes('ẩm thực') || skillNameLower.includes('pha chế'))) {
        currentScore += 40;
      } else if (sector.category === 'art' && (skillNameLower.includes('vẽ') || skillNameLower.includes('nhạc') || skillNameLower.includes('đàn') || skillNameLower.includes('hát') || skillNameLower.includes('thiết kế') || skillNameLower.includes('ảnh') || skillNameLower.includes('thời trang') || skillNameLower.includes('viết'))) {
        currentScore += 40;
      } else if (sector.category === 'intellect' && (skillNameLower.includes('lập trình') || skillNameLower.includes('tin học') || skillNameLower.includes('toán') || skillNameLower.includes('ngoại ngữ') || skillNameLower.includes('logic') || skillNameLower.includes('dữ liệu') || skillNameLower.includes('học'))) {
        currentScore += 40;
      } else if (sector.category === 'craft' && (skillNameLower.includes('sửa') || skillNameLower.includes('chế') || skillNameLower.includes('thủ công') || skillNameLower.includes('may') || skillNameLower.includes('cơ khí') || skillNameLower.includes('lắp ráp'))) {
        currentScore += 40;
      } else if (sector.category === 'nature' && (skillNameLower.includes('cây') || skillNameLower.includes('hoa') || skillNameLower.includes('vườn') || skillNameLower.includes('thú') || skillNameLower.includes('cá') || skillNameLower.includes('môi trường') || skillNameLower.includes('nông'))) {
        currentScore += 40;
      } else if (sector.category === 'empathy' && (skillNameLower.includes('lắng nghe') || skillNameLower.includes('tâm lý') || skillNameLower.includes('sơ cứu') || skillNameLower.includes('chăm sóc') || skillNameLower.includes('an ủi') || skillNameLower.includes('y tế'))) {
        currentScore += 40;
      } else if (sector.category === 'physical' && (skillNameLower.includes('chạy') || skillNameLower.includes('bơi') || skillNameLower.includes('thể thao') || skillNameLower.includes('dẻo dai') || skillNameLower.includes('thể lực') || skillNameLower.includes('phản xạ'))) {
        currentScore += 40;
      } else if (sector.category === 'social' && (skillNameLower.includes('giao tiếp') || skillNameLower.includes('thuyết phục') || skillNameLower.includes('đàm phán') || skillNameLower.includes('bán') || skillNameLower.includes('lãnh đạo') || skillNameLower.includes('kết nối'))) {
        currentScore += 40;
      }

      if (currentScore > 0 && (!bestMatchedSkill || currentScore > score)) {
        score = currentScore;
        bestMatchedSkill = skill;
      }
    }

    if (bestMatchedSkill) {
      scoredSectors.push({
        sector,
        score,
        matchedSkillName: `#${bestMatchedSkill.orderNumber} ${bestMatchedSkill.name}`,
        reason: `Phù hợp xuất sắc với năng lực #${bestMatchedSkill.orderNumber} ${bestMatchedSkill.name} của bạn!`
      });
    }
  }

  // Sort by highest score
  scoredSectors.sort((a, b) => b.score - a.score);

  if (scoredSectors.length >= 2) {
    return [
      {
        sector: scoredSectors[0].sector,
        matchedSkillName: scoredSectors[0].matchedSkillName,
        reason: scoredSectors[0].reason
      },
      {
        sector: scoredSectors[1].sector,
        matchedSkillName: scoredSectors[1].matchedSkillName,
        reason: scoredSectors[1].reason
      }
    ];
  }

  // Fallback if needed
  const primaryFallback = scoredSectors[0] || {
    sector: BUSINESS_SECTORS[0],
    matchedSkillName: playerSkills[0] ? `#${playerSkills[0].orderNumber} ${playerSkills[0].name}` : 'Năng lực cốt lõi',
    reason: `Phù hợp với sở trường năng lực của bạn!`
  };

  const secondarySector = BUSINESS_SECTORS.find(s => s.id !== primaryFallback.sector.id) || BUSINESS_SECTORS[1];
  const secondaryFallback = {
    sector: secondarySector,
    matchedSkillName: playerSkills[1] ? `#${playerSkills[1].orderNumber} ${playerSkills[1].name}` : (playerSkills[0] ? `#${playerSkills[0].orderNumber} ${playerSkills[0].name}` : 'Năng lực mở rộng'),
    reason: `Cơ hội phát triển kinh doanh giàu tiềm năng!`
  };

  return [
    {
      sector: primaryFallback.sector,
      matchedSkillName: primaryFallback.matchedSkillName,
      reason: primaryFallback.reason
    },
    {
      sector: secondaryFallback.sector,
      matchedSkillName: secondaryFallback.matchedSkillName,
      reason: secondaryFallback.reason
    }
  ];
}

/**
 * Helper to retrieve the official standard baseline price for any catalog product.
 */
export function getStandardProductBasePrice(productId: string): number | null {
  for (const sector of BUSINESS_SECTORS) {
    const found = sector.defaultProducts.find(p => p.id === productId);
    if (found) return found.price;
  }
  const centralFound = CENTRAL_FOOD_ITEMS.find(p => p.id === productId);
  if (centralFound) return centralFound.price;
  return null;
}
