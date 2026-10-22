import React, { useState, useEffect } from 'react';
import { BuildingZone, Character, SkillDefinition, StoreProduct } from '../types/game';
import { ONE_HUNDRED_SKILLS } from '../data/skillsData';
import { getRecommendedSectorsForPlayer, RecommendedSectorResult, CENTRAL_FOOD_ITEMS, getStandardProductBasePrice } from '../data/businessSectors';
import { getStallPurchaseCount, recordStallPurchase } from '../utils/storage';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  Zap,
  Utensils,
  Moon,
  Coins,
  Smile,
  CheckCircle,
  AlertCircle,
  Store,
  Crown,
  ShoppingBag,
  Save,
  Trash2,
  TrendingUp,
  DollarSign,
  Info,
  PlusCircle,
  Clock,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';

interface Props {
  building: BuildingZone | null;
  player?: Character | null;
  isHost?: boolean;
  onClose: () => void;
  onWorkCompleted: (
    earnings: number,
    energyCost: number,
    hungerCost: number,
    comfortCost: number,
    xpGained: number,
    buildingName: string
  ) => void;
  onActivityCompleted: (
    cost: number,
    energyRestore: number,
    hungerRestore: number,
    comfortRestore: number,
    activityTitle: string,
    storeId?: string
  ) => void;
  onRestCompleted: () => void;
  onUpdateBuilding: (updatedBuilding: BuildingZone) => void;
  onRelinquishBuilding: (buildingId: string) => void;
  onCustomerPurchasedFromOwner?: (
    ownerId: string,
    ownerName: string,
    amount: number,
    productName: string,
    storeName: string
  ) => void;
  onStartNegotiation?: (product: StoreProduct, store: BuildingZone) => void;
}

export const BuildingInteractionModal: React.FC<Props> = ({
  building,
  player,
  isHost = false,
  onClose,
  onWorkCompleted,
  onActivityCompleted,
  onRestCompleted,
  onUpdateBuilding,
  onRelinquishBuilding,
  onCustomerPurchasedFromOwner,
  onStartNegotiation
}) => {
  if (!building) return null;

  const isSelfOwner = Boolean(
    player && (
      (building.ownerId && (building.ownerId === player.accountId || building.ownerId === player.id)) ||
      (building.ownerName && player.name && building.ownerName.trim().toLowerCase() === player.name.trim().toLowerCase()) ||
      (player.accountId && building.id === `stall_acc_${player.accountId}`) ||
      (player.id && building.id === `stall_acc_${player.id}`)
    )
  );
  const isOwner = Boolean(player && building.isOwned && isSelfOwner);
  const isMyVacantLot = Boolean(player && !building.isOwned && building.isCustomizable && isSelfOwner);
  const isOtherVacantLot = !building.isOwned && building.isCustomizable && !isSelfOwner;
  const isCentralFood = building.isCentralFoodStall === true;
  const stallPurchaseCount = player
    ? Math.max(player.stallPurchaseCounts?.[building.id] || 0, getStallPurchaseCount(player.accountId, building.id))
    : 0;
  const hasReachedLimit = !isCentralFood && stallPurchaseCount >= 2;
  const remainingPurchases = Math.max(0, 2 - stallPurchaseCount);

  // Retrieve player's skills
  const skillIds = player
    ? (player.bestSkillIds && player.bestSkillIds.length > 0 ? player.bestSkillIds : [player.bestSkillId])
    : [];

  const playerSkills = skillIds
    .map(id => ONE_HUNDRED_SKILLS.find(s => s.id === id))
    .filter((s): s is SkillDefinition => s !== undefined);

  // Requirement: Based on player's chosen skills, recommend EXACTLY 2 business sectors
  const [recommendedSectors] = useState<[RecommendedSectorResult, RecommendedSectorResult]>(() => {
    return getRecommendedSectorsForPlayer(playerSkills);
  });

  // Shop Creation Form States
  const [selectedSectorIndex, setSelectedSectorIndex] = useState<0 | 1>(0);
  const [shopName, setShopName] = useState<string>('');
  const [initialProducts, setInitialProducts] = useState<StoreProduct[]>([]);

  // Owner Product & Pricing States (Editable products & prices, plus adding new items)
  const [editableProducts, setEditableProducts] = useState<StoreProduct[]>([]);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState<boolean>(false);
  const [newProductName, setNewProductName] = useState<string>('');
  const [newProductIcon, setNewProductIcon] = useState<string>('✨');
  const [newProductPrice, setNewProductPrice] = useState<number>(30000);
  const [newProductDesc, setNewProductDesc] = useState<string>('');
  const [newProductComfort, setNewProductComfort] = useState<number>(55);

  const [isServingProgress, setIsServingProgress] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Sync state on building change
  useEffect(() => {
    if (isMyVacantLot && player) {
      const chosen = recommendedSectors[selectedSectorIndex]?.sector;
      if (chosen) {
        setShopName(`${chosen.name} của ${player.name}`);
        setInitialProducts([...chosen.defaultProducts]);
      }
    } else if (building.products && building.products.length > 0) {
      setEditableProducts([...building.products]);
    }
    setStatusMessage(null);
    setIsAddingNewProduct(false);
  }, [building.id, isMyVacantLot, selectedSectorIndex, recommendedSectors, player?.name, building.products]);

  // Handle Sector Choice in Vacant Lot
  const handleSelectSector = (index: 0 | 1) => {
    setSelectedSectorIndex(index);
    const chosen = recommendedSectors[index].sector;
    setShopName(`${chosen.name} của ${player.name}`);
    setInitialProducts([...chosen.defaultProducts]);
  };

  // Update initial product price in Creation Form
  const handleInitialProductPriceChange = (index: number, newPrice: number) => {
    setInitialProducts(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], price: Math.max(1000, newPrice) };
      return copy;
    });
  };

  // Launch Custom Store
  const handleCreateShop = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = shopName.trim();
    if (!cleanName) {
      setStatusMessage({ text: 'Vui lòng nhập tên gian hàng của bạn!', isError: true });
      return;
    }

    const chosen = recommendedSectors[selectedSectorIndex].sector;

    const newShop: BuildingZone = {
      ...building,
      name: cleanName,
      title: cleanName,
      subtitle: `Chủ sở hữu: ${player.name}`,
      icon: chosen.icon,
      color: chosen.color,
      roofColor: chosen.roofColor,
      isCustomizable: true,
      isOwned: true,
      ownerId: player.accountId,
      ownerName: player.name,
      businessSectorId: chosen.id,
      businessSectorName: chosen.name,
      products: initialProducts.length > 0 ? initialProducts : chosen.defaultProducts,
      totalRevenue: 0,
      totalSalesCount: 0
    };

    onUpdateBuilding(newShop);
    sounds.playFanfare();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 }
    });

    setStatusMessage({
      text: `🎉 Chúc mừng! Gian hàng "${cleanName}" đã chính thức khai trương với ${newShop.products?.length} sản phẩm/dịch vụ!`
    });
  };

  // Owner: Change product price in real-time
  const handleOwnerProductPriceChange = (index: number, newPrice: number) => {
    setEditableProducts(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], price: Math.max(1000, newPrice) };
      return copy;
    });
  };

  // Owner: Save updated prices
  const handleSavePrices = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedShop: BuildingZone = {
      ...building,
      products: editableProducts
    };

    onUpdateBuilding(updatedShop);
    sounds.playCoin();
    setStatusMessage({
      text: '✅ Đã lưu giá mới cho toàn bộ sản phẩm/dịch vụ của gian hàng!'
    });
  };

  // Owner: Add a new custom product or service
  const handleAddNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) {
      setStatusMessage({ text: 'Vui lòng nhập tên sản phẩm / dịch vụ mới!', isError: true });
      return;
    }

    const newProd: StoreProduct = {
      id: `custom_${Date.now()}`,
      name: newProductName.trim(),
      icon: newProductIcon.trim() || '✨',
      price: Math.max(1000, newProductPrice),
      description: newProductDesc.trim() || 'Dịch vụ đặc biệt độc quyền từ gian hàng.',
      comfortRestore: Math.min(100, Math.max(10, newProductComfort))
    };

    const updatedList = [...editableProducts, newProd];
    setEditableProducts(updatedList);

    const updatedShop: BuildingZone = {
      ...building,
      products: updatedList
    };
    onUpdateBuilding(updatedShop);

    sounds.playCoin();
    setNewProductName('');
    setNewProductDesc('');
    setIsAddingNewProduct(false);

    setStatusMessage({
      text: `✨ Đã thêm sản phẩm "${newProd.name}" vào danh mục với giá ${newProd.price.toLocaleString('vi-VN')}₫!`
    });
  };

  // Owner: Delete product
  const handleDeleteProduct = (productId: string) => {
    if (editableProducts.length <= 1) {
      setStatusMessage({ text: 'Gian hàng cần giữ lại ít nhất 1 sản phẩm!', isError: true });
      return;
    }

    const updatedList = editableProducts.filter(p => p.id !== productId);
    setEditableProducts(updatedList);

    const updatedShop: BuildingZone = {
      ...building,
      products: updatedList
    };
    onUpdateBuilding(updatedShop);

    sounds.playRest();
    setStatusMessage({ text: 'Đã xóa sản phẩm khỏi danh mục gian hàng.' });
  };

  // Owner: Serve customers shift
  const handleServeCustomers = () => {
    if (player.stats.energy < 15) {
      setStatusMessage({ text: 'Thể lực quá thấp! Hãy nghỉ ngơi trước khi bán hàng.', isError: true });
      return;
    }
    if (player.stats.hunger < 10) {
      setStatusMessage({ text: 'Bạn quá đói! Hãy ghé Gian Hàng Ăn Sinh Tồn nạp cơm trước.', isError: true });
      return;
    }

    setIsServingProgress(true);
    setProgressPercent(0);
    sounds.playStep();

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setProgressPercent(Math.min(100, current));

      if (current >= 100) {
        clearInterval(interval);
        setIsServingProgress(false);

        const prods = editableProducts.length > 0 ? editableProducts : (building.products || []);
        const randomProduct = prods[Math.floor(Math.random() * prods.length)];
        const customersServed = Math.floor(Math.random() * 2) + 2;
        const earned = (randomProduct?.price || 30000) * customersServed;

        const updatedShop: BuildingZone = {
          ...building,
          totalRevenue: (building.totalRevenue || 0) + earned,
          totalSalesCount: (building.totalSalesCount || 0) + customersServed
        };
        onUpdateBuilding(updatedShop);

        onWorkCompleted(earned, 14, 10, 5, 30, building.name);
        sounds.playCoin();
        setStatusMessage({
          text: `Tuyệt vời! Bạn vừa phục vụ ${customersServed} lượt khách mua "${randomProduct?.name}" và tiền lời +${earned.toLocaleString('vi-VN')}₫ đã được cộng thẳng trực tiếp vào ví của bạn!`
        });
      }
    }, 250);
  };

  // Customer: Buy product from a player shop (Restores Comfort ONLY)
  const handleCustomerBuyPlayerProduct = (prod: StoreProduct) => {
    if (isSelfOwner) {
      setStatusMessage({
        text: 'Bạn không thể mua hàng tại gian hàng của chính mình!',
        isError: true
      });
      return;
    }

    if (hasReachedLimit) {
      setStatusMessage({
        text: 'Bạn đã mua tối đa đúng 2 lần tại gian hàng này (quy định 2 lần/gian hàng)!',
        isError: true
      });
      return;
    }

    if (player.stats.money < prod.price) {
      setStatusMessage({
        text: `Bạn không đủ tiền! Cần ${prod.price.toLocaleString('vi-VN')}₫ để mua sản phẩm này.`,
        isError: true
      });
      return;
    }

    sounds.playEat();

    // Pay price, restores comfort only, records stall purchase
    onActivityCompleted(
      prod.price,
      0, // Player shops DO NOT give stamina
      0, // Player shops DO NOT give hunger
      prod.comfortRestore,
      prod.name,
      building.id
    );

    // Revenue transferred directly into shop owner's wallet
    const updatedShop: BuildingZone = {
      ...building,
      totalRevenue: (building.totalRevenue || 0) + prod.price,
      totalSalesCount: (building.totalSalesCount || 0) + 1
    };
    onUpdateBuilding(updatedShop);

    if (onCustomerPurchasedFromOwner && building.ownerId) {
      onCustomerPurchasedFromOwner(
        building.ownerId,
        building.ownerName || 'Chủ quán',
        prod.price,
        prod.name,
        building.name
      );
    }

    const newCount = stallPurchaseCount + 1;
    setStatusMessage({
      text: `Đã mua thành công "${prod.name}" (lượt mua ${newCount}/2 tại quán này)! Độ thoải mái +${prod.comfortRestore}%.`
    });
  };

  // BUY FROM CENTRAL FOOD STALL (THE ONLY PLACE FOR HUNGER & STAMINA SURVIVAL!)
  // Cơm: 25.000₫ (No +30%, Lực +35%)
  // Nước: 10.000₫ (No +15%, Lực +20%)
  // Thịt: 30.000₫ (No +45%, Lực +50%)
  const handleBuyCentralFood = (item: StoreProduct) => {
    if (player.stats.money < item.price) {
      setStatusMessage({
        text: `Bạn không đủ tiền! Cần ${item.price.toLocaleString('vi-VN')}₫ để mua ${item.name}.`,
        isError: true
      });
      return;
    }

    sounds.playEat();
    onActivityCompleted(
      item.price,
      item.energyRestore || 0,
      item.hungerRestore || 0,
      item.comfortRestore,
      item.name
    );

    setStatusMessage({
      text: `Đã dùng bữa "${item.name}"! Độ no +${item.hungerRestore}%, Thể lực +${item.energyRestore}%, Thoải mái +${item.comfortRestore}%. Bạn đã tiếp thêm năng lượng sống!`
    });
  };

  // Owner: Relinquish / Reset stall
  const handleRelinquish = () => {
    onRelinquishBuilding(building.id);
    sounds.playRest();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div
          className="p-5 text-white flex items-center justify-between relative transition-colors duration-300"
          style={{ backgroundColor: isCentralFood ? '#831843' : building.color }}
        >
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/20">
              {building.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{building.name}</h3>
                {isCentralFood && (
                  <span className="bg-red-500 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow animate-pulse">
                    Nơi Sinh Tồn Duy Nhất
                  </span>
                )}
                {isOwner && (
                  <span className="bg-amber-400 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                    <Crown className="w-3 h-3" /> Gian hàng của bạn
                  </span>
                )}
                {isMyVacantLot && (
                  <span className="bg-emerald-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow">
                    Mặt bằng của bạn
                  </span>
                )}
                {isOtherVacantLot && (
                  <span className="bg-slate-700 text-slate-300 font-bold text-[10px] px-2 py-0.5 rounded-full shadow">
                    Mặt bằng của {building.ownerName}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                {isCentralFood
                  ? 'Cơm (25.000₫) • Nước (10.000₫) • Thịt (30.000₫) [Bắt Buộc Để Sống]'
                  : building.isOwned
                  ? `Chủ sở hữu: ${building.ownerName || 'Cư dân'}`
                  : building.subtitle}
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

        {/* Status Notification Message */}
        {statusMessage && (
          <div
            className={`mx-5 mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.isError
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
            }`}
          >
            {statusMessage.isError ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-slate-200">
          {/* ========================================================================= */}
          {/* SPECTATOR / HOST VIEW: Read-Only Information                              */}
          {/* ========================================================================= */}
          {(isHost || !player) ? (
            <div className="space-y-4">
              <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-4 text-xs text-amber-200 space-y-2 shadow-inner">
                <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span>Chế Độ Quan Sát Của Host</span>
                </div>
                <p className="text-[11px] text-amber-100/90 leading-relaxed">
                  Host đang ở chế độ Giám Sát tổng quan thành phố sinh tồn. Bạn có thể xem bảng giá, sản phẩm, và doanh thu thực tế của gian hàng này mà không tham gia mua bán.
                </p>
              </div>

              {/* Business details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Chủ Gian Hàng</span>
                  <div className="text-sm font-bold text-white mt-1">
                    {isCentralFood ? '🍲 Bếp Ăn Sinh Tồn Trung Tâm' : building.ownerName || 'Chưa mở gian hàng'}
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {isCentralFood ? 'Loại Cơ Sở' : 'Doanh Thu Tích Lũy'}
                  </span>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-1">
                    {isCentralFood
                      ? 'Nạp No & Lực Bắt Buộc'
                      : `${(building.totalRevenue || 0).toLocaleString('vi-VN')}₫ (${building.totalSalesCount || 0} lượt)`}
                  </div>
                </div>
              </div>

              {/* Products list */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {isCentralFood ? 'Thực đơn món ăn sinh tồn:' : 'Danh mục sản phẩm & dịch vụ:'}
                </h5>
                <div className="grid grid-cols-1 gap-2.5">
                  {(isCentralFood ? CENTRAL_FOOD_ITEMS : building.products || []).map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-1 bg-slate-900 rounded-lg">{item.icon}</span>
                        <div>
                          <h6 className="font-bold text-white text-xs">{item.name}</h6>
                          <p className="text-[10px] text-slate-400">{item.description}</p>
                          {item.comfortRestore ? (
                            <span className="text-[10px] text-pink-400 font-semibold block">
                              +{item.comfortRestore}% Thoải mái
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <span className="font-mono font-extrabold text-amber-300 text-xs">
                        {item.price.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Đóng Bảng Quan Sát
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ========================================================================= */}
              {/* CASE A: CENTRAL SURVIVAL FOOD STALL (ONLY PLACE FOR HUNGER & STAMINA)   */}
              {/* Cơm: 25.000 (No 30%, Lực 35%)                                            */}
              {/* Nước: 10.000 (No 15%, Lực 20%)                                           */}
              {/* Thịt: 30.000 (No 45%, Lực 50%)                                           */}
              {/* ========================================================================= */}
              {isCentralFood && (
                <div className="space-y-4">
                  <div className="bg-red-950/40 border border-red-500/50 rounded-2xl p-4 text-xs text-red-200 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong className="text-white block font-bold text-sm mb-1">
                        ⚠️ QUY TẮC SINH TỒN BẮT BUỘC:
                      </strong>
                      Tất cả cư dân <strong>đều phải mua đồ ăn ở đây</strong> để đảm bảo sống được, không thể mua hàng từ bên khác để mà tăng độ no và thể lực!
                    </div>
                  </div>

              {/* The 3 Exact Food Items */}
              <div className="grid grid-cols-1 gap-3">
                {CENTRAL_FOOD_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-950/80 border border-red-900/40 hover:border-red-500/60 rounded-2xl p-4 flex items-center justify-between gap-3 transition-all shadow-md"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-950 to-slate-900 flex items-center justify-center text-3xl border border-red-700/50 shadow-inner">
                        {item.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-base">{item.name}</h4>
                          <span className="text-amber-300 font-extrabold text-xs bg-amber-950/90 px-2.5 py-0.5 rounded-lg border border-amber-600/70 shadow">
                            {item.price.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">{item.description}</p>
                        
                        {/* Stat Gains Indicators (Exact requested stats) */}
                        <div className="flex items-center gap-4 mt-2 text-xs font-extrabold">
                          <span className="text-orange-400 flex items-center gap-1.5 bg-orange-950/60 px-2 py-0.5 rounded-md border border-orange-800/40">
                            <Utensils className="w-3.5 h-3.5 text-orange-400" /> Độ no: +{item.hungerRestore}%
                          </span>
                          <span className="text-amber-300 flex items-center gap-1.5 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/40">
                            <Zap className="w-3.5 h-3.5 text-amber-300" /> Thể lực: +{item.energyRestore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBuyCentralFood(item)}
                      disabled={player.stats.money < item.price}
                      className={`py-3 px-5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-lg ${
                        player.stats.money >= item.price
                          ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white active:scale-95 shadow-red-900/30'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Mua Dùng Ngay</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>Số dư hiện tại: <strong className="text-emerald-400 font-bold">{player.stats.money.toLocaleString('vi-VN')}₫</strong></span>
                <span className="text-[11px] text-amber-300">💡 Ăn no giúp duy trì thể lực & thoải mái</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CASE B: VACANT ACCOUNT LOT OF THE CURRENT PLAYER                          */}
          {/* 2 Recommended sectors based on skills + Store Name + Editable Prices     */}
          {/* NO HIRING!                                                               */}
          {/* ========================================================================= */}
          {isMyVacantLot && !isCentralFood && (
            <form onSubmit={handleCreateShop} className="space-y-4">
              {/* Requirement: 2 recommended business sectors based on player's chosen skills */}
              <div className="bg-slate-950/70 border border-indigo-500/40 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <h4 className="font-bold text-sm text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Đề Xuất 2 Lĩnh Vực Kinh Doanh Dựa Vào Năng Lực Của Bạn:</span>
                  </h4>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                  <span>Năng lực đã chọn của bạn:</span>
                  {playerSkills.map(s => (
                    <span key={s.id} className="text-amber-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {s.icon} #{s.orderNumber} {s.name}
                    </span>
                  ))}
                </div>

                {/* The 2 proposed sectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {recommendedSectors.map((item, idx) => {
                    const isSelected = selectedSectorIndex === idx;
                    const sec = item.sector;
                    return (
                      <div
                        key={sec.id}
                        onClick={() => handleSelectSector(idx as 0 | 1)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-950/60 border-amber-400 shadow-lg shadow-indigo-900/30'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 opacity-80'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-2xl p-1 bg-slate-950 rounded-xl">{sec.icon}</span>
                            {isSelected ? (
                              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-amber-400" /> Đã chọn
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                                Nhấp chọn
                              </span>
                            )}
                          </div>

                          <h5 className="font-bold text-white text-xs sm:text-sm">{sec.name}</h5>
                          <p className="text-[10px] text-amber-300/90 italic mt-1 leading-snug">
                            {item.reason}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                            {sec.description}
                          </p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                          Gồm <strong>{sec.defaultProducts.length} sản phẩm / dịch vụ</strong> phong phú
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Requirement: Shop Name & Multi-Product Pricing Setup */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span>Đặt Tên Gian Hàng & Giá Cả Các Sản Phẩm Dịch Vụ:</span>
                </h4>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold block">Tên Gian Hàng Của Bạn:</label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Ví dụ: Tiệm Cà Phê Chill, Quán Cơm Gia Đình, Xưởng Chế Tạo..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-semibold"
                  />
                </div>

                {/* Multiple Products with editable prices */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs text-slate-300 font-semibold block">
                    Thiết Lập Giá Bán Ban Đầu (Có Thể Sửa Bất Kỳ Lúc Nào Khi Chơi):
                  </label>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {initialProducts.map((prod, idx) => (
                      <div
                        key={prod.id}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl flex-shrink-0">{prod.icon}</span>
                          <div className="min-w-0">
                            <span className="font-bold text-white text-xs block truncate">{prod.name}</span>
                            <span className="text-[10px] text-pink-400 font-semibold">
                              Hồi phục +{prod.comfortRestore}% Thoải mái
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-xs text-slate-400">Giá:</span>
                          <div className="relative">
                            <input
                              type="number"
                              min={1000}
                              max={300000}
                              step={1000}
                              required
                              value={prod.price}
                              onChange={(e) => handleInitialProductPriceChange(idx, Number(e.target.value))}
                              className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-right text-amber-300 font-bold focus:outline-none focus:border-indigo-500 text-xs"
                            />
                            <span className="absolute right-1.5 top-1 text-[10px] text-slate-400">₫</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  💡 <em>Lưu ý: Không có tính năng tuyển dụng. Bạn là chủ quán và có thể sửa giá hoặc thêm sản phẩm bất kỳ lúc nào!</em>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>🎉 Khai Trương Gian Hàng Của Bạn (Miễn Phí)</span>
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* CASE C: VACANT LOT OF ANOTHER REGISTERED ACCOUNT                         */}
          {/* ========================================================================= */}
          {isOtherVacantLot && !isCentralFood && (
            <div className="text-center py-8 space-y-3 bg-slate-950/60 rounded-3xl p-6 border border-slate-800">
              <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-lg">
                🏪
              </div>
              <h4 className="font-bold text-white text-base">{building.name}</h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Đây là mặt bằng kinh doanh được cấp cho tài khoản <strong>{building.ownerName}</strong>.
                Khi chủ tài khoản này đăng nhập, họ sẽ chọn lĩnh vực và khai trương gian hàng tại đây!
              </p>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CASE D: OWNER ENTERING OWN OPEN STALL                                    */}
          {/* Edit product prices, add new products, serve shifts, collect revenue      */}
          {/* NO HIRING!                                                               */}
          {/* ========================================================================= */}
          {isOwner && !isCentralFood && (
            <div className="space-y-4">
              {/* Product Pricing Table (Requirement 2 & 5: price can be modified anytime & add more products) */}
              <div className="bg-slate-950/70 border border-amber-500/40 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-sm text-white">Sản Phẩm & Giá Bán Gian Hàng:</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-800">
                      {editableProducts.length} sản phẩm/dịch vụ
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewProduct(!isAddingNewProduct)}
                      className="text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{isAddingNewProduct ? 'Đóng' : '+ Thêm Món'}</span>
                    </button>
                  </div>
                </div>

                <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-2.5 text-[11px] text-amber-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span><strong>Quy định trò chơi:</strong> Người chơi không thể mua hàng của chính mình. Chỉ các người chơi khác ghé thăm mới có thể mua hàng và tạo doanh thu cho bạn!</span>
                </div>

                {/* Form to Add New Custom Product */}
                {isAddingNewProduct && (
                  <form onSubmit={handleAddNewProductSubmit} className="bg-slate-900 p-3.5 rounded-xl border border-indigo-500/40 space-y-2.5 animate-fadeIn">
                    <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Thêm Sản Phẩm / Dịch Vụ Mới Vào Gian Hàng:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] text-slate-400 font-semibold">Tên sản phẩm/dịch vụ:</label>
                        <input
                          type="text"
                          required
                          value={newProductName}
                          onChange={(e) => setNewProductName(e.target.value)}
                          placeholder="Ví dụ: Set Bánh Trà Chiều, Dịch Vụ..."
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-semibold">Biểu tượng (Emoji):</label>
                        <input
                          type="text"
                          required
                          value={newProductIcon}
                          onChange={(e) => setNewProductIcon(e.target.value)}
                          placeholder="☕, 🍰, 🎁..."
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-center text-white focus:outline-none focus:border-indigo-400 font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-semibold">Giá bán (₫):</label>
                        <input
                          type="number"
                          min={1000}
                          max={300000}
                          step={1000}
                          required
                          value={newProductPrice}
                          onChange={(e) => setNewProductPrice(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-indigo-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-semibold">Độ thoải mái cộng thêm (%):</label>
                        <input
                          type="number"
                          min={10}
                          max={100}
                          step={5}
                          required
                          value={newProductComfort}
                          onChange={(e) => setNewProductComfort(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-pink-400 font-bold focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold">Mô tả ngắn gọn:</label>
                      <input
                        type="text"
                        value={newProductDesc}
                        onChange={(e) => setNewProductDesc(e.target.value)}
                        placeholder="Mô tả công dụng và trải nghiệm cho khách hàng..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingNewProduct(false)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg shadow cursor-pointer"
                      >
                        Lưu Món Mới
                      </button>
                    </div>
                  </form>
                )}

                {/* Products Table with editable prices */}
                <form onSubmit={handleSavePrices} className="space-y-2.5">
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {editableProducts.map((prod, idx) => (
                      <div
                        key={prod.id}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl flex-shrink-0">{prod.icon}</span>
                          <div className="min-w-0">
                            <span className="font-bold text-white text-xs block truncate">{prod.name}</span>
                            <span className="text-[10px] text-pink-400">+{prod.comfortRestore}% Thoải mái</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="relative">
                            <input
                              type="number"
                              min={1000}
                              max={300000}
                              step={1000}
                              value={prod.price}
                              onChange={(e) => handleOwnerProductPriceChange(idx, Number(e.target.value))}
                              className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-right text-amber-300 font-extrabold focus:outline-none focus:border-amber-400 text-xs"
                            />
                            <span className="absolute right-1.5 top-1 text-[10px] text-slate-400">₫</span>
                          </div>

                          <span
                            title="Quy định: Người chơi không thể mua hàng của chính mình"
                            className="text-[10px] font-semibold text-slate-500 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 select-none"
                          >
                            Không thể tự mua
                          </span>

                          {editableProducts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(prod.id)}
                              title="Xóa món này"
                              className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400 italic">
                      💡 Giá cả có thể sửa bất kỳ lúc nào trong game
                    </span>
                    <button
                      type="submit"
                      className="py-2 px-5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu Thay Đổi Giá Bán</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Revenue & Business Performance: Direct Wallet Transfer */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Doanh Thu Gian Hàng (Cộng Thẳng Vào Ví):</span>
                  </h4>
                  <span className="text-xs text-slate-400">
                    Đã bán: <strong className="text-white">{building.totalSalesCount || 0} lượt</strong>
                  </span>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">Tổng tiền đã cộng thẳng vào ví nhân vật:</span>
                    <span className="text-emerald-400 font-extrabold text-base">
                      {(building.totalRevenue || 0).toLocaleString('vi-VN')}₫
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/70 border border-emerald-700/60 px-3 py-2 rounded-xl font-bold shadow-inner">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tiền về ví ngay khi bán</span>
                  </div>
                </div>
              </div>

              {/* Progress bar when serving */}
              {isServingProgress && (
                <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-amber-500/40 animate-pulse">
                  <div className="flex justify-between text-xs text-amber-300 font-bold">
                    <span>Đang phục vụ khách hàng...</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons for Owner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  disabled={isServingProgress}
                  onClick={handleServeCustomers}
                  className={`py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                    isServingProgress
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30 active:scale-98'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>
                    {isServingProgress ? 'Đang tiếp khách...' : 'Vào Ca Bán Hàng & Tiếp Khách'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleRelinquish}
                  className="py-3.5 px-4 rounded-2xl font-bold text-xs bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Đổi Lĩnh Vực / Sang Nhượng</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CASE E: GUEST ENTERING A PLAYER SHOP -> BUY PRODUCTS (RESTORES COMFORT)   */}
          {/* ========================================================================= */}
          {!isMyVacantLot && !isOtherVacantLot && !isOwner && !isCentralFood && building.isOwned && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-4 text-center">
                <div className="w-14 h-14 bg-slate-900 border border-slate-700 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-inner mb-2">
                  {building.icon}
                </div>
                <h4 className="text-lg font-bold text-white">{building.name}</h4>
                <p className="text-xs text-amber-300 font-semibold mt-0.5">
                  Chủ quán: {building.ownerName || 'Cư dân'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 Các dịch vụ tại đây giúp bạn hồi phục <strong>Độ Thoải Mái (Comfort)</strong>. (Để nạp Độ No & Thể Lực, hãy ghé Gian Hàng Ăn Sinh Tồn Trung Tâm).
                </p>

                {/* Purchase Count Badge (Max 2 purchases per stall) */}
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                    hasReachedLimit
                      ? 'bg-rose-950/80 border-rose-600/70 text-rose-300'
                      : stallPurchaseCount === 1
                      ? 'bg-amber-950/80 border-amber-600/70 text-amber-300'
                      : 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300'
                  }`}>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Lượt mua tại quán này: {stallPurchaseCount}/2 {hasReachedLimit ? '(Đã hết lượt)' : `(Còn ${remainingPurchases} lượt)`}</span>
                  </span>
                </div>

                {hasReachedLimit && (
                  <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-3 text-center text-xs text-rose-300 flex items-center justify-center gap-2 mt-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>Bạn đã mua tối đa <strong>2/2 lần</strong> tại gian hàng này (quy định tối đa 2 lần/mỗi gian hàng). Không thể mua thêm!</span>
                  </div>
                )}

                {isSelfOwner && (
                  <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-3 text-center text-xs text-amber-300 flex items-center justify-center gap-2 mt-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Đây là gian hàng của chính bạn. Bạn không thể tự mua hàng của mình!</span>
                  </div>
                )}
              </div>

              {/* Products Catalog */}
              <div className="space-y-2.5">
                <h5 className="font-bold text-xs text-slate-300 px-1">Danh Mục Sản Phẩm & Dịch Vụ:</h5>
                {building.products && building.products.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {building.products.map(prod => {
                      const itemPrice = prod.originalPrice || getStandardProductBasePrice(prod.id) || prod.price;
                      const standardProd: StoreProduct = { ...prod, price: itemPrice, originalPrice: itemPrice };
                      return (
                      <div
                        key={prod.id}
                        className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl p-1 bg-slate-900 rounded-xl flex-shrink-0">{prod.icon}</span>
                          <div className="min-w-0">
                            <h6 className="font-bold text-white text-xs truncate">{prod.name}</h6>
                            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{prod.description}</p>
                            <span className="text-[10px] text-pink-400 font-semibold block mt-0.5">
                              +{prod.comfortRestore}% Độ thoải mái
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="font-extrabold text-amber-300 text-xs">
                            {itemPrice.toLocaleString('vi-VN')}₫
                          </span>

                          {/* Trao đổi / Thương lượng giá: Giảm hoặc Tăng giá cho 1 lượt mua */}
                          <button
                            type="button"
                            disabled={hasReachedLimit || isSelfOwner}
                            onClick={() => {
                              if (isSelfOwner) {
                                setStatusMessage({ text: 'Bạn không thể mua hàng tại gian hàng của chính mình!', isError: true });
                                return;
                              }
                              if (hasReachedLimit) {
                                setStatusMessage({ text: 'Bạn đã mua tối đa 2 lần tại gian hàng này!', isError: true });
                                return;
                              }
                              if (onStartNegotiation) {
                                onStartNegotiation(standardProd, building);
                              }
                            }}
                            className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                              hasReachedLimit || isSelfOwner
                                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                                : 'bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-600/60 text-indigo-300 hover:text-white cursor-pointer shadow active:scale-95'
                            }`}
                            title={
                              isSelfOwner
                                ? 'Bạn không thể tự mua hàng của chính mình'
                                : hasReachedLimit
                                ? 'Bạn đã mua tối đa 2 lần tại gian hàng này'
                                : 'Thương lượng giá trực tiếp với chủ quán cho 1 lượt mua này (các lần mua sau vẫn giữ giá gốc ban đầu)'
                            }
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Trao đổi</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCustomerBuyPlayerProduct(standardProd)}
                            disabled={player.stats.money < itemPrice || hasReachedLimit || isSelfOwner}
                            title={
                              isSelfOwner
                                ? 'Bạn không thể tự mua hàng của chính mình'
                                : hasReachedLimit
                                ? 'Bạn đã mua tối đa 2 lần tại gian hàng này'
                                : `Mua ngay theo giá niêm yết ban đầu (${itemPrice.toLocaleString('vi-VN')}₫)`
                            }
                            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                              hasReachedLimit || isSelfOwner
                                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                : player.stats.money >= itemPrice
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 cursor-pointer'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>
                              {isSelfOwner
                                ? 'Quán của bạn'
                                : hasReachedLimit
                                ? 'Đã hết lượt (2/2)'
                                : `Mua (${itemPrice.toLocaleString('vi-VN')}₫)`}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">Gian hàng này đang chuẩn bị cập nhật sản phẩm.</p>
                )}
              </div>

              <div className="text-right text-xs text-slate-400 pt-1">
                Ví của bạn: <strong className="text-emerald-400">{(player?.stats?.money ?? 0).toLocaleString('vi-VN')}₫</strong>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
