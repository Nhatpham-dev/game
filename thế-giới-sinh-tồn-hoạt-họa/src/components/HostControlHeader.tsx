import React from 'react';
import { GameSessionState, UserAccount } from '../types/game';
import {
  Crown,
  Play,
  RefreshCw,
  Clock,
  Users,
  Store,
  ScrollText,
  LogOut,
  Trophy,
  Square
} from 'lucide-react';

interface Props {
  hostAccount: UserAccount;
  gameSession: GameSessionState;
  roundTimeRemaining: number;
  totalCharactersCount: number;
  onStartRound: () => void;
  onEndRoundEarly: () => void;
  onRestartRound: () => void;
  onOpenInspector: () => void;
  onOpenDirectory: () => void;
  onOpenLeaderboard: () => void;
  onOpenLogs: () => void;
  onSwitchAccount: () => void;
}

export const HostControlHeader: React.FC<Props> = ({
  hostAccount,
  gameSession,
  roundTimeRemaining,
  totalCharactersCount,
  onStartRound,
  onEndRoundEarly,
  onRestartRound,
  onOpenInspector,
  onOpenDirectory,
  onOpenLeaderboard,
  onOpenLogs,
  onSwitchAccount
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percentRemaining = Math.max(0, Math.min(100, (roundTimeRemaining / 420) * 100));

  return (
    <header className="bg-slate-950 border-b border-amber-500/40 shadow-xl z-30 select-none">
      {/* Top Main Host Bar */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-600 to-indigo-800 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-white">
        {/* Left: Host Identity Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black/40 border border-amber-300/50 flex items-center justify-center text-xl shadow-md flex-shrink-0 animate-pulse">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base uppercase tracking-wider text-amber-200">
                TỔNG QUẢN GIÁM SÁT (HOST)
              </span>
              <span className="text-[10px] bg-black/50 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold">
                Tài khoản: {hostAccount.username}
              </span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase shadow-sm ${
                gameSession.status === 'running'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-400 animate-pulse'
                  : gameSession.status === 'ended'
                  ? 'bg-rose-950 text-rose-300 border border-rose-400'
                  : 'bg-black/60 text-amber-300 border border-amber-400/50'
              }`}>
                {gameSession.status === 'running' ? 'Đang Chơi (7 Phút)' : gameSession.status === 'ended' ? 'Đã Hết Giờ' : 'Chờ Bắt Đầu'}
              </span>
            </div>
            <p className="text-[11px] text-amber-100/90 font-medium hidden sm:block">
              {gameSession.status === 'running'
                ? 'Lượt 7 phút đang chạy. Các chỉ số đói, thể lực, độ thoải mái của mọi người chơi đang tính và các gian hàng đã mở khóa!'
                : gameSession.status === 'ended'
                ? 'Lượt chơi 7 phút đã kết thúc. Nhấn nút để bắt đầu lượt mới!'
                : 'Mọi người chơi đang ở màn hình chính chờ bạn bấm Bắt Đầu. Chỉ khi bạn bấm nút thì hoạt động buôn bán và thanh sinh tồn mới bắt đầu!'}
            </p>
          </div>
        </div>

        {/* Center: Big Digital 7-Minute Timer */}
        <div className="flex items-center gap-3 bg-black/50 px-3.5 py-1.5 rounded-2xl border border-amber-400/30 shadow-inner">
          <Clock className={`w-4 h-4 ${roundTimeRemaining <= 60 ? 'text-rose-400 animate-spin' : 'text-amber-300'}`} />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-amber-200/80 font-bold">Thời Gian Lượt (7 Phút)</span>
            <span className={`font-mono font-black text-base sm:text-lg leading-none ${
              roundTimeRemaining <= 60 ? 'text-rose-400 animate-pulse' : 'text-emerald-300'
            }`}>
              {formatTime(roundTimeRemaining)}
            </span>
          </div>
          <div className="w-16 sm:w-24 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700 hidden sm:block">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                roundTimeRemaining <= 60 ? 'bg-rose-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${percentRemaining}%` }}
            />
          </div>
        </div>

        {/* Right: Primary Action Button */}
        <div className="flex items-center gap-2">
          {gameSession.status === 'running' ? (
            <button
              type="button"
              onClick={onEndRoundEarly}
              className="px-4 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-500 text-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5 fill-rose-300" />
              <span>Kết Thúc Lượt Sớm</span>
            </button>
          ) : gameSession.status === 'ended' ? (
            <button
              type="button"
              onClick={onRestartRound}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>BẮT ĐẦU LƯỢT MỚI (7 PHÚT)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartRound}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/40 transition-all cursor-pointer active:scale-95 animate-bounce"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>BẮT ĐẦU TRÒ CHƠI (7 PHÚT)</span>
            </button>
          )}
        </div>
      </div>

      {/* Host Spectator Navigation & Tool Bar */}
      <div className="px-3 sm:px-5 py-2 bg-slate-900 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenInspector}
            className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Quan Sát Cư Dân ({totalCharactersCount})</span>
          </button>

          <button
            type="button"
            onClick={onOpenDirectory}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Store className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gian Hàng & Dẫn Đường</span>
          </button>

          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Bảng Xếp Hạng</span>
          </button>

          <button
            type="button"
            onClick={onOpenLogs}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <ScrollText className="w-3.5 h-3.5 text-blue-400" />
            <span>Nhật Ký Cả Làng</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 hidden md:inline">
            💡 Dùng <strong>[W, A, S, D]</strong> hoặc <strong>[Phím Mũi Tên]</strong> để di chuyển camera khắp thành phố
          </span>

          <button
            type="button"
            onClick={onSwitchAccount}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-rose-300 hover:text-rose-200 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đổi Tài Khoản / Đăng Xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
};
