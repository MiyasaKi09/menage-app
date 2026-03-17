export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-[20%] w-64 h-64 bg-yellow/6 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-[20%] w-48 h-48 bg-blue/5 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-yellow/80 to-orange/60 rounded-2xl mb-4">
            <span className="font-cinzel text-2xl font-bold text-charcoal/70">M</span>
          </div>
          <h1 className="font-cinzel text-2xl font-semibold text-charcoal tracking-wide">Menage</h1>
          <p className="font-medieval text-[11px] text-charcoal/35 tracking-widest mt-1">Aventure domestique</p>
        </div>
        {children}
      </div>
    </div>
  )
}
