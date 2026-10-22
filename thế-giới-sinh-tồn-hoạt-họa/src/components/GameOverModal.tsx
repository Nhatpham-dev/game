import React from 'react';
import { Character } from '../types/game';
import { AlertTriangle, HeartPulse, RefreshCw, Sparkles, Utensils, Zap, Smile } from 'lucide-react';

interface Props {
  reason: 'hunger' | 'energy' | 'comfort' | null;
  player: Character;
  onRevive: () => void;
  onRestartNew: () => void;
}

export const GameOverModal: React.FC<Props> = ({
  reason,
  player,
  onRevive,
  onRestartNew
}) => {
  if (!reason) return null;

  const getReasonDetails = () => {
    switch (reason) {
      case 'hunger':
        return {
          title: 'GỤC NGÃ VÌ ĐÓI BỤNG (ĐỘ NO 0%)',
          icon: <Utensils className="w-12 h-12 text-orange-400" />,
          color: 'from-orange-950 to-red-950 border-orange-500/80',
          desc: 'Độ no của bạn đã cạn kiệt về 0%! Cơ thể không còn năng lượng để duy trì sự sống.',
          advice: '⚠️ BẮT BUỘC: Bạn phải luôn mua Cơm (25k), Nước (10k), hoặc Thịt (30k) tại Gian Hàng Ăn Sinh Tồn Trung Tâm để duy trì độ no!'
        };
      case 'energy':
        return {
          title: 'BẤT TỈNH VÌ KIỆT SỨC (THỂ LỰC 0%)',
          icon: <Zap className="w-12 h-12 text-amber-400" />,
          color: 'from-amber-950 to-red-950 border-amber-500/80',
          desc: 'Thể lực của bạn đã rơi về 0%! Làm việc và di chuyển liên tục mà không nạp dinh dưỡng đã khiến bạn ngất xỉu.',
          advice: '⚠️ BẮT BUỘC: Thể lực chỉ được hồi phục bằng việc ăn Thịt (+50%), Cơm (+35%) hoặc Nước (+20%) tại Quán Ăn Sinh Tồn Trung Tâm!'
        };
      case 'comfort':
      default:
        return {
          title: 'SUY SỤP TINH THẦN (ĐỘ THOẢI MÁI 0%)',
          icon: <Smile className="w-12 h-12 text-pink-400" />,
          color: 'from-pink-950 to-purple-950 border-pink-500/80',
          desc: 'Độ thoải mái đã cạn sạch về 0%! Áp lực đô thị và sự cô lập đã khiến bạn suy sụp tinh thần hoàn toàn.',
          advice: '⚠️ BẮT BUỘC: Mỗi người trên bản đồ PHẢI đi mua đồ từ các gian hàng của người khác (Cà phê, Trà sữa, Mỹ thuật, Trị liệu...) để duy trì độ thoải mái!'
        };
    }
  };

  const details = getReasonDetails();
  const reviveCost = Math.min(player.stats.money, 15000);
  const canAffordRevive = true;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4 select-none animate-in fade-in zoom-in-95 duration-300">
      <div className={`bg-gradient-to-b ${details.color} border-2 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-center text-white space-y-5`}>
        {/* Icon & Warning */}
        <div className="w-20 h-20 bg-slate-950/80 rounded-3xl mx-auto flex items-center justify-center shadow-inner border border-white/20 animate-pulse">
          {details.icon}
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-400 bg-red-950/80 border border-red-500/50 px-3 py-0.5 rounded-full">
            💀 BẠN ĐÃ THUA CUỘC
          </span>
          <h2 className="text-xl font-black text-white tracking-tight mt-2">
            {details.title}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed px-2">
            {details.desc}
          </p>
        </div>

        {/* Vital Rule Box */}
        <div className="bg-slate-950/80 border border-slate-700/80 rounded-2xl p-3.5 text-left text-xs space-y-1.5 shadow-inner">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Quy Tắc Sinh Tồn Cần Ghi Nhớ:</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            {details.advice}
          </p>
          <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800">
            * 1 trong 2 thanh Độ no và Thể lực mất là thua luôn. Mất thanh Độ thoải mái cũng coi như thua.
          </div>
        </div>

        {/* Survival Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={onRevive}
            disabled={!canAffordRevive}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              canAffordRevive
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-900/40 active:scale-98'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-emerald-300" />
            <span>
              🚑 Cấp Cứu & Hồi Sinh (Phí {reviveCost.toLocaleString('vi-VN')}₫)
            </span>
          </button>

          <button
            type="button"
            onClick={onRestartNew}
            className="w-full py-3 px-4 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>🔄 Làm Lại Từ Đầu (Đầy 100% cả 3 thanh)</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400">
          Số dư trong ví: <strong className="text-emerald-400 font-bold">{player.stats.money.toLocaleString('vi-VN')}₫</strong>
        </div>
      </div>
    </div>
  );
};
