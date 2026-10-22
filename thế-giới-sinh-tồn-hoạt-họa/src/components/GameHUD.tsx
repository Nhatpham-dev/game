import React, { useState } from 'react';
import { Character, LogMessage, SkillDefinition } from '../types/game';
import { ONE_HUNDRED_SKILLS } from '../data/skillsData';
import { CharacterSprite } from './CharacterSprite';
import { sounds } from '../utils/audio';
import {
  Zap,
  Utensils,
  Smile,
  Coins,
  Sun,
  Moon,
  Users,
  Trophy,
  Volume2,
  VolumeX,
  ScrollText,
  UserPlus,
  Trash2,
  AlertTriangle,
  HelpCircle,
  X
} from 'lucide-react';

interface Props {
  player: Character;
  timeOfDayHours: number;
  allCharacters: Character[];
  logs: LogMessage[];
  onSwitchAccount: () => void;
  onOpenLeaderboard: () => void;
  onOpenLogs: () => void;
  onDeleteCurrentAccount: () => void;
}

export const GameHUD: React.FC<Props> = ({
  player,
  timeOfDayHours,
  allCharacters,
  logs,
  onSwitchAccount,
  onOpenLeaderboard,
  onOpenLogs,
  onDeleteCurrentAccount
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSurvivalGuide, setShowSurvivalGuide] = useState(false);

  const handleToggleAudio = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sounds.playCoin();
    }
  };

  const skillIds = player.bestSkillIds && player.bestSkillIds.length > 0 
    ? player.bestSkillIds 
    : [player.bestSkillId];

  const playerSkills = skillIds
    .map(id => ONE_HUNDRED_SKILLS.find(s => s.id === id))
    .filter((s): s is SkillDefinition => s !== undefined);

  const primarySkill = playerSkills[0];
  const primaryIcon = player.bestSkillId === 'custom' ? '✨' : (primarySkill?.icon || '✨');

  // Format time of day
  const hourInt = Math.floor(timeOfDayHours);
  const minuteInt = Math.floor((timeOfDayHours - hourInt) * 60);
  const timeFormatted = `${String(hourInt).padStart(2, '0')}:${String(minuteInt).padStart(2, '0')}`;
  const isNight = timeOfDayHours < 6 || timeOfDayHours >= 18;

  return (
    <>
      <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white z-30 px-3 sm:px-6 py-2.5 shadow-lg select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Player Profile & 3 Skills */}
          <div className="flex items-center gap-3">
            <div className="relative bg-slate-950 p-1 rounded-2xl border border-slate-700/80 shadow">
              <CharacterSprite
                appearance={player.appearance}
                size={46}
                activityIcon={primaryIcon}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  {player.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Lv.{player.stats.level}
                </span>
              </div>

              {/* 3 Skills Badges */}
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                {player.bestSkillId === 'custom' ? (
                  <span className="text-xs text-purple-300 font-semibold truncate max-w-[160px]">
                    ✨ {player.customSkillName || 'Kỹ năng riêng'}
                  </span>
                ) : (
                  playerSkills.map(s => (
                    <span
                      key={s.id}
                      title={s.name}
                      className="text-[10px] text-amber-300 bg-slate-950/80 border border-slate-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 shadow-sm"
                    >
                      <span>{s.icon}</span>
                      <span className="font-bold text-indigo-300">#{s.orderNumber}</span>
                      <span className="hidden xl:inline truncate max-w-[110px]">{s.name}</span>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Center: Vital Survival Stats & Money */}
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
            {/* Money Wallet */}
            <div className="bg-slate-950/80 border border-amber-500/40 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 shadow-inner">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Ví tiền mặt</div>
                <div className="text-sm font-extrabold text-amber-300 tracking-tight">
                  {player.stats.money.toLocaleString('vi-VN')}₫
                </div>
              </div>
            </div>

            {/* Clickable Survival Meters Group */}
            <div
              onClick={() => setShowSurvivalGuide(true)}
              title="Bấm để xem chi tiết cơ chế Độ no, Thể lực & Cách hồi phục"
              className="flex items-center gap-3 sm:gap-4 bg-slate-950/50 hover:bg-slate-950/90 border border-slate-800 hover:border-indigo-500/50 px-3 py-1 rounded-2xl transition-all cursor-pointer group"
            >
              {/* Energy (Thể lực) */}
              <div className="flex flex-col min-w-[70px] sm:min-w-[85px]">
                <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-amber-300">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                    Thể lực
                  </span>
                  <span>{Math.round(player.stats.energy)}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, player.stats.energy))}%` }}
                  />
                </div>
              </div>

              {/* Hunger (Độ no) */}
              <div className="flex flex-col min-w-[70px] sm:min-w-[85px]">
                <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-orange-300">
                  <span className="flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-orange-400" />
                    Độ no
                  </span>
                  <span>{Math.round(player.stats.hunger)}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, player.stats.hunger))}%` }}
                  />
                </div>
              </div>

              {/* Comfort (Độ thoải mái) */}
              <div className="flex flex-col min-w-[70px] sm:min-w-[85px]">
                <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-pink-300">
                  <span className="flex items-center gap-1">
                    <Smile className="w-3 h-3 text-pink-400 fill-pink-400/20" />
                    Thoải mái
                  </span>
                  <span>{Math.round(player.stats.comfort ?? 100)}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="bg-pink-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, player.stats.comfort ?? 100))}%` }}
                  />
                </div>
              </div>

              <div className="text-slate-500 group-hover:text-indigo-400 transition-colors pl-0.5">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Right: Day/Night, Switcher & Delete Account button */}
          <div className="flex items-center gap-2">
            {/* Time & Weather */}
            <div className="bg-slate-950/80 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold">
              {isNight ? (
                <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              )}
              <span className="text-slate-300">{timeFormatted}</span>
            </div>

            {/* Leaderboard */}
            <button
              onClick={onOpenLeaderboard}
              title="Bảng xếp hạng cư dân sinh tồn"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Xếp hạng ({allCharacters.length})</span>
            </button>

            {/* Survival Event Logs */}
            <button
              onClick={onOpenLogs}
              title="Nhật ký sự kiện thế giới"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <ScrollText className="w-4 h-4" />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleAudio}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Switch Account */}
            <button
              onClick={onSwitchAccount}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đổi / Thêm tài khoản</span>
            </button>

            {/* Delete Current Account Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              title="Xóa tài khoản hiện tại"
              className="p-2 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1 text-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden lg:inline font-semibold">Xóa tài khoản</span>
            </button>
          </div>
        </div>
      </header>

      {/* Direct Delete Current Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/60 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-white">Xác nhận xóa tài khoản?</h3>
              <p className="text-xs text-slate-300">
                Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của <strong className="text-rose-400 underline">{player.name}</strong>?
              </p>
              <p className="text-[11px] text-rose-300/80 bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/40 mt-2 text-left leading-relaxed">
                ⚠️ Dữ liệu nhân vật, số tiền <strong>{player.stats.money.toLocaleString('vi-VN')}₫</strong> và mọi tiến trình sinh tồn sẽ bị xóa sạch khỏi thế giới.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteCurrentAccount();
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Survival Guide Modal (Độ no & Thể lực) */}
      {showSurvivalGuide && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Cơ Chế Độ No & Thể Lực</h3>
                  <p className="text-xs text-amber-100">Quy luật sinh tồn trong thế giới thực tế</p>
                </div>
              </div>
              <button
                onClick={() => setShowSurvivalGuide(false)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Guide Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
              {/* 1. Thể lực */}
              <div className="bg-slate-950/70 border border-amber-500/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 fill-amber-400" />
                    <span>1. Thể lực (Energy - 0 đến 100%)</span>
                  </h4>
                  <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-800">
                    Hiện tại: {Math.round(player.stats.energy)}%
                  </span>
                </div>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  <li>
                    <strong className="text-white">Bao lâu sẽ hết?</strong>
                    <ul className="pl-4 list-none space-y-1 text-slate-400 mt-0.5">
                      <li>• <em>Khi đi bộ:</em> Tiêu hao nhanh <strong>-0.25% mỗi giây</strong> khi di chuyển.</li>
                      <li>• <em>Khi bán hàng / tiếp khách:</em> Tiêu hao từ <strong>10% đến 15% mỗi ca</strong>.</li>
                      <li>• <em>Hậu quả:</em> Thể lực dưới mức cần thiết bạn sẽ kiệt sức không thể tiếp tục hoạt động.</li>
                    </ul>
                  </li>
                  <li className="pt-1">
                    <strong className="text-emerald-400">Cách làm tăng Thể lực:</strong>
                    <ul className="pl-4 list-none space-y-1 text-slate-400 mt-0.5">
                      <li>• 🥩 <strong>Thịt nướng (30.000₫):</strong> Hồi <strong className="text-amber-300">+50% Thể lực</strong> (Mua tại Quán Ăn Sinh Tồn Trung Tâm).</li>
                      <li>• 🍚 <strong>Cơm trắng (25.000₫):</strong> Hồi <strong className="text-amber-300">+35% Thể lực</strong> (Mua tại Quán Ăn Sinh Tồn Trung Tâm).</li>
                      <li>• 💧 <strong>Nước khoáng (10.000₫):</strong> Hồi <strong className="text-amber-300">+20% Thể lực</strong> (Mua tại Quán Ăn Sinh Tồn Trung Tâm).</li>
                      <li>⚠️ <em>Lưu ý thua cuộc:</em> 1 trong 2 thanh Thể lực hoặc Độ no mất (0%) là bạn sẽ <strong>THUA LUÔN</strong>!</li>
                    </ul>
                  </li>
                </ul>
              </div>

              {/* 2. Độ no */}
              <div className="bg-slate-950/70 border border-orange-500/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-orange-400 flex items-center gap-1.5">
                    <Utensils className="w-4 h-4" />
                    <span>2. Độ no (Hunger - 0 đến 100%)</span>
                  </h4>
                  <span className="text-[11px] font-bold text-orange-300 bg-orange-950/80 px-2 py-0.5 rounded-lg border border-orange-800">
                    Hiện tại: {Math.round(player.stats.hunger)}%
                  </span>
                </div>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  <li>
                    <strong className="text-white">Bao lâu sẽ hết?</strong>
                    <ul className="pl-4 list-none space-y-1 text-slate-400 mt-0.5">
                      <li>• <em>Tự nhiên:</em> Giảm <strong>-0.45% mỗi giây</strong> ➔ Cạn kiệt sau khoảng ~3.7 phút nếu không ăn.</li>
                      <li>• <em>Hậu quả khi hết (0%):</em> <strong>THUA CUỘC NGAY LẬP TỨC!</strong></li>
                    </ul>
                  </li>
                  <li className="pt-1">
                    <strong className="text-emerald-400">Nơi DUY NHẤT để tăng Độ no (Quán Ăn Sinh Tồn Trung Tâm):</strong>
                    <ul className="pl-4 list-none space-y-1 text-slate-400 mt-0.5">
                      <li>• 🥩 <strong>Thịt nướng (30.000₫):</strong> Hồi <strong className="text-orange-300">+45% Độ no</strong>, +50% Thể lực.</li>
                      <li>• 🍚 <strong>Cơm trắng nóng hổi (25.000₫):</strong> Hồi <strong className="text-orange-300">+30% Độ no</strong>, +35% Thể lực.</li>
                      <li>• 💧 <strong>Nước khoáng tinh khiết (10.000₫):</strong> Hồi <strong className="text-orange-300">+15% Độ no</strong>, +20% Thể lực.</li>
                    </ul>
                  </li>
                </ul>
              </div>

              {/* 3. Độ thoải mái */}
              <div className="bg-slate-950/70 border border-pink-500/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-pink-400 flex items-center gap-1.5">
                    <Smile className="w-4 h-4 fill-pink-400/20" />
                    <span>3. Độ thoải mái (Comfort - Bắt buộc duy trì)</span>
                  </h4>
                  <span className="text-[11px] font-bold text-pink-300 bg-pink-950/80 px-2 py-0.5 rounded-lg border border-pink-800">
                    Hiện tại: {Math.round(player.stats.comfort ?? 100)}%
                  </span>
                </div>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  <li>
                    <strong className="text-white">Cơ chế tiêu hao & Điều kiện Thua cuộc:</strong>
                    <ul className="pl-4 list-none space-y-1 text-slate-400 mt-0.5">
                      <li>• Độ thoải mái liên tục giảm dần theo thời gian trong quá trình sinh hoạt và lao động.</li>
                      <li>• 💀 <strong>CỰC KỲ QUAN TRỌNG:</strong> Nếu mất thanh độ thoải mái (về 0%) thì <strong>CŨNG COI NHƯ THUA CUỘC</strong>!</li>
                    </ul>
                  </li>
                  <li className="pt-1">
                    <strong className="text-emerald-400">Cách duy trì thanh Độ thoải mái:</strong>
                    <ul className="pl-4 list-none space-y-1 text-slate-400 mt-0.5">
                      <li>• 🛍️ <strong>Mỗi người trên bản đồ PHẢI đi mua đồ từ các gian hàng của người khác</strong> (Cà phê, Trà sữa, Mỹ thuật, Trị liệu, Âm nhạc...) để nạp lại Độ thoải mái!</li>
                      <li>• 💬 Khi ghé thăm quán của người khác, bạn có thể bấm <strong>"Trao đổi"</strong> để trò chuyện đàm phán giảm giá hoặc tăng giá sản phẩm trước khi mua!</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 text-center">
              <button
                type="button"
                onClick={() => setShowSurvivalGuide(false)}
                className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow"
              >
                Đã hiểu, quay lại thế giới sinh tồn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
