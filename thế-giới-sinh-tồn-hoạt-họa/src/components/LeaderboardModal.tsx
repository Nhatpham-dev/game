import React from 'react';
import { Character, SkillDefinition } from '../types/game';
import { ONE_HUNDRED_SKILLS } from '../data/skillsData';
import { CharacterSprite } from './CharacterSprite';
import { X, Trophy, Medal, Award, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  characters: Character[];
  currentPlayerId: string;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<Props> = ({
  isOpen,
  characters,
  currentPlayerId,
  onClose
}) => {
  if (!isOpen) return null;

  // Sort characters by money descending
  const sorted = [...characters].sort((a, b) => b.stats.money - a.stats.money);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Bảng Xếp Hạng Sinh Tồn</h3>
              <p className="text-xs text-amber-100 font-medium">
                Cư dân thế giới thực & tài sản tích lũy
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

        {/* List of Survivors */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 text-slate-200">
          {sorted.map((char, index) => {
            const isSelf = char.id === currentPlayerId;
            const charSkillIds = char.bestSkillIds && char.bestSkillIds.length > 0
              ? char.bestSkillIds
              : [char.bestSkillId];
            
            const charSkills = charSkillIds
              .map(id => ONE_HUNDRED_SKILLS.find(s => s.id === id))
              .filter((s): s is SkillDefinition => s !== undefined);

            return (
              <div
                key={char.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isSelf
                    ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-800/60 border-slate-700/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm">
                    {index === 0 ? (
                      <span className="text-2xl">🥇</span>
                    ) : index === 1 ? (
                      <span className="text-2xl">🥈</span>
                    ) : index === 2 ? (
                      <span className="text-2xl">🥉</span>
                    ) : (
                      <span className="text-slate-400">#{index + 1}</span>
                    )}
                  </div>

                  {/* Character Avatar */}
                  <div className="bg-slate-900 rounded-xl p-1 border border-slate-700/60">
                    <CharacterSprite
                      appearance={char.appearance}
                      size={38}
                    />
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{char.name}</h4>
                      {isSelf && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500 text-white">
                          Bạn
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-1 flex-wrap">
                      {char.bestSkillId === 'custom' ? (
                        <span>✨ {char.customSkillName || 'Kỹ năng riêng'}</span>
                      ) : (
                        charSkills.map(s => (
                          <span
                            key={s.id}
                            title={s.name}
                            className="bg-slate-900/90 border border-slate-700 px-1.5 py-0.2 rounded text-[10px] text-indigo-200"
                          >
                            {s.icon} #{s.orderNumber}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Money and Stats */}
                <div className="text-right">
                  <div className="text-sm font-extrabold text-amber-300">
                    {char.stats.money.toLocaleString('vi-VN')}₫
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Cấp {char.stats.level} • Sống {char.stats.daysSurvived || 1} ngày
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center text-xs text-slate-400">
          💡 Hãy phát huy tối đa <strong>năng lực giỏi nhất</strong> của bạn tại đúng tòa nhà để vươn lên dẫn đầu!
        </div>
      </div>
    </div>
  );
};
