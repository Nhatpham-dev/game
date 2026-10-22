import React, { useState } from 'react';
import { Character, BuildingZone, GameSessionState } from '../types/game';
import { ONE_HUNDRED_SKILLS } from '../data/skillsData';
import { CharacterSprite } from './CharacterSprite';
import {
  X,
  Users,
  Store,
  TrendingUp,
  Zap,
  Utensils,
  Smile,
  Coins,
  Eye,
  Search,
  ShieldAlert,
  Clock,
  Crown
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  allCharacters: Character[];
  buildings: BuildingZone[];
  gameSession: GameSessionState;
  onFocusCoordinates?: (coords: { x: number; y: number }) => void;
  onInspectBuilding?: (building: BuildingZone) => void;
}

export const HostSpectatorInspector: React.FC<Props> = ({
  isOpen,
  onClose,
  allCharacters,
  buildings,
  gameSession,
  onFocusCoordinates,
  onInspectBuilding
}) => {
  const [activeTab, setActiveTab] = useState<'players' | 'stalls' | 'stats'>('players');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter regular player characters (exclude any host artifact if any)
  const regularPlayers = allCharacters.filter(
    c => c && c.name && c.name.toLowerCase() !== 'host' && c.accountId !== 'acc_host_admin'
  );

  const filteredPlayers = regularPlayers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.customSkillName && p.customSkillName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const ownedStalls = buildings.filter(b => b.isOwned);
  const totalMoneyCirculating = regularPlayers.reduce((sum, p) => sum + (p.stats?.money || 0), 0);
  const totalRevenueGenerated = buildings.reduce((sum, b) => sum + (b.totalRevenue || 0), 0);
  const totalSalesCount = buildings.reduce((sum, b) => sum + (b.totalSalesCount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in select-none">
      <div className="bg-slate-900 border border-amber-500/60 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 p-4 sm:p-5 text-white flex items-center justify-between gap-3 shadow-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-black/30 border border-amber-300/40 flex items-center justify-center text-2xl shadow">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight">
                  Bảng Quan Sát Cư Dân & Gian Hàng (Host)
                </h3>
                <span className="text-[10px] bg-black/40 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                  {regularPlayers.length} Cư Dân
                </span>
              </div>
              <p className="text-xs text-amber-100/90">
                Theo dõi thời gian thực các chỉ số sinh tồn (Thể lực, Độ no, Thoải mái) và doanh thu của tất cả người chơi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1 flex-shrink-0">
          <button
            onClick={() => setActiveTab('players')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'players'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Cư Dân & Sinh Tồn ({regularPlayers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stalls')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'stalls'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Gian Hàng Đã Mở ({ownedStalls.length}/{buildings.length - 1})</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Tổng Quan Kinh Tế Làng</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: PLAYERS SURVIVAL & WEALTH INSPECTOR */}
          {activeTab === 'players' && (
            <div className="space-y-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm cư dân theo tên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {filteredPlayers.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Không tìm thấy cư dân nào trong phòng.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredPlayers.map((player) => {
                    const skill = ONE_HUNDRED_SKILLS.find(s => s.id === player.bestSkillId);
                    const stall = buildings.find(
                      b => b.ownerId === player.accountId || b.ownerId === player.id || b.ownerName === player.name
                    );

                    const hunger = Math.round(player.stats?.hunger ?? 100);
                    const energy = Math.round(player.stats?.energy ?? 100);
                    const comfort = Math.round(player.stats?.comfort ?? 100);
                    const money = player.stats?.money ?? 0;

                    return (
                      <div
                        key={player.id}
                        className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-3.5 space-y-2.5 transition-all shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                              <CharacterSprite appearance={player.appearance} size={32} />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-white text-xs">{player.name}</h4>
                                <span className="text-[10px] text-amber-400 font-mono">
                                  {skill?.icon || '✨'} {skill?.name || player.customSkillName || 'Cư dân'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400">
                                {stall?.isOwned
                                  ? `🏪 ${stall.name} (+${(stall.totalRevenue || 0).toLocaleString('vi-VN')}₫)`
                                  : '⚠️ Chưa mở gian hàng'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-amber-300 text-xs bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-800/40">
                              {money.toLocaleString('vi-VN')}₫
                            </span>

                            {onFocusCoordinates && (
                              <button
                                type="button"
                                onClick={() => {
                                  onFocusCoordinates({ x: player.x, y: player.y });
                                  onClose();
                                }}
                                className="px-2 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-600/60 text-indigo-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                                title="Di chuyển camera đến vị trí người chơi này"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Xem</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Survival Stats Indicators */}
                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-900 text-[10px]">
                          {/* Energy */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-emerald-400 font-medium">
                              <span className="flex items-center gap-0.5">
                                <Zap className="w-3 h-3" /> Lực
                              </span>
                              <span>{energy}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  energy < 25 ? 'bg-rose-500 animate-pulse' : energy < 50 ? 'bg-amber-400' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${energy}%` }}
                              />
                            </div>
                          </div>

                          {/* Hunger */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-orange-400 font-medium">
                              <span className="flex items-center gap-0.5">
                                <Utensils className="w-3 h-3" /> No
                              </span>
                              <span>{hunger}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  hunger < 25 ? 'bg-rose-500 animate-pulse' : hunger < 50 ? 'bg-amber-400' : 'bg-orange-500'
                                }`}
                                style={{ width: `${hunger}%` }}
                              />
                            </div>
                          </div>

                          {/* Comfort */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-pink-400 font-medium">
                              <span className="flex items-center gap-0.5">
                                <Smile className="w-3 h-3" /> Vui
                              </span>
                              <span>{comfort}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  comfort < 25 ? 'bg-rose-500 animate-pulse' : comfort < 50 ? 'bg-amber-400' : 'bg-pink-500'
                                }`}
                                style={{ width: `${comfort}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STALLS INSPECTOR */}
          {activeTab === 'stalls' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {buildings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-1 bg-slate-900 rounded-xl">{b.icon}</span>
                        <div>
                          <h4 className="font-bold text-white text-xs">{b.name}</h4>
                          <p className="text-[10px] text-slate-400">
                            {b.isCentralFoodStall
                              ? '🍲 Quán Ăn Sinh Tồn Trung Tâm'
                              : b.isOwned
                              ? `Chủ sở hữu: ${b.ownerName || 'Cư dân'}`
                              : 'Chưa mở gian hàng'}
                          </p>
                        </div>
                      </div>

                      {onInspectBuilding && (
                        <button
                          type="button"
                          onClick={() => {
                            onInspectBuilding(b);
                            onClose();
                          }}
                          className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/60 text-amber-300 rounded-lg text-[10px] font-bold cursor-pointer transition-all active:scale-95"
                        >
                          Chi tiết
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] bg-black/40 p-2 rounded-xl border border-slate-900">
                      <span className="text-slate-400">
                        {b.isCentralFoodStall ? 'Món ăn phục vụ' : 'Doanh thu thu về'}:
                      </span>
                      <strong className="text-emerald-400 font-mono">
                        {b.isCentralFoodStall
                          ? 'Cơm 25k • Nước 10k • Thịt 30k'
                          : `${(b.totalRevenue || 0).toLocaleString('vi-VN')}₫ (${b.totalSalesCount || 0} lượt bán)`}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ECONOMY OVERVIEW */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Tổng tiền trong lưu thông</span>
                  <div className="text-xl font-extrabold text-amber-300 font-mono">
                    {totalMoneyCirculating.toLocaleString('vi-VN')}₫
                  </div>
                  <p className="text-[10px] text-slate-500">Tổng ví của tất cả {regularPlayers.length} người chơi</p>
                </div>

                <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Tổng doanh thu bán buôn</span>
                  <div className="text-xl font-extrabold text-emerald-400 font-mono">
                    {totalRevenueGenerated.toLocaleString('vi-VN')}₫
                  </div>
                  <p className="text-[10px] text-slate-500">{totalSalesCount} lượt khách đã được phục vụ</p>
                </div>

                <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Tỷ lệ mở quầy kinh doanh</span>
                  <div className="text-xl font-extrabold text-indigo-400 font-mono">
                    {ownedStalls.length}/{Math.max(1, buildings.length - 1)}
                  </div>
                  <p className="text-[10px] text-slate-500">Gian hàng cư dân đang kinh doanh</p>
                </div>
              </div>

              <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-2xl p-4 text-xs text-indigo-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-indigo-300 text-sm">
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span>Trạng thái lượt chơi 7 phút:</span>
                </div>
                <p className="leading-relaxed">
                  Lượt hiện tại: <strong>Lượt #{gameSession.roundNumber || 1}</strong> • Trạng thái:{' '}
                  <span className="uppercase font-bold text-amber-300">
                    {gameSession.status === 'running'
                      ? 'Đang Diễn Ra (7 Phút)'
                      : gameSession.status === 'ended'
                      ? 'Đã Hết Giờ'
                      : 'Chờ Bắt Đầu'}
                  </span>
                </p>
                <p className="text-[11px] text-indigo-100/70">
                  Thời lượng mỗi lượt: 7 phút (420 giây). Khi host bấm Bắt Đầu, các thanh đói, thể lực, độ thoải mái của mọi người chơi mới bắt đầu giảm và mọi giao dịch mới được kích hoạt.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
