import React from 'react'

interface CategoryIconProps {
  category: string
  size?: number
}

// Shared parchment card wrapper for hand-drawn style
function IconCard({ children, size, bgColor = '#E8DCC8' }: { children: React.ReactNode; size: number; bgColor?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Parchment background */}
      <rect x="2" y="2" width="96" height="96" rx="14" fill={bgColor} stroke="#4B3C2A" strokeWidth="1" opacity="0.9" />
      {/* Subtle paper texture */}
      <rect x="2" y="2" width="96" height="96" rx="14" fill="url(#paper)" opacity="0.03" />
      <defs>
        <filter id="paper">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      {children}
    </svg>
  )
}

export function CategoryIcon({ category, size = 60 }: CategoryIconProps) {
  const icons: Record<string, React.ReactElement> = {
    'Cuisine & Vaisselle': (
      <IconCard size={size} bgColor="#E8DCC8">
        {/* Pot with steam - hand drawn style */}
        <ellipse cx="50" cy="72" rx="22" ry="6" fill="#B27060" fillOpacity="0.3" />
        <path d="M32 45 Q30 70 35 72 L65 72 Q70 70 68 45 Z" fill="#B27060" fillOpacity="0.4" stroke="#5A4123" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M30 45 L70 45" stroke="#5A4123" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M28 42 L72 42 L72 48 L28 48 Z" fill="#C4A35A" fillOpacity="0.4" stroke="#5A4123" strokeWidth="1" strokeLinecap="round" />
        {/* Steam */}
        <path d="M40 35 Q38 28 42 22" fill="none" stroke="#4A7A73" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        <path d="M50 33 Q48 25 52 18" fill="none" stroke="#4A7A73" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        <path d="M60 35 Q58 28 62 22" fill="none" stroke="#4A7A73" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      </IconCard>
    ),
    'Sanitaire': (
      <IconCard size={size} bgColor="#D8E8E5">
        {/* Water drops and sparkle */}
        <path d="M50 25 Q55 35 50 42 Q45 35 50 25" fill="#4A7A73" fillOpacity="0.5" stroke="#5A4123" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M35 35 Q38 42 35 48 Q32 42 35 35" fill="#4A7A73" fillOpacity="0.4" stroke="#5A4123" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M65 32 Q68 39 65 45 Q62 39 65 32" fill="#4A7A73" fillOpacity="0.4" stroke="#5A4123" strokeWidth="0.8" strokeLinecap="round" />
        {/* Basin */}
        <path d="M25 58 Q25 75 50 75 Q75 75 75 58" fill="#4A7A73" fillOpacity="0.2" stroke="#5A4123" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="22" y1="58" x2="78" y2="58" stroke="#5A4123" strokeWidth="1.2" strokeLinecap="round" />
        {/* Sparkle */}
        <path d="M72 25 L73 28 L76 29 L73 30 L72 33 L71 30 L68 29 L71 28 Z" fill="#C4A35A" opacity="0.5" />
      </IconCard>
    ),
    'Textile': (
      <IconCard size={size} bgColor="#E5DDE8">
        {/* Folded cloth layers - watercolor wash style */}
        <path d="M20 35 Q35 28 50 35 Q65 42 80 35 L80 48 Q65 55 50 48 Q35 41 20 48 Z" fill="#9B8CB5" fillOpacity="0.4" stroke="#5A4123" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M20 48 Q35 41 50 48 Q65 55 80 48 L80 61 Q65 68 50 61 Q35 54 20 61 Z" fill="#F0E4D0" fillOpacity="0.6" stroke="#5A4123" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M20 61 Q35 54 50 61 Q65 68 80 61 L80 74 Q65 81 50 74 Q35 67 20 74 Z" fill="#4A7A73" fillOpacity="0.35" stroke="#5A4123" strokeWidth="0.8" strokeLinecap="round" />
      </IconCard>
    ),
    'Salon & Espaces Communs': (
      <IconCard size={size} bgColor="#E8E0D0">
        {/* Sofa - soft watercolor */}
        <rect x="22" y="48" width="56" height="22" rx="6" fill="#9B8CB5" fillOpacity="0.45" stroke="#5A4123" strokeWidth="1" strokeLinecap="round" />
        <rect x="18" y="44" width="8" height="26" rx="4" fill="#9B8CB5" fillOpacity="0.35" stroke="#5A4123" strokeWidth="0.8" strokeLinecap="round" />
        <rect x="74" y="44" width="8" height="26" rx="4" fill="#9B8CB5" fillOpacity="0.35" stroke="#5A4123" strokeWidth="0.8" strokeLinecap="round" />
        {/* Cushions */}
        <rect x="30" y="40" width="14" height="10" rx="3" fill="#C4A35A" fillOpacity="0.4" stroke="#5A4123" strokeWidth="0.6" />
        <rect x="56" y="40" width="14" height="10" rx="3" fill="#C88B7A" fillOpacity="0.4" stroke="#5A4123" strokeWidth="0.6" />
        {/* Rug lines */}
        <path d="M20 78 Q50 82 80 78" stroke="#5A8060" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <path d="M22 82 Q50 86 78 82" stroke="#B27060" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      </IconCard>
    ),
    'Extérieur & Plantes': (
      <IconCard size={size} bgColor="#D8E5D8">
        {/* Plant in pot */}
        <path d="M38 65 L42 82 L58 82 L62 65 Z" fill="#B27060" fillOpacity="0.5" stroke="#5A4123" strokeWidth="1" strokeLinecap="round" />
        {/* Leaves - watercolor blobs */}
        <ellipse cx="50" cy="42" rx="8" ry="16" fill="#5A8060" fillOpacity="0.4" transform="rotate(-15 50 42)" />
        <ellipse cx="42" cy="40" rx="7" ry="14" fill="#5A8060" fillOpacity="0.35" transform="rotate(25 42 40)" />
        <ellipse cx="58" cy="38" rx="7" ry="15" fill="#5A8060" fillOpacity="0.3" transform="rotate(-35 58 38)" />
        {/* Stem */}
        <path d="M50 55 L50 65" stroke="#5A4123" strokeWidth="1.2" strokeLinecap="round" />
        {/* Sun */}
        <circle cx="78" cy="22" r="6" fill="#C4A35A" fillOpacity="0.3" />
        <circle cx="78" cy="22" r="3" fill="#C4A35A" fillOpacity="0.5" />
      </IconCard>
    ),
    'Sols & Surfaces': (
      <IconCard size={size} bgColor="#E0DDD5">
        {/* Broom - hand-drawn */}
        <line x1="35" y1="22" x2="42" y2="68" stroke="#6B4B2A" strokeWidth="2" strokeLinecap="round" />
        {/* Bristles */}
        <path d="M36 68 Q42 80 48 68" fill="none" stroke="#C4A35A" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M34 70 Q42 82 50 70" fill="none" stroke="#C4A35A" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        {/* Bucket */}
        <path d="M55 52 L58 76 L78 76 L81 52 Z" fill="#B27060" fillOpacity="0.35" stroke="#5A4123" strokeWidth="1" strokeLinecap="round" />
        <ellipse cx="68" cy="52" rx="13" ry="4" fill="#B27060" fillOpacity="0.25" stroke="#5A4123" strokeWidth="0.8" />
        {/* Water */}
        <circle cx="66" cy="62" r="2.5" fill="#4A7A73" opacity="0.3" />
        <circle cx="72" cy="59" r="1.5" fill="#4A7A73" opacity="0.3" />
        {/* Sparkle */}
        <path d="M25 40 L26 43 L29 44 L26 45 L25 48 L24 45 L21 44 L24 43 Z" fill="#C4A35A" opacity="0.4" />
      </IconCard>
    ),
    'Rangement': (
      <IconCard size={size} bgColor="#E2DDD0">
        {/* Shelf - hand drawn */}
        <rect x="25" y="22" width="50" height="56" fill="none" stroke="#5A4123" strokeWidth="1.2" strokeLinecap="round" rx="2" />
        <line x1="25" y1="40" x2="75" y2="40" stroke="#5A4123" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="25" y1="58" x2="75" y2="58" stroke="#5A4123" strokeWidth="1.2" strokeLinecap="round" />
        {/* Items - watercolor blobs */}
        <rect x="30" y="25" width="10" height="12" rx="2" fill="#B27060" fillOpacity="0.4" />
        <rect x="44" y="27" width="8" height="10" rx="1" fill="#4A7A73" fillOpacity="0.4" />
        <rect x="56" y="26" width="14" height="11" rx="2" fill="#C4A35A" fillOpacity="0.35" />
        <circle cx="35" cy="50" r="5" fill="#5A8060" fillOpacity="0.35" />
        <rect x="45" y="46" width="18" height="8" rx="2" fill="#9B8CB5" fillOpacity="0.35" />
        <rect x="30" y="63" width="13" height="10" rx="2" fill="#C88B7A" fillOpacity="0.35" />
        <circle cx="58" cy="68" r="6" fill="#C4A35A" fillOpacity="0.3" />
      </IconCard>
    ),
    'Courses & Gestion': (
      <IconCard size={size} bgColor="#E5E0D0">
        {/* Shopping bag - hand drawn */}
        <path d="M32 38 L28 78 L72 78 L68 38 Z" fill="#C4A35A" fillOpacity="0.3" stroke="#5A4123" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M38 38 Q38 22 50 22 Q62 22 62 38" stroke="#5A4123" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* Items inside */}
        <rect x="36" y="48" width="6" height="18" rx="2" fill="#5A8060" fillOpacity="0.4" />
        <circle cx="50" cy="56" r="6" fill="#B27060" fillOpacity="0.4" />
        <rect x="60" y="52" width="5" height="13" rx="1" fill="#4A7A73" fillOpacity="0.4" />
        {/* Checkmarks */}
        <path d="M78 28 L80 30 L84 24" stroke="#5A8060" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M78 36 L80 38 L84 32" stroke="#5A8060" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5" />
      </IconCard>
    ),
  }

  // Default icon
  const defaultIcon = (
    <IconCard size={size}>
      <circle cx="50" cy="45" r="18" fill="#C4A35A" fillOpacity="0.3" stroke="#5A4123" strokeWidth="1" />
      <path d="M42 42 L50 32 L58 42" stroke="#5A4123" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <line x1="50" y1="48" x2="50" y2="65" stroke="#5A4123" strokeWidth="1.2" strokeLinecap="round" />
    </IconCard>
  )

  return icons[category] || defaultIcon
}
