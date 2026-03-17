export function RainbowBar() {
  // Rosette colors matching watercolor palette
  const rosettes = [
    { petals: '#C88B7A', center: '#B27060' },  // coral
    { petals: '#4A7A73', center: '#3A6A63' },  // teal
    { petals: '#C88B7A', center: '#B27060' },  // coral
    { petals: '#5A8060', center: '#4A7050' },  // sage
    { petals: '#C88B7A', center: '#B27060' },  // coral
    { petals: '#4A7A73', center: '#3A6A63' },  // teal
    { petals: '#C88B7A', center: '#B27060' },  // coral
    { petals: '#5A8060', center: '#4A7050' },  // sage
    { petals: '#C88B7A', center: '#B27060' },  // coral
    { petals: '#4A7A73', center: '#3A6A63' },  // teal
    { petals: '#C88B7A', center: '#B27060' },  // coral
    { petals: '#5A8060', center: '#4A7050' },  // sage
  ]

  return (
    <div className="w-full h-6 bg-cream/50 flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 600 24"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {rosettes.map((r, i) => {
          const cx = 25 + i * 50
          const cy = 12
          return (
            <g key={i} transform={`translate(${cx}, ${cy})`} opacity="0.7">
              {/* 4-petal rosette */}
              <ellipse rx="5" ry="9" fill={r.petals} opacity="0.6" />
              <ellipse rx="5" ry="9" fill={r.petals} opacity="0.6" transform="rotate(90)" />
              <ellipse rx="4" ry="7" fill={r.petals} opacity="0.4" transform="rotate(45)" />
              <ellipse rx="4" ry="7" fill={r.petals} opacity="0.4" transform="rotate(135)" />
              {/* Center dot */}
              <circle r="2.5" fill={r.center} opacity="0.8" />
              <circle r="1" fill="#F0E4D0" opacity="0.6" />
            </g>
          )
        })}
        {/* Thin connecting line */}
        <line x1="0" y1="12" x2="600" y2="12" stroke="#4B3C2A" strokeWidth="0.3" opacity="0.2" />
      </svg>
    </div>
  )
}
