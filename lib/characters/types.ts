export interface CharacterTheme {
  primary: string   // RGB values like "155 140 181"
  accent: string
  glow: string
}

export interface CharacterPower {
  power_type: 'category_bonus' | 'point_multiplier' | 'time_reduction' | 'streak_shield'
  power_value: Record<string, any>
  power_description: string
}

export interface Character {
  avatar_id: string
  avatar_name: string
  description?: string
  character_class: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  color_theme: CharacterTheme
  power_type: string
  power_description: string
  power_value: Record<string, any>
  lore_text: string
}

export interface WeeklyCharacter extends Character {
  weekly_id: string
  is_revealed: boolean
}

export interface CollectionCharacter extends Character {
  times_received: number
  is_favorite: boolean
  is_collected: boolean
}

export const RARITY_COLORS: Record<string, string> = {
  common: '#5A8060',
  rare: '#4A7A73',
  epic: '#9B8CB5',
  legendary: '#C4A35A',
}

export const RARITY_LABELS: Record<string, string> = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Epique',
  legendary: 'Legendaire',
}

export const CLASS_EMOJIS: Record<string, string> = {
  pirate: '🏴‍☠️',
  lavandiere: '👗',
  mage: '🧙',
  boheme: '🪘',
  devin: '🔮',
  imperatrice: '👑',
  sentinelle: '🏰',
  ange: '👼',
}

export const CLASS_IMAGES: Record<string, string> = {
  pirate: '/characters/pirate.png',
  lavandiere: '/characters/lavandiere.png',
  mage: '/characters/mage.png',
  boheme: '/characters/boheme.png',
  devin: '/characters/devin.png',
  imperatrice: '/characters/imperatrice.png',
  sentinelle: '/characters/sentinelle.png',
  ange: '/characters/ange.png',
}
