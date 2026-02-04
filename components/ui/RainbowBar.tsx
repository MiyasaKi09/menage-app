interface RainbowBarProps {
  size?: number
  gap?: number
}

export function RainbowBar({ size = 6, gap = 2 }: RainbowBarProps) {
  const colors = ['#ff3b5c', '#ff6b2c', '#ffe14f', '#00e676', '#00b4ff', '#b24bff']

  return (
    <div className="flex" style={{ gap }}>
      {colors.map((color, i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size * 5,
            backgroundColor: color,
            transition: 'transform 0.2s ease'
          }}
          className="cursor-pointer hover:scale-110"
        />
      ))}
    </div>
  )
}
