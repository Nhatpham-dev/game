import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  UserAccount,
  Character,
  BuildingZone,
  LogMessage,
  NegotiationSession,
  NegotiationMessage,
  StoreProduct,
  GameSessionState,
  GameRoundStatus
} from './types/game';
import {
  getAccounts,
  saveAccounts,
  getActiveAccountId,
  getCharacters,
  saveCharacter,
  saveCharacters,
  getCharacterByAccountId,
  getLogs,
  addLog,
  setActiveAccountId,
  deleteAccount,
  getStallPurchaseCount,
  recordStallPurchase,
  getLocalGameSession,
  saveLocalGameSession,
  HOST_ACCOUNT
} from './utils/storage';
import { syncBuildingsWithAccounts, saveBuildingsToStorage, generateFortyDemoAccounts } from './utils/buildingManager';
import { getStandardProductBasePrice } from './data/businessSectors';
import { AuthModal } from './components/AuthModal';
import { CharacterSetupModal } from './components/CharacterSetupModal';
import { WorldCanvas } from './components/WorldCanvas';
import { GameHUD } from './components/GameHUD';
import { BuildingInteractionModal } from './components/BuildingInteractionModal';
import { NegotiationChatModal } from './components/NegotiationChatModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { LogsModal } from './components/LogsModal';
import { ShopDirectoryModal } from './components/ShopDirectoryModal';
import { GameOverModal } from './components/GameOverModal';
import { WaitingForHostModal } from './components/WaitingForHostModal';
import { RoundSummaryModal } from './components/RoundSummaryModal';
import { HostControlHeader } from './components/HostControlHeader';
import { HostSpectatorInspector } from './components/HostSpectatorInspector';
import { sounds } from './utils/audio';
import {
  testConnection,
  subscribeToRemoteAccounts,
  subscribeToRemoteCharacters,
  subscribeToRemoteBuildings,
  subscribeToRemoteLogs,
  subscribeToNegotiations,
  syncNegotiationToCloud,
  addNegotiationMessageToCloud,
  deleteNegotiationFromCloud,
  syncCharacterToCloud,
  syncBuildingToCloud,
  syncAccountToCloud,
  deleteAccountFromCloud,
  bulkUploadCityToCloud,
  subscribeToGameSession,
  syncGameSessionToCloud,
  loginWithGoogle,
  logoutUser,
  auth
} from './utils/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Crown, Play, Pause, RefreshCw, Clock, Sparkles, AlertCircle, CheckCircle, Trophy } from 'lucide-react';

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  opacity: number;
  createdAt: number;
}

export default function App() {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(null);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingZone | null>(null);
  const [buildings, setBuildings] = useState<BuildingZone[]>(() => {
    return syncBuildingsWithAccounts(getAccounts(), getCharacters());
  });
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isLogsOpen, setIsLogsOpen] = useState<boolean>(false);
  const [isShopDirectoryOpen, setIsShopDirectoryOpen] = useState<boolean>(false);
  const [isHostInspectorOpen, setIsHostInspectorOpen] = useState<boolean>(false);
  const [spectatorFocusCoords, setSpectatorFocusCoords] = useState<{ x: number; y: number } | null>(null);
  const [gameOverReason, setGameOverReason] = useState<'hunger' | 'energy' | 'comfort' | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [activeNegotiation, setActiveNegotiation] = useState<NegotiationSession | null>(null);
  const activeNegotiationRef = useRef<NegotiationSession | null>(null);
  useEffect(() => {
    activeNegotiationRef.current = activeNegotiation;
  }, [activeNegotiation]);

  // Game session & 7-minute round management
  const [gameSession, setGameSession] = useState<GameSessionState>(() => getLocalGameSession());
  const [roundTimeRemaining, setRoundTimeRemaining] = useState<number>(420);
  const gameSessionRef = useRef<GameSessionState>(gameSession);
  useEffect(() => {
    gameSessionRef.current = gameSession;
  }, [gameSession]);

  const isHost = Boolean(currentAccount?.isHost || currentAccount?.username.toLowerCase() === 'host');

  const broadcastSession = (session: GameSessionState) => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('survival_game_session');
        bc.postMessage({ type: 'SESSION_UPDATE', session });
        bc.close();
      }
    } catch {}
  };

  const currentAccountRef = useRef<UserAccount | null>(null);
  useEffect(() => {
    currentAccountRef.current = currentAccount;
  }, [currentAccount]);

  const currentCharacterRef = useRef<Character | null>(null);
  useEffect(() => {
    currentCharacterRef.current = currentCharacter;
  }, [currentCharacter]);

  const processedAgreementsRef = useRef<Set<string>>(new Set());
  const lastCloudSyncRef = useRef<number>(0);

  // World simulation state
  const [timeOfDayHours, setTimeOfDayHours] = useState<number>(9.5); // 09:30 AM start
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [logs, setLogs] = useState<LogMessage[]>([]);

  // Initialize data & Setup Real-Time Firebase Listeners
  useEffect(() => {
    const loadedAccounts = getAccounts();
    const loadedCharacters = getCharacters();
    const loadedLogs = getLogs();

    setAccounts(loadedAccounts);
    setAllCharacters(loadedCharacters);
    setLogs(loadedLogs);

    // Sync buildings: Exactly 1 stall per registered account + Central Survival Food Stall
    const syncedBuildings = syncBuildingsWithAccounts(loadedAccounts, loadedCharacters);
    setBuildings(syncedBuildings);

    const activeId = getActiveAccountId();
    if (activeId) {
      const foundAcc = loadedAccounts.find(a => a.id === activeId);
      if (foundAcc) {
        setCurrentAccount(foundAcc);
        const isHostAcc = foundAcc.isHost || foundAcc.username.toLowerCase() === 'host';
        if (isHostAcc) {
          // Host account never needs character setup
          setCurrentCharacter(null);
          setIsSetupOpen(false);
        } else {
          const foundChar = loadedCharacters.find(c => c.accountId === activeId);
          if (foundChar) {
            // Fix previous bug where character was mistakenly saved as "nhat" instead of account's username:
            if (foundChar.name !== foundAcc.username && (foundChar.name === 'nhat' || !foundChar.name)) {
              foundChar.name = foundAcc.username;
              saveCharacter(foundChar);
            }
            setCurrentCharacter(foundChar);
          } else {
            // Has account but not setup character yet
            setCurrentCharacter(null);
            setIsSetupOpen(true);
          }
        }
      } else {
        setIsAuthOpen(true);
      }
    } else {
      // First time player
      setIsAuthOpen(true);
    }

    // 1. Test Firebase Connectivity & Pre-populate Cloud if available
    testConnection().then(connected => {
      setIsCloudConnected(connected);
      if (connected) {
        bulkUploadCityToCloud(loadedAccounts, loadedCharacters, syncedBuildings);
      }
    });

    // 2. Track Firebase Auth state
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });

    // 3. Real-Time Remote Characters Sync across different devices
    const unsubRemoteChars = subscribeToRemoteCharacters((remoteChars) => {
      setAllCharacters(prev => {
        const charMap = new Map<string, Character>();
        remoteChars.forEach(c => charMap.set(c.id, c));
        // Preserve active player's local responsive coordinate
        const activeLocalChar = currentCharacter;
        if (activeLocalChar) {
          charMap.set(activeLocalChar.id, activeLocalChar);
        }
        const merged = Array.from(charMap.values());
        saveCharacters(merged);
        return merged;
      });
    });

    // 4. Real-Time Remote Stalls & Pricing Sync across devices
    const unsubRemoteBuildings = subscribeToRemoteBuildings((remoteBuildings) => {
      if (remoteBuildings.length > 0) {
        setBuildings(prev => {
          const map = new Map<string, BuildingZone>();
          // Central stall always preserved
          prev.forEach(b => map.set(b.id, b));
          remoteBuildings.forEach(b => map.set(b.id, b));
          const list = Array.from(map.values());
          saveBuildingsToStorage(list);
          return list;
        });
      }
    });

    // 5. Real-Time Remote Accounts Sync
    const unsubRemoteAccounts = subscribeToRemoteAccounts((remoteAccs) => {
      if (remoteAccs.length > 0) {
        setAccounts(prev => {
          const map = new Map<string, UserAccount>();
          remoteAccs.forEach(a => map.set(a.id, a));
          const list = Array.from(map.values());
          saveAccounts(list);
          return list;
        });
      }
    });

    // 6. Real-Time Remote Event Logs
    const unsubRemoteLogs = subscribeToRemoteLogs((remoteLogs) => {
      if (remoteLogs.length > 0) {
        setLogs(remoteLogs);
      }
    });

    // 7. Real-Time Negotiations Sync (For BOTH Store Owner and Customer)
    let negBroadcast: BroadcastChannel | null = null;
    let salesBroadcast: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        salesBroadcast = new BroadcastChannel('survival_game_sales');
        salesBroadcast.onmessage = (event) => {
          if (event.data?.type === 'DIRECT_SALE_CREDIT') {
            const { ownerId, amount, productName, storeName } = event.data;
            const currentAccId = currentAccountRef.current?.id || getActiveAccountId();
            const currChar = currentCharacterRef.current;
            if (currentAccId && (ownerId === currentAccId || currChar?.id === ownerId)) {
              setCurrentCharacter(prevChar => {
                if (!prevChar) return null;
                const newMoney = prevChar.stats.money + amount;
                const updatedChar: Character = {
                  ...prevChar,
                  stats: {
                    ...prevChar.stats,
                    money: newMoney
                  }
                };
                saveCharacter(updatedChar);
                syncCharacterToCloud(updatedChar);
                return updatedChar;
              });
              addFloatingText(`+${amount.toLocaleString('vi-VN')}₫`, '#34D399');
              sounds.playCoin();
              addLog(
                `💰 Gian hàng "${storeName}" của bạn vừa bán được "${productName}"! Bạn nhận ngay +${amount.toLocaleString('vi-VN')}₫ trực tiếp vào ví!`,
                'money'
              );
            }
          }
        };

        negBroadcast = new BroadcastChannel('survival_game_negotiations');
        negBroadcast.onmessage = (event) => {
          if (event.data?.type === 'NEGOTIATION_UPDATE' && event.data.session) {
            const sess = event.data.session as NegotiationSession;
            const currentAccId = currentAccountRef.current?.id || getActiveAccountId();
            if (
              currentAccId &&
              (sess.customerAccountId === currentAccId || sess.ownerAccountId === currentAccId)
            ) {
              if (sess.status === 'active') {
                setActiveNegotiation(prev => {
                  if (!prev || prev.id === sess.id) return sess;
                  return prev;
                });
              } else if (sess.status === 'agreed') {
                const targetCatalogPrice = sess.originalPrice || getStandardProductBasePrice(sess.productId) || sess.originalPrice;

                setBuildings(prevB => {
                  const updated = prevB.map(b => {
                    if (b.id === sess.storeId) {
                      const restoredProducts = (b.products || []).map(p => {
                        if (p.id === sess.productId) {
                          return {
                            ...p,
                            price: targetCatalogPrice,
                            originalPrice: targetCatalogPrice
                          };
                        }
                        return p;
                      });
                      const newB = { ...b, products: restoredProducts };
                      syncBuildingToCloud(newB);
                      return newB;
                    }
                    return b;
                  });
                  saveBuildingsToStorage(updated);
                  return updated;
                });

                setSelectedBuilding(prev => {
                  if (!prev || prev.id !== sess.storeId) return prev;
                  const restoredProducts = (prev.products || []).map(p => {
                    if (p.id === sess.productId) {
                      return {
                        ...p,
                        price: targetCatalogPrice,
                        originalPrice: targetCatalogPrice
                      };
                    }
                    return p;
                  });
                  return { ...prev, products: restoredProducts };
                });

                if (!processedAgreementsRef.current.has(sess.id)) {
                  processedAgreementsRef.current.add(sess.id);
                  if (sess.customerAccountId === currentAccId) {
                    const paidAmount = sess.currentAgreedPrice;
                    const comfortRestore = sess.comfortRestore || 25;
                    const newCount = recordStallPurchase(currentAccId, sess.storeId);
                    setCurrentCharacter(prevChar => {
                      if (!prevChar) return null;
                      const newMoney = Math.max(0, prevChar.stats.money - paidAmount);
                      const newComfort = Math.min(100, (prevChar.stats.comfort ?? 100) + comfortRestore);
                      const updatedChar: Character = {
                        ...prevChar,
                        stats: {
                          ...prevChar.stats,
                          money: newMoney,
                          comfort: newComfort
                        },
                        stallPurchaseCounts: {
                          ...(prevChar.stallPurchaseCounts || {}),
                          [sess.storeId]: newCount
                        }
                      };
                      saveCharacter(updatedChar);
                      syncCharacterToCloud(updatedChar);
                      return updatedChar;
                    });
                    addFloatingText(`-${paidAmount.toLocaleString('vi-VN')}₫`, '#F87171');
                    sounds.playEat();
                    sounds.playFanfare();
                    addLog(
                      `🛍️ Giao dịch thành công! Bạn đã mua "${sess.productName}" với mức giá thỏa thuận riêng ${paidAmount.toLocaleString('vi-VN')}₫ cho lượt này (lượt mua ${newCount}/2 tại quán)! Đã trừ ${paidAmount.toLocaleString('vi-VN')}₫, độ thoải mái +${comfortRestore}%. (Từ lần mua tiếp theo, bạn và người khác vẫn mua theo giá niêm yết ban đầu).`,
                      'success'
                    );
                  }

                  if (sess.ownerAccountId === currentAccId && !processedAgreementsRef.current.has(sess.id + '_owner')) {
                    processedAgreementsRef.current.add(sess.id + '_owner');
                    const earnedAmount = sess.currentAgreedPrice;
                    setCurrentCharacter(prevChar => {
                      if (!prevChar) return null;
                      const newMoney = prevChar.stats.money + earnedAmount;
                      const updatedChar: Character = {
                        ...prevChar,
                        stats: {
                          ...prevChar.stats,
                          money: newMoney
                        }
                      };
                      saveCharacter(updatedChar);
                      syncCharacterToCloud(updatedChar);
                      return updatedChar;
                    });
                    addFloatingText(`+${earnedAmount.toLocaleString('vi-VN')}₫`, '#34D399');
                    sounds.playCoin();
                    addLog(
                      `💰 Khách hàng ${sess.customerName} đã mua món "${sess.productName}" với giá chốt ${earnedAmount.toLocaleString('vi-VN')}₫! Tiền đã cộng thẳng trực tiếp vào ví của bạn!`,
                      'money'
                    );
                  }
                }
                setActiveNegotiation(prev => (prev?.id === sess.id ? null : prev));
              } else if (sess.status === 'cancelled') {
                setActiveNegotiation(prev => (prev?.id === sess.id ? null : prev));
              }
            }
          }
        };
      }
    } catch {
      // BroadcastChannel optional fallback
    }

    const unsubNegotiations = subscribeToNegotiations((sessions) => {
      const currentAccId = currentAccountRef.current?.id || getActiveAccountId();
      if (!currentAccId) return;

      const mySessions = sessions.filter(
        s => s.customerAccountId === currentAccId || s.ownerAccountId === currentAccId
      );

      setActiveNegotiation(prev => {
        // 1. If user already has this negotiation session open, match by ID first!
        let target: NegotiationSession | undefined;
        if (prev) {
          target = mySessions.find(s => s.id === prev.id);
        }

        // 2. If not currently viewing or couldn't find, pick the most recently updated active negotiation
        if (!target) {
          const activeSessions = mySessions
            .filter(s => s.status === 'active')
            .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          target = activeSessions[0];
        }

        if (target) {
          // If the session was agreed upon: Khách hàng mua ngay với giá đã chốt và bị trừ tiền
          if (target.status === 'agreed') {
            const targetCatalogPrice = target.originalPrice || getStandardProductBasePrice(target.productId) || target.originalPrice;

            setBuildings(prevB => {
              const updated = prevB.map(b => {
                if (b.id === target!.storeId) {
                  const restoredProducts = (b.products || []).map(p => {
                    if (p.id === target!.productId) {
                      return {
                        ...p,
                        price: targetCatalogPrice,
                        originalPrice: targetCatalogPrice
                      };
                    }
                    return p;
                  });
                  const newB = { ...b, products: restoredProducts };
                  syncBuildingToCloud(newB);
                  return newB;
                }
                return b;
              });
              saveBuildingsToStorage(updated);
              return updated;
            });

            setSelectedBuilding(prev => {
              if (!prev || prev.id !== target!.storeId) return prev;
              const restoredProducts = (prev.products || []).map(p => {
                if (p.id === target!.productId) {
                  return {
                    ...p,
                    price: targetCatalogPrice,
                    originalPrice: targetCatalogPrice
                  };
                }
                return p;
              });
              return { ...prev, products: restoredProducts };
            });

            if (!processedAgreementsRef.current.has(target.id)) {
              processedAgreementsRef.current.add(target.id);

              if (target.customerAccountId === currentAccId) {
                // Khách hàng bị trừ tiền theo giá chốt và nhận độ thoải mái
                const paidAmount = target.currentAgreedPrice;
                const comfortRestore = target.comfortRestore || 25;
                const newCount = recordStallPurchase(currentAccId, target.storeId);
                setCurrentCharacter(prevChar => {
                  if (!prevChar) return null;
                  const newMoney = Math.max(0, prevChar.stats.money - paidAmount);
                  const newComfort = Math.min(100, (prevChar.stats.comfort ?? 100) + comfortRestore);
                  const updatedChar: Character = {
                    ...prevChar,
                    stats: {
                      ...prevChar.stats,
                      money: newMoney,
                      comfort: newComfort
                    },
                    stallPurchaseCounts: {
                      ...(prevChar.stallPurchaseCounts || {}),
                      [target.storeId]: newCount
                    }
                  };
                  saveCharacter(updatedChar);
                  syncCharacterToCloud(updatedChar);
                  return updatedChar;
                });

                addFloatingText(`-${paidAmount.toLocaleString('vi-VN')}₫`, '#F87171');
                sounds.playEat();
                sounds.playFanfare();
                addLog(
                  `🛍️ Giao dịch thành công! Bạn đã mua "${target.productName}" với mức giá thỏa thuận riêng ${paidAmount.toLocaleString('vi-VN')}₫ cho lượt này (lượt mua ${newCount}/2 tại quán)! Đã trừ ${paidAmount.toLocaleString('vi-VN')}₫, độ thoải mái +${comfortRestore}%. (Từ lần mua tiếp theo, bạn và người khác vẫn mua theo giá niêm yết ban đầu).`,
                  'success'
                );
              }

              if (target.ownerAccountId === currentAccId && !processedAgreementsRef.current.has(target.id + '_owner')) {
                processedAgreementsRef.current.add(target.id + '_owner');
                const earnedAmount = target.currentAgreedPrice;
                setCurrentCharacter(prevChar => {
                  if (!prevChar) return null;
                  const newMoney = prevChar.stats.money + earnedAmount;
                  const updatedChar: Character = {
                    ...prevChar,
                    stats: {
                      ...prevChar.stats,
                      money: newMoney
                    }
                  };
                  saveCharacter(updatedChar);
                  syncCharacterToCloud(updatedChar);
                  return updatedChar;
                });
                addFloatingText(`+${earnedAmount.toLocaleString('vi-VN')}₫`, '#34D399');
                sounds.playCoin();
                addLog(
                  `💰 Khách hàng ${target.customerName} đã mua món "${target.productName}" với giá chốt ${earnedAmount.toLocaleString('vi-VN')}₫! Tiền đã cộng thẳng trực tiếp vào ví của bạn!`,
                  'money'
                );
              }
            }

            // Giá của hàng đó vẫn giữ nguyên cho người khác! KHÔNG cập nhật giá trong building!
            return null;
          }

          // If the session was cancelled
          if (target.status === 'cancelled') {
            return null;
          }

          // If still active: check if a new incoming message arrived from the other participant
          if (prev && prev.id === target.id) {
            const prevCount = prev.messages?.length || 0;
            const newCount = target.messages?.length || 0;
            if (newCount > prevCount) {
              const lastMsg = target.messages[newCount - 1];
              if (lastMsg && lastMsg.senderId !== currentAccId) {
                sounds.playStep();
              }
            }
          } else if (!prev) {
            sounds.playCoin();
          }

          return target;
        }

        return null;
      });
    });

    // 8. Global Game Session Sync (Host presence & 7-min round status)
    const unsubGameSession = subscribeToGameSession((cloudSession) => {
      setGameSession(cloudSession);
      saveLocalGameSession(cloudSession);
    });

    let sessionBroadcast: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        sessionBroadcast = new BroadcastChannel('survival_game_session');
        sessionBroadcast.onmessage = (event) => {
          if (event.data?.type === 'SESSION_UPDATE' && event.data.session) {
            setGameSession(event.data.session);
            saveLocalGameSession(event.data.session);
          }
        };
      }
    } catch {}

    return () => {
      unsubAuth();
      unsubRemoteChars();
      unsubRemoteBuildings();
      unsubRemoteAccounts();
      unsubRemoteLogs();
      unsubNegotiations();
      unsubGameSession();
      negBroadcast?.close();
      salesBroadcast?.close();
      sessionBroadcast?.close();
    };
  }, []);

  // 7-Minute Round Countdown Timer Loop
  useEffect(() => {
    if (gameSession.status !== 'running' || !gameSession.endsAt) {
      if (gameSession.status === 'waiting_for_host' || gameSession.status === 'host_joined') {
        setRoundTimeRemaining(420);
      }
      return;
    }

    const checkTimer = () => {
      const now = Date.now();
      const diffSeconds = Math.max(0, Math.ceil((gameSession.endsAt! - now) / 1000));
      setRoundTimeRemaining(diffSeconds);

      if (diffSeconds <= 0 && gameSession.status === 'running') {
        handleRoundTimeUp();
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [gameSession.status, gameSession.endsAt]);

  const handleHostStartGame = () => {
    const now = Date.now();
    const runningSession: GameSessionState = {
      ...gameSession,
      status: 'running',
      roundDurationSeconds: 420,
      startedAt: now,
      endsAt: now + 420 * 1000,
      roundNumber: (gameSession.roundNumber || 0) + 1,
      updatedAt: now
    };
    setGameSession(runningSession);
    saveLocalGameSession(runningSession);
    syncGameSessionToCloud(runningSession);
    broadcastSession(runningSession);

    sounds.playFanfare();
    addFloatingText('LƯỢT CHƠI ĐÃ BẮT ĐẦU! (7 PHÚT) 🎮', '#10B981');
    const updatedLogs = addLog(
      '🎮 HOST ĐÃ BẮT ĐẦU LƯỢT CHƠI 7 PHÚT! Tất cả các gian hàng, mua sắm và các chỉ số sinh tồn chính thức bắt đầu tính!',
      'success'
    );
    setLogs(updatedLogs);
  };

  const handleRoundTimeUp = () => {
    const endedSession: GameSessionState = {
      ...gameSessionRef.current,
      status: 'ended',
      updatedAt: Date.now()
    };
    setGameSession(endedSession);
    saveLocalGameSession(endedSession);
    syncGameSessionToCloud(endedSession);
    broadcastSession(endedSession);

    sounds.playFanfare();
    addFloatingText('HẾT GIỜ 7 PHÚT! 🏁', '#F59E0B');
    const updatedLogs = addLog('🏁 HẾT GIỜ! Lượt chơi 7 phút đã kết thúc. Mời xem bảng tổng kết xếp hạng!', 'warning');
    setLogs(updatedLogs);
  };

  const handleHostRestartRound = () => {
    if (currentCharacter) {
      const resetChar: Character = {
        ...currentCharacter,
        stats: {
          ...currentCharacter.stats,
          hunger: 100,
          energy: 100,
          comfort: 100
        }
      };
      saveCharacter(resetChar);
      setCurrentCharacter(resetChar);
      syncCharacterToCloud(resetChar);
    }

    const now = Date.now();
    const newSession: GameSessionState = {
      ...gameSession,
      status: 'running',
      roundDurationSeconds: 420,
      startedAt: now,
      endsAt: now + 420 * 1000,
      roundNumber: (gameSession.roundNumber || 0) + 1,
      updatedAt: now
    };
    setGameSession(newSession);
    saveLocalGameSession(newSession);
    syncGameSessionToCloud(newSession);
    broadcastSession(newSession);

    sounds.playFanfare();
    addFloatingText('LƯỢT CHƠI MỚI BẮT ĐẦU! 🔄', '#10B981');
    const updatedLogs = addLog('🔄 Host vừa khởi động lượt chơi 7 phút mới! Mời các cư dân tiếp tục sinh tồn và kinh doanh.', 'success');
    setLogs(updatedLogs);
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Time & Survival Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Advance time: 1 second real time = ~0.08 hours (around 5 mins)
      setTimeOfDayHours(prev => (prev + 0.04) % 24);

      if (gameOverReason) return;
      // ONLY DECAY STATS WHEN THE 7-MINUTE ROUND IS RUNNING!
      if (gameSessionRef.current.status !== 'running') return;

      // Survival Simulation Loop
      setCurrentCharacter(prev => {
        if (!prev) return null;
        
        // 1. Hunger decay: -0.45% per second (100% -> 0% in ~3.7 minutes)
        let newHunger = Math.max(0, prev.stats.hunger - 0.45);
        let newEnergy = prev.stats.energy;
        let newComfort = prev.stats.comfort ?? 100;

        // 2. Energy decay:
        // Moving: -0.25% per sec (~6.5 minutes running)
        // Standing: -0.05% per sec
        if (prev.isMoving) {
          newEnergy = Math.max(0, newEnergy - 0.25);
        } else {
          newEnergy = Math.max(0, newEnergy - 0.05);
        }

        // 3. Comfort decay:
        // Natural continuous decay (-0.35%/s).
        // Quy tắc: Mỗi người trong bản đồ phải đi mua đồ người khác để duy trì thanh độ thoải mái!
        newComfort = Math.max(0, newComfort - 0.35);

        // Severe hunger (< 30%) causes frustration & irritability (-0.25%/s)
        if (newHunger < 30) {
          newComfort = Math.max(0, newComfort - 0.25);
        }
        // Exhaustion (< 20% energy) causes stress & fatigue (-0.25%/s)
        if (newEnergy < 20) {
          newComfort = Math.max(0, newComfort - 0.25);
        }

        // Quy tắc Thua cuộc (Game Over):
        // 1 trong 2 thanh độ no và thể lực mất là thua luôn (0%).
        // Mất thanh độ thoải mái (0%) cũng coi như thua.
        let lossReason: 'hunger' | 'energy' | 'comfort' | null = null;
        if (newHunger <= 0) {
          lossReason = 'hunger';
        } else if (newEnergy <= 0) {
          lossReason = 'energy';
        } else if (newComfort <= 0) {
          lossReason = 'comfort';
        }

        if (lossReason) {
          setGameOverReason(lossReason);
          sounds.playGameOver();
          addLog(
            `💀 ${prev.name} đã THUA CUỘC do ${
              lossReason === 'hunger'
                ? 'cạn kiệt độ no'
                : lossReason === 'energy'
                ? 'kiệt quệ thể lực'
                : 'suy sụp tinh thần (độ thoải mái cạn kiệt)'
            } (0%)!`,
            'warning'
          );
        }

        const updated: Character = {
          ...prev,
          stats: {
            ...prev.stats,
            hunger: newHunger,
            energy: newEnergy,
            comfort: newComfort
          }
        };
        saveCharacter(updated);
        return updated;
      });

      // Occasional ambient NPC action / chat
      if (Math.random() < 0.25) {
        setAllCharacters(prevList => {
          const npcs = prevList.filter(c => c.accountId !== currentAccount?.id);
          if (npcs.length === 0) return prevList;

          const randomNpc = npcs[Math.floor(Math.random() * npcs.length)];
          const quotes = [
            'Hôm nay thị trường buôn bán nhộn nhịp thật!',
            'Vừa kiếm được khoản thù lao sinh tồn kha khá!',
            'Đói bụng quá, lát phải ghé quán ăn trung tâm ăn phở.',
            'Phải đi mua sắm ủng hộ gian hàng khác để tăng độ thoải mái!',
            'Đừng để thanh thoải mái về 0 nhé, thua cuộc đấy!'
          ];

          const updatedNpc: Character = {
            ...randomNpc,
            speechBubble: {
              text: quotes[Math.floor(Math.random() * quotes.length)],
              expiresAt: Date.now() + 8000
            }
          };

          return prevList.map(c => (c.id === updatedNpc.id ? updatedNpc : c));
        });
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [currentAccount, gameOverReason]);

  // Handle Revive After Game Over
  const handleReviveFromGameOver = () => {
    if (!currentCharacter) return;
    const reviveCost = Math.min(currentCharacter.stats.money, 15000);
    const updatedChar: Character = {
      ...currentCharacter,
      stats: {
        ...currentCharacter.stats,
        money: Math.max(0, currentCharacter.stats.money - reviveCost),
        hunger: 45,
        energy: 45,
        comfort: 45
      }
    };
    saveCharacter(updatedChar);
    setCurrentCharacter(updatedChar);
    setAllCharacters(prev => prev.map(c => c.id === updatedChar.id ? updatedChar : c));
    setGameOverReason(null);
    sounds.playFanfare();
    addFloatingText('Đã hồi sinh! 🚑', '#34D399');
    const updatedLogs = addLog(
      `🚑 ${currentCharacter.name} đã được cấp cứu hồi sinh (chi phí: ${reviveCost.toLocaleString('vi-VN')}₫). Hãy nhanh chóng mua thức ăn và mua sắm duy trì độ thoải mái!`,
      'info'
    );
    setLogs(updatedLogs);
  };

  // Handle Restart New After Game Over
  const handleRestartNewCharacter = () => {
    if (!currentCharacter) return;
    const updatedChar: Character = {
      ...currentCharacter,
      stats: {
        ...currentCharacter.stats,
        hunger: 100,
        energy: 100,
        comfort: 100,
        money: 100000,
        daysSurvived: 1
      }
    };
    saveCharacter(updatedChar);
    setCurrentCharacter(updatedChar);
    setAllCharacters(prev => prev.map(c => c.id === updatedChar.id ? updatedChar : c));
    setGameOverReason(null);
    sounds.playFanfare();
    addFloatingText('Làm lại từ đầu! ✨', '#FACC15');
    const updatedLogs = addLog(
      `🔄 ${currentCharacter.name} đã làm lại từ đầu với 100% chỉ số sinh tồn và 100.000₫ vốn khởi nghiệp!`,
      'success'
    );
    setLogs(updatedLogs);
  };

  // Clean up expired floating texts
  useEffect(() => {
    const timer = setInterval(() => {
      setFloatingTexts(prev => prev.filter(ft => Date.now() - ft.createdAt < 1500));
    }, 300);
    return () => clearInterval(timer);
  }, []);

  // Account handler
  const handleAccountReady = (acc: UserAccount, isNew: boolean) => {
    setCurrentAccount(acc);
    setIsAuthOpen(false);
    syncAccountToCloud(acc);

    const isHostAcc = acc.isHost || acc.username.toLowerCase() === 'host';
    if (isHostAcc) {
      const updatedSession: GameSessionState = {
        ...gameSession,
        hostId: acc.id,
        hostName: acc.username,
        isHostPresent: true,
        status: gameSession.status === 'waiting_for_host' ? 'host_joined' : gameSession.status,
        updatedAt: Date.now()
      };
      setGameSession(updatedSession);
      saveLocalGameSession(updatedSession);
      syncGameSessionToCloud(updatedSession);
      broadcastSession(updatedSession);
      addFloatingText('Đăng nhập Host thành công! 👑', '#F59E0B');
    }

    const existingChar = getCharacterByAccountId(acc.id);
    if (existingChar && !isNew) {
      if (existingChar.name !== acc.username && (existingChar.name === 'nhat' || !existingChar.name)) {
        existingChar.name = acc.username;
        saveCharacter(existingChar);
      }
      setCurrentCharacter(existingChar);
      addLog(`Chào mừng ${existingChar.name} đã quay trở lại thế giới!`, 'info');
      setLogs(getLogs());
    } else {
      // Clear previous character immediately so old name is never displayed!
      setCurrentCharacter(null);
      setIsSetupOpen(true);
    }

    setBuildings(syncBuildingsWithAccounts(getAccounts(), getCharacters()));
  };

  // Two-Way Negotiation Chat Handlers
  const handleStartNegotiation = (product: StoreProduct, store: BuildingZone) => {
    if (!currentAccount || !currentCharacter) return;

    if (gameSession.status !== 'running') {
      addLog('⚠️ Trò chơi chưa bắt đầu! Hãy đợi Host bấm "Bắt Đầu Trò Chơi (7 phút)"!', 'warning');
      addFloatingText('Trò chơi chưa bắt đầu! ⏳', '#FBBF24');
      return;
    }

    const isStoreOwner = Boolean(
      (store.ownerId && (store.ownerId === currentAccount.id || store.ownerId === currentCharacter.id)) ||
      (store.ownerName && currentCharacter.name && store.ownerName.trim().toLowerCase() === currentCharacter.name.trim().toLowerCase()) ||
      (currentAccount.id && store.id === `stall_acc_${currentAccount.id}`) ||
      (currentCharacter.id && store.id === `stall_acc_${currentCharacter.id}`)
    );

    if (isStoreOwner) {
      addLog('Quy định trò chơi: Bạn không thể mua hay thương lượng hàng tại gian hàng của chính mình!', 'warning');
      addFloatingText('Không thể tự mua!', '#F87171');
      return;
    }

    const currentPurchases = Math.max(
      currentCharacter.stallPurchaseCounts?.[store.id] || 0,
      getStallPurchaseCount(currentAccount.id, store.id)
    );
    if (currentPurchases >= 2) {
      addLog(`Bạn đã mua tối đa 2 lần tại gian hàng "${store.name}". Không thể mua hoặc trao đổi thêm!`, 'warning');
      return;
    }

    // Close building modal if open so chat is clearly visible
    setSelectedBuilding(null);

    const standardBasePrice = getStandardProductBasePrice(product.id) || product.originalPrice || product.price;

    const newSession: NegotiationSession = {
      id: `neg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      storeId: store.id,
      storeName: store.name,
      ownerAccountId: store.ownerId || '',
      ownerName: store.ownerName || 'Chủ quán',
      customerAccountId: currentAccount.id,
      customerName: currentCharacter.name,
      productId: product.id,
      productName: product.name,
      productIcon: product.icon || '🛍️',
      comfortRestore: product.comfortRestore || 25,
      originalPrice: standardBasePrice,
      currentAgreedPrice: standardBasePrice,
      status: 'active',
      messages: [
        {
          id: `msg_init_${Date.now()}`,
          senderId: currentAccount.id,
          senderName: currentCharacter.name,
          senderRole: 'customer',
          text: `Chào bạn ${store.ownerName || 'chủ quán'}! Mình muốn thương lượng lại mức giá cho món "${product.name}" (giá niêm yết: ${standardBasePrice.toLocaleString('vi-VN')}₫).`,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          createdAt: Date.now()
        }
      ],
      updatedAt: Date.now()
    };

    setActiveNegotiation(newSession);
    syncNegotiationToCloud(newSession);

    // Broadcast for same-browser windows
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('survival_game_negotiations');
        bc.postMessage({ type: 'NEGOTIATION_UPDATE', session: newSession });
        bc.close();
      }
    } catch {
      // ignore
    }

    sounds.playCoin();
    addLog(`💬 Bạn đã mở cuộc đàm phán giá món "${product.name}" với gian hàng ${store.name}!`, 'info');
  };

  const handleNegotiationSendMessage = async (text: string, proposedPrice?: number) => {
    const currentSess = activeNegotiationRef.current || activeNegotiation;
    const currAcc = currentAccountRef.current || currentAccount;
    const currChar = currentCharacterRef.current || currentCharacter;
    if (!currentSess || !currAcc) return;

    const trimmedText = text.trim();
    if (!trimmedText) return;

    const isCustomer = currAcc.id === currentSess.customerAccountId;
    const cleanProposedPrice = proposedPrice && proposedPrice > 0 ? proposedPrice : undefined;

    const newMsg: NegotiationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: currAcc.id,
      senderName: currChar?.name || currAcc.username,
      senderRole: isCustomer ? 'customer' : 'owner',
      text: trimmedText,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now()
    };
    if (cleanProposedPrice) {
      newMsg.proposedPrice = cleanProposedPrice;
    }

    const updatedSession: NegotiationSession = {
      ...currentSess,
      currentAgreedPrice: cleanProposedPrice || currentSess.currentAgreedPrice,
      messages: [...(currentSess.messages || []), newMsg],
      updatedAt: Date.now()
    };

    // 1. Instant local update
    setActiveNegotiation(updatedSession);

    // 2. Instant same-browser cross-tab broadcast
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('survival_game_negotiations');
        bc.postMessage({ type: 'NEGOTIATION_UPDATE', session: updatedSession });
        bc.close();
      }
    } catch {
      // ignore
    }

    // 3. Real-time Firebase Cloud sync for different devices/machines
    try {
      await addNegotiationMessageToCloud(
        currentSess.id,
        newMsg,
        cleanProposedPrice
      );
    } catch {
      // Fallback: full session sync
      await syncNegotiationToCloud(updatedSession);
    }

    // Only simulate automated NPC reply if store has NO player owner or is an NPC
    const isOwnerRealPlayer = Boolean(
      currentSess.ownerAccountId && !currentSess.ownerAccountId.startsWith('npc_acc_')
    );
    if (isCustomer && !isOwnerRealPlayer) {
      setTimeout(async () => {
        let reply = 'Cảm ơn bạn đã ghé thăm gian hàng! Mình ghi nhận mức đề xuất của bạn.';
        const lower = trimmedText.toLowerCase();
        let agreed = cleanProposedPrice || currentSess.currentAgreedPrice;
        if (lower.includes('bớt') || lower.includes('giảm') || lower.includes('sinh viên')) {
          agreed = cleanProposedPrice || Math.max(1000, Math.round((currentSess.originalPrice * 0.85) / 1000) * 1000);
          reply = `Haha nhất trí nhé! Khách quý mở hàng thì quán mình sẵn sàng bớt xuống ${agreed.toLocaleString('vi-VN')}₫ cho bạn!`;
        } else if (lower.includes('tăng') || lower.includes('ủng hộ')) {
          agreed = cleanProposedPrice || Math.round((currentSess.originalPrice * 1.25) / 1000) * 1000;
          reply = `Cảm ơn tấm lòng hào sảng của bạn nhiều lắm! Mình cập nhật giá ủng hộ ${agreed.toLocaleString('vi-VN')}₫ ngay nhé!`;
        }

        const ownerMsg: NegotiationMessage = {
          id: `msg_owner_${Date.now()}`,
          senderId: currentSess.ownerAccountId || 'npc_bot',
          senderName: currentSess.ownerName || 'Chủ quán',
          senderRole: 'owner',
          text: reply,
          proposedPrice: agreed,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          createdAt: Date.now()
        };

        const autoUpdatedSession: NegotiationSession = {
          ...updatedSession,
          currentAgreedPrice: agreed,
          messages: [...updatedSession.messages, ownerMsg],
          updatedAt: Date.now()
        };
        setActiveNegotiation(autoUpdatedSession);
        try {
          await addNegotiationMessageToCloud(currentSess.id, ownerMsg, agreed);
        } catch {
          await syncNegotiationToCloud(autoUpdatedSession);
        }
      }, 1100);
    }
  };

  const handleNegotiationOwnerConfirmPrice = async (newPrice: number) => {
    const currentSess = activeNegotiationRef.current || activeNegotiation;
    const currAcc = currentAccountRef.current || currentAccount;
    const currChar = currentCharacterRef.current || currentCharacter;
    if (!currentSess) return;

    const isSameUser = Boolean(
      currentSess.ownerAccountId === currentSess.customerAccountId ||
      (currentSess.ownerName && currentSess.customerName && currentSess.ownerName.trim().toLowerCase() === currentSess.customerName.trim().toLowerCase())
    );
    if (isSameUser) {
      addLog('Quy định trò chơi: Bạn không thể tự mua hàng của chính mình!', 'warning');
      return;
    }

    const currentCustomerPurchases = getStallPurchaseCount(currentSess.customerAccountId, currentSess.storeId);
    if (currentCustomerPurchases >= 2) {
      addLog(`Khách hàng ${currentSess.customerName} đã mua tối đa 2 lần tại quán của bạn!`, 'warning');
      return;
    }

    const newCustomerCount = recordStallPurchase(currentSess.customerAccountId, currentSess.storeId);

    // 1. Chủ gian hàng nhận tiền từ khách hàng vào ví nhân vật
    if (currChar) {
      const updatedChar: Character = {
        ...currChar,
        stats: {
          ...currChar.stats,
          money: currChar.stats.money + newPrice
        }
      };
      saveCharacter(updatedChar);
      setCurrentCharacter(updatedChar);
      syncCharacterToCloud(updatedChar);
      addFloatingText(`+${newPrice.toLocaleString('vi-VN')}₫`, '#34D399');
    }

    // 2. Cập nhật doanh thu & số lượt bán cho gian hàng
    // QUAN TRỌNG: Phục hồi và giữ nguyên giá niêm yết ban đầu cho cả người khác lẫn các lượt mua sau!
    const targetCatalogPrice = currentSess.originalPrice || getStandardProductBasePrice(currentSess.productId) || currentSess.originalPrice;
    setBuildings(prev => {
      const updated = prev.map(b => {
        if (b.id === currentSess.storeId) {
          const restoredProducts = (b.products || []).map(p => {
            if (p.id === currentSess.productId) {
              return {
                ...p,
                price: targetCatalogPrice,
                originalPrice: targetCatalogPrice
              };
            }
            return p;
          });
          const newB = {
            ...b,
            products: restoredProducts,
            totalRevenue: (b.totalRevenue || 0) + newPrice,
            totalSalesCount: (b.totalSalesCount || 0) + 1
          };
          syncBuildingToCloud(newB);
          return newB;
        }
        return b;
      });
      saveBuildingsToStorage(updated);
      return updated;
    });

    setSelectedBuilding(prev => {
      if (!prev || prev.id !== currentSess.storeId) return prev;
      const restoredProducts = (prev.products || []).map(p => {
        if (p.id === currentSess.productId) {
          return {
            ...p,
            price: targetCatalogPrice,
            originalPrice: targetCatalogPrice
          };
        }
        return p;
      });
      return { ...prev, products: restoredProducts };
    });

    const completedSession: NegotiationSession = {
      ...currentSess,
      status: 'agreed',
      currentAgreedPrice: newPrice,
      messages: [
        ...(currentSess.messages || []),
        {
          id: `msg_finish_${Date.now()}`,
          senderId: currAcc?.id || currentSess.ownerAccountId,
          senderName: currChar?.name || currentSess.ownerName,
          senderRole: 'system',
          text: `Chủ quán đã xác nhận chốt bán món "${currentSess.productName}" với mức giá ${newPrice.toLocaleString('vi-VN')}₫ cho khách hàng ${currentSess.customerName} trong lượt mua này! Khách hàng đã nhận món và bị trừ tiền. (Từ lần mua tiếp theo, món hàng vẫn áp dụng giá niêm yết ban đầu cho cả người mua và người khác).`,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          createdAt: Date.now()
        }
      ],
      updatedAt: Date.now()
    };

    processedAgreementsRef.current.add(completedSession.id);
    setActiveNegotiation(null);

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('survival_game_negotiations');
        bc.postMessage({ type: 'NEGOTIATION_UPDATE', session: completedSession });
        bc.close();
      }
    } catch {
      // ignore
    }

    await syncNegotiationToCloud(completedSession);

    addLog(
      `🤝 Giao dịch thành công! Bạn đã chốt bán "${currentSess.productName}" giá ${newPrice.toLocaleString('vi-VN')}₫ cho ${currentSess.customerName}! Nhận +${newPrice.toLocaleString('vi-VN')}₫ vào ví. (Từ lần mua tiếp theo, khách vẫn mua theo giá niêm yết ban đầu).`,
      'money'
    );
    sounds.playFanfare();
  };

  const handleNegotiationClose = async () => {
    const currentSess = activeNegotiationRef.current || activeNegotiation;
    if (currentSess) {
      const cancelled: NegotiationSession = {
        ...currentSess,
        status: 'cancelled',
        updatedAt: Date.now()
      };
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('survival_game_negotiations');
          bc.postMessage({ type: 'NEGOTIATION_UPDATE', session: cancelled });
          bc.close();
        }
      } catch {
        // ignore
      }
      await syncNegotiationToCloud(cancelled);
    }
    setActiveNegotiation(null);
  };

  // Character handler
  const handleCharacterCreated = (newChar: Character) => {
    setCurrentCharacter(newChar);
    setIsSetupOpen(false);
    const updatedChars = getCharacters();
    setAllCharacters(updatedChars);
    setLogs(getLogs());
    syncCharacterToCloud(newChar);

    const isHostAcc = currentAccount?.isHost || currentAccount?.username.toLowerCase() === 'host';
    if (isHostAcc && currentAccount) {
      const updatedSession: GameSessionState = {
        ...gameSession,
        hostId: currentAccount.id,
        hostName: newChar.name || currentAccount.username,
        isHostPresent: true,
        status: gameSession.status === 'waiting_for_host' ? 'host_joined' : gameSession.status,
        updatedAt: Date.now()
      };
      setGameSession(updatedSession);
      saveLocalGameSession(updatedSession);
      syncGameSessionToCloud(updatedSession);
      broadcastSession(updatedSession);
    }

    // Update stall title with new character name
    setBuildings(syncBuildingsWithAccounts(getAccounts(), updatedChars));
  };

  // Delete account handler
  const handleAccountDeleted = (accountId: string) => {
    const result = deleteAccount(accountId);
    setAccounts(result.remainingAccounts);
    setAllCharacters(result.remainingCharacters);
    setLogs(getLogs());
    deleteAccountFromCloud(accountId);

    // Update stalls to remove deleted account stall
    setBuildings(syncBuildingsWithAccounts(result.remainingAccounts, result.remainingCharacters));

    if (currentAccount?.id === accountId) {
      setCurrentAccount(null);
      setCurrentCharacter(null);
      setIsAuthOpen(true);
    }
  };

  // Player position update from canvas
  const handlePlayerPositionChange = useCallback((x: number, y: number, isMoving: boolean) => {
    setCurrentCharacter(prev => {
      if (!prev) return null;
      const updated: Character = {
        ...prev,
        x,
        y,
        isMoving
      };
      saveCharacter(updated);

      // Real-time Cloud Position Sync across devices
      if (!isMoving || Date.now() - lastCloudSyncRef.current > 350) {
        lastCloudSyncRef.current = Date.now();
        syncCharacterToCloud(updated);
      }

      return updated;
    });

    // Update inside all characters list
    setAllCharacters(prev =>
      prev.map(c => (c.id === currentCharacter?.id ? { ...c, x, y, isMoving } : c))
    );
  }, [currentCharacter?.id]);

  // Add floating text
  const addFloatingText = (text: string, color: string = '#FACC15') => {
    if (!currentCharacter) return;
    const newFt: FloatingText = {
      id: `ft_${Date.now()}_${Math.random()}`,
      text,
      x: currentCharacter.x,
      y: currentCharacter.y - 20,
      color,
      opacity: 1,
      createdAt: Date.now()
    };
    setFloatingTexts(prev => [...prev, newFt]);
  };

  // Handle Work Completion
  const handleWorkCompleted = (
    earnings: number,
    energyCost: number,
    hungerCost: number,
    comfortCost: number,
    xpGained: number,
    buildingName: string
  ) => {
    if (!currentCharacter) return;

    const newMoney = currentCharacter.stats.money + earnings;
    const newEnergy = Math.max(0, currentCharacter.stats.energy - energyCost);
    const newHunger = Math.max(0, currentCharacter.stats.hunger - hungerCost);
    const newComfort = Math.max(0, (currentCharacter.stats.comfort ?? 100) - comfortCost);
    const newXp = currentCharacter.stats.xp + xpGained;
    const newLevel = Math.floor(newXp / 100) + 1;

    const updatedChar: Character = {
      ...currentCharacter,
      stats: {
        ...currentCharacter.stats,
        money: newMoney,
        energy: newEnergy,
        hunger: newHunger,
        comfort: newComfort,
        xp: newXp,
        level: newLevel
      }
    };

    saveCharacter(updatedChar);
    setCurrentCharacter(updatedChar);

    // Update in all characters list
    setAllCharacters(prev =>
      prev.map(c => (c.id === updatedChar.id ? updatedChar : c))
    );

    // Floating animation
    addFloatingText(`+${earnings.toLocaleString('vi-VN')}₫`, '#34D399');

    // Add log
    const updatedLogs = addLog(
      `${currentCharacter.name} vừa kiếm được +${earnings.toLocaleString('vi-VN')}₫ tại ${buildingName}!`,
      'money'
    );
    setLogs(updatedLogs);
  };

  // Handle Building Activity Completed (Dining, Strolling Park, Therapy, etc. No item shops!)
  const handleActivityCompleted = (
    cost: number,
    energyRestore: number,
    hungerRestore: number,
    comfortRestore: number,
    activityTitle: string,
    storeId?: string
  ) => {
    if (!currentCharacter) return;

    let updatedStallCounts = currentCharacter.stallPurchaseCounts || {};
    if (storeId && storeId !== 'central_food_stall') {
      const newCount = recordStallPurchase(currentCharacter.accountId, storeId);
      updatedStallCounts = {
        ...updatedStallCounts,
        [storeId]: newCount
      };
    }

    const newMoney = Math.max(0, currentCharacter.stats.money - cost);
    const newEnergy = Math.min(100, currentCharacter.stats.energy + energyRestore);
    const newHunger = Math.min(100, currentCharacter.stats.hunger + hungerRestore);
    const newComfort = Math.min(100, (currentCharacter.stats.comfort ?? 100) + comfortRestore);

    const updatedChar: Character = {
      ...currentCharacter,
      stats: {
        ...currentCharacter.stats,
        money: newMoney,
        energy: newEnergy,
        hunger: newHunger,
        comfort: newComfort
      },
      stallPurchaseCounts: updatedStallCounts
    };

    saveCharacter(updatedChar);
    setCurrentCharacter(updatedChar);
    syncCharacterToCloud(updatedChar);

    // Update list
    setAllCharacters(prev =>
      prev.map(c => (c.id === updatedChar.id ? updatedChar : c))
    );

    if (cost > 0) {
      addFloatingText(`-${cost.toLocaleString('vi-VN')}₫`, '#F43F5E');
    } else {
      addFloatingText('Thoải mái! ✨', '#EC4899');
    }

    const updatedLogs = addLog(
      `${currentCharacter.name} đã trải nghiệm "${activityTitle}" (${cost > 0 ? `-${cost.toLocaleString('vi-VN')}₫` : 'Miễn phí'}).`,
      'info'
    );
    setLogs(updatedLogs);
  };

  // Handle Rest Completed
  const handleRestCompleted = () => {
    if (!currentCharacter) return;

    const updatedChar: Character = {
      ...currentCharacter,
      stats: {
        ...currentCharacter.stats,
        energy: 100,
        comfort: Math.min(100, (currentCharacter.stats.comfort ?? 100) + 60),
        daysSurvived: (currentCharacter.stats.daysSurvived || 1) + 1
      }
    };

    saveCharacter(updatedChar);
    setCurrentCharacter(updatedChar);

    setAllCharacters(prev =>
      prev.map(c => (c.id === updatedChar.id ? updatedChar : c))
    );

    addFloatingText('Đầy 100% Năng Lượng! ⚡', '#38BDF8');

    const updatedLogs = addLog(
      `${currentCharacter.name} đã ngủ hồi sức đầy 100% năng lượng và bước sang ngày sinh tồn thứ ${updatedChar.stats.daysSurvived}!`,
      'success'
    );
    setLogs(updatedLogs);
  };

  // Handle Building Customization & Business Updates
  const handleUpdateBuilding = (updated: BuildingZone) => {
    setBuildings(prev => {
      const newList = prev.map(b => b.id === updated.id ? updated : b);
      saveBuildingsToStorage(newList);
      return newList;
    });
    setSelectedBuilding(updated);
    syncBuildingToCloud(updated);
    addFloatingText(`Khai trương ${updated.name}! 🎉`, '#F59E0B');
    const updatedLogs = addLog(
      `🎉 ${currentCharacter?.name} vừa khai trương / cập nhật gian hàng "${updated.name}"!`,
      'success'
    );
    setLogs(updatedLogs);
  };

  // Handle Relinquish Building (Return stall to vacant)
  const handleRelinquishBuilding = (buildingId: string) => {
    setBuildings(prev => {
      const target = prev.find(b => b.id === buildingId);
      if (!target) return prev;
      const resetBuilding: BuildingZone = {
        ...target,
        name: `Gian Hàng của ${target.ownerName || 'Cư dân'}`,
        title: `Gian Hàng của ${target.ownerName || 'Cư dân'}`,
        subtitle: 'Chưa mở bán • Nhấp để chọn lĩnh vực & mở quán!',
        icon: '🏪',
        color: '#1E293B',
        roofColor: '#3B82F6',
        isCustomizable: true,
        isOwned: false,
        products: undefined,
        totalRevenue: 0,
        totalSalesCount: 0
      };

      const newList = prev.map(b => b.id === buildingId ? resetBuilding : b);
      saveBuildingsToStorage(newList);
      setSelectedBuilding(resetBuilding);
      syncBuildingToCloud(resetBuilding);
      return newList;
    });
    const updatedLogs = addLog(
      `${currentCharacter?.name} đã sang nhượng lại gian hàng cho thành phố.`,
      'info'
    );
    setLogs(updatedLogs);
  };

  // Handle Instant Direct Payment into Stall Owner's Wallet
  const handleCustomerPurchasedFromOwner = (
    ownerId: string,
    ownerName: string,
    amount: number,
    productName: string,
    storeName: string
  ) => {
    // 1. If current active player is the owner:
    if (currentCharacter && (currentAccount?.id === ownerId || currentCharacter.id === ownerId)) {
      const newMoney = currentCharacter.stats.money + amount;
      const updatedChar: Character = {
        ...currentCharacter,
        stats: {
          ...currentCharacter.stats,
          money: newMoney
        }
      };
      saveCharacter(updatedChar);
      setCurrentCharacter(updatedChar);
      syncCharacterToCloud(updatedChar);
      addFloatingText(`+${amount.toLocaleString('vi-VN')}₫`, '#34D399');
      sounds.playCoin();
      const updatedLogs = addLog(
        `💰 Gian hàng "${storeName}" của bạn vừa bán được "${productName}"! Bạn nhận ngay +${amount.toLocaleString('vi-VN')}₫ trực tiếp vào ví!`,
        'money'
      );
      setLogs(updatedLogs);
      return;
    }

    // 2. If the owner is another registered player:
    const chars = getCharacters();
    const targetChar = chars.find(
      c => c.accountId === ownerId || c.id === ownerId || (c.name && ownerName && c.name.trim().toLowerCase() === ownerName.trim().toLowerCase())
    );
    if (targetChar) {
      const updatedTarget: Character = {
        ...targetChar,
        stats: {
          ...targetChar.stats,
          money: targetChar.stats.money + amount
        }
      };
      saveCharacter(updatedTarget);
      syncCharacterToCloud(updatedTarget);
      setAllCharacters(prev => prev.map(c => c.id === updatedTarget.id ? updatedTarget : c));
    }

    // Broadcast across windows/tabs so if the owner has another tab open, their wallet updates live!
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('survival_game_sales');
        bc.postMessage({
          type: 'DIRECT_SALE_CREDIT',
          ownerId,
          amount,
          productName,
          storeName
        });
        bc.close();
      }
    } catch {
      // ignore
    }

    const updatedLogs = addLog(
      `🛍️ Bạn đã mua "${productName}" từ "${storeName}". Tiền ${amount.toLocaleString('vi-VN')}₫ đã được cộng thẳng vào ví chủ quán (${ownerName})!`,
      'info'
    );
    setLogs(updatedLogs);
  };

  // Fast Travel to a building door from Directory
  const handleFastTravelToBuilding = (b: BuildingZone) => {
    setIsShopDirectoryOpen(false);
    if (!currentCharacter) return;

    const targetX = b.x + b.width / 2;
    const targetY = b.y + b.height + 25;

    const updatedChar: Character = {
      ...currentCharacter,
      x: targetX,
      y: targetY,
      isMoving: false
    };

    saveCharacter(updatedChar);
    setCurrentCharacter(updatedChar);
    setAllCharacters(prev => prev.map(c => (c.id === updatedChar.id ? updatedChar : c)));

    addFloatingText(`Đến ${b.name}! 🚀`, '#38BDF8');
    sounds.playStep();
  };

  // Fast Pre-seed 40 demo accounts & stalls
  const handleSeedFortyDemoAccounts = () => {
    const demo = generateFortyDemoAccounts();
    saveAccounts(demo.accounts);
    saveCharacters(demo.characters);
    saveBuildingsToStorage(demo.buildings);

    setAccounts(demo.accounts);
    setAllCharacters(demo.characters);
    setBuildings(demo.buildings);
    bulkUploadCityToCloud(demo.accounts, demo.characters, demo.buildings);

    // Auto-login as first player
    const firstAcc = demo.accounts[0];
    const firstChar = demo.characters[0];
    setActiveAccountId(firstAcc.id);
    setCurrentAccount(firstAcc);
    setCurrentCharacter(firstChar);

    setIsAuthOpen(false);
    sounds.playFanfare();
    const updatedLogs = addLog(
      '🎉 Đã khởi tạo thành công 40 người chơi & 40 gian hàng trên toàn bộ bản đồ đô thị (Đã đồng bộ lên Cloud)!',
      'success'
    );
    setLogs(updatedLogs);
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-slate-950 overflow-hidden font-sans text-slate-100 select-none">
      {/* 1. Top HUD Status Bar */}
      {currentCharacter && (
        <GameHUD
          player={currentCharacter}
          timeOfDayHours={timeOfDayHours}
          allCharacters={allCharacters}
          logs={logs}
          onSwitchAccount={() => setIsAuthOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenLogs={() => setIsLogsOpen(true)}
          onDeleteCurrentAccount={() => currentAccount && handleAccountDeleted(currentAccount.id)}
        />
      )}

      {/* 1.1 HOST CONTROL PANEL (Rendered for Host Account) */}
      {currentCharacter && isHost && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 px-4 py-2 border-b border-amber-400/50 flex flex-wrap items-center justify-between gap-3 shadow-lg z-20">
          <div className="flex items-center gap-2.5 text-white">
            <span className="w-8 h-8 rounded-xl bg-black/40 border border-amber-300/40 flex items-center justify-center text-base shadow">👑</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-200">QUYỀN HOST: {currentCharacter.name}</span>
                <span className="text-[10px] bg-black/40 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                  👥 {allCharacters.length} cư dân trong phòng
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  gameSession.status === 'running'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                    : gameSession.status === 'ended'
                    ? 'bg-rose-950 text-rose-300 border border-rose-500'
                    : 'bg-black/50 text-white border border-white/20'
                }`}>
                  {gameSession.status === 'running' ? 'Đang Chơi (7 Phút)' : gameSession.status === 'ended' ? 'Hết Giờ' : 'Chờ Bắt Đầu'}
                </span>
              </div>
              <p className="text-[11px] text-amber-100/90 font-medium">
                {gameSession.status === 'running'
                  ? 'Lượt chơi 7 phút đang đếm ngược. Các chỉ số sinh tồn và chức năng buôn bán đang hoạt động!'
                  : gameSession.status === 'ended'
                  ? 'Lượt chơi 7 phút đã kết thúc. Bạn có thể nhấn nút để khởi động lượt mới!'
                  : 'Người chơi đang đợi bạn bấm nút Bắt Đầu để mở khóa buôn bán & bắt đầu tính giờ 7 phút!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {gameSession.status === 'running' ? (
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono font-black text-sm border shadow-inner ${
                  roundTimeRemaining <= 60
                    ? 'bg-rose-950 text-rose-300 border-rose-400 animate-pulse'
                    : 'bg-black/60 text-emerald-300 border-emerald-500/60'
                }`}>
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span>{formatTime(roundTimeRemaining)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRoundTimeUp}
                  className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-600 text-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow active:scale-95"
                >
                  Kết thúc lượt sớm
                </button>
              </div>
            ) : gameSession.status === 'ended' ? (
              <button
                type="button"
                onClick={handleHostRestartRound}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>BẮT ĐẦU LƯỢT MỚI (7 PHÚT)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleHostStartGame}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-xl shadow-emerald-500/40 transition-all cursor-pointer active:scale-95 animate-bounce"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>BẮT ĐẦU TRÒ CHƠI (7 PHÚT)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1.2 REGULAR PLAYER STATUS & 7-MINUTE TIMER HUD */}
      {currentCharacter && !isHost && (
        <>
          {gameSession.status === 'host_joined' && (
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-700/60 px-4 py-2 flex items-center justify-between gap-3 text-xs text-indigo-200 z-10 shadow-md">
              <div className="flex items-center gap-2.5">
                <Crown className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
                <span>
                  <strong>Host {gameSession.hostName || 'Tổng Quản'}</strong> đã vào phòng! Trò chơi đang chuẩn bị... Hãy sẵn sàng, các hoạt động và thời gian 7 phút sẽ bắt đầu khi Host bấm Bắt Đầu.
                </span>
              </div>
              <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full flex-shrink-0 animate-pulse">
                Đang Chờ Host Bắt Đầu
              </span>
            </div>
          )}

          {gameSession.status === 'running' && (
            <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between gap-3 text-xs z-10 shadow-md">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>LƯỢT CHƠI 7 PHÚT:</span>
                </span>
                <div className="w-28 sm:w-48 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      roundTimeRemaining <= 60
                        ? 'bg-rose-500 animate-pulse'
                        : 'bg-gradient-to-r from-emerald-500 to-indigo-500'
                    }`}
                    style={{ width: `${Math.max(0, Math.min(100, (roundTimeRemaining / 420) * 100))}%` }}
                  />
                </div>
              </div>

              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono font-black text-sm border shadow-inner ${
                roundTimeRemaining <= 60
                  ? 'bg-rose-950/90 text-rose-300 border-rose-500 animate-pulse'
                  : 'bg-slate-950 text-emerald-400 border-slate-700'
              }`}>
                <span>{formatTime(roundTimeRemaining)}</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* City Overview Status Bar with Live Cross-Device Sync Badge & Google Auth */}
      {currentCharacter && (
        <div className="hidden sm:flex items-center justify-between px-4 py-1.5 bg-slate-900/60 border-b border-slate-800 text-[11px] text-slate-300">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <span>🏪</span>
              <span>
                <strong>{accounts.length} Gian Hàng Cư Dân</strong> ({accounts.length} tài khoản)
              </span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5 text-rose-300 font-semibold">
              <span>🍲</span>
              <span>
                <strong>1 Quán Ăn Sinh Tồn Trung Tâm</strong> (Cơm 25k, Nước 10k, Thịt 30k)
              </span>
            </span>
            <span className="text-slate-600">•</span>
            {/* Live Cross-Device Firebase Sync Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] text-emerald-300 font-bold shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{isCloudConnected ? 'Đồng bộ đa thiết bị (Firebase Live)' : 'Đang kết nối Cloud...'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {authUser ? (
              <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700 text-[10px]">
                <span className="text-emerald-400 font-bold">👤 {authUser.displayName || authUser.email}</span>
                <button
                  type="button"
                  onClick={() => logoutUser()}
                  className="text-rose-400 hover:text-rose-300 underline cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => loginWithGoogle()}
                className="py-1 px-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow active:scale-95"
                title="Đăng nhập tài khoản Google để đồng bộ dữ liệu người chơi trên nhiều thiết bị"
              >
                <span>🌐 Đăng nhập Google</span>
              </button>
            )}
            <span className="text-slate-500">|</span>
            <button
              onClick={() => setIsShopDirectoryOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer flex items-center gap-1"
            >
              <span>📋 Xem danh bạ {accounts.length} gian hàng & dẫn đường</span>
            </button>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">🗺️ Camera tự động theo người chơi</span>
          </div>
        </div>
      )}

      {/* 2. Main Interactive Animated World Canvas with Follow-Camera */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center p-1 sm:p-2">
        {currentCharacter ? (
          <WorldCanvas
            player={currentCharacter}
            allCharacters={allCharacters}
            buildings={buildings}
            onPlayerPositionChange={handlePlayerPositionChange}
            onEnterBuilding={(b) => {
              if (gameSession.status === 'waiting_for_host') {
                addFloatingText('Đang đợi Host vào phòng! ⏳', '#FBBF24');
                addLog('⚠️ Trò chơi chưa bắt đầu: Đang đợi Host vào phòng!', 'warning');
                return;
              }
              if (gameSession.status === 'host_joined') {
                addFloatingText('Đang đợi Host bấm Bắt Đầu! 👑', '#FBBF24');
                addLog('⚠️ Trò chơi chưa bắt đầu: Vui lòng đợi Host bấm "Bắt Đầu Trò Chơi (7 phút)"!', 'warning');
                return;
              }
              if (gameSession.status === 'ended') {
                addFloatingText('Lượt chơi đã kết thúc! 🏁', '#F87171');
                addLog('⚠️ Lượt chơi 7 phút đã kết thúc! Hãy đợi Host khởi động lượt mới!', 'warning');
                return;
              }
              setSelectedBuilding(b);
            }}
            onOpenDirectory={() => setIsShopDirectoryOpen(true)}
            timeOfDayHours={timeOfDayHours}
            floatingTexts={floatingTexts}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-center p-6">
            <div className="text-4xl animate-bounce">🌍</div>
            <h2 className="text-xl font-bold text-white">Chào mừng bạn đến với Thế Giới Sinh Tồn Hoạt Họa</h2>
            <p className="text-xs text-slate-400 max-w-sm">
              Đang chuẩn bị thế giới thực tế mô phỏng... Vui lòng tạo tài khoản hoặc đăng nhập để bắt đầu!
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg text-sm cursor-pointer"
            >
              Tạo tài khoản người chơi
            </button>
          </div>
        )}
      </main>

      {/* 2.1 WAITING FOR HOST SCREEN (When Host has not entered the room yet) */}
      {currentCharacter && gameSession.status === 'waiting_for_host' && !isHost && (
        <WaitingForHostModal
          player={currentCharacter}
          account={currentAccount!}
          allCharacters={allCharacters}
          onLogout={() => {
            setCurrentAccount(null);
            setCurrentCharacter(null);
            setIsAuthOpen(true);
          }}
        />
      )}

      {/* 2.2 7-MINUTE ROUND SUMMARY / LEADERBOARD MODAL (When 7 minutes expire) */}
      {currentCharacter && gameSession.status === 'ended' && (
        <RoundSummaryModal
          isOpen={gameSession.status === 'ended'}
          gameSession={gameSession}
          allCharacters={allCharacters}
          buildings={buildings}
          isHost={isHost}
          onRestartRound={handleHostRestartRound}
          onLogout={() => {
            setCurrentAccount(null);
            setCurrentCharacter(null);
            setIsAuthOpen(true);
          }}
        />
      )}

      {/* 3. Account Auth Modal (Đầu tiên tạo 1 tài khoản & Quản lý/Xóa tài khoản) */}
      <AuthModal
        isOpen={isAuthOpen}
        onAccountReady={handleAccountReady}
        onAccountDeleted={handleAccountDeleted}
        onSeedFortyAccounts={handleSeedFortyDemoAccounts}
        onClose={() => currentAccount && setIsAuthOpen(false)}
      />

      {/* 4. Character Profile & Best Skill Setup Modal (Sau khi tạo xong điền tên và năng lực giỏi nhất) */}
      {currentAccount && (
        <CharacterSetupModal
          key={currentAccount.id}
          isOpen={isSetupOpen}
          account={currentAccount}
          onCharacterCreated={handleCharacterCreated}
        />
      )}

      {/* 5. Building Work / Custom Shop / Rest Interaction Modal */}
      {currentCharacter && selectedBuilding && (
        <BuildingInteractionModal
          building={selectedBuilding}
          player={currentCharacter}
          onClose={() => setSelectedBuilding(null)}
          onWorkCompleted={handleWorkCompleted}
          onActivityCompleted={handleActivityCompleted}
          onRestCompleted={handleRestCompleted}
          onUpdateBuilding={handleUpdateBuilding}
          onRelinquishBuilding={handleRelinquishBuilding}
          onCustomerPurchasedFromOwner={handleCustomerPurchasedFromOwner}
          onStartNegotiation={handleStartNegotiation}
        />
      )}

      {/* 6. Leaderboard / Citizen Directory Modal */}
      {currentCharacter && (
        <LeaderboardModal
          isOpen={isLeaderboardOpen}
          characters={allCharacters}
          currentPlayerId={currentCharacter.id}
          onClose={() => setIsLeaderboardOpen(false)}
        />
      )}

      {/* 7. World Event Logs Modal */}
      {currentCharacter && (
        <LogsModal
          isOpen={isLogsOpen}
          logs={logs}
          onClose={() => setIsLogsOpen(false)}
        />
      )}

      {/* 8. 40-Shop Town Directory & Fast Travel Modal */}
      {currentCharacter && (
        <ShopDirectoryModal
          isOpen={isShopDirectoryOpen}
          buildings={buildings}
          player={currentCharacter}
          onClose={() => setIsShopDirectoryOpen(false)}
          onFastTravelToBuilding={handleFastTravelToBuilding}
        />
      )}

      {/* 9. Game Over Modal (Hết Độ No, Kiệt Thể Lực hoặc Mất Độ Thoải Mái) */}
      {currentCharacter && gameOverReason && (
        <GameOverModal
          reason={gameOverReason}
          player={currentCharacter}
          onRevive={handleReviveFromGameOver}
          onRestartNew={handleRestartNewCharacter}
        />
      )}

      {/* 10. Real-time Two-Way Negotiation Chat Modal (Both Owner & Customer) */}
      {activeNegotiation && currentAccount && (
        <NegotiationChatModal
          isOpen={!!activeNegotiation}
          session={activeNegotiation}
          currentAccountId={currentAccount.id}
          currentAccountName={currentCharacter?.name || currentAccount.username}
          onSendMessage={handleNegotiationSendMessage}
          onOwnerConfirmPrice={handleNegotiationOwnerConfirmPrice}
          onClose={handleNegotiationClose}
        />
      )}
    </div>
  );
}
