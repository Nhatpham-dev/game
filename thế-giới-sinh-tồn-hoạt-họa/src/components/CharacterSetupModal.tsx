import React, { useState, useMemo, useEffect } from 'react';
import { Character, CharacterAppearance, UserAccount, SkillDefinition } from '../types/game';
import { ONE_HUNDRED_SKILLS, SKILL_SECTIONS } from '../data/skillsData';
import { CharacterSprite } from './CharacterSprite';
import { saveCharacter, addLog } from '../utils/storage';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ArrowRight,
  UserCheck,
  Palette,
  Search,
  Dices,
  Check,
  HelpCircle,
  X,
  Award
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  account: UserAccount;
  onCharacterCreated: (character: Character) => void;
}

const SHIRT_COLORS = [
  { name: 'Xanh Lam', color: '#2563EB' },
  { name: 'Cam Nổi', color: '#EA580C' },
  { name: 'Xanh Lá', color: '#16A34A' },
  { name: 'Tím Đậm', color: '#9333EA' },
  { name: 'Hồng Đào', color: '#E11D48' },
  { name: 'Đen Cool', color: '#1E293B' },
  { name: 'Vàng Nghệ', color: '#D97706' },
];

const HAIR_STYLES = [
  { id: 'short', name: 'Tóc ngắn' },
  { id: 'spiky', name: 'Tóc vuốt' },
  { id: 'long', name: 'Tóc dài' },
  { id: 'curly', name: 'Tóc xoăn' },
  { id: 'buzz', name: 'Đầu đinh' },
] as const;

const ACCESSORIES = [
  { id: 'none', name: 'Không', icon: '👤' },
  { id: 'glasses', name: 'Kính mắt', icon: '👓' },
  { id: 'headphones', name: 'Tai nghe', icon: '🎧' },
  { id: 'hat', name: 'Mũ cá tính', icon: '🧢' },
  { id: 'backpack', name: 'Ba lô sinh tồn', icon: '🎒' },
] as const;

export const CharacterSetupModal: React.FC<Props> = ({ isOpen, account, onCharacterCreated }) => {
  const [characterName, setCharacterName] = useState(account.username);
  
  // Always synchronize character name to current account username when opened or account changes
  useEffect(() => {
    if (account?.username) {
      setCharacterName(account.username);
    }
  }, [account?.id, account?.username, isOpen]);

  // Select 3 skills out of 100
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(['skill_3', 'skill_21', 'skill_31']); 
  const [customSkillText, setCustomSkillText] = useState<string>('');
  const [isCustomSkillMode, setIsCustomSkillMode] = useState<boolean>(false);

  // Skill filter and search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Appearance state
  const [skinColor] = useState<string>('#FCD34D');
  const [hairStyle, setHairStyle] = useState<'short' | 'long' | 'spiky' | 'curly' | 'buzz'>('short');
  const [hairColor, setHairColor] = useState<string>('#1E293B');
  const [shirtColor, setShirtColor] = useState<string>('#2563EB');
  const [pantsColor, setPantsColor] = useState<string>('#334155');
  const [accessory, setAccessory] = useState<'none' | 'glasses' | 'hat' | 'headphones' | 'backpack'>('headphones');

  const [activeTab, setActiveTab] = useState<'skills' | 'appearance'>('skills');
  const [error, setError] = useState<string>('');

  // Filter skills list
  const filteredSkills = useMemo(() => {
    return ONE_HUNDRED_SKILLS.filter((skill) => {
      let matchSection = true;
      if (selectedCategory === 'section_1') matchSection = skill.orderNumber >= 1 && skill.orderNumber <= 30;
      else if (selectedCategory === 'section_2') matchSection = skill.orderNumber >= 31 && skill.orderNumber <= 65;
      else if (selectedCategory === 'section_3') matchSection = skill.orderNumber >= 66 && skill.orderNumber <= 100;

      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        query === '' ||
        skill.name.toLowerCase().includes(query) ||
        skill.subgroup.toLowerCase().includes(query) ||
        skill.section.toLowerCase().includes(query) ||
        String(skill.orderNumber).includes(query);

      return matchSection && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const currentAppearance: CharacterAppearance = {
    gender: 'boy',
    skinColor,
    hairStyle,
    hairColor,
    shirtColor,
    pantsColor,
    accessory
  };

  const selectedSkillsData = selectedSkillIds
    .map(id => ONE_HUNDRED_SKILLS.find(s => s.id === id))
    .filter((s): s is SkillDefinition => s !== undefined);

  // Toggle skill selection (allow up to 3)
  const handleToggleSkill = (skillId: string) => {
    setIsCustomSkillMode(false);
    setError('');

    if (selectedSkillIds.includes(skillId)) {
      if (selectedSkillIds.length <= 1) {
        setError('Bạn cần chọn ít nhất 1 kỹ năng!');
        return;
      }
      setSelectedSkillIds(selectedSkillIds.filter(id => id !== skillId));
      sounds.playStep();
    } else {
      if (selectedSkillIds.length >= 3) {
        // Replace oldest or shift
        setSelectedSkillIds([...selectedSkillIds.slice(1), skillId]);
        sounds.playCoin();
      } else {
        setSelectedSkillIds([...selectedSkillIds, skillId]);
        sounds.playCoin();
      }
    }
  };

  // Random pick 3 distinct skills
  const handleRandom3Skills = () => {
    setIsCustomSkillMode(false);
    setError('');
    const shuffled = [...ONE_HUNDRED_SKILLS].sort(() => 0.5 - Math.random());
    const random3 = shuffled.slice(0, 3).map(s => s.id);
    setSelectedSkillIds(random3);
    sounds.playFanfare();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = characterName.trim();
    if (!cleanName) {
      setError('Vui lòng nhập tên nhân vật của bạn!');
      return;
    }

    if (isCustomSkillMode && !customSkillText.trim()) {
      setError('Vui lòng nhập kỹ năng riêng của bạn!');
      return;
    }

    if (!isCustomSkillMode && selectedSkillIds.length < 3) {
      setError(`Vui lòng chọn đủ 3 kỹ năng (hiện tại bạn mới chọn ${selectedSkillIds.length}/3)!`);
      return;
    }

    const primarySkill = selectedSkillsData[0] || ONE_HUNDRED_SKILLS[0];
    const skillTitles = isCustomSkillMode
      ? [customSkillText.trim()]
      : selectedSkillsData.map(s => `#${s.orderNumber} ${s.name}`);

    const newChar: Character = {
      id: `char_${account.id}`,
      accountId: account.id,
      name: cleanName,
      bestSkillId: isCustomSkillMode ? 'custom' : primarySkill.id,
      bestSkillIds: isCustomSkillMode ? ['custom'] : selectedSkillIds,
      customSkillName: isCustomSkillMode ? customSkillText.trim() : undefined,
      appearance: currentAppearance,
      stats: {
        money: 100000,
        energy: 100,
        hunger: 100,
        comfort: 100,
        health: 100,
        level: 1,
        xp: 0,
        daysSurvived: 1
      },
      x: 480,
      y: 470,
      direction: 'down',
      isMoving: false,
      isWorking: false,
      speechBubble: {
        text: `Tôi là ${cleanName}, sở hữu 3 kỹ năng sinh tồn!`,
        expiresAt: Date.now() + 10000
      },
      isCurrentPlayer: true
    };

    saveCharacter(newChar);
    addLog(
      `Cư dân ${cleanName} vừa bước vào thế giới với 3 kỹ năng: ${skillTitles.join(', ')}!`,
      'success'
    );

    sounds.playFanfare();
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 }
    });

    onCharacterCreated(newChar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Hồ Sơ Cư Dân Sinh Tồn</h2>
              <p className="text-xs text-indigo-100 font-medium">
                Tài khoản: <strong className="text-white underline">{account.username}</strong> • Chọn 3 kỹ năng giỏi nhất trong 100 mục
              </p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-black/25 p-1 rounded-xl gap-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('skills')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'skills' ? 'bg-white text-slate-900 shadow' : 'text-indigo-100 hover:text-white'
              }`}
            >
              1. Chọn 3 Kỹ năng ({selectedSkillIds.length}/3)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('appearance')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'appearance' ? 'bg-white text-slate-900 shadow' : 'text-indigo-100 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              2. Ngoại hình
            </button>
          </div>
        </div>

        {/* Selected 3 Skills Overview Bar */}
        <div className="bg-slate-950/95 border-b border-slate-800 px-4 py-3 flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-1.5 flex items-center justify-center shadow-inner">
              <CharacterSprite
                appearance={currentAppearance}
                size={46}
                activityIcon={selectedSkillsData[0]?.icon || '✨'}
              />
            </div>
            <div>
              <div className="text-white font-bold text-sm flex items-center gap-2">
                <span>{characterName.trim() || 'Tên nhân vật'}</span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isCustomSkillMode ? '1 kỹ năng riêng' : `${selectedSkillIds.length}/3 Kỹ năng`}
                </span>
              </div>

              {/* 3 Skill badges preview */}
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {isCustomSkillMode ? (
                  <span className="text-xs bg-purple-950/80 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded-lg font-semibold">
                    ✨ {customSkillText.trim() || 'Kỹ năng riêng'}
                  </span>
                ) : (
                  selectedSkillsData.map(s => (
                    <span
                      key={s.id}
                      className="text-[11px] bg-slate-900 border border-indigo-500/40 text-indigo-200 px-2 py-0.5 rounded-lg font-medium flex items-center gap-1 shadow-sm"
                    >
                      <span>{s.icon}</span>
                      <span className="font-bold text-amber-300">#{s.orderNumber}</span>
                      <span className="truncate max-w-[120px] sm:max-w-[160px]">{s.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSkill(s.id);
                        }}
                        className="text-slate-400 hover:text-rose-400 ml-0.5 cursor-pointer"
                        title="Bỏ chọn"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tiêu chí tuyển dụng ở các nơi là <strong>bí mật</strong>! Có 3 kỹ năng tăng cơ hội được nhận việc!</span>
          </div>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 text-slate-200 space-y-4">
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl p-3">
              {error}
            </div>
          )}

          {activeTab === 'skills' ? (
            <>
              {/* Name Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  1. Tên nhân vật của bạn
                </label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Nhập tên hiển thị trong thế giới..."
                  maxLength={24}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm font-semibold"
                />
              </div>

              {/* Skill Selection Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      2. Chọn 3 kỹ năng giỏi nhất ({ONE_HUNDRED_SKILLS.length} mục)
                    </label>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      selectedSkillIds.length === 3
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {selectedSkillIds.length}/3 kỹ năng
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRandom3Skills}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Dices className="w-3.5 h-3.5" />
                      Chọn ngẫu nhiên 3 kỹ năng
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCustomSkillMode(!isCustomSkillMode)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isCustomSkillMode
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      + Tự nhập kỹ năng riêng
                    </button>
                  </div>
                </div>

                {/* If custom skill mode */}
                {isCustomSkillMode ? (
                  <div className="bg-purple-950/40 border border-purple-500/50 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      Nhập kỹ năng độc nhất mà bạn tự tin giỏi nhất:
                    </div>
                    <input
                      type="text"
                      value={customSkillText}
                      onChange={(e) => setCustomSkillText(e.target.value)}
                      placeholder="Ví dụ: Đàm phán đa văn hóa, Trực giác đầu tư, Diễn xuất..."
                      maxLength={40}
                      className="w-full bg-slate-950 border border-purple-500/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none text-sm"
                      autoFocus
                    />
                    <p className="text-[11px] text-slate-400">
                      Khi vào thế giới, các cơ sở tuyển dụng sẽ tự thẩm định xem kỹ năng riêng này của bạn có thích hợp hay không!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Search & Category Filter */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Tìm kỹ năng hoặc số thứ tự (#1, #21, #31, #66, Lập trình, Nấu ăn, Chạy bộ...)"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Category Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                        {SKILL_SECTIONS.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                              selectedCategory === cat.id
                                ? 'bg-indigo-600 text-white shadow'
                                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Skills Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                      {filteredSkills.map((skill) => {
                        const isSelected = selectedSkillIds.includes(skill.id) && !isCustomSkillMode;
                        const selectedIndex = selectedSkillIds.indexOf(skill.id) + 1;

                        return (
                          <div
                            key={skill.id}
                            onClick={() => handleToggleSkill(skill.id)}
                            className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 text-left relative ${
                              isSelected
                                ? 'bg-indigo-950/70 border-indigo-400 ring-2 ring-indigo-500/40 shadow-md'
                                : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                            }`}
                          >
                            <span className="text-xl flex-shrink-0 mt-0.5">{skill.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-800/60 flex-shrink-0">
                                    #{skill.orderNumber}
                                  </span>
                                  <h4 className="font-bold text-xs text-white truncate" title={skill.name}>
                                    {skill.name}
                                  </h4>
                                </div>

                                {isSelected ? (
                                  <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 shadow">
                                    {selectedIndex}
                                  </span>
                                ) : (
                                  <span className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0 opacity-40" />
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 text-[9px] text-slate-400">
                                <span className="text-amber-300 font-medium truncate max-w-[120px]">
                                  {skill.subgroup}
                                </span>
                                <span>•</span>
                                <span className="text-slate-500">
                                  {skill.section}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Tab Appearance */
            <div className="space-y-4">
              {/* Hair style */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Kiểu tóc
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {HAIR_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setHairStyle(style.id)}
                      className={`py-2 px-1 text-xs font-medium rounded-xl border transition-all text-center ${
                        hairStyle === style.id
                          ? 'bg-indigo-600 text-white border-indigo-400 font-bold'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair color */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Màu tóc
                </label>
                <div className="flex items-center gap-2">
                  {['#1E293B', '#78350F', '#D97706', '#E2E8F0', '#9333EA', '#DC2626'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setHairColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-9 h-9 rounded-xl border-2 transition-transform ${
                        hairColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Shirt Color */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Màu áo
                </label>
                <div className="flex flex-wrap gap-2">
                  {SHIRT_COLORS.map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      onClick={() => setShirtColor(item.color)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                        shirtColor === item.color
                          ? 'bg-slate-800 border-indigo-400 text-white ring-2 ring-indigo-500/40'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessories */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Phụ kiện trang bị
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ACCESSORIES.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setAccessory(acc.id)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                        accessory === acc.id
                          ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 font-bold'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-lg">{acc.icon}</span>
                      <span>{acc.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            {activeTab === 'skills' ? (
              <button
                type="button"
                onClick={() => setActiveTab('appearance')}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Palette className="w-4 h-4" />
                Đổi ngoại hình & trang phục
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('skills')}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all cursor-pointer"
              >
                ← Quay lại chọn kỹ năng ({selectedSkillIds.length}/3)
              </button>
            )}

            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-95"
            >
              <span>Xác nhận & Bước vào thế giới thực</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
