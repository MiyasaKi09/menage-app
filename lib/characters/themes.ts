// Each character replaces EVERY CSS variable — the whole site transforms.
// RGB triplets ("R G B") unless noted.

export interface FullTheme {
  // ── Dark backgrounds (hero cards, CTA blocks) ──────────────────────────
  deepBg1: string      // main deep bg (gradient start)
  deepBg2: string      // gradient end

  // ── Light backgrounds ──────────────────────────────────────────────────
  cream: string        // page background
  offWhite: string     // card / surface background

  // ── Text ──────────────────────────────────────────────────────────────
  charcoal: string     // primary text (very dark)
  ink: string          // secondary text / subtle elements

  // ── Borders & inputs ──────────────────────────────────────────────────
  border: string       // default border
  input: string        // input border (often same as border)
  ring: string         // focus ring (accent color)

  // ── Accent (primary CTA, highlights) ──────────────────────────────────
  accent: string       // e.g. gold, purple, emerald…
  accentSoft: string   // lighter accent (hover, subtle highlights)
  accentMuted: string  // very muted (tint backgrounds)
  accentFg: string     // text on solid accent bg (usually charcoal or white)

  // ── Secondary palette ─────────────────────────────────────────────────
  secondary: string
  secondarySoft: string

  // ── Named accents (mapped to tailwind color names) ─────────────────────
  yellow: string       // maps to --yellow
  orange: string       // maps to --orange
  red: string          // maps to --red (destructive)
  green: string        // maps to --green
  blue: string         // maps to --blue
  purple: string       // maps to --purple
  pink: string         // maps to --pink

  // ── Warm tint & glow ──────────────────────────────────────────────────
  warm: string         // warm accent (badges, notifications)
  glow: string         // glow animations
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT THEME — gold/parchment (no character active)
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_THEME: FullTheme = {
  deepBg1:      '26 23 20',
  deepBg2:      '45 37 32',
  cream:        '246 241 235',
  offWhite:     '255 255 255',
  charcoal:     '26 23 20',
  ink:          '45 37 32',
  border:       '232 224 212',
  input:        '232 224 212',
  ring:         '196 163 90',
  accent:       '196 163 90',
  accentSoft:   '212 183 106',
  accentMuted:  '196 163 90',
  accentFg:     '26 23 20',
  secondary:    '74 122 115',
  secondarySoft:'107 143 136',
  yellow:       '196 163 90',
  orange:       '178 112 96',
  red:          '176 96 80',
  green:        '90 128 96',
  blue:         '74 122 115',
  purple:       '155 140 181',
  pink:         '200 139 122',
  warm:         '178 112 96',
  glow:         '240 224 160',
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARACTER THEMES
// ─────────────────────────────────────────────────────────────────────────────
export const CHARACTER_THEMES: Record<string, FullTheme> = {

  // ── ANGE — Céleste / Divin ─────────────────────────────────────────────
  // Ivoire chaud, or pâle, lumière divine
  ange: {
    deepBg1:      '40 32 12',
    deepBg2:      '58 46 18',
    cream:        '251 248 238',
    offWhite:     '255 254 248',
    charcoal:     '30 24 10',
    ink:          '52 42 20',
    border:       '232 220 188',
    input:        '232 220 188',
    ring:         '210 182 95',
    accent:       '210 182 95',
    accentSoft:   '228 205 130',
    accentMuted:  '210 182 95',
    accentFg:     '30 24 10',
    secondary:    '188 172 138',
    secondarySoft:'208 196 168',
    yellow:       '210 182 95',
    orange:       '205 162 80',
    red:          '185 90 75',
    green:        '148 168 112',
    blue:         '148 162 190',
    purple:       '178 165 210',
    pink:         '220 188 160',
    warm:         '215 172 100',
    glow:         '255 242 185',
  },

  // ── MAGE — Arcane / Mystique ───────────────────────────────────────────
  // Violet profond, lavande, nuit étoilée
  mage: {
    deepBg1:      '18 12 38',
    deepBg2:      '28 20 55',
    cream:        '244 241 252',
    offWhite:     '250 248 255',
    charcoal:     '22 16 42',
    ink:          '42 32 68',
    border:       '210 202 235',
    input:        '210 202 235',
    ring:         '128 95 200',
    accent:       '128 95 200',
    accentSoft:   '155 128 220',
    accentMuted:  '128 95 200',
    accentFg:     '255 255 255',
    secondary:    '88 122 168',
    secondarySoft:'118 148 192',
    yellow:       '175 155 215',
    orange:       '162 125 185',
    red:          '175 85 120',
    green:        '88 148 128',
    blue:         '88 122 168',
    purple:       '128 95 200',
    pink:         '188 138 188',
    warm:         '162 125 185',
    glow:         '205 185 245',
  },

  // ── IMPÉRATRICE — Jardin Royal / Émeraude ─────────────────────────────
  // Vert forêt, rose poudré, feuillage
  imperatrice: {
    deepBg1:      '10 32 18',
    deepBg2:      '18 48 28',
    cream:        '240 248 242',
    offWhite:     '248 254 250',
    charcoal:     '14 30 18',
    ink:          '28 52 35',
    border:       '192 222 202',
    input:        '192 222 202',
    ring:         '52 128 78',
    accent:       '52 128 78',
    accentSoft:   '80 155 105',
    accentMuted:  '52 128 78',
    accentFg:     '255 255 255',
    secondary:    '160 105 112',
    secondarySoft:'185 135 140',
    yellow:       '135 178 98',
    orange:       '172 120 90',
    red:          '175 82 82',
    green:        '52 128 78',
    blue:         '68 140 125',
    purple:       '138 108 158',
    pink:         '182 128 135',
    warm:         '172 120 90',
    glow:         '140 210 155',
  },

  // ── SENTINELLE — Pierre / Ambre ────────────────────────────────────────
  // Ocre, rouille, pierre chaude, medieval stone
  sentinelle: {
    deepBg1:      '52 28 10',
    deepBg2:      '72 42 15',
    cream:        '250 244 234',
    offWhite:     '255 252 245',
    charcoal:     '38 22 8',
    ink:          '62 40 18',
    border:       '232 210 180',
    input:        '232 210 180',
    ring:         '195 118 38',
    accent:       '195 118 38',
    accentSoft:   '215 148 65',
    accentMuted:  '195 118 38',
    accentFg:     '255 255 255',
    secondary:    '132 92 58',
    secondarySoft:'158 118 85',
    yellow:       '195 118 38',
    orange:       '195 118 38',
    red:          '185 72 55',
    green:        '115 138 85',
    blue:         '105 128 148',
    purple:       '148 118 148',
    pink:         '205 148 118',
    warm:         '210 135 60',
    glow:         '245 200 128',
  },

  // ── DEVIN — Nuit / Prophétique ─────────────────────────────────────────
  // Bleu nuit, ardoise, argent, mystère
  devin: {
    deepBg1:      '8 12 32',
    deepBg2:      '15 20 48',
    cream:        '236 239 250',
    offWhite:     '244 246 255',
    charcoal:     '18 22 48',
    ink:          '35 42 72',
    border:       '198 205 232',
    input:        '198 205 232',
    ring:         '88 112 172',
    accent:       '88 112 172',
    accentSoft:   '118 140 198',
    accentMuted:  '88 112 172',
    accentFg:     '255 255 255',
    secondary:    '112 138 122',
    secondarySoft:'138 162 148',
    yellow:       '162 148 195',
    orange:       '148 128 155',
    red:          '162 82 105',
    green:        '85 138 118',
    blue:         '88 112 172',
    purple:       '118 95 172',
    pink:         '162 122 148',
    warm:         '158 142 172',
    glow:         '158 178 225',
  },

  // ── BOHÈME — Prairie / Rose Poudré ─────────────────────────────────────
  // Rose, pêche, sauge douce, liberté créative
  boheme: {
    deepBg1:      '42 18 24',
    deepBg2:      '62 28 36',
    cream:        '252 244 246',
    offWhite:     '255 250 252',
    charcoal:     '38 18 24',
    ink:          '65 35 42',
    border:       '232 208 215',
    input:        '232 208 215',
    ring:         '188 88 105',
    accent:       '188 88 105',
    accentSoft:   '212 118 132',
    accentMuted:  '188 88 105',
    accentFg:     '255 255 255',
    secondary:    '112 148 112',
    secondarySoft:'138 170 138',
    yellow:       '205 158 88',
    orange:       '208 138 108',
    red:          '188 88 105',
    green:        '112 148 112',
    blue:         '122 148 180',
    purple:       '172 128 175',
    pink:         '205 148 158',
    warm:         '212 138 110',
    glow:         '248 195 205',
  },

  // ── LAVANDIÈRE — Eaux Cristal / Sarcelle ──────────────────────────────
  // Sarcelle vif, aqua, eau douce, propreté lumineuse
  lavandiere: {
    deepBg1:      '5 28 25',
    deepBg2:      '10 42 38',
    cream:        '235 248 246',
    offWhite:     '244 254 252',
    charcoal:     '8 30 27',
    ink:          '18 52 46',
    border:       '185 225 218',
    input:        '185 225 218',
    ring:         '35 138 120',
    accent:       '35 138 120',
    accentSoft:   '62 165 148',
    accentMuted:  '35 138 120',
    accentFg:     '255 255 255',
    secondary:    '128 162 150',
    secondarySoft:'155 185 175',
    yellow:       '108 178 108',
    orange:       '138 165 115',
    red:          '165 82 88',
    green:        '35 138 120',
    blue:         '58 128 168',
    purple:       '118 108 172',
    pink:         '168 128 148',
    warm:         '155 168 108',
    glow:         '122 215 200',
  },

  // ── PIRATE (Capitaine Recure) — Terre Cuite / Corail ──────────────────
  // Corail vif, sable chaud, aventure audacieuse
  pirate: {
    deepBg1:      '42 15 8',
    deepBg2:      '62 22 12',
    cream:        '252 244 238',
    offWhite:     '255 251 247',
    charcoal:     '40 18 10',
    ink:          '65 30 15',
    border:       '235 212 198',
    input:        '235 212 198',
    ring:         '198 78 52',
    accent:       '198 78 52',
    accentSoft:   '218 108 82',
    accentMuted:  '198 78 52',
    accentFg:     '255 255 255',
    secondary:    '138 112 88',
    secondarySoft:'165 140 115',
    yellow:       '205 158 52',
    orange:       '198 78 52',
    red:          '198 78 52',
    green:        '112 148 88',
    blue:         '95 125 155',
    purple:       '148 108 148',
    pink:         '215 148 130',
    warm:         '215 120 72',
    glow:         '248 178 148',
  },
}
