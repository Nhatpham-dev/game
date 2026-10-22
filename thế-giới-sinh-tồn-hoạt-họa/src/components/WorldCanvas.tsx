import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Character, BuildingZone } from '../types/game';
import { ONE_HUNDRED_SKILLS } from '../data/skillsData';
import { calculateWorldDimensions, WORLD_BASE_WIDTH } from '../utils/buildingManager';
import { sounds } from '../utils/audio';
import { Compass, Map, Navigation } from 'lucide-react';

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  opacity: number;
  createdAt: number;
}

interface Props {
  player?: Character | null;
  allCharacters: Character[];
  buildings: BuildingZone[];
  onPlayerPositionChange?: (x: number, y: number, isMoving: boolean) => void;
  onEnterBuilding: (building: BuildingZone) => void;
  onOpenDirectory?: () => void;
  timeOfDayHours: number; // 0 to 24
  floatingTexts: FloatingText[];
  isSpectator?: boolean;
  focusCoordinates?: { x: number; y: number } | null;
  onSelectCharacter?: (character: Character) => void;
}

export const WorldCanvas: React.FC<Props> = ({
  player,
  allCharacters,
  buildings,
  onPlayerPositionChange,
  onEnterBuilding,
  onOpenDirectory,
  timeOfDayHours,
  floatingTexts,
  isSpectator = false,
  focusCoordinates,
  onSelectCharacter
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nearbyBuilding, setNearbyBuilding] = useState<BuildingZone | null>(null);
  const targetPosRef = useRef<{ x: number; y: number } | null>(null);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const lastStepSoundRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const cameraRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update target camera position when focusCoordinates changes
  useEffect(() => {
    if (focusCoordinates) {
      targetPosRef.current = focusCoordinates;
    }
  }, [focusCoordinates]);

  // Viewport resolution
  const VIEW_WIDTH = 1280;
  const VIEW_HEIGHT = 720;

  // Dynamic World Map Dimensions based on number of buildings (Scales up for 40+ players!)
  const worldDims = calculateWorldDimensions(buildings.length);
  const WORLD_WIDTH = worldDims.width;
  const WORLD_HEIGHT = worldDims.height;

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      keysPressedRef.current[e.key.toLowerCase()] = true;

      // E or Space to enter nearby building
      if ((e.key.toLowerCase() === 'e' || e.key === ' ') && nearbyBuilding) {
        e.preventDefault();
        onEnterBuilding(nearbyBuilding);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearbyBuilding, onEnterBuilding]);

  // Click / Tap on canvas to move player (using camera world coordinates)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Viewport click coordinates
    const viewClickX = (e.clientX - rect.left) * scaleX;
    const viewClickY = (e.clientY - rect.top) * scaleY;

    // Convert to absolute world coordinates by adding camera offset!
    const worldClickX = viewClickX + cameraRef.current.x;
    const worldClickY = viewClickY + cameraRef.current.y;

    // Check if clicked directly on a building entrance
    const clickedBuilding = buildings.find(
      b => worldClickX >= b.x && worldClickX <= b.x + b.width && worldClickY >= b.y && worldClickY <= b.y + b.height
    );

    if (isSpectator || !player) {
      // Check if clicked directly on any player character in spectator mode
      const clickedChar = allCharacters.find(
        c => Math.hypot(worldClickX - c.x, worldClickY - c.y) < 32
      );
      if (clickedChar && onSelectCharacter) {
        onSelectCharacter(clickedChar);
        return;
      }

      if (clickedBuilding) {
        onEnterBuilding(clickedBuilding);
      } else {
        targetPosRef.current = { x: worldClickX, y: worldClickY };
      }
      return;
    }

    if (clickedBuilding) {
      targetPosRef.current = {
        x: clickedBuilding.x + clickedBuilding.width / 2,
        y: clickedBuilding.y + clickedBuilding.height + 25
      };

      const dist = Math.hypot(
        player.x - (clickedBuilding.x + clickedBuilding.width / 2),
        player.y - (clickedBuilding.y + clickedBuilding.height / 2)
      );
      if (dist < 140) {
        onEnterBuilding(clickedBuilding);
      }
    } else {
      targetPosRef.current = {
        x: Math.max(30, Math.min(WORLD_WIDTH - 30, worldClickX)),
        y: Math.max(30, Math.min(WORLD_HEIGHT - 30, worldClickY))
      };
    }
  };

  // Find nearest building to player
  const checkNearbyBuilding = useCallback((px: number, py: number) => {
    let closest: BuildingZone | null = null;
    let minDistance = 100;

    for (const b of buildings) {
      const centerX = b.x + b.width / 2;
      const centerY = b.y + b.height / 2;
      const dist = Math.hypot(px - centerX, py - centerY);
      if (dist < minDistance + (b.width / 2)) {
        closest = b;
        break;
      }
    }
    setNearbyBuilding(closest);
  }, [buildings]);

  // Main Canvas render & animation loop with Camera Tracking
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let currentX = player?.x || WORLD_WIDTH / 2;
    let currentY = player?.y || 450;

    const render = () => {
      let isMoving = false;

      if (isSpectator || !player) {
        // Direct Spectator Camera Panning via WASD or Arrow Keys
        const panSpeed = 10;
        const keys = keysPressedRef.current;
        if (keys['w'] || keys['arrowup']) cameraRef.current.y -= panSpeed;
        if (keys['s'] || keys['arrowdown']) cameraRef.current.y += panSpeed;
        if (keys['a'] || keys['arrowleft']) cameraRef.current.x -= panSpeed;
        if (keys['d'] || keys['arrowright']) cameraRef.current.x += panSpeed;

        if (targetPosRef.current) {
          const targetCamX = targetPosRef.current.x - VIEW_WIDTH / 2;
          const targetCamY = targetPosRef.current.y - VIEW_HEIGHT / 2;
          cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.1;
          cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.1;
          if (Math.hypot(targetCamX - cameraRef.current.x, targetCamY - cameraRef.current.y) < 5) {
            targetPosRef.current = null;
          }
        }

        cameraRef.current.x = Math.max(0, Math.min(WORLD_WIDTH - VIEW_WIDTH, cameraRef.current.x));
        cameraRef.current.y = Math.max(0, Math.min(WORLD_HEIGHT - VIEW_HEIGHT, cameraRef.current.y));
      } else {
        // 1. Process Regular Player Movement
        let moveX = 0;
        let moveY = 0;
        const speed = player.stats.energy < 20 || player.stats.hunger < 20 ? 1.8 : 3.6;

        const keys = keysPressedRef.current;
        if (keys['w'] || keys['arrowup']) moveY -= 1;
        if (keys['s'] || keys['arrowdown']) moveY += 1;
        if (keys['a'] || keys['arrowleft']) moveX -= 1;
        if (keys['d'] || keys['arrowright']) moveX += 1;

        if (moveX !== 0 || moveY !== 0) {
          targetPosRef.current = null;
          const len = Math.hypot(moveX, moveY);
          currentX += (moveX / len) * speed;
          currentY += (moveY / len) * speed;
        } else if (targetPosRef.current) {
          const dx = targetPosRef.current.x - currentX;
          const dy = targetPosRef.current.y - currentY;
          const dist = Math.hypot(dx, dy);

          if (dist > 4) {
            currentX += (dx / dist) * speed;
            currentY += (dy / dist) * speed;
          } else {
            targetPosRef.current = null;
          }
        }

        // Constrain inside world boundaries
        currentX = Math.max(30, Math.min(WORLD_WIDTH - 30, currentX));
        currentY = Math.max(40, Math.min(WORLD_HEIGHT - 35, currentY));

        isMoving = (moveX !== 0 || moveY !== 0) || (targetPosRef.current !== null);

        if (isMoving && Date.now() - lastStepSoundRef.current > 380) {
          sounds.playStep();
          lastStepSoundRef.current = Date.now();
        }

        // Sync position back
        if (onPlayerPositionChange && (Math.abs(currentX - player.x) > 0.5 || Math.abs(currentY - player.y) > 0.5)) {
          onPlayerPositionChange(currentX, currentY, isMoving);
          checkNearbyBuilding(currentX, currentY);
        }

        // 2. Smooth Follow Camera tracking the player!
        const targetCamX = Math.max(0, Math.min(WORLD_WIDTH - VIEW_WIDTH, currentX - VIEW_WIDTH / 2));
        const targetCamY = Math.max(0, Math.min(WORLD_HEIGHT - VIEW_HEIGHT, currentY - VIEW_HEIGHT / 2));

        // Gentle interpolation for cinematic tracking
        cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.15;
        cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.15;
      }

      const camX = cameraRef.current.x;
      const camY = cameraRef.current.y;

      // Clear viewport
      ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

      // Save context and apply camera translation
      ctx.save();
      ctx.translate(-camX, -camY);

      // Base terrain (Grass & Parks)
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      // Grass texture specks
      ctx.fillStyle = '#047857';
      for (let i = 0; i < WORLD_WIDTH; i += 50) {
        for (let j = 0; j < WORLD_HEIGHT; j += 50) {
          ctx.fillRect(i + ((j % 100 === 0) ? 10 : 25), j + 15, 3, 3);
        }
      }

      // Central Food Plaza (Warm cobblestone terrace around Central Survival Food Stall)
      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.roundRect(720, 310, 360, 250, 18);
      ctx.fill();

      // Checkered plaza pavers
      ctx.fillStyle = 'rgba(254, 215, 170, 0.15)';
      for (let px = 725; px < 1070; px += 24) {
        for (let py = 315; py < 550; py += 24) {
          if ((Math.floor(px / 24) + Math.floor(py / 24)) % 2 === 0) {
            ctx.fillRect(px, py, 22, 22);
          }
        }
      }

      // Dynamic Streets & Boulevards across all rows (Accommodates 40+ players!)
      const numRows = Math.max(4, Math.ceil((buildings.length - 3) / 5) + 3);
      for (let r = 0; r < numRows; r++) {
        let bY = 265;
        if (r === 1) bY = 565;
        else if (r === 2) bY = 825;
        else if (r > 2) bY = 825 + (r - 2) * 270;

        if (bY + 55 <= WORLD_HEIGHT) {
          // Asphalt road
          ctx.fillStyle = '#334155';
          ctx.fillRect(0, bY, WORLD_WIDTH, 55);

          // Center dashed line
          ctx.strokeStyle = '#F8FAFC';
          ctx.lineWidth = 3;
          ctx.setLineDash([16, 16]);
          ctx.beginPath();
          ctx.moveTo(0, bY + 27);
          ctx.lineTo(WORLD_WIDTH, bY + 27);
          ctx.stroke();
          ctx.setLineDash([]);

          // Sidewalks
          ctx.fillStyle = '#64748B';
          ctx.fillRect(0, bY - 5, WORLD_WIDTH, 5);
          ctx.fillRect(0, bY + 55, WORLD_WIDTH, 5);
        }
      }

      // Main Vertical Avenues connecting all streets
      const avenues = [360, 700, 1070, 1400];
      avenues.forEach(vx => {
        ctx.fillStyle = '#334155';
        ctx.fillRect(vx, 0, 48, WORLD_HEIGHT);

        // Dashed lines
        ctx.strokeStyle = '#F8FAFC';
        ctx.lineWidth = 3;
        ctx.setLineDash([16, 16]);
        ctx.beginPath();
        ctx.moveTo(vx + 24, 0);
        ctx.lineTo(vx + 24, WORLD_HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Crosswalks at all intersections
      for (let r = 0; r < numRows; r++) {
        let bY = 265;
        if (r === 1) bY = 565;
        else if (r === 2) bY = 825;
        else if (r > 2) bY = 825 + (r - 2) * 270;

        if (bY + 55 <= WORLD_HEIGHT) {
          avenues.forEach(vx => {
            ctx.fillStyle = '#FFFFFF';
            for (let k = 0; k < 48; k += 11) {
              ctx.fillRect(vx + k, bY, 6, 55);
            }
          });
        }
      }

      // Decorative central plaza tables & umbrellas
      const drawPlazaTable = (tx: number, ty: number) => {
        ctx.fillStyle = '#92400E';
        ctx.beginPath();
        ctx.arc(tx, ty, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(tx, ty - 6, 16, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(tx, ty - 6, 8, Math.PI, 0);
        ctx.fill();
      };
      drawPlazaTable(740, 535);
      drawPlazaTable(1060, 535);

      // 3. Draw Buildings
      buildings.forEach((b) => {
        // Culling: Only render buildings that are visible in camera viewport (+ padding)
        if (
          b.x + b.width < camX - 100 ||
          b.x > camX + VIEW_WIDTH + 100 ||
          b.y + b.height < camY - 100 ||
          b.y > camY + VIEW_HEIGHT + 100
        ) {
          return;
        }

        const isHighlight = nearbyBuilding?.id === b.id;

        // Shadow under building
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(b.x + 8, b.y + 8, b.width, b.height);

        // Building Main Body
        ctx.fillStyle = b.isCentralFoodStall
          ? '#831843'
          : b.isCustomizable && !b.isOwned
          ? '#1E293B'
          : b.color;

        ctx.strokeStyle = isHighlight
          ? '#FACC15'
          : b.isCentralFoodStall
          ? '#EF4444'
          : b.isOwned
          ? '#38BDF8'
          : '#475569';
        ctx.lineWidth = isHighlight ? 4 : (b.isCentralFoodStall ? 3.5 : 2);

        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, 14);
        ctx.fill();
        ctx.stroke();

        // Building Roof / Canopy
        ctx.fillStyle = b.isCentralFoodStall
          ? '#DC2626'
          : b.isCustomizable && !b.isOwned
          ? '#334155'
          : b.roofColor;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, 38, [14, 14, 0, 0]);
        ctx.fill();

        // Roof awning stripes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        for (let s = 0; s < b.width; s += 24) {
          ctx.fillRect(b.x + s, b.y, 12, 38);
        }

        // Building Icon and Name
        ctx.font = 'bold 14px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.fillText(`${b.icon} ${b.name}`, b.x + 14, b.y + 25);

        // Subtitle / Owner label
        ctx.font = '11px Plus Jakarta Sans, sans-serif';
        if (b.isCentralFoodStall) {
          ctx.fillStyle = '#FEF08A';
          ctx.fillText('🍲 Cơm 25k (No+30, Lực+35) • Nước 10k • Thịt 30k', b.x + 14, b.y + 57);
          ctx.fillStyle = '#FCA5A5';
          ctx.fillText('⚠️ Nơi DUY NHẤT để nạp Độ No & Thể Lực sống còn', b.x + 14, b.y + 73);
        } else if (b.isCustomizable && !b.isOwned) {
          ctx.fillStyle = '#F59E0B';
          ctx.fillText(`🏗️ ${b.ownerName ? `Gian Hàng của ${b.ownerName}` : 'Chưa mở bán'} • Chạm để mở quán`, b.x + 14, b.y + 57);
        } else if (b.isOwned) {
          ctx.fillStyle = '#38BDF8';
          ctx.fillText(`👑 ${b.ownerName || 'Chủ quán'} • ${b.products?.length || 6} sản phẩm/dịch vụ`, b.x + 14, b.y + 57);
        } else {
          ctx.fillStyle = '#CBD5E1';
          ctx.fillText(b.subtitle, b.x + 14, b.y + 57);
        }

        // Building Windows (with warm light)
        const isNight = timeOfDayHours < 6 || timeOfDayHours > 18;
        ctx.fillStyle = isNight ? '#FEF08A' : '#94A3B8';

        const startWinY = b.isCentralFoodStall ? 86 : 74;
        for (let wx = b.x + 20; wx < b.x + b.width - 25; wx += 44) {
          ctx.fillRect(wx, b.y + startWinY, 26, 24);
          ctx.strokeStyle = '#1E293B';
          ctx.lineWidth = 1;
          ctx.strokeRect(wx, b.y + startWinY, 26, 24);
        }

        // Entrance Door
        const doorX = b.x + b.width / 2 - 20;
        const doorY = b.y + b.height - 40;
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(doorX, doorY, 40, 40);

        ctx.strokeStyle = b.isCentralFoodStall ? '#EF4444' : '#FACC15';
        ctx.lineWidth = 2;
        ctx.strokeRect(doorX, doorY, 40, 40);

        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.arc(doorX + 32, doorY + 20, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // If player is close, draw entrance helper balloon
        if (isHighlight) {
          const bounceOffset = Math.sin(Date.now() / 150) * 4;
          const tagX = b.x + b.width / 2;
          const tagY = b.y + b.height + 15 + bounceOffset;

          ctx.fillStyle = '#FACC15';
          ctx.strokeStyle = '#78350F';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(tagX - 75, tagY, 150, 26, 8);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
          ctx.fillStyle = '#78350F';
          ctx.textAlign = 'center';
          ctx.fillText(
            b.isCentralFoodStall
              ? '🍲 [E] Mua Cơm, Nước, Thịt'
              : 'Bấm [E] hoặc Chạm để vào',
            tagX,
            tagY + 17
          );
        }
      });

      // 4. Draw Street Lamps & Park Trees
      const drawTree = (tx: number, ty: number) => {
        if (tx < camX - 50 || tx > camX + VIEW_WIDTH + 50 || ty < camY - 50 || ty > camY + VIEW_HEIGHT + 50) return;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(tx, ty + 15, 20, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#78350F';
        ctx.fillRect(tx - 4, ty - 6, 8, 22);
        ctx.fillStyle = '#15803D';
        ctx.beginPath();
        ctx.arc(tx, ty - 20, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22C55E';
        ctx.beginPath();
        ctx.arc(tx - 5, ty - 24, 16, 0, Math.PI * 2);
        ctx.fill();
      };

      // Trees along streets and avenues
      for (let ty = 190; ty < WORLD_HEIGHT; ty += 270) {
        drawTree(390, ty);
        drawTree(685, ty);
        drawTree(1060, ty);
        drawTree(1410, ty);
        drawTree(50, ty);
        drawTree(1750, ty);
      }

      // 5. Draw All Characters (Player + Others)
      const sortedCharacters = [...allCharacters].sort((a, b) => a.y - b.y);

      sortedCharacters.forEach((char) => {
        const isSelf = Boolean(player && char.id === player.id);
        const cx = isSelf ? currentX : char.x;
        const cy = isSelf ? currentY : char.y;

        if (cx < camX - 50 || cx > camX + VIEW_WIDTH + 50 || cy < camY - 50 || cy > camY + VIEW_HEIGHT + 50) {
          return;
        }

        const isCharMoving = isSelf ? isMoving : char.isMoving;

        // Shadow under character
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 18, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        const bob = isCharMoving ? Math.sin(Date.now() / 90) * 3 : 0;

        // Legs / Pants
        ctx.fillStyle = char.appearance.pantsColor || '#334155';
        ctx.fillRect(cx - 6, cy + 8 + bob, 5, 10);
        ctx.fillRect(cx + 1, cy + 8 - bob, 5, 10);

        // Shoes
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(cx - 7, cy + 16 + bob, 6, 4);
        ctx.fillRect(cx + 1, cy + 16 - bob, 6, 4);

        // Body / Shirt
        ctx.fillStyle = char.appearance.shirtColor || '#2563EB';
        ctx.beginPath();
        ctx.roundRect(cx - 9, cy - 6 + bob, 18, 16, 4);
        ctx.fill();

        // Head
        ctx.fillStyle = char.appearance.skinColor || '#FCD34D';
        ctx.beginPath();
        ctx.arc(cx, cy - 12 + bob, 9, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = char.appearance.hairColor || '#1E293B';
        ctx.beginPath();
        ctx.arc(cx, cy - 15 + bob, 9, Math.PI, 0, false);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(cx - 4, cy - 13 + bob, 2.5, 3);
        ctx.fillRect(cx + 2, cy - 13 + bob, 2.5, 3);

        // Accessory: Glasses or Hat
        if (char.appearance.accessory === 'glasses') {
          ctx.strokeStyle = '#0284C7';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(cx - 5, cy - 14 + bob, 4, 3);
          ctx.strokeRect(cx + 1, cy - 14 + bob, 4, 3);
        } else if (char.appearance.accessory === 'hat') {
          ctx.fillStyle = '#EF4444';
          ctx.fillRect(cx - 10, cy - 22 + bob, 20, 5);
          ctx.fillRect(cx - 6, cy - 27 + bob, 12, 6);
        }

        // Name tag & Skill badge above character
        ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
        const nameText = `${char.name} ${isSelf ? '(Bạn)' : ''}`;
        const textWidth = ctx.measureText(nameText).width;

        ctx.fillStyle = isSelf ? 'rgba(37, 99, 235, 0.95)' : 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(cx - (textWidth / 2) - 8, cy - 42 + bob, textWidth + 16, 17, 6);
        ctx.fill();

        if (isSelf) {
          ctx.strokeStyle = '#FACC15';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(nameText, cx, cy - 30 + bob);

        // Skill icon floating
        const charSkill = ONE_HUNDRED_SKILLS.find(s => s.id === char.bestSkillId);
        const iconToShow = char.bestSkillId === 'custom' ? '✨' : (charSkill?.icon || '✨');
        ctx.font = '10px serif';
        ctx.fillText(iconToShow, cx + (textWidth / 2) + 12, cy - 30 + bob);

        // Speech Bubble
        if (char.speechBubble && char.speechBubble.expiresAt > Date.now()) {
          const bubbleText = char.speechBubble.text;
          ctx.font = '11px Plus Jakarta Sans, sans-serif';
          const bubbleWidth = Math.min(220, ctx.measureText(bubbleText).width + 16);

          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#0F172A';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(cx - (bubbleWidth / 2), cy - 72 + bob, bubbleWidth, 24, 8);
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(cx - 4, cy - 48 + bob);
          ctx.lineTo(cx, cy - 42 + bob);
          ctx.lineTo(cx + 4, cy - 48 + bob);
          ctx.fill();

          ctx.fillStyle = '#0F172A';
          ctx.textAlign = 'center';
          ctx.fillText(bubbleText, cx, cy - 56 + bob);
        }
      });

      // 6. Floating Gain/Loss Numbers
      floatingTexts.forEach((ft) => {
        const age = Date.now() - ft.createdAt;
        const alpha = Math.max(0, 1 - (age / 1800));
        ctx.font = 'bold 15px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = alpha;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y - (age * 0.04));
        ctx.globalAlpha = 1.0;
      });

      // 7. Day / Night ambient lighting layer
      let ambientAlpha = 0;
      if (timeOfDayHours >= 19 || timeOfDayHours < 5) {
        ambientAlpha = 0.52;
      } else if (timeOfDayHours >= 17 && timeOfDayHours < 19) {
        ambientAlpha = 0.28;
      } else if (timeOfDayHours >= 5 && timeOfDayHours < 7) {
        ambientAlpha = 0.22;
      }

      if (ambientAlpha > 0) {
        ctx.fillStyle = timeOfDayHours >= 17 && timeOfDayHours < 19
          ? `rgba(249, 115, 22, ${ambientAlpha})`
          : `rgba(15, 23, 42, ${ambientAlpha})`;
        ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      }

      // Restore camera translation
      ctx.restore();

      // 8. RENDER SCREEN-SPACE HUD OVERLAYS (Mini-Map Radar)
      // Mini-Map Radar in top-right of canvas
      const miniW = 150;
      const miniH = 95;
      const miniX = VIEW_WIDTH - miniW - 16;
      const miniY = 16;

      // Radar background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(miniX, miniY, miniW, miniH, 10);
      ctx.fill();
      ctx.stroke();

      // Mini-Map Title
      ctx.font = 'bold 9px Plus Jakarta Sans, sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.textAlign = 'left';
      ctx.fillText('BẢN ĐỒ RADAR (40+ GIAN HÀNG)', miniX + 8, miniY + 12);

      // Mini-map scaling
      const mapScaleX = (miniW - 16) / WORLD_WIDTH;
      const mapScaleY = (miniH - 22) / WORLD_HEIGHT;

      // Draw stalls as small dots
      buildings.forEach(b => {
        const mx = miniX + 8 + b.x * mapScaleX;
        const my = miniY + 18 + b.y * mapScaleY;
        const mw = Math.max(3, b.width * mapScaleX);
        const mh = Math.max(2, b.height * mapScaleY);

        if (b.isCentralFoodStall) {
          ctx.fillStyle = '#EF4444';
          ctx.fillRect(mx - 1, my - 1, mw + 2, mh + 2);
        } else if (b.isOwned) {
          ctx.fillStyle = '#38BDF8';
          ctx.fillRect(mx, my, mw, mh);
        } else {
          ctx.fillStyle = '#64748B';
          ctx.fillRect(mx, my, mw, mh);
        }
      });

      // Viewport Camera Rectangle on mini-map
      const viewRectX = miniX + 8 + camX * mapScaleX;
      const viewRectY = miniY + 18 + camY * mapScaleY;
      const viewRectW = VIEW_WIDTH * mapScaleX;
      const viewRectH = VIEW_HEIGHT * mapScaleY;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1;
      ctx.strokeRect(viewRectX, viewRectY, viewRectW, viewRectH);

      // Player Blip on mini-map (pulsing yellow dot)
      const pMx = miniX + 8 + currentX * mapScaleX;
      const pMy = miniY + 18 + currentY * mapScaleY;
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(pMx, pMy, 3, 0, Math.PI * 2);
      ctx.fill();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [player, allCharacters, onPlayerPositionChange, checkNearbyBuilding, nearbyBuilding, timeOfDayHours, floatingTexts, buildings, WORLD_WIDTH, WORLD_HEIGHT]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-slate-950">
      {/* Interactive Camera Canvas */}
      <canvas
        ref={canvasRef}
        width={VIEW_WIDTH}
        height={VIEW_HEIGHT}
        onClick={handleCanvasClick}
        className="w-full h-full max-w-full max-h-[85vh] object-contain cursor-crosshair rounded-2xl shadow-2xl border-2 border-slate-800"
      />

      {/* Floating Action Buttons */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        {onOpenDirectory && (
          <button
            onClick={onOpenDirectory}
            className="bg-slate-900/90 hover:bg-indigo-600 text-white font-bold py-2 px-3.5 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-2 text-xs transition-all cursor-pointer backdrop-blur-md active:scale-95"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Danh Bạ 40 Gian Hàng</span>
          </button>
        )}

        <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
          {isSpectator ? (
            <span>🎥 Chế độ quan sát Host: Dùng <strong>WASD / Mũi tên</strong> hoặc <strong>Nhấp chuột</strong> để lia góc nhìn</span>
          ) : (
            <span>🎮 Di chuyển: <strong>WASD / Mũi tên</strong> hoặc <strong>Nhấp chuột</strong></span>
          )}
        </div>
      </div>

      {/* Touch / Virtual On-Screen Joystick for mobile/tablet */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col items-center bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-xl">
        <button
          onClick={() => {
            if (player) targetPosRef.current = { x: player.x, y: player.y - 75 };
            else cameraRef.current.y -= 120;
          }}
          className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow cursor-pointer active:scale-95 mb-1"
        >
          ▲
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => {
              if (player) targetPosRef.current = { x: player.x - 75, y: player.y };
              else cameraRef.current.x -= 120;
            }}
            className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow cursor-pointer active:scale-95"
          >
            ◀
          </button>
          <button
            onClick={() => {
              if (player) targetPosRef.current = { x: player.x, y: player.y + 75 };
              else cameraRef.current.y += 120;
            }}
            className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow cursor-pointer active:scale-95"
          >
            ▼
          </button>
          <button
            onClick={() => {
              if (player) targetPosRef.current = { x: player.x + 75, y: player.y };
              else cameraRef.current.x += 120;
            }}
            className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow cursor-pointer active:scale-95"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Nearby Building Interaction Button Prompt */}
      {nearbyBuilding && (
        <div className="absolute bottom-6 right-4 sm:right-6 z-20 animate-bounce">
          <button
            onClick={() => onEnterBuilding(nearbyBuilding)}
            className={`text-white font-bold py-3 px-5 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm border cursor-pointer active:scale-95 ${
              nearbyBuilding.isCentralFoodStall
                ? 'bg-gradient-to-r from-red-600 to-amber-600 border-amber-300 shadow-red-600/30'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 border-amber-300 shadow-orange-500/30'
            }`}
          >
            <span className="text-xl">{nearbyBuilding.icon}</span>
            <span>
              {nearbyBuilding.isCentralFoodStall
                ? 'Vào Quán Ăn Sinh Tồn (Cơm, Nước, Thịt)'
                : `Vào ${nearbyBuilding.name}`}
            </span>
            <span className="text-[11px] bg-black/30 px-2 py-0.5 rounded-lg border border-white/20">
              Phím [E]
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
