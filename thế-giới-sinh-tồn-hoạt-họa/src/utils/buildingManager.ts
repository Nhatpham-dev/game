import { BuildingZone, UserAccount, Character, StoreProduct } from '../types/game';
import { CENTRAL_FOOD_ITEMS, BUSINESS_SECTORS, getStandardProductBasePrice } from '../data/businessSectors';

const BUILDINGS_KEY = 'survival_game_buildings';

// Base Width across 5 commercial avenues
export const WORLD_BASE_WIDTH = 1800;
export const WORLD_BASE_HEIGHT = 1100;

/**
 * Calculates dynamic world map dimensions to support ANY number of accounts
 * (e.g. 40 accounts = ~2550px height, 100 accounts = ~5500px height)
 */
export function calculateWorldDimensions(accountCount: number): { width: number; height: number } {
  if (accountCount <= 14) {
    return { width: WORLD_BASE_WIDTH, height: 1100 };
  }
  const overflow = accountCount - 14;
  const extraRows = Math.ceil(overflow / 5);
  const height = 1100 + extraRows * 270 + 150;
  return {
    width: WORLD_BASE_WIDTH,
    height
  };
}

/**
 * Computes neat, non-overlapping street coordinates for any account index.
 * Row 0: 5 plots (y = 80)
 * Row 1: 4 plots (y = 350, center x: 750 is Central Food Stall)
 * Row 2: 5 plots (y = 640, completely dedicated to player stalls)
 * Row 3+: 5 plots per row (y = 910 + (row - 3) * 270)
 */
export function getStorePlotCoordinate(index: number): { x: number; y: number; width: number; height: number } {
  const PREDEFINED_PLOTS = [
    // Row 0 - North Boulevard (y = 80)
    { x: 80, y: 80, width: 260, height: 170 },
    { x: 420, y: 80, width: 260, height: 170 },
    { x: 760, y: 80, width: 260, height: 170 },
    { x: 1100, y: 80, width: 260, height: 170 },
    { x: 1440, y: 80, width: 260, height: 170 },

    // Row 1 - Central Boulevard (y = 350, flanking Central Food Stall at 750)
    { x: 80, y: 350, width: 260, height: 170 },
    { x: 420, y: 350, width: 260, height: 170 },
    // (x: 750, y: 340 is Central Food Stall)
    { x: 1100, y: 350, width: 260, height: 170 },
    { x: 1440, y: 350, width: 260, height: 170 },

    // Row 2 - South Boulevard (y = 640, all 5 plots for player resident stalls)
    { x: 80, y: 640, width: 260, height: 170 },
    { x: 420, y: 640, width: 260, height: 170 },
    { x: 760, y: 640, width: 260, height: 170 },
    { x: 1100, y: 640, width: 260, height: 170 },
    { x: 1440, y: 640, width: 260, height: 170 }
  ];

  if (index < PREDEFINED_PLOTS.length) {
    return PREDEFINED_PLOTS[index];
  }

  // Dynamic extension for accounts from 15 to 40, 100+
  const overflowIndex = index - PREDEFINED_PLOTS.length;
  const col = overflowIndex % 5;
  const row = 3 + Math.floor(overflowIndex / 5);
  const x = 80 + col * 340;
  const y = 910 + (row - 3) * 270;

  return { x, y, width: 260, height: 170 };
}

// =========================================================================
// GIAN HÀNG ĂN SINH TỒN TRUNG TÂM (CHỈ GỒM CƠM, NƯỚC, THỊT THEO ĐÚNG GIÁ & CHỈ SỐ)
// Cơm 25.000₫ (No 30%, Thể lực 35%)
// Nước 10.000₫ (No 15%, Thể lực 20%)
// Thịt 30.000₫ (No 45%, Thể lực 50%)
// =========================================================================
export const CENTRAL_FOOD_STALL: BuildingZone = {
  id: 'central_food_stall',
  name: 'Gian Hàng Ăn Sinh Tồn Trung Tâm',
  type: 'central_food_market',
  x: 750,
  y: 340,
  width: 300,
  height: 200,
  color: '#831843',
  roofColor: '#DC2626',
  icon: '🍲',
  title: 'Gian Hàng Ăn Sinh Tồn (Độc Quyền)',
  subtitle: 'Cơm 25k (No+30, Lực+35) • Nước 10k (No+15, Lực+20) • Thịt 30k (No+45, Lực+50)',
  isCentralFoodStall: true,
  isCustomizable: false,
  isOwned: true,
  ownerName: 'Thành Phố Sinh Tồn',
  products: CENTRAL_FOOD_ITEMS
};

/**
 * Synchronizes and generates stores:
 * EXACTLY ONE store per registered account!
 * Plus Central Food Stall. (Hostel & Park have been removed).
 */
export function syncBuildingsWithAccounts(
  accounts: UserAccount[],
  characters: Character[]
): BuildingZone[] {
  let savedBuildings: BuildingZone[] = [];
  try {
    const raw = localStorage.getItem(BUILDINGS_KEY);
    if (raw) {
      savedBuildings = JSON.parse(raw);
      // Clean up legacy hostel / park
      savedBuildings = savedBuildings.filter(b => b.id !== 'shelter' && b.id !== 'park');
    }
  } catch {
    savedBuildings = [];
  }

  // 1. Generate an account store for each registered player account (excluding Host)
  const regularPlayerAccounts = accounts.filter(a => !a.isHost && a.username.toLowerCase() !== 'host');
  const accountStores: BuildingZone[] = regularPlayerAccounts.map((account, index) => {
    const stallId = `stall_acc_${account.id}`;
    const coord = getStorePlotCoordinate(index);

    // Find associated character name
    const char = characters.find(c => c.accountId === account.id);
    const ownerName = char ? char.name : account.username;

    // Check if this account already customized their stall
    const existing = savedBuildings.find(
      b => b.id === stallId || (b.ownerId === account.id && b.isCustomizable)
    );

    if (existing && existing.isOwned) {
      return {
        ...existing,
        id: stallId,
        ownerId: account.id,
        ownerName: existing.ownerName || ownerName,
        x: coord.x,
        y: coord.y,
        width: coord.width,
        height: coord.height,
        // Guarantee products array is populated and retains original catalog prices
        products: (existing.products && existing.products.length > 0
          ? existing.products
          : BUSINESS_SECTORS.find(s => s.id === existing.businessSectorId)?.defaultProducts || []
        ).map(p => {
          const std = getStandardProductBasePrice(p.id);
          const truePrice = p.originalPrice || std || p.price;
          return {
            ...p,
            price: truePrice,
            originalPrice: truePrice
          };
        })
      };
    }

    // Default vacant stall dedicated to this specific registered account
    return {
      id: stallId,
      name: `Gian Hàng của ${ownerName}`,
      type: 'account_store',
      x: coord.x,
      y: coord.y,
      width: coord.width,
      height: coord.height,
      color: '#1E293B',
      roofColor: '#3B82F6',
      icon: '🏪',
      title: `Gian Hàng của ${ownerName}`,
      subtitle: 'Chưa mở bán • Nhấp để chọn 1 trong 2 lĩnh vực & đặt giá sản phẩm',
      isCustomizable: true,
      isOwned: false,
      ownerId: account.id,
      ownerName,
      totalRevenue: 0,
      totalSalesCount: 0
    };
  });

  const fullList: BuildingZone[] = [
    CENTRAL_FOOD_STALL,
    ...accountStores
  ];

  try {
    localStorage.setItem(BUILDINGS_KEY, JSON.stringify(fullList));
  } catch {
    // LocalStorage fallback
  }

  return fullList;
}

export function saveBuildingsToStorage(buildings: BuildingZone[]) {
  try {
    // Filter out removed hostel and park
    const filtered = buildings.filter(b => b.id !== 'shelter' && b.id !== 'park');
    localStorage.setItem(BUILDINGS_KEY, JSON.stringify(filtered));
  } catch {
    // LocalStorage fallback
  }
}

/**
 * Pre-seeds 40 demo players with diverse skills and active stalls
 * for instant testing of 40-player ecosystem.
 */
export function generateFortyDemoAccounts(): {
  accounts: UserAccount[];
  characters: Character[];
  buildings: BuildingZone[];
} {
  const NAMES = [
    'Minh Đàn Guitar', 'Hà Culinary', 'Bác Sáu Bonsai', 'Bác Sĩ Tuấn',
    'Nguyễn Hoàng Long', 'Trần Bảo Ngọc', 'Lê Tuấn Kiệt', 'Phạm Thanh Thảo',
    'Vũ Đức Anh', 'Đỗ Thảo Vy', 'Bùi Gia Huy', 'Hoàng Kim Ngân',
    'Đặng Văn Hùng', 'Trịnh Mai Linh', 'Phan Quốc Bảo', 'Lý Diệu Hương',
    'Mai Văn Cường', 'Võ Tuyết Mai', 'Dương Hữu Thắng', 'Ngô Thu Trang',
    'Lương Thế Vinh', 'Tạ Minh Châu', 'Cao Hoài Nam', 'Hồ Bích Trâm',
    'Đinh Tiến Dũng', 'Lâm Khánh An', 'Vương Đình Trọng', 'Tô Hải Đăng',
    'Đoàn Nhật Quang', 'Chu Thảo Nguyên', 'Lưu Quốc Cường', 'Vũ Bích Ngọc',
    'Bạch Gia Huy', 'Hà Tấn Phát', 'Khổng Minh Trí', 'Thái Kim Liên',
    'Đào Xuân Bách', 'Trịnh Cẩm Tú', 'Nghiêm Đình Luật', 'Lê Hải Yến'
  ];

  const accounts: UserAccount[] = [];
  const characters: Character[] = [];
  const buildings: BuildingZone[] = [CENTRAL_FOOD_STALL];

  NAMES.forEach((name, idx) => {
    const accId = `acc_demo_${idx + 1}`;
    const charId = `char_demo_${idx + 1}`;
    const stallId = `stall_acc_${accId}`;
    const coord = getStorePlotCoordinate(idx);
    const sector = BUSINESS_SECTORS[idx % BUSINESS_SECTORS.length];

    // Account
    accounts.push({
      id: accId,
      username: `user_${idx + 1}`,
      pin: '1234',
      createdAt: Date.now() - (40 - idx) * 3600000
    });

    // Character
    characters.push({
      id: charId,
      accountId: accId,
      name,
      bestSkillId: sector.id,
      appearance: {
        gender: idx % 2 === 0 ? 'boy' : 'girl',
        skinColor: '#F8D9B4',
        hairStyle: idx % 3 === 0 ? 'short' : idx % 3 === 1 ? 'curly' : 'long',
        hairColor: '#2D3748',
        shirtColor: sector.color,
        pantsColor: '#1E293B',
        accessory: idx % 4 === 0 ? 'glasses' : idx % 4 === 1 ? 'headphones' : 'none'
      },
      stats: {
        money: 120000 + (idx * 25000),
        energy: 85 + (idx % 15),
        hunger: 80 + (idx % 20),
        comfort: 80 + (idx % 20),
        level: Math.floor(idx / 4) + 1,
        xp: (idx * 45) % 100,
        daysSurvived: Math.floor(idx / 3) + 1
      },
      x: coord.x + 130,
      y: coord.y + coord.height + 35,
      direction: 'down',
      isMoving: false,
      isWorking: false,
      speechBubble: {
        text: `Chào mừng ghé thăm "${sector.name} của ${name}"!`,
        expiresAt: Date.now() + 15000
      }
    });

    // Populate stall for this player
    buildings.push({
      id: stallId,
      name: `${sector.name} của ${name}`,
      type: 'account_store',
      x: coord.x,
      y: coord.y,
      width: coord.width,
      height: coord.height,
      color: sector.color,
      roofColor: sector.roofColor,
      icon: sector.icon,
      title: `${sector.name} của ${name}`,
      subtitle: `Chủ quán: ${name} • ${sector.defaultProducts.length} sản phẩm`,
      isCustomizable: true,
      isOwned: true,
      ownerId: accId,
      ownerName: name,
      businessSectorId: sector.id,
      businessSectorName: sector.name,
      products: sector.defaultProducts.map(p => ({
        ...p,
        price: p.price + (idx % 5) * 2000
      })),
      totalRevenue: (idx + 1) * 35000,
      totalSalesCount: (idx + 1) * 2
    });
  });

  return { accounts, characters, buildings };
}
