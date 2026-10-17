import { FRICTION_TOKENS, GAME_BADGES } from '../../../data/missionData.ts';

const STORAGE_KEY = 'friction_arcade_reward_ledger_v1';

export interface RewardLedgerState {
  tokenBalance: number;
  collectedTokenIds: string[];
  unlockedBadgeIds: string[];
  visitedZones: string[];
  completedSideQuestIds: string[];
  lastEarnedNotice: { title: string; amount?: number; time: number } | null;
}

const DEFAULT_STATE: RewardLedgerState = {
  tokenBalance: 0,
  collectedTokenIds: [],
  unlockedBadgeIds: [],
  visitedZones: ['city'],
  completedSideQuestIds: [],
  lastEarnedNotice: null,
};

function loadRewardLedger(): RewardLedgerState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return {
      tokenBalance: typeof parsed.tokenBalance === 'number' ? parsed.tokenBalance : 0,
      collectedTokenIds: Array.isArray(parsed.collectedTokenIds) ? parsed.collectedTokenIds : [],
      unlockedBadgeIds: Array.isArray(parsed.unlockedBadgeIds) ? parsed.unlockedBadgeIds : [],
      visitedZones: Array.isArray(parsed.visitedZones) ? parsed.visitedZones : ['city'],
      completedSideQuestIds: Array.isArray(parsed.completedSideQuestIds) ? parsed.completedSideQuestIds : [],
      lastEarnedNotice: null,
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveRewardLedger(state: RewardLedgerState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        tokenBalance: state.tokenBalance,
        collectedTokenIds: state.collectedTokenIds,
        unlockedBadgeIds: state.unlockedBadgeIds,
        visitedZones: state.visitedZones,
        completedSideQuestIds: state.completedSideQuestIds,
      })
    );
  } catch {
    // quota or privacy mode fallback
  }
}

let activeLedger: RewardLedgerState = loadRewardLedger();
type Listener = (state: RewardLedgerState) => void;
const listeners = new Set<Listener>();

function notify() {
  saveRewardLedger(activeLedger);
  listeners.forEach((fn) => fn({ ...activeLedger }));
}

export const RewardLedger = {
  getState(): RewardLedgerState {
    return { ...activeLedger };
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener({ ...activeLedger });
    return () => listeners.delete(listener);
  },

  collectToken(tokenId: string): { success: boolean; amount: number; name: string } {
    if (activeLedger.collectedTokenIds.includes(tokenId)) {
      return { success: false, amount: 0, name: '' };
    }

    const tokenDef = FRICTION_TOKENS.find((t) => t.id === tokenId);
    const value = tokenDef ? tokenDef.value : 10;
    const name = tokenDef ? tokenDef.name : 'Friction Token';

    activeLedger = {
      ...activeLedger,
      tokenBalance: activeLedger.tokenBalance + value,
      collectedTokenIds: [...activeLedger.collectedTokenIds, tokenId],
      lastEarnedNotice: {
        title: `+${value} TOKENS · ${name}`,
        amount: value,
        time: Date.now(),
      },
    };

    notify();
    return { success: true, amount: value, name };
  },

  isTokenCollected(tokenId: string): boolean {
    return activeLedger.collectedTokenIds.includes(tokenId);
  },

  recordZoneVisit(zone: string) {
    if (!activeLedger.visitedZones.includes(zone)) {
      const updatedZones = [...activeLedger.visitedZones, zone];
      activeLedger = {
        ...activeLedger,
        visitedZones: updatedZones,
      };

      // Check if Station Explorer badge conditions are met (city + 5 interior areas + platform)
      const required = ['city', 'atrium', 'concourse', 'board', 'desk', 'lounge', 'lab', 'platform'];
      const hasAll = required.every((r) => updatedZones.includes(r));
      if (hasAll) {
        RewardLedger.unlockBadge('badge-explorer');
      } else {
        notify();
      }
    }
  },

  unlockBadge(badgeId: string): boolean {
    if (activeLedger.unlockedBadgeIds.includes(badgeId)) {
      return false;
    }

    const badgeDef = GAME_BADGES.find((b) => b.id === badgeId);
    activeLedger = {
      ...activeLedger,
      unlockedBadgeIds: [...activeLedger.unlockedBadgeIds, badgeId],
      lastEarnedNotice: {
        title: `★ BADGE UNLOCKED: ${badgeDef ? badgeDef.title : badgeId}`,
        time: Date.now(),
      },
    };

    notify();
    return true;
  },

  completeSideQuest(questId: string, rewardTokens: number = 10) {
    if (activeLedger.completedSideQuestIds.includes(questId)) return;

    activeLedger = {
      ...activeLedger,
      tokenBalance: activeLedger.tokenBalance + rewardTokens,
      completedSideQuestIds: [...activeLedger.completedSideQuestIds, questId],
      lastEarnedNotice: {
        title: `+${rewardTokens} TOKENS · Side Quest Resolved`,
        amount: rewardTokens,
        time: Date.now(),
      },
    };
    notify();
  },

  resetLifetimeRewards() {
    activeLedger = { ...DEFAULT_STATE };
    notify();
  },
};
