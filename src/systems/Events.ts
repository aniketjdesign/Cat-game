export const Events = {
  NeedsUpdated: 'needs.updated',
  TaskUpdated: 'tasks.updated',
  TimeUpdated: 'time.updated',
  PathBlocked: 'path.blocked',
  Toast: 'ui.toast',
  InteractionEnter: 'interaction.enter',
  InteractionExit: 'interaction.exit',
  InteractionHighlight: 'interaction.highlight',
  CoinsUpdated: 'coins.updated',
  BondUpdated: 'bond.updated',
  AchievementUnlocked: 'achievement.unlocked',
  DecorUpdated: 'decor.updated',
  GameplayAction: 'gameplay.action',
} as const;

export type EventKey = (typeof Events)[keyof typeof Events];

export interface ToastPayload {
  message: string;
  durationMs?: number;
}

export interface GameplayActionPayload {
  action: 'feed' | 'water' | 'play' | 'cleanLitter' | 'pet';
}
