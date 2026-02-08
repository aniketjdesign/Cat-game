export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;
export const TILE_SIZE = 32;
export const SAVE_KEY = 'cat-game-save-v1';

export const PLAYER_SPEED = 150;
export const PATH_ARRIVAL_THRESHOLD = 6;

export const NEED_KEYS = ['hunger', 'thirst', 'fun', 'hygiene'] as const;
export type NeedKey = (typeof NEED_KEYS)[number];

export const TASK_KEYS = ['feed', 'water', 'play', 'cleanLitter'] as const;
export type TaskKey = (typeof TASK_KEYS)[number];

export type CatBreedId =
  | 'orange_tabby'
  | 'grey_tabby'
  | 'tuxedo'
  | 'calico'
  | 'siamese'
  | 'persian'
  | 'bengal'
  | 'black'
  | 'russian_blue'
  | 'ginger_white';

export interface CatBreedDef {
  id: CatBreedId;
  name: string;
  blurb: string;
  primary: string;
  secondary: string;
  eye: string;
  decayMultiplier: Partial<Record<NeedKey, number>>;
}

export const CAT_BREEDS: CatBreedDef[] = [
  {
    id: 'orange_tabby',
    name: 'Orange Tabby',
    blurb: 'A warm ball of chaos and cuddles',
    primary: '#E8822A',
    secondary: '#C46A1F',
    eye: '#4CAF50',
    decayMultiplier: { hunger: 1.2 },
  },
  {
    id: 'grey_tabby',
    name: 'Grey Tabby',
    blurb: 'Mysterious yet surprisingly needy',
    primary: '#7A7A7A',
    secondary: '#4A4A4A',
    eye: '#4CAF50',
    decayMultiplier: {},
  },
  {
    id: 'tuxedo',
    name: 'Tuxedo',
    blurb: 'Born fancy, acts feral',
    primary: '#1F1F1F',
    secondary: '#F1F1F1',
    eye: '#EBCB63',
    decayMultiplier: { hunger: 0.85 },
  },
  {
    id: 'calico',
    name: 'Calico',
    blurb: 'Three cats in one chaotic package',
    primary: '#F4E9D8',
    secondary: '#D96E2F',
    eye: '#6AA84F',
    decayMultiplier: { fun: 1.25 },
  },
  {
    id: 'siamese',
    name: 'Siamese',
    blurb: 'Judges you, but lovingly',
    primary: '#E8D8B6',
    secondary: '#5C4332',
    eye: '#6EC6FF',
    decayMultiplier: {},
  },
  {
    id: 'persian',
    name: 'Persian',
    blurb: 'Maximum floof, minimum effort',
    primary: '#F1EFE6',
    secondary: '#CFC9BC',
    eye: '#78A7E0',
    decayMultiplier: { hunger: 0.75, thirst: 0.75, hygiene: 0.75 },
  },
  {
    id: 'bengal',
    name: 'Bengal',
    blurb: 'A tiny leopard in your house',
    primary: '#C68F3D',
    secondary: '#6A4422',
    eye: '#89C75F',
    decayMultiplier: { fun: 1.4 },
  },
  {
    id: 'black',
    name: 'Black Cat',
    blurb: 'Spooky? Just misunderstood',
    primary: '#111111',
    secondary: '#2C2C2C',
    eye: '#B7E25C',
    decayMultiplier: {},
  },
  {
    id: 'russian_blue',
    name: 'Russian Blue',
    blurb: 'Elegant and emotionally complex',
    primary: '#708090',
    secondary: '#4B5A68',
    eye: '#57B65A',
    decayMultiplier: { fun: 0.9 },
  },
  {
    id: 'ginger_white',
    name: 'Ginger & White',
    blurb: 'The neighborhood sweetheart',
    primary: '#F6F2EA',
    secondary: '#D77E2E',
    eye: '#73B559',
    decayMultiplier: { hunger: 0.95, thirst: 0.95, fun: 0.95, hygiene: 0.95 },
  },
];

export const PRONOUNS = ['he/him', 'she/her', 'they/them'] as const;
export const SKIN_TONES = ['#FFE0BD', '#F5C89A', '#D4A76A', '#B07A3E', '#8B5E34', '#5C3D2E'];
export const HAIR_COLORS = ['#2C2C2C', '#5A3E2B', '#E5C87A', '#AA4C2F', '#437EE2', '#EA7AA7', '#8A63D2', '#E8E8E8'];
export const EYE_COLORS = ['#4F3822', '#4B78D4', '#5DA450', '#8A6F43', '#6A6A6A'];
export const OUTFIT_COLORS = ['#2F5DAA', '#3D9B54', '#B15A3A', '#8D5AB7', '#D9B03A', '#4C8B95', '#C65378', '#7C7C7C'];

export const INPUT_TARGET_MIN_SIZE = 56;

export const DEFAULT_PLAYER_NAME = 'Alex';
export const DEFAULT_CAT_NAME = 'Mochi';

export const IN_GAME_MINUTES_PER_REAL_SECOND = 1;
export const DAY_MINUTES = 24 * 60;
