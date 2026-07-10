import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Size in px for the square mark. Wordmark auto-scales. */
  size?: number;
  /** Show "CreateOS" wordmark next to the mark. Default true. */
  withWordmark?: boolean;
  /** Use light wordmark (for dark backgrounds). Default false. */
  light?: boolean;
}

export function LogoMark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="createos-mark-grad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="28" fill="url(#createos-mark-grad)" />
      <path
        d="M 82 30 Q 50 30 50 60 Q 50 90 82 90"
        stroke="white"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M 60 48 L 78 60 L 60 72 Z" fill="white" />
      <g transform="translate(86 36)">
        <path
          d="M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z"
          fill="white"
          opacity="0.95"
        />
      </g>
    </svg>
  );
}

export function Logo({ className, size = 36, withWordmark = true, light = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {withWordmark && (
        <span
          className={cn(
            "font-display font-bold tracking-tight leading-none",
            light ? "text-white" : "text-foreground"
          )}
          style={{ fontSize: size * 0.55 }}
        >
          CreateOS
        </span>
      )}
    </div>
  );
}
