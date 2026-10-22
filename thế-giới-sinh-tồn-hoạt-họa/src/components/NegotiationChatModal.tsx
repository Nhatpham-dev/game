import React, { useState, useEffect, useRef } from 'react';
import { NegotiationSession, NegotiationMessage } from '../types/game';
import { sounds } from '../utils/audio';
import {
  MessageSquare,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Send,
  CheckCircle,
  Crown,
  User,
  Sparkles,
  X,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  session: NegotiationSession | null;
  currentAccountId: string;
  currentAccountName: string;
  onSendMessage: (text: string, proposedPrice?: number) => void;
  onOwnerConfirmPrice: (newPrice: number) => void;
  onClose: () => void;
}

export const NegotiationChatModal: React.FC<Props> = ({
  isOpen,
  session,
  currentAccountId,
  currentAccountName,
  onSendMessage,
  onOwnerConfirmPrice,
  onClose
}) => {
  if (!isOpen || !session) return null;

  const isOwner = currentAccountId === session.ownerAccountId;
  const isCustomer = currentAccountId === session.customerAccountId;

  const [inputText, setInputText] = useState('');
  const [ownerNewPrice, setOwnerNewPrice] = useState<number>(
    session.currentAgreedPrice || session.originalPrice
  );
  const [errorMsg, setErrorMsg] = useState('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Update ownerNewPrice whenever session's currentAgreedPrice changes
  useEffect(() => {
    if (session.currentAgreedPrice) {
      setOwnerNewPrice(session.currentAgreedPrice);
    }
  }, [session.currentAgreedPrice]);

  // Auto-scroll on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages?.length]);

  const handleSend = (textToSend?: string, proposedPrice?: number) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    onSendMessage(text, proposedPrice);
    setInputText('');
    sounds.playStep();

    if (proposedPrice && proposedPrice > 0) {
      setOwnerNewPrice(proposedPrice);
    }
  };

  const handleOwnerConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerNewPrice || ownerNewPrice < 1000) {
      setErrorMsg('Vui lòng điền số tiền hợp lệ (tối thiểu 1.000₫).');
      return;
    }

    sounds.playFanfare();
    onOwnerConfirmPrice(ownerNewPrice);
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-indigo-500/70 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl shadow-indigo-950/80 flex flex-col max-h-[92vh]">
        {/* Header Banner */}
        <div className="p-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-2xl shadow-inner">
              💬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Đàm Phán Giá Cả Trực Tiếp
                </h3>
                {isOwner ? (
                  <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    <span>Bạn là Chủ Quán</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>Bạn là Khách Hàng</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-indigo-200 mt-0.5">
                Gian hàng: <strong className="text-white">{session.storeName}</strong> • Chủ quán: <strong className="text-amber-300">{session.ownerName}</strong> ↔ Khách: <strong className="text-indigo-300">{session.customerName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Đóng cuộc đàm phán"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Synchronization Notice Bar */}
        <div className="bg-emerald-950/60 border-b border-emerald-800/60 px-4 py-1.5 flex items-center justify-between text-[11px] text-emerald-300 font-medium">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Đang kết nối trực tiếp cả Chủ Gian Hàng và Khách Hàng</span>
          </div>
          <span className="text-[10px] text-emerald-400/80">Real-time Cloud Sync</span>
        </div>

        {/* Product Being Negotiated Banner */}
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1 bg-slate-900 rounded-xl border border-slate-800">{session.productIcon || '🛍️'}</span>
            <div>
              <span className="font-bold text-white block">{session.productName}</span>
              <span className="text-[10px] text-slate-400">
                Giá niêm yết tại quầy: <span className="line-through">{session.originalPrice.toLocaleString('vi-VN')}₫</span> (vẫn giữ nguyên cho khách khác)
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Giá thương lượng riêng:</span>
            <span className="text-amber-400 font-extrabold text-sm">
              {(session.currentAgreedPrice || session.originalPrice).toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>

        {/* Live Conversation Chat Messages */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-900/60 min-h-[220px]">
          {session.messages?.map((msg) => {
            const isMe = msg.senderId === currentAccountId;
            const isMsgCustomer = msg.senderRole === 'customer';
            const isSystem = msg.senderRole === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center py-1">
                  <span className="bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-[10px] px-3 py-1 rounded-full font-semibold">
                    🔔 {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow ${
                    isMsgCustomer ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {isMsgCustomer ? <User className="w-3.5 h-3.5" /> : <Crown className="w-3.5 h-3.5" />}
                </div>

                <div className={`max-w-[78%] space-y-0.5 ${isMe ? 'text-right' : 'text-left'}`}>
                  <div className="text-[10px] text-slate-400 font-semibold px-1">
                    {msg.senderName} {isMe ? '(Bạn)' : ''} • {msg.time}
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed shadow-md ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                    {msg.proposedPrice && (
                      <div className="mt-1 pt-1 border-t border-white/20 text-[11px] font-bold text-amber-300 flex items-center gap-1">
                        <span>💡 Đề xuất giá:</span>
                        <span>{msg.proposedPrice.toLocaleString('vi-VN')}₫</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips for Customer */}
        {isCustomer && (
          <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 space-y-1.5">
            <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Gợi ý trả giá nhanh cho khách hàng:</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
              <button
                type="button"
                onClick={() =>
                  handleSend(
                    'Sinh viên nghèo xin bớt 20% mở hàng được không bạn ơi?',
                    Math.round((session.originalPrice * 0.8) / 1000) * 1000
                  )
                }
                className="py-1 px-2.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-700/60 text-rose-300 rounded-xl font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95 transition-all"
              >
                <TrendingDown className="w-3 h-3" />
                <span>Giảm 20% ({Math.round(session.originalPrice * 0.8).toLocaleString('vi-VN')}₫)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSend(
                    'Mình mua ủng hộ bạn nè, giảm nhẹ 10% nha!',
                    Math.round((session.originalPrice * 0.9) / 1000) * 1000
                  )
                }
                className="py-1 px-2.5 bg-amber-950/60 hover:bg-amber-900 border border-amber-700/60 text-amber-300 rounded-xl font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95 transition-all"
              >
                <TrendingDown className="w-3 h-3" />
                <span>Giảm 10% ({Math.round(session.originalPrice * 0.9).toLocaleString('vi-VN')}₫)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSend(
                    'Món này của bạn làm quá chất lượng, mình muốn trả thêm +15% ủng hộ quán!',
                    Math.round((session.originalPrice * 1.15) / 1000) * 1000
                  )
                }
                className="py-1 px-2.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 rounded-xl font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95 transition-all"
              >
                <TrendingUp className="w-3 h-3" />
                <span>Tăng +15% ({Math.round(session.originalPrice * 1.15).toLocaleString('vi-VN')}₫)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSend(
                    'Quán quá chill, mình muốn tăng giá +30% gửi tặng chủ quán phát tài nhé!',
                    Math.round((session.originalPrice * 1.3) / 1000) * 1000
                  )
                }
                className="py-1 px-2.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-700/60 text-purple-300 rounded-xl font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95 transition-all"
              >
                <TrendingUp className="w-3 h-3" />
                <span>Tăng +30% ({Math.round(session.originalPrice * 1.3).toLocaleString('vi-VN')}₫)</span>
              </button>
            </div>
          </div>
        )}

        {/* Message Input Box (Both Owner & Customer can type) */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              isOwner
                ? 'Nhắn tin trả lời khách hàng (Ví dụ: Đồng ý mức giá này nhé)...'
                : 'Nhập lời nhắn trao đổi với chủ quán...'
            }
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer shadow active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* REQUIREMENT: CHỦ GIAN HÀNG ĐIỀN SỐ TIỀN MỚI VÀ ẤN XÁC NHẬN ĐỂ KẾT THÚC   */}
        {/* ========================================================================= */}
        {isOwner ? (
          <form
            onSubmit={handleOwnerConfirm}
            className="p-4 bg-gradient-to-r from-amber-950/60 via-slate-950 to-orange-950/60 border-t-2 border-amber-500/80 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>BẠN LÀ CHỦ QUÁN • CHỐT GIÁ BÁN & HOÀN TẤT CHO KHÁCH:</span>
              </div>
              <span className="text-[10px] text-slate-400 italic">
                (Khách sẽ bị trừ tiền ngay • Giá quầy vẫn giữ nguyên cho người khác)
              </span>
            </div>

            {errorMsg && (
              <div className="text-[11px] text-rose-400 bg-rose-950/40 p-1.5 rounded-lg border border-rose-800">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <span className="text-xs text-slate-400 absolute left-3 top-2.5">Số tiền bán:</span>
                <input
                  type="number"
                  min={1000}
                  max={500000}
                  step={1000}
                  required
                  value={ownerNewPrice}
                  onChange={(e) => setOwnerNewPrice(Number(e.target.value))}
                  className="w-full bg-slate-900 border-2 border-amber-500/80 rounded-xl pl-24 pr-8 py-2 text-right text-amber-300 font-black text-sm focus:outline-none focus:border-amber-400 shadow-inner"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">₫</span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto py-2.5 px-5 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-900/40 active:scale-98 whitespace-nowrap"
              >
                <CheckCircle className="w-4 h-4 text-slate-950" />
                <span>Xác Nhận Giá Bán & Trừ Tiền Khách</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
            <span>
              Đang chờ chủ quán <strong className="text-amber-300">{session.ownerName}</strong> xác nhận giá chốt. Khi xác nhận, bạn sẽ mua ngay món hàng này và bị trừ tiền theo mức giá ưu đãi!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
