import { socialLinks } from "@/constants"
import { useTranslations } from "next-intl"

export default function Footer() {
  const t = useTranslations("Footer")
  return (
    <footer className="border-border flex w-full flex-col !items-center !justify-center gap-4 border-t p-6 sm:items-start">
      <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
        {socialLinks.map(({ id, href, icon, label }) => (
          <a
            key={id}
            href={href}
            aria-label={label}
            title={label}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-current opacity-70 transition-all duration-300 hover:text-gray-900 hover:opacity-100 dark:hover:text-gray-100"
          >
            {icon}
          </a>
        ))}
      </div>

      <p className="mt-2 text-center text-xs opacity-80 sm:text-left">
        {new Date().getFullYear()} Webiston. {t("allRightsReserved")}
      </p>
    </footer>
  )
}
