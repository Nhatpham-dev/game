import React from 'react';
import { Character, BuildingZone, GameSessionState } from '../types/game';
import { Trophy, Crown, Medal, RefreshCw, LogOut, TrendingUp, Heart, ShoppingBag, DollarSign } from 'lucide-react';
import { CharacterSprite } from './CharacterSprite';

interface Props {
  isOpen: boolean;
  gameSession: GameSessionState;
  allCharacters: Character[];
  buildings: BuildingZone[];
  isHost: boolean;
  onRestartRound: () => void;
  onClose?: () => void;
  onLogout: () => void;
}

export const RoundSummaryModal: React.FC<Props> = ({
  isOpen,
  gameSession,
  allCharacters,
  buildings,
  isHost,
  onRestartRound,
  onClose,
  onLogout
}) => {
  if (!isOpen) return null;

  // Rank players by wealth (money)
  const rankedByMoney = [...allCharacters].sort((a, b) => b.stats.money - a.stats.money);
  const top1Money = rankedByMoney[0];
  const top2Money = rankedByMoney[1];
  const top3Money = rankedByMoney[2];

  // Rank stalls by revenue
  const rankedStores = [...buildings]
    .filter(b => b.isOwned && (b.totalRevenue || 0) > 0)
    .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0));
  const topStore = rankedStores[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in select-none">
      <div className="bg-slate-900 border border-amber-500/60 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col relative max-h-[92vh]">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 p-6 text-white text-center shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-3 shadow-inner">
            <Trophy className="w-9 h-9 text-amber-200" />
          </div>

          <div className="inline-block bg-black/30 border border-white/20 px-3 py-0.5 rounded-full text-[11px] font-bold text-amber-200 uppercase tracking-wider mb-1">
            Lượt chơi #{gameSession.roundNumber || 1} • Thời lượng: 7 Phút
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
            Hết Giờ! Tổng Kết Lượt Chơi
          </h2>
          <p className="text-xs text-amber-100/90 mt-1 font-medium">
            Thời gian 7 phút sinh tồn và kinh doanh đã kết thúc. Hãy cùng chúc mừng các quán quân!
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Top 2 */}
            {top2Money && (
              <div className="bg-slate-950/70 border border-slate-700/80 rounded-2xl p-3 text-center flex flex-col items-center justify-between order-2 sm:order-1">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-600 text-slate-300 flex items-center justify-center text-xs font-black mb-1">
                  #2
                </div>
                <div className="w-10 h-10 my-1">
                  <CharacterSprite appearance={top2Money.appearance} size={40} />
                </div>
                <h5 className="font-bold text-white text-xs truncate max-w-[120px]">{top2Money.name}</h5>
                <span className="text-[11px] font-extrabold text-amber-300 mt-0.5">
                  {top2Money.stats.money.toLocaleString('vi-VN')}₫
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">Á Quân Tài Chính</span>
              </div>
            )}

            {/* Top 1 Champion */}
            {top1Money && (
              <div className="bg-gradient-to-b from-amber-950/80 to-slate-950 border-2 border-amber-400 rounded-2xl p-3.5 text-center flex flex-col items-center justify-between order-1 sm:order-2 shadow-lg shadow-amber-500/20">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-black shadow mb-1">
                  👑 #1
                </div>
                <div className="w-12 h-12 my-1">
                  <CharacterSprite appearance={top1Money.appearance} size={48} />
                </div>
                <h5 className="font-bold text-amber-300 text-sm truncate max-w-[140px]">{top1Money.name}</h5>
                <span className="text-xs font-black text-white bg-amber-600/60 px-2 py-0.5 rounded-full mt-0.5 border border-amber-400/50">
                  {top1Money.stats.money.toLocaleString('vi-VN')}₫
                </span>
                <span className="text-[10px] text-amber-200 font-bold mt-1">Triệu Phú Đô Thị 🏆</span>
              </div>
            )}

            {/* Top 3 */}
            {top3Money && (
              <div className="bg-slate-950/70 border border-slate-700/80 rounded-2xl p-3 text-center flex flex-col items-center justify-between order-3">
                <div className="w-7 h-7 rounded-full bg-amber-950/80 border border-amber-700 text-amber-400 flex items-center justify-center text-xs font-black mb-1">
                  #3
                </div>
                <div className="w-10 h-10 my-1">
                  <CharacterSprite appearance={top3Money.appearance} size={40} />
                </div>
                <h5 className="font-bold text-white text-xs truncate max-w-[120px]">{top3Money.name}</h5>
                <span className="text-[11px] font-extrabold text-amber-300 mt-0.5">
                  {top3Money.stats.money.toLocaleString('vi-VN')}₫
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">Hạng Ba</span>
              </div>
            )}
          </div>

          {/* Top Store of the Round */}
          {topStore && (
            <div className="bg-slate-950/70 border border-indigo-500/40 rounded-2xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-xl shadow">
                  {topStore.icon || '🏪'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{topStore.name}</span>
                    <span className="text-[9px] bg-indigo-900/80 text-indigo-300 px-1.5 py-0.2 rounded font-bold">
                      Gian Hàng Đỉnh Cao
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-300">
                    Chủ quán: <strong>{topStore.ownerName}</strong> • Đã bán {topStore.totalSalesCount || 0} lượt
                  </p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-emerald-400">
                +{(topStore.totalRevenue || 0).toLocaleString('vi-VN')}₫
              </span>
            </div>
          )}

          {/* Full Citizen Ranking Table */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 px-1">Bảng Xếp Hạng Toàn Bộ Cư Dân:</span>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl max-h-48 overflow-y-auto divide-y divide-slate-800/80">
              {rankedByMoney.map((char, index) => (
                <div key={char.id} className="p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-5 text-center font-bold text-xs ${
                      index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-slate-500'
                    }`}>
                      #{index + 1}
                    </span>
                    <span className="font-semibold text-white truncate max-w-[160px]">{char.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400">
                      No: {char.stats.hunger}% • Lực: {char.stats.energy}%
                    </span>
                    <span className="font-extrabold text-amber-300 text-xs">
                      {char.stats.money.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onLogout}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đổi Tài Khoản</span>
          </button>

          {isHost ? (
            <button
              onClick={onRestartRound}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Khởi Động Lượt Chơi Mới (7 Phút)</span>
            </button>
          ) : (
            <div className="text-xs text-amber-300 font-semibold flex items-center gap-2 bg-amber-950/40 border border-amber-700/50 px-3 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>Đang đợi Host bắt đầu lượt mới...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
