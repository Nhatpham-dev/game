import React from 'react';
import { LogMessage } from '../types/game';
import { X, ScrollText, CheckCircle, AlertCircle, Coins, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  logs: LogMessage[];
  onClose: () => void;
}

export const LogsModal: React.FC<Props> = ({ isOpen, logs, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-2xl">
              <ScrollText className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Nhật Ký Thế Giới Sinh Tồn</h3>
              <p className="text-xs text-slate-300 font-medium">
                Biến động và sự kiện thực tế trong thế giới
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

        {/* Logs Feed */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 text-slate-200">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Chưa có sự kiện nào được ghi nhận.
            </div>
          ) : (
            logs.map((log) => {
              const timeString = new Date(log.timestamp).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              return (
                <div
                  key={log.id}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 flex items-start gap-3 text-xs"
                >
                  <div className="mt-0.5">
                    {log.type === 'money' && <Coins className="w-4 h-4 text-amber-400" />}
                    {log.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    {log.type === 'warning' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                    {log.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 leading-relaxed">{log.text}</p>
                    <span className="text-[10px] text-slate-500 block mt-1">{timeString}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
