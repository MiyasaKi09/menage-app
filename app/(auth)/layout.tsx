import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[380px]">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow/70 to-yellow/40 rounded-lg flex items-center justify-center">
            <span className="font-sans font-semibold text-[14px] text-charcoal/60">M</span>
          </div>
          <span className="font-sans font-semibold text-lg text-charcoal/80">Menage</span>
        </Link>
        {children}
      </div>
    </div>
  )
}
