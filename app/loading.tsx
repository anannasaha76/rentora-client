export default function Loading() {
  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-4 py-16">
      <div className="relative flex flex-col items-center">
        {/* Animated outer ring */}
        <div className="relative flex size-20 items-center justify-center">
          <div className="absolute size-20 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <div className="absolute size-14 animate-pulse rounded-full bg-primary/10" />
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-md">
            R
          </span>
        </div>

        {/* Brand & Loading Indicator */}
        <div className="mt-6 flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Loading Rentora
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Preparing your equipment and rental details...
          </p>
        </div>

        {/* Subtle animated bouncing dots */}
        <div className="mt-4 flex items-center gap-1.5">
          <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
          <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
          <span className="size-2 animate-bounce rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}
