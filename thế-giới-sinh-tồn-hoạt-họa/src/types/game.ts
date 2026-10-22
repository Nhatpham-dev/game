export interface UserAccount {
  id: string;
  username: string;
  pin: string;
  createdAt: number;
  isHost?: boolean;
}

export interface CharacterAppearance {
  gender: 'boy' | 'girl' | 'neutral';
  skinColor: string;
  hairStyle: 'short' | 'long' | 'spiky' | 'curly' | 'buzz';
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  accessory: 'none' | 'glasses' | 'hat' | 'headphones' | 'backpack';
}

export interface CharacterStats {
  money: number;
  energy: number; // Thể lực (0 - 100)
  hunger: number; // Độ no (0 - 100)
  comfort: number; // Độ thoải mái (0 - 100)
  health?: number; // Optional backward compatibility
  level: number;
  xp: number;
  daysSurvived: number;
}

export interface Character {
  id: string;
  accountId: string;
  name: string;
  bestSkillId: string;
  bestSkillIds?: string[]; // Up to 3 chosen skills from the 100 list
  customSkillName?: string;
  appearance: CharacterAppearance;
  stats: CharacterStats;
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  direction: 'down' | 'up' | 'left' | 'right';
  isMoving: boolean;
  isWorking: boolean;
  currentActivity?: string;
  speechBubble?: {
    text: string;
    expiresAt: number;
  };
  isCurrentPlayer?: boolean;
  stallPurchaseCounts?: Record<string, number>; // Maps storeId to number of times purchased (max 2 per stall)
}

export type SkillCategory =
  | 'art'        // Nghệ thuật & Biểu diễn (Hát hay, Đánh đàn, Khiêu vũ...)
  | 'social'     // Giao tiếp & Xã hội (Giao tiếp duyên dáng, Thuyết phục...)
  | 'intellect'  // Trí tuệ & Tư duy (Sáng tạo, Tính nhẩm nhanh, Logic...)
  | 'physical'   // Thể chất & Thể thao (Chạy nhanh, Bền bỉ, Phản xạ...)
  | 'craft'      // Khéo tay & Kỹ thuật (Sửa chữa, Điêu khắc, May vá...)
  | 'culinary'   // Ẩm thực & Vị giác (Cảm thụ hương vị, Nấu ăn...)
  | 'empathy'    // Tâm lý & Cảm xúc (Lắng nghe, Đọc vị tâm lý, Dỗ dành...)
  | 'nature';    // Thiên nhiên & Động vật (Chăm cây, Huấn luyện thú, Câu cá...)

export interface SkillDefinition {
  id: string;
  orderNumber: number; // 1 to 100
  name: string;
  section: string; // 'I. Sở thích' | 'II. Kỹ năng chuyên môn' | 'III. Kỹ năng mềm'
  subgroup: string; // 'Sáng tạo & Nghệ thuật', 'Công nghệ & CNTT', v.v.
  icon: string;
  acceptedWorkplaceTypes: string[];
}

export interface StoreProduct {
  id: string;
  name: string;
  icon: string;
  price: number;
  originalPrice?: number;
  description: string;
  comfortRestore: number;
  energyRestore?: number; // ONLY for central food stall
  hungerRestore?: number; // ONLY for central food stall
}

export interface BusinessSector {
  id: string;
  name: string;
  category: SkillCategory;
  icon: string;
  color: string;
  roofColor: string;
  description: string;
  defaultProducts: StoreProduct[];
  matchingSkillIds?: string[];
}

export interface BuildingZone {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  roofColor: string;
  icon: string;
  title: string;
  subtitle: string;

  // Custom Player-Created Business Properties (NO hiring)
  isCustomizable?: boolean;
  isOwned?: boolean;
  ownerId?: string; // accountId of the owner
  ownerName?: string;
  businessSectorId?: string;
  businessSectorName?: string;
  products?: StoreProduct[]; // Multiple products/services for this stall
  totalRevenue?: number;
  totalSalesCount?: number;

  // Dedicated central survival food stall
  isCentralFoodStall?: boolean;

  // Leisure / Recovery Activity for public facilities (shelter, park)
  activity?: {
    title: string;
    description: string;
    icon: string;
    cost: number;
    energyRestore: number;
    hungerRestore: number;
    comfortRestore: number;
    durationSec?: number;
  };
}

export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  icon: string;
  count: number;
  energyRestore: number;
  hungerRestore: number;
  healthRestore: number;
}

export interface LogMessage {
  id: string;
  text: string;
  type: 'money' | 'warning' | 'info' | 'success';
  timestamp: number;
}

export interface NegotiationMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'owner' | 'system';
  text: string;
  proposedPrice?: number;
  time: string;
  createdAt: number;
}

export interface NegotiationSession {
  id: string;
  storeId: string;
  storeName: string;
  ownerAccountId: string;
  ownerName: string;
  customerAccountId: string;
  customerName: string;
  productId: string;
  productName: string;
  productIcon: string;
  comfortRestore?: number;
  originalPrice: number;
  currentAgreedPrice: number;
  status: 'active' | 'agreed' | 'cancelled';
  messages: NegotiationMessage[];
  updatedAt: number;
}

export type GameRoundStatus = 'waiting_for_host' | 'host_joined' | 'running' | 'ended';

export interface GameSessionState {
  id: string; // 'global_session'
  hostId: string | null;
  hostName: string | null;
  isHostPresent: boolean;
  status: GameRoundStatus;
  roundDurationSeconds: number; // 420 (7 minutes)
  startedAt: number | null;
  endsAt: number | null;
  roundNumber: number;
  updatedAt: number;
}
