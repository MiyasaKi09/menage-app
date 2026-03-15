import React from 'react'

interface CategoryIconProps {
  category: string
  size?: number
}

export function CategoryIcon({ category, size = 60 }: CategoryIconProps) {
  const icons: Record<string, React.ReactElement> = {
    'Cuisine & Vaisselle': (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* Stack of plates */}
        <ellipse cx="50" cy="75" rx="35" ry="12" fill="#F2E6D2" opacity="0.9" />
        <ellipse cx="50" cy="70" rx="32" ry="10" fill="#D4AF37" />
        <ellipse cx="50" cy="65" rx="28" ry="8" fill="#B87333" />
        <ellipse cx="50" cy="60" rx="24" ry="6" fill="#F2E6D2" />
        {/* Fork */}
        <rect x="20" y="25" width="3" height="30" fill="#3E3023" rx="1" />
        <rect x="18" y="25" width="2" height="8" fill="#3E3023" />
        <rect x="21" y="25" width="2" height="8" fill="#3E3023" />
        <rect x="24" y="25" width="2" height="8" fill="#3E3023" />
        {/* Spoon */}
        <rect x="75" y="25" width="4" height="30" fill="#3E3023" rx="1" />
        <ellipse cx="77" cy="22" rx="5" ry="4" fill="#3E3023" />
      </svg>
    ),
    'Sanitaire': (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* Water drops */}
        <ellipse cx="25" cy="30" rx="6" ry="8" fill="#385FA8" opacity="0.8" />
        <ellipse cx="45" cy="25" rx="6" ry="8" fill="#385FA8" opacity="0.8" />
        <ellipse cx="65" cy="30" rx="6" ry="8" fill="#385FA8" opacity="0.8" />
        <ellipse cx="80" cy="25" rx="6" ry="8" fill="#385FA8" opacity="0.8" />
        {/* Toilet */}
        <rect x="30" y="50" width="40" height="30" rx="8" fill="#F2E6D2" stroke="#3E3023" strokeWidth="3" />
        <ellipse cx="50" cy="50" rx="18" ry="10" fill="#385FA8" opacity="0.3" />
        {/* Sparkles */}
        <path d="M75 60 L78 65 L83 65 L79 69 L81 74 L75 71 L69 74 L71 69 L67 65 L72 65 Z" fill="#D4AF37" />
        <path d="M20 65 L22 68 L25 68 L22 70 L23 73 L20 71 L17 73 L18 70 L15 68 L18 68 Z" fill="#D4AF37" />
      </svg>
    ),
    'Textile': (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* Folded fabric layers */}
        <path d="M10 30 Q30 20 50 30 T90 30 L90 45 Q70 35 50 45 T10 45 Z" fill="#8B2323" opacity="0.9" />
        <path d="M10 45 Q30 35 50 45 T90 45 L90 60 Q70 50 50 60 T10 60 Z" fill="#F2E6D2" />
        <path d="M10 60 Q30 50 50 60 T90 60 L90 75 Q70 65 50 75 T10 75 Z" fill="#385FA8" opacity="0.9" />
        {/* Iron */}
        <path d="M25 20 L40 20 L45 25 L45 30 L20 30 L20 25 Z" fill="#3E3023" />
        <rect x="22" y="18" width="16" height="2" fill="#D4AF37" />
      </svg>
    ),
    'Salon & Espaces Communs': (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* Sofa */}
        <rect x="20" y="45" width="60" height="30" rx="5" fill="#8046A8" />
        <rect x="15" y="40" width="10" height="35" rx="3" fill="#8046A8" />
        <rect x="75" y="40" width="10" height="35" rx="3" fill="#8046A8" />
        <rect x="20" y="35" width="60" height="10" rx="5" fill="#8046A8" opacity="0.7" />
        {/* Cushions */}
        <rect x="30" y="38" width="15" height="12" rx="2" fill="#D4AF37" opacity="0.8" />
        <rect x="55" y="38" width="15" height="12" rx="2" fill="#B87333" opacity="0.8" />
        {/* Rug pattern */}
        <line x1="15" y1="80" x2="85" y2="80" stroke="#2E8B57" strokeWidth="3" />
        <line x1="15" y1="85" x2="85" y2="85" stroke="#8B2323" strokeWidth="3" />
        <line x1="15" y1="90" x2="85" y2="90" stroke="#385FA8" strokeWidth="3" />
      </svg>
    ),
    'Extérieur & Plantes': (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* Plant pot */}
        <path d="M35 70 L40 90 L60 90 L65 70 Z" fill="#B87333" />
        <rect x="38" y="88" width="24" height="8" fill="#5A280F" />
        {/* Leaves */}
        <ellipse cx="50" cy="50" rx="12" ry="20" fill="#2E8B57" transform="rotate(-20 50 50)" />
        <ellipse cx="45" cy="45" rx="10" ry="18" fill="#2E8B57" transform="rotate(30 45 45)" opacity="0.8" />
        <ellipse cx="55" cy="48" rx="11" ry="19" fill="#2E8B57" transform="rotate(-45 55 48)" opacity="0.9" />
        {/* Stem */}
        <rect x="48" y="50" width="4" height="25" fill="#12321E" />
        {/* Sun */}
        <circle cx="80" cy="20" r="8" fill="#D4AF37" />
        <line x1="80" y1="10" x2="80" y2="5" stroke="#D4AF37" strokeWidth="2" />
        <line x1="88" y1="20" x2="93" y2="20" stroke="#D4AF37" strokeWidth="2" />
        <line x1="72" y1="20" x2="67" y2="20" stroke="#D4AF37" strokeWidth="2" />
        <line x1="80" y1="28" x2="80" y2="33" stroke="#D4AF37" strokeWidth="2" />
      </svg>
    ),
    'Sols & Surfaces': (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* Mop */}
        <line x1="30" y1="20" x2="40" y2="80" stroke="#5A280F" strokeWidth="3" />
        <ellipse cx="42" cy="85" rx="12" ry="8" fill="#385FA8" opacity="0.6" />
        <path d="M35 80 Q42 88 49 80" stroke="#F2E6D2" strokeWidth="2" fill="none" />
        <path d="M34 83 Q42 90 50 83" stroke="#F2E6D2" strokeWidth="2" fill="none" />
        {/* Bucket */}
        <path d="M55 60 L60 85 L80 85 L85 60 Z" fill="#8B2323" />
        <ellipse cx="70" cy="60" rx="15" ry="5" fill="#8B2323" />
        {/* Water/bubbles */}
        <circle cx="68" cy="70" r="3" fill="#385FA8" opacity="0.5" />
        <circle cx="73" cy="67" r="2" fill="#385FA8" opacity="0.5" />
        <circle cx="65" cy="75" r="2.5" fill="#385FA8" opacity="0.5" />
        {/* Sparkle */}
        <path d="M20 40 L22 44 L26 44 L23 47 L24 51 L20 48 L16 51 L17 47 L14 44 L18 44 Z" fill="#D4AF37" />
      </svg>
    ),
    'Rangement': (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* Shelf unit */}
        <rect x="25" y="20" width="50" height="60" fill="none" stroke="#3E3023" strokeWidth="4" />
        <line x1="25" y1="40" x2="75" y2="40" stroke="#3E3023" strokeWidth="4" />
        <line x1="25" y1="60" x2="75" y2="60" stroke="#3E3023" strokeWidth="4" />
        {/* Items on shelves */}
        <rect x="30" y="24" width="12" height="12" fill="#B87333" />
        <rect x="45" y="26" width="10" height="10" fill="#385FA8" />
        <rect x="58" y="25" width="14" height="11" fill="#D4AF37" />
        <circle cx="35" cy="50" r="6" fill="#2E8B57" />
        <rect x="45" y="46" width="20" height="8" fill="#8046A8" />
        <rect x="30" y="65" width="15" height="10" fill="#8B2323" />
        <circle cx="58" cy="70" r="7" fill="#D4AF37" />
        {/* Arrow indicating organization */}
        <path d="M85 35 L85 50 L90 45 Z" fill="#2E8B57" />
      </svg>
    ),
    'Courses & Gestion': (
      <svg viewBox="0 0 100 100" width={size} height={size}>
        {/* Shopping bag */}
        <path d="M30 35 L25 80 L75 80 L70 35 Z" fill="#D4AF37" stroke="#3E3023" strokeWidth="3" />
        <path d="M35 35 Q35 20 50 20 Q65 20 65 35" stroke="#3E3023" strokeWidth="3" fill="none" />
        {/* Items in bag */}
        <rect x="35" y="45" width="8" height="20" fill="#2E8B57" />
        <circle cx="50" cy="55" r="8" fill="#8B2323" />
        <rect x="60" y="50" width="6" height="15" fill="#385FA8" />
        {/* Checkmarks */}
        <path d="M80 25 L83 28 L88 20" stroke="#2E8B57" strokeWidth="2" fill="none" />
        <path d="M80 35 L83 38 L88 30" stroke="#2E8B57" strokeWidth="2" fill="none" />
        <path d="M80 45 L83 48 L88 40" stroke="#2E8B57" strokeWidth="2" fill="none" />
      </svg>
    ),
  }

  // Default icon if category not found
  const defaultIcon = (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <circle cx="50" cy="50" r="30" fill="#D4AF37" />
      <path d="M40 40 L50 30 L60 40" stroke="#3E3023" strokeWidth="3" fill="none" />
      <rect x="48" y="45" width="4" height="25" fill="#3E3023" />
    </svg>
  )

  return icons[category] || defaultIcon
}
