import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Background orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[250px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(ellipse, rgb(196,163,90), transparent 70%)' }} />
      </div>

      <div className="w-full max-w-[380px] relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10 group">
          <div className="w-9 h-9 bg-gradient-to-br from-yellow to-yellow/50 rounded-xl flex items-center justify-center shadow-golden transition-transform duration-200 group-hover:scale-105">
            <span className="font-serif font-bold text-[15px] text-charcoal/80">K</span>
          </div>
          <span className="font-serif font-bold text-[18px] text-charcoal/85 tracking-tight">the keep</span>
        </Link>

        {children}
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-charcoal/[0.06] to-transparent" />
    </div>
  )
}
