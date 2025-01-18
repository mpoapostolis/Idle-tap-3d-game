import { create } from "zustand";

interface Helper {
  id: number;
  name: string;
  damage: number;
  cost: number;
  count: number;
  color: string;
}

interface GameState {
  level: number;
  gold: number;
  clickDamage: number;
  monstersDefeated: number;
  currentMonsterHp: number;
  maxMonsterHp: number;
  monsterTimer: number;
  maxMonsterTimer: number;
  isBoss: boolean;
  comboCount: number;
  comboMultiplier: number;
  helpers: Helper[];
  addGold: (amount: number) => void;
  upgradeClickDamage: () => void;
  buyHelper: (helperId: number) => void;
  damageMonster: (damage: number) => void;
  nextLevel: () => void;
  tickTimer: () => void;
  increaseCombo: () => void;
  resetCombo: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  level: 1,
  gold: 0,
  clickDamage: 10,
  monstersDefeated: 0,
  currentMonsterHp: 100,
  maxMonsterHp: 100,
  monsterTimer: 30,
  maxMonsterTimer: 30,
  isBoss: false,
  comboCount: 0,
  comboMultiplier: 1,
  helpers: [
    {
      id: 1,
      name: "Apprentice",
      damage: 1,
      cost: 10,
      count: 0,
      color: "#4ade80",
    },
    { id: 2, name: "Warrior", damage: 5, cost: 50, count: 0, color: "#f87171" },
    { id: 3, name: "Mage", damage: 20, cost: 200, count: 0, color: "#818cf8" },
    {
      id: 4,
      name: "Assassin",
      damage: 50,
      cost: 1000,
      count: 0,
      color: "#fb923c",
    },
    {
      id: 5,
      name: "Dragon Knight",
      damage: 200,
      cost: 5000,
      count: 0,
      color: "#f472b6",
    },
    {
      id: 6,
      name: "Arch Mage",
      damage: 1000,
      cost: 25000,
      count: 0,
      color: "#c084fc",
    },
    {
      id: 7,
      name: "Titan Slayer",
      damage: 5000,
      cost: 100000,
      count: 0,
      color: "#fbbf24",
    },
  ],

  addGold: (amount) => set((state) => ({ gold: state.gold + amount })),

  upgradeClickDamage: () =>
    set((state) => {
      const cost = Math.floor(state.clickDamage * 0.5);
      if (state.gold >= cost) {
        return {
          gold: state.gold - cost,
          clickDamage: Math.floor(state.clickDamage * 1.2),
        };
      }
      return state;
    }),

  buyHelper: (helperId) =>
    set((state) => {
      const helper = state.helpers.find((h) => h.id === helperId);
      if (!helper || state.gold < helper.cost) return state;

      const updatedHelpers = state.helpers.map((h) =>
        h.id === helperId
          ? { ...h, count: h.count + 1, cost: Math.floor(h.cost * 1.5) }
          : h
      );

      return {
        gold: state.gold - helper.cost,
        helpers: updatedHelpers,
      };
    }),

  damageMonster: (damage) =>
    set((state) => {
      const totalDamage = damage * state.comboMultiplier;
      const newHp = state.currentMonsterHp - totalDamage;

      if (newHp <= 0) {
        const baseGold = Math.floor(state.maxMonsterHp * 0.1);
        const goldMultiplier = state.isBoss ? 5 : 1;
        const comboBonus = state.comboCount > 0 ? state.comboCount * 0.1 : 0;
        const goldEarned = Math.floor(
          baseGold * goldMultiplier * (1 + comboBonus)
        );

        const nextLevel = state.level + 1;
        const willBeBoss = nextLevel % 10 === 0;
        const baseHpMultiplier = willBeBoss ? 5 : 1.2;
        const newMaxHp = Math.floor(state.maxMonsterHp * baseHpMultiplier);

        // First update to show 0 HP
        setTimeout(() => {
          set({
            currentMonsterHp: newMaxHp,
            monstersDefeated: state.monstersDefeated + 1,
            gold: state.gold + goldEarned,
            level: nextLevel,
            maxMonsterHp: newMaxHp,
            monsterTimer: state.maxMonsterTimer,
            isBoss: willBeBoss,
            comboCount: 0,
            comboMultiplier: 1,
          });
        }, 500);

        return { currentMonsterHp: 0 };
      }
      return { currentMonsterHp: newHp };
    }),

  nextLevel: () =>
    set((state) => {
      const nextLevel = state.level + 1;
      const willBeBoss = nextLevel % 10 === 0;
      const baseHpMultiplier = willBeBoss ? 5 : 1.2;
      const newMaxHp = Math.floor(state.maxMonsterHp * baseHpMultiplier);

      return {
        level: nextLevel,
        maxMonsterHp: newMaxHp,
        currentMonsterHp: newMaxHp,
        monsterTimer: state.maxMonsterTimer,
        isBoss: willBeBoss,
        comboCount: 0,
        comboMultiplier: 1,
      };
    }),

  tickTimer: () =>
    set((state) => {
      if (state.monsterTimer <= 0) {
        const prevLevel = Math.max(1, state.level - 1);
        const isBoss = prevLevel % 10 === 0;
        const baseHp = Math.floor(state.maxMonsterHp / (isBoss ? 5 : 1.2));

        return {
          level: prevLevel,
          currentMonsterHp: baseHp,
          maxMonsterHp: baseHp,
          monsterTimer: state.maxMonsterTimer,
          gold: Math.floor(state.gold * 0.9),
          isBoss: isBoss,
          comboCount: 0,
          comboMultiplier: 1,
        };
      }
      return { monsterTimer: state.monsterTimer - 1 };
    }),

  increaseCombo: () =>
    set((state) => ({
      comboCount: state.comboCount + 1,
      comboMultiplier: 1 + state.comboCount * 0.1,
    })),

  resetCombo: () => set({ comboCount: 0, comboMultiplier: 1 }),
}));
