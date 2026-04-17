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
  epic: 'Épique',
  legendary: 'Légendaire',
}

// Supports both English DB keys (new rows) and French DB keys (legacy rows)
export const CLASS_LABELS: Record<string, string> = {
  // English keys
  wizard:      'Sorcier',
  angel:       'Ange',
  bard:        'Barde',
  washerwoman: 'Lavandière',
  guardian:    'Gardien',
  noblewoman:  'Noble Dame',
  oracle:      'Oracle',
  pirate:      'Pirate',
  knight:      'Chevalier',
  fairy:       'Fée',
  alchemist:   'Alchimiste',
  druid:       'Druide',
  dragon:      'Dragon',
  monk:        'Moine',
  wanderer:    'Vagabond',
  // French legacy keys
  mage:        'Sorcier',
  ange:        'Ange',
  boheme:      'Barde',
  lavandiere:  'Lavandière',
  sentinelle:  'Gardien',
  imperatrice: 'Noble Dame',
  devin:       'Oracle',
  chevalier:   'Chevalier',
  fee:         'Fée',
  alchimiste:  'Alchimiste',
  druide:      'Druide',
  moine:       'Moine',
  vagabond:    'Vagabond',
}

export const CLASS_EMOJIS: Record<string, string> = {
  // English keys
  wizard:      '🧙',
  angel:       '👼',
  bard:        '🪘',
  washerwoman: '👗',
  guardian:    '🏰',
  noblewoman:  '👑',
  oracle:      '🔮',
  pirate:      '🏴‍☠️',
  knight:      '⚔️',
  fairy:       '🧚',
  alchemist:   '⚗️',
  druid:       '🌿',
  dragon:      '🐉',
  monk:        '🧘',
  wanderer:    '🗺️',
  // French legacy keys
  mage:        '🧙',
  ange:        '👼',
  boheme:      '🪘',
  lavandiere:  '👗',
  sentinelle:  '🏰',
  imperatrice: '👑',
  devin:       '🔮',
  chevalier:   '⚔️',
  fee:         '🧚',
  alchimiste:  '⚗️',
  druide:      '🌿',
  moine:       '🧘',
  vagabond:    '🗺️',
}

export const CLASS_IMAGES: Record<string, string> = {
  // English keys
  wizard:      '/characters/mage.png',
  angel:       '/characters/ange.png',
  bard:        '/characters/boheme.png',
  washerwoman: '/characters/lavandiere.png',
  guardian:    '/characters/sentinelle.png',
  noblewoman:  '/characters/imperatrice.png',
  oracle:      '/characters/devin.png',
  pirate:      '/characters/pirate.png',
  // French legacy keys (same files)
  mage:        '/characters/mage.png',
  ange:        '/characters/ange.png',
  boheme:      '/characters/boheme.png',
  lavandiere:  '/characters/lavandiere.png',
  sentinelle:  '/characters/sentinelle.png',
  imperatrice: '/characters/imperatrice.png',
  devin:       '/characters/devin.png',
}
