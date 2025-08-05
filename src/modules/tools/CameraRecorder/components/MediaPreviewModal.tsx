'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import type { CapturedMedia } from '@/hooks/tools/useCameraRecorder'
import Image from 'next/image'

interface MediaPreviewModalProps {
  media: CapturedMedia | null
  onClose: () => void
}

export const MediaPreviewModal = ({ media, onClose }: MediaPreviewModalProps) => {
  if (!media) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.3 }}
          className="relative max-h-[90vh] max-w-[90vw] rounded-xl border border-zinc-800 bg-zinc-900 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="ghost" size="sm" className="absolute top-2 right-2 z-10 h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center">
            <h3 className="mb-4 text-lg font-semibold text-zinc-200">{media.filename}</h3>

            {media.type === 'screenshot' ? (
              <Image src={media.url} alt="Screenshot preview" className="max-h-[70vh] max-w-full rounded-lg" />
            ) : (
              <video src={media.url} controls className="max-h-[70vh] max-w-full rounded-lg" />
            )}

            <div className="mt-4 text-sm text-zinc-400">
              <p>Vaqt: {media.timestamp.toLocaleString('uz-UZ')}</p>
              {media.size && <p>Hajm: {(media.size / 1024 / 1024).toFixed(2)} MB</p>}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
