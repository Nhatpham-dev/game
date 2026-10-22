import React, { useState } from 'react';
import { BuildingZone, Character } from '../types/game';
import {
  X,
  Search,
  MapPin,
  Store,
  Crown,
  Sparkles,
  Utensils,
  Navigation,
  Compass
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  buildings: BuildingZone[];
  player?: Character | null;
  onClose: () => void;
  onFastTravelToBuilding: (building: BuildingZone) => void;
}

export const ShopDirectoryModal: React.FC<Props> = ({
  isOpen,
  buildings,
  player,
  onClose,
  onFastTravelToBuilding
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter categories
  const CATEGORIES = [
    { id: 'all', name: 'Tất cả' },
    { id: 'central', name: '🍲 Quán Ăn Sinh Tồn' },
    { id: 'culinary', name: 'Ẩm thực & Cà phê' },
    { id: 'art', name: 'Nghệ thuật & Âm nhạc' },
    { id: 'tech', name: 'Công nghệ & Chế tạo' },
    { id: 'wellness', name: 'Sức khỏe & Thể thao' },
    { id: 'nature', name: 'Nông sản & Sinh thái' },
    { id: 'unopened', name: 'Chưa mở bán' }
  ];

  const centralStall = buildings.find(b => b.isCentralFoodStall);
  const playerShops = buildings.filter(b => b.type === 'account_store' || (b.isCustomizable && !b.isCentralFoodStall));

  const filteredShops = playerShops.filter(shop => {
    // Search query match
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      shop.name.toLowerCase().includes(q) ||
      (shop.ownerName && shop.ownerName.toLowerCase().includes(q)) ||
      (shop.businessSectorName && shop.businessSectorName.toLowerCase().includes(q)) ||
      (shop.products && shop.products.some(p => p.name.toLowerCase().includes(q)));

    if (!matchesSearch) return false;

    // Category filter
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'unopened') return !shop.isOwned;

    const sectorId = shop.businessSectorId || '';
    if (selectedCategory === 'culinary') return sectorId.includes('culinary');
    if (selectedCategory === 'art') return sectorId.includes('art');
    if (selectedCategory === 'tech') return sectorId.includes('tech') || sectorId.includes('craft');
    if (selectedCategory === 'wellness') return sectorId.includes('empathy') || sectorId.includes('physical');
    if (selectedCategory === 'nature') return sectorId.includes('nature');

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/20">
              🗺️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Danh Bạ Đô Thị Sinh Tồn</h3>
                <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow">
                  {playerShops.length} Gian Hàng
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Tìm kiếm gian hàng của bạn bè, xem giá bán và di chuyển nhanh đến vị trí
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên gian hàng, chủ quán (ví dụ: Cà Phê, Tuấn, Cơm, May...)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Directory List Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Featured Essential: Central Survival Food Stall */}
          {centralStall && (selectedCategory === 'all' || selectedCategory === 'central') && (
            <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/80 border-2 border-red-500/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 bg-red-900/60 border border-red-500/80 rounded-2xl flex items-center justify-center text-3xl shadow-inner flex-shrink-0 animate-pulse">
                  🍲
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-white text-sm sm:text-base">
                      {centralStall.name}
                    </h4>
                    <span className="bg-red-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow">
                      Bắt Buộc Để Sống
                    </span>
                  </div>
                  <p className="text-xs text-amber-200 mt-1">
                    🍚 Cơm 25k (No+30, Lực+35) • 💧 Nước 10k (No+15, Lực+20) • 🥩 Thịt 30k (No+45, Lực+50)
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Nơi <strong>DUY NHẤT</strong> cung cấp thực phẩm sinh tồn cho toàn bộ 40+ cư dân.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onFastTravelToBuilding(centralStall)}
                className="py-2.5 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer whitespace-nowrap active:scale-95"
              >
                <Compass className="w-4 h-4" />
                <span>Tới Nạp Năng Lượng ➔</span>
              </button>
            </div>
          )}

          {/* List of 40 Player Stalls */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
              <span>Danh Sách Các Gian Hàng ({filteredShops.length}):</span>
              <span>Bản đồ đô thị mở rộng</span>
            </div>

            {filteredShops.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                Không tìm thấy gian hàng nào phù hợp với từ khóa "{searchQuery}".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredShops.map((shop, idx) => {
                  const isPlayerOwner = Boolean(
                    player && (
                      (shop.ownerId && (shop.ownerId === player.accountId || shop.ownerId === player.id)) ||
                      (shop.ownerName && player.name && shop.ownerName.trim().toLowerCase() === player.name.trim().toLowerCase()) ||
                      (player.accountId && shop.id === `stall_acc_${player.accountId}`) ||
                      (player.id && shop.id === `stall_acc_${player.id}`)
                    )
                  );
                  return (
                    <div
                      key={shop.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isPlayerOwner
                          ? 'bg-indigo-950/40 border-amber-400/80 shadow-md'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white/10 flex-shrink-0"
                          style={{ backgroundColor: shop.color || '#1E293B' }}
                        >
                          {shop.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h5 className="font-bold text-white text-xs truncate max-w-[190px]">
                              {shop.name}
                            </h5>
                            {isPlayerOwner && (
                              <span className="text-[9px] font-extrabold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                <Crown className="w-2.5 h-2.5" /> Quán của bạn
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-amber-300 mt-0.5 font-medium">
                            Chủ quán: {shop.ownerName}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {shop.isOwned
                              ? `Đang mở bán • ${shop.products?.length || 6} sản phẩm/dịch vụ`
                              : 'Chưa mở bán • Mặt bằng trống'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-400" />
                          <span>Lô #{idx + 1}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => onFastTravelToBuilding(shop)}
                          className="py-1.5 px-3 bg-slate-800 hover:bg-indigo-600 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow active:scale-95"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Tới Gian Hàng ➔</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-400 flex items-center justify-between px-5">
          <span>💡 Mỗi tài khoản đăng nhập đều có 1 gian hàng riêng biệt.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
