import React from 'react';
import { Character, UserAccount } from '../types/game';
import { Clock, Users, ShieldAlert, LogOut, Sparkles, Crown, Compass, Store, Heart } from 'lucide-react';
import { CharacterSprite } from './CharacterSprite';

interface Props {
  player: Character;
  account: UserAccount;
  allCharacters: Character[];
  onLogout: () => void;
}

export const WaitingForHostModal: React.FC<Props> = ({
  player,
  account,
  allCharacters,
  onLogout
}) => {
  const waitingCitizens = allCharacters.filter(c => c.id !== player.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col relative max-h-[92vh]">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 p-6 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-3 shadow-inner relative">
            <Clock className="w-8 h-8 text-amber-200 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400"></span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
            Đang Đợi Host Vào Phòng
          </h2>
          <p className="text-xs text-amber-100/90 mt-1.5 font-medium max-w-sm mx-auto">
            Chủ phòng (Host) chưa có mặt. Mọi người chơi sẽ tự động được đưa vào màn hình chính ngay khi Host đăng nhập!
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Host Credentials Info Card for Testing / Reference */}
          <div className="bg-amber-950/40 border border-amber-600/40 rounded-2xl p-3.5 text-xs text-amber-200 space-y-1.5 shadow-inner">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Thông tin tài khoản Host:</span>
            </div>
            <p className="text-[11px] text-amber-100/80">
              Tên đăng nhập: <strong className="text-white bg-black/40 px-2 py-0.5 rounded font-mono">host</strong> • Mật khẩu: <strong className="text-white bg-black/40 px-2 py-0.5 rounded font-mono">host123</strong>
            </p>
            <p className="text-[10px] text-amber-300/80 italic">
              (Bạn có thể mở một tab ẩn danh khác đăng nhập tài khoản Host để điều khiển bắt đầu lượt chơi)
            </p>
          </div>

          {/* Current Player Status Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex items-center justify-center shadow">
                <CharacterSprite appearance={player.appearance} size={44} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-white text-sm">{player.name}</h4>
                  <span className="text-[9px] bg-emerald-950 border border-emerald-600/60 text-emerald-300 px-1.5 py-0.2 rounded-full font-bold">
                    Sẵn sàng
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ví tiền khởi điểm: <strong className="text-amber-400 font-extrabold">{player.stats.money.toLocaleString('vi-VN')}₫</strong>
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đổi Acc</span>
            </button>
          </div>

          {/* Waiting Room Citizens List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Các cư dân đang trong phòng chờ ({allCharacters.length}):</span>
              </span>
              <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Trực tuyến
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-2.5 max-h-40 overflow-y-auto space-y-1.5">
              {allCharacters.map(char => (
                <div
                  key={char.id}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                    char.id === player.id
                      ? 'bg-indigo-950/50 border border-indigo-600/50 text-white font-bold'
                      : 'bg-slate-900/60 border border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{char.name === 'host' ? '👑' : '👤'}</span>
                    <span className="truncate max-w-[170px]">{char.name}</span>
                    {char.id === player.id && (
                      <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-normal">
                        Bạn
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-amber-300 font-bold">
                    {char.stats.money.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rules Summary Card */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3.5 text-[11px] text-slate-300 space-y-1.5">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Luật chơi quy định:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[10.5px]">
              <li>Mỗi lượt chơi kéo dài chính xác <strong className="text-amber-300 font-bold">7 phút</strong> sau khi Host bấm Bắt Đầu.</li>
              <li>Chỉ khi Host bấm Bắt Đầu thì các thanh Đói, Thể Lực, Thoải Mái mới bắt đầu tính và mở khóa buôn bán.</li>
              <li>Người chơi có thể mở gian hàng, thương lượng giá cả và tiếp khách để tích lũy tài sản.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
