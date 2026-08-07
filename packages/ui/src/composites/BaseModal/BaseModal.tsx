"use client"

/**
 * BaseModal — reusable modal built on Radix Dialog.
 *
 * Present/absent animation is Radix's own data-state + tw-animate-css CSS —
 * the exact pattern every other overlay in the product uses (dropdown-menu,
 * select, the shadcn dialog primitive). It used to be framer-motion's
 * AnimatePresence wrapped around the Radix portal: two presence managers
 * over one subtree, each entitled to keep it mounted, plus the whole of
 * framer-motion in the bundle for a fade the CSS idiom already provides.
 * One presence owner, one animation system across every overlay.
 */

import * as DialogPrimitive from "@radix-ui/react-dialog"
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
    <DialogPrimitive.Root
      open={isOpen}
      // Guarded: onOpenChange also fires with `true`, and handing it `onClose`
      // directly would close the parent's state during open.
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in" />
        <DialogPrimitive.Content
          onInteractOutside={
            closeOnOverlayClick ? undefined : (event) => event.preventDefault()
          }
          className={cn(
            "-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-50 w-full",
            "rounded-xl border border-border bg-card shadow-2xl",
            "max-h-[90vh] overflow-hidden",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in",
            sizeVariants[size],
            className
          )}
        >
          {/* Close button */}
          {showCloseButton && (
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className={cn(
                  "absolute top-4 right-4 z-10 rounded-full p-1.5",
                  "text-muted-foreground hover:bg-accent hover:text-foreground",
                  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogPrimitive.Close>
          )}

          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

// Header component
export function BaseModalHeader({ children, className }: BaseModalHeaderProps) {
  return (
    <div className={cn("border-border border-b px-6 py-4", className)}>
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
      className={cn("font-semibold text-foreground text-lg", className)}
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
      className={cn("mt-1 text-muted-foreground text-sm", className)}
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
        "flex items-center justify-end gap-2 border-border border-t px-6 py-4",
        className
      )}
    >
      {children}
    </div>
  )
}
