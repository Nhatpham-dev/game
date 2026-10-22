import { UserAccount, Character, InventoryItem, LogMessage, BuildingZone, GameSessionState } from '../types/game';
import { INITIAL_NPCS, WORLD_BUILDINGS } from '../data/worldData';

const ACCOUNTS_KEY = 'survival_game_accounts';
const CHARACTERS_KEY = 'survival_game_characters';
const ACTIVE_ACCOUNT_KEY = 'survival_game_active_account_id';
const INVENTORY_KEY = 'survival_game_inventory_';
const LOGS_KEY = 'survival_game_logs';
const BUILDINGS_KEY = 'survival_game_buildings';
const GAME_SESSION_KEY = 'survival_game_session';

export const HOST_ACCOUNT: UserAccount = {
  id: 'acc_host_admin',
  username: 'host',
  pin: 'host123',
  createdAt: 1700000000000,
  isHost: true
};

export function getLocalGameSession(): GameSessionState {
  try {
    const raw = localStorage.getItem(GAME_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {
    id: 'global_session',
    hostId: null,
    hostName: null,
    isHostPresent: false,
    status: 'waiting_for_host',
    roundDurationSeconds: 420,
    startedAt: null,
    endsAt: null,
    roundNumber: 1,
    updatedAt: Date.now()
  };
}

export function saveLocalGameSession(session: GameSessionState) {
  localStorage.setItem(GAME_SESSION_KEY, JSON.stringify(session));
}

export function getBuildings(): BuildingZone[] {
  try {
    const raw = localStorage.getItem(BUILDINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return WORLD_BUILDINGS;
  } catch {
    return WORLD_BUILDINGS;
  }
}

export function saveBuildings(buildings: BuildingZone[]) {
  localStorage.setItem(BUILDINGS_KEY, JSON.stringify(buildings));
}

export function getAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    let list: UserAccount[] = raw ? JSON.parse(raw) : [];
    // Filter out any legacy pre-seeded accounts so login screen starts clean
    list = list.filter(a => a && a.id && !a.id.startsWith('npc_acc_'));
    // Ensure Host Account is always available
    if (!list.some(a => a.username.toLowerCase() === 'host')) {
      list = [HOST_ACCOUNT, ...list];
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
    }
    return list;
  } catch {
    return [HOST_ACCOUNT];
  }
}

export function saveAccounts(accounts: UserAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function deleteAccount(accountId: string): { remainingAccounts: UserAccount[]; remainingCharacters: Character[] } {
  const accountToDelete = getAccounts().find(a => a.id === accountId);
  
  // 1. Remove from accounts
  const accounts = getAccounts().filter(a => a.id !== accountId);
  saveAccounts(accounts);

  // 2. Remove associated character
  const characters = getCharacters().filter(c => c.accountId !== accountId);
  saveCharacters(characters);

  // 3. Remove inventory
  localStorage.removeItem(INVENTORY_KEY + `char_${accountId}`);

  // 4. Remove active account id if it was this account
  if (getActiveAccountId() === accountId) {
    setActiveAccountId(null);
  }

  // 5. Clean session hiring records
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.includes(accountId)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => sessionStorage.removeItem(k));
  } catch {
    // SessionStorage fallback
  }

  if (accountToDelete) {
    addLog(`Tài khoản "${accountToDelete.username}" đã được xóa vĩnh viễn khỏi thế giới sinh tồn.`, 'warning');
  }

  return { remainingAccounts: accounts, remainingCharacters: characters };
}

export function getActiveAccountId(): string | null {
  return localStorage.getItem(ACTIVE_ACCOUNT_KEY);
}

export function setActiveAccountId(id: string | null) {
  if (id) {
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
  }
}

export function getCharacters(): Character[] {
  try {
    const raw = localStorage.getItem(CHARACTERS_KEY);
    let list: Character[] = raw ? JSON.parse(raw) : [];
    // Filter out legacy pre-seeded npc characters and host character (Host is pure spectator)
    list = list.filter(c => c && c.id && !c.id.startsWith('npc_') && c.accountId !== HOST_ACCOUNT.id && c.name.toLowerCase() !== 'host');
    return list;
  } catch {
    return [];
  }
}

export function saveCharacters(characters: Character[]) {
  localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
}

export function getCharacterByAccountId(accountId: string): Character | undefined {
  const characters = getCharacters();
  return characters.find(c => c.accountId === accountId);
}

export function saveCharacter(character: Character) {
  const characters = getCharacters();
  const index = characters.findIndex(c => c.id === character.id);
  if (index >= 0) {
    characters[index] = character;
  } else {
    characters.push(character);
  }
  saveCharacters(characters);
}

export function getInventory(characterId: string): InventoryItem[] {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY + characterId);
    return raw ? JSON.parse(raw) : [
      {
        id: 'starter_bread',
        itemId: 'bread',
        name: 'Bánh Mì Khởi Đầu',
        icon: '🥖',
        count: 2,
        energyRestore: 15,
        hungerRestore: 35,
        healthRestore: 5
      },
      {
        id: 'starter_water',
        itemId: 'energy_drink',
        name: 'Nước Tăng Lực',
        icon: '⚡',
        count: 1,
        energyRestore: 45,
        hungerRestore: 5,
        healthRestore: 0
      }
    ];
  } catch {
    return [];
  }
}

export function saveInventory(characterId: string, items: InventoryItem[]) {
  localStorage.setItem(INVENTORY_KEY + characterId, JSON.stringify(items));
}

export function getLogs(): LogMessage[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    return raw ? JSON.parse(raw) : [
      {
        id: 'init_log_1',
        text: 'Chào mừng tất cả mọi người đến với Thành Phố Sinh Tồn!',
        type: 'info',
        timestamp: Date.now() - 60000
      },
      {
        id: 'init_log_2',
        text: 'Bác Sáu Nông Dân vừa thu hoạch khoai tây tại Nông Trại Xanh.',
        type: 'success',
        timestamp: Date.now() - 30000
      }
    ];
  } catch {
    return [];
  }
}

export function addLog(text: string, type: 'money' | 'warning' | 'info' | 'success' = 'info') {
  const logs = getLogs();
  const newLog: LogMessage = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    text,
    type,
    timestamp: Date.now()
  };
  const updated = [newLog, ...logs].slice(0, 30);
  localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  return updated;
}

// ---------------------------------------------------------------------------
// STALL PURCHASE TRACKING (MAX 2 PURCHASES PER STALL FOR EACH PLAYER)
// ---------------------------------------------------------------------------
const STALL_PURCHASE_PREFIX = 'survival_stall_purchases_';

export function getStallPurchaseCount(accountId: string, storeId: string): number {
  if (!accountId || !storeId) return 0;
  try {
    const raw = localStorage.getItem(`${STALL_PURCHASE_PREFIX}${accountId}_${storeId}`);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function recordStallPurchase(accountId: string, storeId: string): number {
  if (!accountId || !storeId) return 0;
  try {
    const current = getStallPurchaseCount(accountId, storeId);
    const updated = current + 1;
    localStorage.setItem(`${STALL_PURCHASE_PREFIX}${accountId}_${storeId}`, updated.toString());
    return updated;
  } catch {
    return 1;
  }
}

