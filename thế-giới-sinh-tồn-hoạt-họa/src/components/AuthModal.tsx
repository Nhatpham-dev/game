import React, { useState } from 'react';
import { UserAccount } from '../types/game';
import { getAccounts, saveAccounts, setActiveAccountId, deleteAccount, HOST_ACCOUNT } from '../utils/storage';
import { sounds } from '../utils/audio';
import { UserPlus, LogIn, Users, Sparkles, ShieldCheck, Trash2, AlertTriangle, X, Crown, KeyRound, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onAccountReady: (account: UserAccount, isNew: boolean) => void;
  onAccountDeleted?: (accountId: string) => void;
  onSeedFortyAccounts?: () => void;
  onClose?: () => void;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onAccountReady,
  onAccountDeleted,
  onSeedFortyAccounts,
  onClose
}) => {
  const [tab, setTab] = useState<'create' | 'switch' | 'host'>('create');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [hostPin, setHostPin] = useState('host123');
  const [error, setError] = useState('');
  const [accountToDelete, setAccountToDelete] = useState<UserAccount | null>(null);
  const accounts = getAccounts();

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('Vui lòng nhập tên tài khoản của bạn.');
      return;
    }

    // Special Host Account verification
    if (cleanUsername.toLowerCase() === 'host') {
      if (pin.trim() !== 'host123') {
        setError("Tài khoản 'host' yêu cầu mật khẩu chính xác là 'host123'!");
        return;
      }
      handleLoginAsHost();
      return;
    }

    if (accounts.some(acc => acc.username.toLowerCase() === cleanUsername.toLowerCase())) {
      setError('Tên tài khoản này đã tồn tại! Vui lòng chọn tên khác hoặc chọn tab chuyển tài khoản.');
      return;
    }

    const newAccount: UserAccount = {
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: cleanUsername,
      pin: pin.trim() || '1234',
      createdAt: Date.now()
    };

    saveAccounts([...accounts, newAccount]);
    setActiveAccountId(newAccount.id);
    sounds.playCoin();
    onAccountReady(newAccount, true);
  };

  const handleLoginAsHost = () => {
    setError('');
    if (hostPin.trim() !== 'host123') {
      setError("Mật khẩu Host không chính xác! Mật khẩu là: 'host123'");
      return;
    }

    // Find or provision host account
    let hostAcc = accounts.find(a => a.username.toLowerCase() === 'host');
    if (!hostAcc) {
      hostAcc = HOST_ACCOUNT;
      saveAccounts([HOST_ACCOUNT, ...accounts]);
    } else {
      hostAcc = { ...hostAcc, isHost: true };
    }

    setActiveAccountId(hostAcc.id);
    sounds.playCoin();
    onAccountReady(hostAcc, false);
  };

  const handleSelectExisting = (acc: UserAccount) => {
    setActiveAccountId(acc.id);
    sounds.playCoin();
    onAccountReady(acc, false);
  };

  const handleConfirmDelete = () => {
    if (!accountToDelete) return;
    if (accountToDelete.isHost || accountToDelete.username.toLowerCase() === 'host') {
      setError('Không thể xóa tài khoản Host của hệ thống!');
      setAccountToDelete(null);
      return;
    }

    deleteAccount(accountToDelete.id);
    if (onAccountDeleted) {
      onAccountDeleted(accountToDelete.id);
    }
    sounds.playWork();
    setAccountToDelete(null);

    const remaining = getAccounts();
    if (remaining.length === 0) {
      setTab('create');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-indigo-950/60 flex flex-col relative">
        {/* Close button if optional */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header Banner */}
        <div className={`relative p-6 text-white text-center transition-all ${
          tab === 'host'
            ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700'
            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
        }`}>
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl mb-3 shadow-inner">
            {tab === 'host' ? (
              <Crown className="w-8 h-8 text-amber-300" />
            ) : (
              <Sparkles className="w-8 h-8 text-amber-300" />
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Thế Giới Sinh Tồn Hoạt Họa</h2>
          <p className="text-xs text-blue-100/90 mt-1 font-medium">
            {tab === 'host'
              ? 'Quyền Quản Trị Viên (Host): Bắt đầu lượt chơi 7 phút & điều phối thành phố'
              : 'Có bao nhiêu tài khoản đăng nhập thì sẽ có bấy nhiêu gian hàng trên bản đồ'}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1">
          <button
            onClick={() => { setTab('create'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'create'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tạo mới</span>
          </button>

          <button
            onClick={() => { setTab('switch'); setError(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'switch'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tài khoản ({accounts.length})</span>
          </button>

          <button
            onClick={() => { setTab('host'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'host'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                : 'text-amber-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Host</span>
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: CREATE NEW ACCOUNT */}
          {tab === 'create' && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Tên tài khoản người chơi:
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ví dụ: Minh Khang, Lan Anh, Bảo Nam..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">
                    Mã PIN bảo mật:
                  </label>
                  <span className="text-[10px] text-slate-500">Mặc định 1234 nếu để trống</span>
                </div>
                <input
                  type="password"
                  maxLength={10}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all tracking-widest text-center"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Bắt đầu khám phá & mở gian hàng</span>
              </button>
            </form>
          )}

          {/* TAB 2: SWITCH EXISTING ACCOUNT */}
          {tab === 'switch' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-2 flex items-center justify-between">
                <span>Chọn tài khoản bạn muốn đăng nhập:</span>
                <span className="text-indigo-400 font-semibold">{accounts.length} tài khoản</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {accounts.map(acc => {
                  const isHostAcc = acc.isHost || acc.username.toLowerCase() === 'host';
                  return (
                    <div
                      key={acc.id}
                      className={`p-3 border rounded-xl flex items-center justify-between transition-all group ${
                        isHostAcc
                          ? 'bg-amber-950/40 border-amber-500/70 shadow-sm'
                          : 'bg-slate-950/80 border-slate-800 hover:border-indigo-500/60'
                      }`}
                    >
                      <div
                        onClick={() => handleSelectExisting(acc)}
                        className="flex-1 cursor-pointer flex items-center gap-2.5 min-w-0"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isHostAcc
                            ? 'bg-amber-500 text-slate-950 shadow'
                            : 'bg-indigo-950 text-indigo-400 border border-indigo-700/50'
                        }`}>
                          {isHostAcc ? '👑' : acc.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                            <span className="truncate">{acc.username}</span>
                            {isHostAcc && (
                              <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                                HOST
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {isHostAcc ? 'Quản trị viên phòng chơi' : `Tạo ngày: ${new Date(acc.createdAt).toLocaleDateString('vi-VN')}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSelectExisting(acc)}
                          title="Vào chơi tài khoản này"
                          className={`p-2 rounded-lg transition-all cursor-pointer ${
                            isHostAcc
                              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow'
                              : 'bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white'
                          }`}
                        >
                          <LogIn className="w-4 h-4" />
                        </button>

                        {!isHostAcc && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAccountToDelete(acc);
                            }}
                            title={`Xóa tài khoản ${acc.username}`}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setTab('create')}
                className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                + Tạo thêm tài khoản cho người chơi mới
              </button>
            </div>
          )}

          {/* TAB 3: HOST LOGIN */}
          {tab === 'host' && (
            <div className="space-y-4">
              <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-4 text-xs text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span>Thông Tin Đăng Nhập Host:</span>
                </div>
                <div className="space-y-1 bg-black/40 p-3 rounded-xl border border-amber-800/40 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Tên đăng nhập:</span>
                    <strong className="text-amber-300">host</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Mật khẩu (PIN):</span>
                    <strong className="text-amber-300">host123</strong>
                  </div>
                </div>
                <p className="text-[11px] text-amber-100/80 leading-relaxed">
                  💡 <strong>Quyền hạn Host:</strong> Khi Host vào phòng, tất cả người chơi sẽ chuyển sang màn hình chính. Khi bạn nhấn <em>"Bắt Đầu Trò Chơi (7 phút)"</em>, toàn bộ người chơi mới có thể mở quán, mua bán và các thanh sinh tồn mới bắt đầu tính!
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Tên tài khoản Host:
                </label>
                <input
                  type="text"
                  disabled
                  value="host"
                  className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-amber-300 font-bold focus:outline-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Mật khẩu Host:
                </label>
                <input
                  type="password"
                  value={hostPin}
                  onChange={(e) => setHostPin(e.target.value)}
                  placeholder="host123"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleLoginAsHost}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-amber-600/30 transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Crown className="w-4 h-4 text-amber-200" />
                <span>Đăng Nhập Với Quyền Host Ngay</span>
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal Overlay */}
        {accountToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-rose-500/60 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-bold text-base text-white">Xác nhận xóa tài khoản?</h3>
                <p className="text-xs text-slate-300">
                  Bạn có chắc muốn xóa vĩnh viễn tài khoản <strong className="text-rose-400 underline">{accountToDelete.username}</strong>?
                </p>
                <p className="text-[11px] text-rose-300/80 bg-rose-950/40 p-2 rounded-xl border border-rose-800/40 mt-2">
                  ⚠️ Nhân vật, gian hàng của tài khoản này trên bản đồ và số tiền tích lũy sẽ bị xóa vĩnh viễn!
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAccountToDelete(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa vĩnh viễn
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
