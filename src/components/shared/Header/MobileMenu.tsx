'use client'

import { cn } from '@/lib'
import { useEffect, useRef } from 'react'
import MobileMenuContent from './MobileMenuContent'
import { useParams } from 'next/navigation'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const params = useParams()
  const tutorialId = params?.slug?.[0] as string | undefined

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <div
      className={cn(
        'transition-opacity duration-500 ease-in-out',
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      <div
        ref={menuRef}
        className={cn(
          'bg-background fixed inset-x-0 top-0 z-50 mt-14 h-[calc(100vh-56px)] transition-opacity duration-300 ease-in-out',
          isOpen ? 'opacity-100' : 'opacity-50'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full pr-0">
          <div className="h-full px-4 [&>*]:pr-0">
            {isOpen && tutorialId && <MobileMenuContent tutorialId={tutorialId} onClose={onClose} />}
          </div>
        </div>
      </div>
    </div>
  )
}
