export function RainbowBar() {
  return (
    <div className="w-full h-1.5 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, #8B2323 0%, #D4AF37 25%, #2E8B57 50%, #385FA8 75%, #8046A8 100%)',
        }}
      />
      {/* Ornamental gold dots */}
      <div className="absolute inset-0 flex justify-between items-center px-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full bg-yellow/60"
          />
        ))}
      </div>
    </div>
  )
}
