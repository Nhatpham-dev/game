import { BuildingZone } from '../types/game';
import { ONE_HUNDRED_SKILLS } from './skillsData';

export const WORLD_BUILDINGS: BuildingZone[] = [
  {
    id: 'lot_1',
    name: 'Mặt Bằng Kinh Doanh #1',
    type: 'commercial_lot',
    x: 80,
    y: 70,
    width: 220,
    height: 160,
    color: '#1E293B',
    roofColor: '#3B82F6',
    icon: '🏪',
    title: 'Mặt Bằng Trống #1',
    subtitle: 'Chưa có chủ • Nhấp để mở cửa hàng theo năng lực của bạn!',
    isCustomizable: true,
    isOwned: false,
    totalRevenue: 0,
    totalSalesCount: 0
  },
  {
    id: 'lot_2',
    name: 'Mặt Bằng Kinh Doanh #2',
    type: 'commercial_lot',
    x: 360,
    y: 70,
    width: 220,
    height: 160,
    color: '#431407',
    roofColor: '#EA580C',
    icon: '🏪',
    title: 'Mặt Bằng Trống #2',
    subtitle: 'Chưa có chủ • Nhấp để mở cửa hàng theo năng lực của bạn!',
    isCustomizable: true,
    isOwned: false,
    totalRevenue: 0,
    totalSalesCount: 0
  },
  {
    id: 'lot_3',
    name: 'Mặt Bằng Kinh Doanh #3',
    type: 'commercial_lot',
    x: 640,
    y: 70,
    width: 240,
    height: 160,
    color: '#064E3B',
    roofColor: '#10B981',
    icon: '🏪',
    title: 'Mặt Bằng Trống #3',
    subtitle: 'Chưa có chủ • Nhấp để mở cửa hàng theo năng lực của bạn!',
    isCustomizable: true,
    isOwned: false,
    totalRevenue: 0,
    totalSalesCount: 0
  },
  {
    id: 'lot_4',
    name: 'Mặt Bằng Kinh Doanh #4',
    type: 'commercial_lot',
    x: 80,
    y: 300,
    width: 220,
    height: 160,
    color: '#713F12',
    roofColor: '#F59E0B',
    icon: '🏪',
    title: 'Mặt Bằng Trống #4',
    subtitle: 'Chưa có chủ • Nhấp để mở cửa hàng theo năng lực của bạn!',
    isCustomizable: true,
    isOwned: false,
    totalRevenue: 0,
    totalSalesCount: 0
  },
  {
    id: 'lot_5',
    name: 'Mặt Bằng Kinh Doanh #5',
    type: 'commercial_lot',
    x: 360,
    y: 300,
    width: 220,
    height: 160,
    color: '#312E81',
    roofColor: '#8B5CF6',
    icon: '🏪',
    title: 'Mặt Bằng Trống #5',
    subtitle: 'Chưa có chủ • Nhấp để mở cửa hàng theo năng lực của bạn!',
    isCustomizable: true,
    isOwned: false,
    totalRevenue: 0,
    totalSalesCount: 0
  },
  {
    id: 'lot_6',
    name: 'Mặt Bằng Kinh Doanh #6',
    type: 'commercial_lot',
    x: 640,
    y: 300,
    width: 240,
    height: 160,
    color: '#831843',
    roofColor: '#EC4899',
    icon: '🏪',
    title: 'Mặt Bằng Trống #6',
    subtitle: 'Chưa có chủ • Nhấp để mở cửa hàng theo năng lực của bạn!',
    isCustomizable: true,
    isOwned: false,
    totalRevenue: 0,
    totalSalesCount: 0
  },
  {
    id: 'lot_7',
    name: 'Mặt Bằng Kinh Doanh #7',
    type: 'commercial_lot',
    x: 360,
    y: 530,
    width: 220,
    height: 150,
    color: '#064E3B',
    roofColor: '#059669',
    icon: '🏪',
    title: 'Mặt Bằng Trống #7',
    subtitle: 'Chưa có chủ • Nhấp để mở cửa hàng theo năng lực của bạn!',
    isCustomizable: true,
    isOwned: false,
    totalRevenue: 0,
    totalSalesCount: 0
  }
];

export const INITIAL_NPCS: Array<{
  name: string;
  skillId: string;
  appearance: {
    gender: 'boy' | 'girl' | 'neutral';
    skinColor: string;
    hairStyle: 'short' | 'long' | 'spiky' | 'curly' | 'buzz';
    hairColor: string;
    shirtColor: string;
    pantsColor: string;
    accessory: 'none' | 'glasses' | 'hat' | 'headphones' | 'backpack';
  };
  x: number;
  y: number;
  quote: string;
}> = [
  {
    name: 'Minh Đàn Guitar',
    skillId: 'skill_3',
    appearance: {
      gender: 'boy',
      skinColor: '#FCD34D',
      hairStyle: 'short',
      hairColor: '#1F2937',
      shirtColor: '#2563EB',
      pantsColor: '#1E293B',
      accessory: 'headphones'
    },
    x: 200,
    y: 190,
    quote: 'Ai vừa mở tiệm cà phê âm nhạc thế, lát mình ghé ủng hộ!'
  },
  {
    name: 'Hà Culinary',
    skillId: 'skill_21',
    appearance: {
      gender: 'girl',
      skinColor: '#FDE68A',
      hairStyle: 'long',
      hairColor: '#78350F',
      shirtColor: '#EA580C',
      pantsColor: '#FFFFFF',
      accessory: 'hat'
    },
    x: 480,
    y: 190,
    quote: 'Mình đang nếm thử món ăn của các cửa hàng mới mở trong phố nè!'
  },
  {
    name: 'Bác Sáu Bonsai',
    skillId: 'skill_23',
    appearance: {
      gender: 'boy',
      skinColor: '#D97706',
      hairStyle: 'buzz',
      hairColor: '#4B5563',
      shirtColor: '#059669',
      pantsColor: '#475569',
      accessory: 'hat'
    },
    x: 750,
    y: 200,
    quote: 'Mặt bằng kinh doanh trống nhiều lắm, mở tiệm đi các bạn trẻ!'
  },
  {
    name: 'Bác Sĩ Tuấn',
    skillId: 'skill_67',
    appearance: {
      gender: 'boy',
      skinColor: '#FDE68A',
      hairStyle: 'short',
      hairColor: '#111827',
      shirtColor: '#EC4899',
      pantsColor: '#E2E8F0',
      accessory: 'glasses'
    },
    x: 760,
    y: 430,
    quote: 'Kinh doanh phát tài nhé! Nhớ giữ gìn sức khỏe và độ thoải mái!'
  }
];

export { ONE_HUNDRED_SKILLS };
