"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface RentoraIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  size?: number | string
}

/**
 * Rentora Icon Mark
 * Distinctive modern equipment monogram with circulation rental loop & forward dynamic tread
 */
export function RentoraIcon({ className, size = 32, ...props }: RentoraIconProps) {
  const idPrefix = React.useId()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      width={size}
      height={size}
      className={cn("shrink-0 select-none transition-transform duration-200", className)}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient
          id={`${idPrefix}-grad`}
          x1="0"
          y1="0"
          x2="48"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="55%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient
          id={`${idPrefix}-highlight`}
          x1="0"
          y1="0"
          x2="0"
          y2="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={`${idPrefix}-accent`}
          x1="16"
          y1="14"
          x2="36"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <filter id={`${idPrefix}-shadow`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#047857" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Squircle Badge Container */}
      <rect
        x="2.5"
        y="2.5"
        width="43"
        height="43"
        rx="12"
        fill={`url(#${idPrefix}-grad)`}
        filter={`url(#${idPrefix}-shadow)`}
      />
      {/* 3D Glass / Specular Arc */}
      <rect
        x="3.5"
        y="3.5"
        width="41"
        height="20"
        rx="11"
        fill={`url(#${idPrefix}-highlight)`}
      />

      {/* R Stem (Equipment Mast) */}
      <rect x="12" y="11" width="5.5" height="26" rx="2.75" fill="#ffffff" />

      {/* R Circulation Loop (Continuous Rental Loop) */}
      <path
        d="M14.5 11H24.5C28.642 11 32 14.358 32 18.5C32 22.642 28.642 26 24.5 26H14.5"
        stroke="#ffffff"
        strokeWidth="5.5"
        strokeLinecap="round"
      />

      {/* Forward-Driving Dynamic Kick Leg */}
      <path
        d="M22 24L31.5 35.5C32.2 36.3 33.5 36.3 34.2 35.5C34.8 34.8 34.7 33.8 34 33L25.5 23.5"
        fill={`url(#${idPrefix}-accent)`}
        stroke={`url(#${idPrefix}-accent)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Circulation Indicator Notch */}
      <path
        d="M23.5 22.5L26 25L23.5 27.5"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Axis Hub Pin */}
      <circle cx="24.5" cy="18.5" r="2.5" fill="#ffffff" />
      <circle cx="24.5" cy="18.5" r="1.3" fill="#059669" />
    </svg>
  )
}

export interface RentoraLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  iconOnly?: boolean
  showText?: boolean
  withTagline?: boolean
  className?: string
  iconClassName?: string
  textClassName?: string
  href?: string | null
}

const sizeConfig = {
  xs: { iconSize: 24, textSize: "text-base tracking-tight", tagSize: "text-[9px]" },
  sm: { iconSize: 32, textSize: "text-lg tracking-tight", tagSize: "text-[10px]" },
  md: { iconSize: 38, textSize: "text-xl tracking-tight", tagSize: "text-[11px]" },
  lg: { iconSize: 46, textSize: "text-2xl tracking-tight", tagSize: "text-xs" },
  xl: { iconSize: 56, textSize: "text-3xl tracking-tight", tagSize: "text-sm" },
}

/**
 * Full Rentora Brand Logo
 * Combines RentoraIcon with stylized wordmark typography
 */
export function RentoraLogo({
  size = "sm",
  iconOnly = false,
  showText = true,
  withTagline = false,
  className,
  iconClassName,
  textClassName,
  href = "/",
}: RentoraLogoProps) {
  const cfg = sizeConfig[size] || sizeConfig.sm

  const content = (
    <span
      className={cn(
        "group inline-flex items-center gap-2.5 font-bold select-none",
        !href && className
      )}
    >
      <RentoraIcon
        size={cfg.iconSize}
        className={cn(
          "transition-all duration-300 group-hover:scale-105 group-hover:shadow-md",
          iconClassName
        )}
      />

      {!iconOnly && showText && (
        <span className="flex flex-col">
          <span
            className={cn(
              "font-extrabold tracking-tight text-foreground transition-colors",
              cfg.textSize,
              textClassName
            )}
          >
            <span>Rent</span>
            <span className="text-primary">ora</span>
            <span className="ml-0.5 inline-block size-1.5 rounded-full bg-primary/80 align-baseline" />
          </span>

          {withTagline && (
            <span
              className={cn(
                "-mt-0.5 font-medium uppercase tracking-wider text-muted-foreground",
                cfg.tagSize
              )}
            >
              Equipment Rental
            </span>
          )}
        </span>
      )}
    </span>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex items-center outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg",
          className
        )}
      >
        {content}
      </Link>
    )
  }

  return content
}
