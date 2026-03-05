"use client"

/**
 * BaseModal - Reusable modal component with Framer Motion animations
 * Built on top of Radix Dialog for accessibility
 * Supports multiple sizes: sm, md, lg, xl, 2xl, full
 */

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "../../utils/cn"

// Size variants
const sizeVariants = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  full: "max-w-[95vw]"
} as const

type ModalSize = keyof typeof sizeVariants

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  size?: ModalSize
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}

interface BaseModalHeaderProps {
  children: ReactNode
  className?: string
}

interface BaseModalBodyProps {
  children: ReactNode
  className?: string
}

interface BaseModalFooterProps {
  children: ReactNode
  className?: string
}

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

const contentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 25, stiffness: 300 }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 }
  }
}

export function BaseModal({
  isOpen,
  onClose,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  className
}: BaseModalProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <DialogPrimitive.Portal forceMount>
            {/* Overlay */}
            <DialogPrimitive.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={closeOnOverlayClick ? onClose : undefined}
              />
            </DialogPrimitive.Overlay>

            {/* Content */}
            <DialogPrimitive.Content asChild>
              <motion.div
                className={cn(
                  "fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2",
                  "rounded-xl border border-zinc-200 bg-white shadow-2xl",
                  "dark:border-zinc-800 dark:bg-zinc-900",
                  "max-h-[90vh] overflow-hidden",
                  sizeVariants[size],
                  className
                )}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                {showCloseButton && (
                  <DialogPrimitive.Close asChild>
                    <button
                      className={cn(
                        "absolute top-4 right-4 z-10 rounded-full p-1.5",
                        "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100",
                        "dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800",
                        "transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      )}
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </DialogPrimitive.Close>
                )}

                {children}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}

// Header component
export function BaseModalHeader({ children, className }: BaseModalHeaderProps) {
  return (
    <div
      className={cn(
        "border-b border-zinc-200 px-6 py-4 dark:border-zinc-800",
        className
      )}
    >
      {children}
    </div>
  )
}

// Title component
export function BaseModalTitle({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "text-lg font-semibold text-zinc-900 dark:text-zinc-100",
        className
      )}
    >
      {children}
    </DialogPrimitive.Title>
  )
}

// Description component
export function BaseModalDescription({
  children,
  className
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <DialogPrimitive.Description
      className={cn("mt-1 text-sm text-zinc-500 dark:text-zinc-400", className)}
    >
      {children}
    </DialogPrimitive.Description>
  )
}

// Body component
export function BaseModalBody({ children, className }: BaseModalBodyProps) {
  return (
    <div className={cn("overflow-y-auto px-6 py-4", className)}>{children}</div>
  )
}

// Footer component
export function BaseModalFooter({ children, className }: BaseModalFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t border-zinc-200 px-6 py-4 dark:border-zinc-800",
        className
      )}
    >
      {children}
    </div>
  )
}
