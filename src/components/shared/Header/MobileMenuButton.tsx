'use client'

import { cn } from '@/lib'
import { useMobileMenuStore } from '@/stores'
import MobileMenu from './MobileMenu'

const MobileMenuButton = () => {
  const { isOpen, toggle, close } = useMobileMenuStore()

  return (
    <>
      <button className="flex cursor-pointer items-center justify-center lg:hidden" onClick={toggle}>
        <div className="relative ml-auto flex h-9 w-9 items-center justify-center">
          <span
            className={cn(
              'absolute top-3 left-2 h-0.5 w-5 transform rounded-full bg-current transition-all duration-200',
              isOpen ? 'top-4 rotate-45' : ''
            )}
          />
          <span
            className={cn(
              'absolute top-4.5 left-2 h-0.5 w-5 transform rounded-full bg-current transition-all duration-200',
              isOpen ? 'opacity-0' : ''
            )}
          />
          <span
            className={cn(
              'absolute top-6 left-2 h-0.5 w-5 transform rounded-full bg-current transition-all duration-200',
              isOpen ? 'top-4 -rotate-45' : ''
            )}
          />
        </div>
      </button>

      <MobileMenu isOpen={isOpen} onClose={close} />
    </>
  )
}

export default MobileMenuButton
