// Each character replaces EVERY CSS variable — the whole site transforms.
// RGB triplets ("R G B") unless noted.
// Keys MUST match character_class values stored in the database (English).

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
  input: string        // input border
  ring: string         // focus ring (accent color)

  // ── Accent (primary CTA, highlights) ──────────────────────────────────
  accent: string
  accentSoft: string
  accentMuted: string
  accentFg: string     // text on solid accent bg

  // ── Secondary palette ─────────────────────────────────────────────────
  secondary: string
  secondarySoft: string

  // ── Named accents (mapped to Tailwind color names) ─────────────────────
  yellow: string
  orange: string
  red: string
  green: string
  blue: string
  purple: string
  pink: string

  // ── Warm tint & glow ──────────────────────────────────────────────────
  warm: string
  glow: string
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
// CHARACTER THEMES — keys match character_class in DB
// ─────────────────────────────────────────────────────────────────────────────
export const CHARACTER_THEMES: Record<string, FullTheme> = {

  // ── ANGEL — Céleste / Divin ────────────────────────────────────────────
  // Ivoire chaud, or pâle, lumière divine
  angel: {
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

  // ── WIZARD — Arcane / Mystique ─────────────────────────────────────────
  // Violet profond, lavande, nuit étoilée
  wizard: {
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

  // ── NOBLEWOMAN — Jardin Royal / Émeraude ──────────────────────────────
  // Vert forêt, rose poudré, feuillage
  noblewoman: {
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

  // ── GUARDIAN — Pierre / Ambre ──────────────────────────────────────────
  // Ocre, rouille, pierre chaude, medieval stone
  guardian: {
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

  // ── ORACLE — Nuit / Prophétique ────────────────────────────────────────
  // Bleu nuit, ardoise, argent, mystère
  oracle: {
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

  // ── BARD — Prairie / Rose Poudré ───────────────────────────────────────
  // Rose, pêche, sauge douce, liberté créative
  bard: {
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

  // ── WASHERWOMAN — Eaux Cristal / Sarcelle ─────────────────────────────
  // Sarcelle vif, aqua, eau douce, propreté lumineuse
  washerwoman: {
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

  // ── PIRATE — Terre Cuite / Corail ─────────────────────────────────────
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

  // ── KNIGHT — Acier / Argent ────────────────────────────────────────────
  // Métal poli, ardoise froide, honneur chevaleresque
  knight: {
    deepBg1:      '18 20 28',
    deepBg2:      '28 32 42',
    cream:        '242 244 248',
    offWhite:     '250 251 255',
    charcoal:     '20 22 32',
    ink:          '38 42 58',
    border:       '205 210 225',
    input:        '205 210 225',
    ring:         '105 118 155',
    accent:       '105 118 155',
    accentSoft:   '135 148 182',
    accentMuted:  '105 118 155',
    accentFg:     '255 255 255',
    secondary:    '148 130 95',
    secondarySoft:'172 158 122',
    yellow:       '195 178 112',
    orange:       '168 135 88',
    red:          '165 75 75',
    green:        '88 142 108',
    blue:         '105 118 155',
    purple:       '122 105 158',
    pink:         '165 130 145',
    warm:         '175 148 105',
    glow:         '195 205 228',
  },

  // ── FAIRY — Féerique / Étincelles ─────────────────────────────────────
  // Lilas rosé, menthe, magie scintillante
  fairy: {
    deepBg1:      '32 15 42',
    deepBg2:      '48 22 62',
    cream:        '250 244 255',
    offWhite:     '255 251 255',
    charcoal:     '28 15 38',
    ink:          '52 30 68',
    border:       '228 210 240',
    input:        '228 210 240',
    ring:         '175 108 215',
    accent:       '175 108 215',
    accentSoft:   '198 138 232',
    accentMuted:  '175 108 215',
    accentFg:     '255 255 255',
    secondary:    '88 175 158',
    secondarySoft:'115 198 182',
    yellow:       '215 188 88',
    orange:       '215 135 108',
    red:          '198 88 118',
    green:        '88 175 158',
    blue:         '108 155 210',
    purple:       '175 108 215',
    pink:         '218 148 188',
    warm:         '215 135 108',
    glow:         '225 185 255',
  },

  // ── ALCHEMIST — Cuivre / Ambre savant ─────────────────────────────────
  // Cuivre chaud, ambre doré, science & mystère
  alchemist: {
    deepBg1:      '35 22 8',
    deepBg2:      '52 35 12',
    cream:        '252 246 235',
    offWhite:     '255 252 244',
    charcoal:     '32 20 8',
    ink:          '55 38 15',
    border:       '235 218 185',
    input:        '235 218 185',
    ring:         '188 120 45',
    accent:       '188 120 45',
    accentSoft:   '212 148 72',
    accentMuted:  '188 120 45',
    accentFg:     '255 255 255',
    secondary:    '128 155 95',
    secondarySoft:'155 178 122',
    yellow:       '188 120 45',
    orange:       '205 95 55',
    red:          '195 72 58',
    green:        '108 155 88',
    blue:         '88 128 168',
    purple:       '148 105 175',
    pink:         '205 145 125',
    warm:         '205 95 55',
    glow:         '245 210 135',
  },

  // ── DRUID — Forêt / Mousse & Racines ──────────────────────────────────
  // Vert mousse profond, écorce brune, nature ancienne
  druid: {
    deepBg1:      '12 28 15',
    deepBg2:      '20 42 22',
    cream:        '238 246 238',
    offWhite:     '246 254 246',
    charcoal:     '12 26 14',
    ink:          '25 48 28',
    border:       '188 220 192',
    input:        '188 220 192',
    ring:         '62 118 68',
    accent:       '62 118 68',
    accentSoft:   '88 148 95',
    accentMuted:  '62 118 68',
    accentFg:     '255 255 255',
    secondary:    '128 100 65',
    secondarySoft:'158 128 92',
    yellow:       '148 168 62',
    orange:       '158 112 62',
    red:          '165 72 65',
    green:        '62 118 68',
    blue:         '62 118 108',
    purple:       '108 88 138',
    pink:         '162 118 108',
    warm:         '158 112 62',
    glow:         '138 208 142',
  },

  // ── DRAGON — Braise / Feu & Cendres ───────────────────────────────────
  // Rouge cramoisi, orange braise, cendre sombre
  dragon: {
    deepBg1:      '35 8 5',
    deepBg2:      '55 12 8',
    cream:        '255 242 240',
    offWhite:     '255 248 247',
    charcoal:     '38 8 5',
    ink:          '62 15 10',
    border:       '240 205 200',
    input:        '240 205 200',
    ring:         '205 52 35',
    accent:       '205 52 35',
    accentSoft:   '225 85 65',
    accentMuted:  '205 52 35',
    accentFg:     '255 255 255',
    secondary:    '158 105 42',
    secondarySoft:'182 132 68',
    yellow:       '225 165 38',
    orange:       '215 105 38',
    red:          '205 52 35',
    green:        '95 138 75',
    blue:         '88 112 152',
    purple:       '138 78 138',
    pink:         '218 128 118',
    warm:         '215 105 38',
    glow:         '255 175 120',
  },

  // ── MONK — Zen / Sable & Bambou ───────────────────────────────────────
  // Beige sable, vert pâle, sérénité apaisante
  monk: {
    deepBg1:      '25 22 15',
    deepBg2:      '38 34 22',
    cream:        '250 248 240',
    offWhite:     '255 254 248',
    charcoal:     '25 22 14',
    ink:          '45 40 28',
    border:       '228 220 198',
    input:        '228 220 198',
    ring:         '148 138 92',
    accent:       '148 138 92',
    accentSoft:   '172 162 118',
    accentMuted:  '148 138 92',
    accentFg:     '255 255 255',
    secondary:    '105 138 108',
    secondarySoft:'132 162 135',
    yellow:       '175 158 88',
    orange:       '175 128 78',
    red:          '168 82 75',
    green:        '105 138 108',
    blue:         '95 128 148',
    purple:       '132 112 148',
    pink:         '188 148 138',
    warm:         '175 128 78',
    glow:         '215 205 165',
  },

  // ── WANDERER — Crépuscule / Route & Horizon ────────────────────────────
  // Brun voyage, terracotta, coucher de soleil
  wanderer: {
    deepBg1:      '30 18 12',
    deepBg2:      '45 28 18',
    cream:        '252 245 238',
    offWhite:     '255 252 247',
    charcoal:     '32 20 12',
    ink:          '55 35 22',
    border:       '232 215 198',
    input:        '232 215 198',
    ring:         '172 108 65',
    accent:       '172 108 65',
    accentSoft:   '198 135 92',
    accentMuted:  '172 108 65',
    accentFg:     '255 255 255',
    secondary:    '125 148 108',
    secondarySoft:'152 172 135',
    yellow:       '200 162 62',
    orange:       '188 118 58',
    red:          '188 75 65',
    green:        '112 148 88',
    blue:         '95 128 162',
    purple:       '145 108 158',
    pink:         '210 148 128',
    warm:         '195 125 65',
    glow:         '242 195 155',
  },
}

// French legacy key aliases — maps old DB slugs to the same theme objects
// This supports production DBs seeded before the English rename migration.
CHARACTER_THEMES.mage        = CHARACTER_THEMES.wizard
CHARACTER_THEMES.ange        = CHARACTER_THEMES.angel
CHARACTER_THEMES.boheme      = CHARACTER_THEMES.bard
CHARACTER_THEMES.lavandiere  = CHARACTER_THEMES.washerwoman
CHARACTER_THEMES.sentinelle  = CHARACTER_THEMES.guardian
CHARACTER_THEMES.imperatrice = CHARACTER_THEMES.noblewoman
CHARACTER_THEMES.devin       = CHARACTER_THEMES.oracle
CHARACTER_THEMES.chevalier   = CHARACTER_THEMES.knight
CHARACTER_THEMES.fee         = CHARACTER_THEMES.fairy
CHARACTER_THEMES.alchimiste  = CHARACTER_THEMES.alchemist
CHARACTER_THEMES.druide      = CHARACTER_THEMES.druid
CHARACTER_THEMES.moine       = CHARACTER_THEMES.monk
CHARACTER_THEMES.vagabond    = CHARACTER_THEMES.wanderer
