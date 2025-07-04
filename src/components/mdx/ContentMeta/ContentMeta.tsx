import { ArrowUpRightIcon } from 'lucide-react'
import Link from 'next/link'

interface ContentMetaProps {
  updatedAt?: string | null
}

export default function ContentMeta({ updatedAt }: ContentMetaProps) {
  return (
    <div className="my-0 flex items-center justify-between border-b border-[#F2F2F7] py-5 max-sm:flex-col max-sm:gap-2 dark:border-[#151515]">
      <Link
        href={`https://github.com/RustamovRR/webiston/issues/new`}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2"
      >
        <span className="text-[15px] font-normal text-[#8D8D93] transition-colors duration-200 group-hover:text-black dark:group-hover:text-white">
          Kontentni yaxshilash uchun GitHub muammosini yuborish
        </span>
        <ArrowUpRightIcon className="stroke-[1px] text-[#8D8D93] duration-200 group-hover:text-black dark:group-hover:text-white" />
      </Link>
      {updatedAt && (
        <div className="text-muted-foreground text-sm">
          Oxirgi yangilanish:{' '}
          {new Date(updatedAt).toLocaleDateString('uz-UZ', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      )}
    </div>
  )
}
