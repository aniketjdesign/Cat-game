import { EconomyState } from '../state/GameState';

export interface DecorItem {
  id: string;
  label: string;
  cost: number;
  themeColor: string;
  kind: 'theme' | 'furniture';
  description: string;
}

export const DECOR_ITEMS: DecorItem[] = [
  {
    id: 'default',
    label: 'Default Cozy',
    cost: 0,
    themeColor: '#2F5DAA',
    kind: 'theme',
    description: 'Classic house palette',
  },
  {
    id: 'sunset',
    label: 'Sunset Warm',
    cost: 25,
    themeColor: '#D06F3B',
    kind: 'theme',
    description: 'Warm evening tones',
  },
  {
    id: 'mint',
    label: 'Mint Fresh',
    cost: 25,
    themeColor: '#5F9D76',
    kind: 'theme',
    description: 'Fresh green palette',
  },
  {
    id: 'retro',
    label: 'Retro Toybox',
    cost: 40,
    themeColor: '#A85A7C',
    kind: 'theme',
    description: 'Playful vintage palette',
  },
  {
    id: 'cat_tree',
    label: 'Window Cat Tree',
    cost: 60,
    themeColor: '#9B6E43',
    kind: 'furniture',
    description: 'Sleep perch near window',
  },
  {
    id: 'cat_bed',
    label: 'Cloud Cat Bed',
    cost: 45,
    themeColor: '#8A7EC7',
    kind: 'furniture',
    description: 'Soft floor sleeping bed',
  },
];

export class EconomySystem {
  private state: EconomyState;

  constructor(initial: EconomyState) {
    this.state = {
      coins: initial.coins,
      purchasedDecorIds: [...initial.purchasedDecorIds],
    };
  }

  getState(): EconomyState {
    return {
      coins: this.state.coins,
      purchasedDecorIds: [...this.state.purchasedDecorIds],
    };
  }

  awardCoins(amount: number): EconomyState {
    this.state.coins = Math.max(0, this.state.coins + amount);
    return this.getState();
  }

  purchaseDecor(id: string): { success: boolean; state: EconomyState } {
    if (this.state.purchasedDecorIds.includes(id)) {
      return { success: true, state: this.getState() };
    }

    const item = DECOR_ITEMS.find((entry) => entry.id === id);
    if (!item) {
      return { success: false, state: this.getState() };
    }

    if (this.state.coins < item.cost) {
      return { success: false, state: this.getState() };
    }

    this.state.coins -= item.cost;
    this.state.purchasedDecorIds.push(id);

    return { success: true, state: this.getState() };
  }
}
