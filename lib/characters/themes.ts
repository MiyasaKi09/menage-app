// Each character has a COMPLETE site palette that replaces ALL CSS variables
// When a player becomes a character, the entire site transforms

export interface FullTheme {
  // Page backgrounds
  deepBg1: string       // gradient start (dark pages)
  deepBg2: string       // gradient end (dark pages)
  // Accent colors
  accent: string        // primary accent (buttons, highlights)
  accentSoft: string    // softer accent (hover states, subtle highlights)
  accentMuted: string   // very muted accent (backgrounds, tints)
  // Secondary
  secondary: string     // secondary color
  secondarySoft: string
  // Warm/cool tone
  warm: string          // warm accent (notifications, badges)
  // Neutrals (tinted to match character)
  cream: string         // main light background
  offWhite: string      // card backgrounds
  charcoal: string      // text color
  ink: string           // borders, subtle elements
  // Glow/special
  glow: string          // glow animations, special highlights
}

// Default theme (gold/parchment - no character active)
export const DEFAULT_THEME: FullTheme = {
  deepBg1: '43 76 63',
  deepBg2: '35 55 50',
  accent: '196 163 90',
  accentSoft: '212 183 106',
  accentMuted: '196 163 90',
  secondary: '74 122 115',
  secondarySoft: '107 143 136',
  warm: '178 112 96',
  cream: '240 228 208',
  offWhite: '232 220 200',
  charcoal: '75 60 42',
  ink: '90 65 35',
  glow: '240 224 160',
}

// Character themes - keyed by character_class
export const CHARACTER_THEMES: Record<string, FullTheme> = {
  // Ange Celeste - luminous gold/white/ivory
  angel: {
    deepBg1: '65 60 40',
    deepBg2: '45 42 35',
    accent: '212 195 130',
    accentSoft: '230 215 160',
    accentMuted: '212 195 130',
    secondary: '180 165 130',
    secondarySoft: '200 185 155',
    warm: '210 185 140',
    cream: '248 243 230',
    offWhite: '240 235 218',
    charcoal: '85 75 55',
    ink: '100 88 60',
    glow: '245 235 200',
  },

  // Gardien du Chateau - warm ochre/brown/stone
  guardian: {
    deepBg1: '80 60 30',
    deepBg2: '55 42 25',
    accent: '196 163 72',
    accentSoft: '210 180 95',
    accentMuted: '178 145 72',
    secondary: '140 100 60',
    secondarySoft: '165 125 80',
    warm: '180 130 70',
    cream: '242 232 210',
    offWhite: '235 222 198',
    charcoal: '80 60 35',
    ink: '95 72 42',
    glow: '220 200 140',
  },

  // Dame des Roses - deep green/rose/garden
  noblewoman: {
    deepBg1: '30 55 35',
    deepBg2: '25 42 30',
    accent: '90 128 80',
    accentSoft: '120 155 105',
    accentMuted: '60 90 55',
    secondary: '165 110 115',
    secondarySoft: '185 135 138',
    warm: '175 120 120',
    cream: '238 235 225',
    offWhite: '228 225 215',
    charcoal: '45 55 40',
    ink: '55 68 48',
    glow: '140 180 130',
  },

  // Oracle des Saules - blue-grey/night/mystical
  oracle: {
    deepBg1: '40 48 65',
    deepBg2: '30 35 50',
    accent: '145 155 175',
    accentSoft: '165 175 195',
    accentMuted: '115 125 145',
    secondary: '130 140 120',
    secondarySoft: '155 162 145',
    warm: '175 165 140',
    cream: '235 237 242',
    offWhite: '225 228 235',
    charcoal: '55 60 72',
    ink: '68 75 88',
    glow: '165 175 195',
  },

  // Barde des Prairies - soft pink/pastel/meadow
  wanderer: {
    deepBg1: '75 50 55',
    deepBg2: '55 38 42',
    accent: '195 150 150',
    accentSoft: '215 175 170',
    accentMuted: '185 140 140',
    secondary: '130 155 120',
    secondarySoft: '150 175 140',
    warm: '200 160 130',
    cream: '245 238 235',
    offWhite: '238 230 226',
    charcoal: '80 60 62',
    ink: '95 72 75',
    glow: '235 205 200',
  },

  // Merlin le Propre - mystical purple/lavender
  wizard: {
    deepBg1: '45 40 65',
    deepBg2: '32 28 48',
    accent: '155 140 181',
    accentSoft: '175 162 200',
    accentMuted: '135 120 160',
    secondary: '120 140 130',
    secondarySoft: '140 160 150',
    warm: '180 155 140',
    cream: '240 236 245',
    offWhite: '232 228 238',
    charcoal: '60 52 72',
    ink: '75 65 88',
    glow: '200 185 230',
  },

  // Dame Blanche - teal/aqua/fresh
  washerwoman: {
    deepBg1: '30 60 55',
    deepBg2: '22 45 42',
    accent: '74 122 115',
    accentSoft: '100 145 138',
    accentMuted: '60 105 98',
    secondary: '140 165 155',
    secondarySoft: '160 182 172',
    warm: '170 135 110',
    cream: '235 242 240',
    offWhite: '225 235 232',
    charcoal: '42 62 58',
    ink: '55 78 72',
    glow: '168 200 195',
  },

  // Capitaine Recure - terracotta/coral/warm
  pirate: {
    deepBg1: '65 42 35',
    deepBg2: '48 32 28',
    accent: '200 125 100',
    accentSoft: '218 148 125',
    accentMuted: '176 112 96',
    secondary: '140 120 95',
    secondarySoft: '165 145 118',
    warm: '210 140 100',
    cream: '245 236 230',
    offWhite: '238 228 220',
    charcoal: '75 55 45',
    ink: '90 65 52',
    glow: '232 184 168',
  },

  // Chevalier Etincelant - gold/amber/noble
  knight: {
    deepBg1: '65 55 30',
    deepBg2: '48 40 22',
    accent: '196 163 90',
    accentSoft: '212 183 106',
    accentMuted: '175 142 72',
    secondary: '155 130 85',
    secondarySoft: '175 150 105',
    warm: '190 150 90',
    cream: '245 238 220',
    offWhite: '238 230 210',
    charcoal: '72 60 38',
    ink: '88 72 45',
    glow: '240 224 160',
  },

  // Fee du Logis - sage green/fairy/nature
  fairy: {
    deepBg1: '35 60 42',
    deepBg2: '25 45 32',
    accent: '90 145 100',
    accentSoft: '115 168 122',
    accentMuted: '75 125 85',
    secondary: '145 130 100',
    secondarySoft: '168 152 120',
    warm: '175 145 110',
    cream: '238 242 235',
    offWhite: '228 235 225',
    charcoal: '48 62 45',
    ink: '60 75 55',
    glow: '176 216 176',
  },

  // Alchimiste des Saveurs - warm coral/copper
  alchemist: {
    deepBg1: '68 45 38',
    deepBg2: '50 35 28',
    accent: '200 139 122',
    accentSoft: '218 162 145',
    accentMuted: '180 120 105',
    secondary: '160 140 110',
    secondarySoft: '180 160 130',
    warm: '210 150 120',
    cream: '245 238 232',
    offWhite: '238 228 222',
    charcoal: '78 58 48',
    ink: '92 70 58',
    glow: '240 200 184',
  },

  // Druide des Jardins - forest green/earth
  druid: {
    deepBg1: '35 55 38',
    deepBg2: '25 42 28',
    accent: '90 128 96',
    accentSoft: '115 150 118',
    accentMuted: '72 108 78',
    secondary: '135 120 90',
    secondarySoft: '158 142 110',
    warm: '168 140 100',
    cream: '238 240 232',
    offWhite: '228 232 222',
    charcoal: '50 60 45',
    ink: '62 75 55',
    glow: '168 208 168',
  },

  // Barde Motivant - lavender/musical
  bard: {
    deepBg1: '50 42 62',
    deepBg2: '38 32 48',
    accent: '165 148 190',
    accentSoft: '185 170 208',
    accentMuted: '145 128 168',
    secondary: '140 148 130',
    secondarySoft: '162 168 150',
    warm: '185 160 145',
    cream: '242 238 248',
    offWhite: '235 230 240',
    charcoal: '62 55 72',
    ink: '78 68 90',
    glow: '224 208 240',
  },

  // Dragon Domestique - ember/fire/dark warm
  dragon: {
    deepBg1: '70 38 28',
    deepBg2: '52 28 20',
    accent: '210 140 90',
    accentSoft: '225 165 115',
    accentMuted: '190 120 75',
    secondary: '150 110 80',
    secondarySoft: '172 132 100',
    warm: '220 150 90',
    cream: '248 238 228',
    offWhite: '240 228 218',
    charcoal: '80 52 38',
    ink: '95 62 45',
    glow: '240 192 168',
  },

  // Moine de l'Ordre - earth brown/parchment
  monk: {
    deepBg1: '55 45 32',
    deepBg2: '42 35 25',
    accent: '168 136 96',
    accentSoft: '188 158 118',
    accentMuted: '148 118 80',
    secondary: '130 120 100',
    secondarySoft: '152 142 120',
    warm: '175 145 105',
    cream: '242 236 225',
    offWhite: '235 228 215',
    charcoal: '68 58 42',
    ink: '82 70 52',
    glow: '208 184 152',
  },
}
