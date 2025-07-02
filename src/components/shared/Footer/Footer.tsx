export default function Footer() {
  return (
    <footer className="border-border border-t">
      <div className="container mx-auto flex h-[54px] items-center justify-between gap-4 px-4 max-sm:h-auto max-sm:flex-col max-sm:justify-center max-sm:gap-2 max-sm:py-4">
        <p className="text-[#8A8A8E] max-sm:order-1 dark:text-[#8D8D93]">
          {new Date().getFullYear()} Webiston. Barcha huquqlar himoyalangan.
        </p>
        <div className="flex items-center gap-6 max-[480px]:flex-col max-[480px]:gap-2">
          <p className="text-[#8A8A8E] max-[480px]:order-1 dark:text-[#8D8D93]">
            So'nggi yangilanishlar uchun ijtimoiy tarmoqlarimizga obuna bo'ling.
          </p>
          {/* <div className="flex items-center gap-4">
          <SocialMedia />
        </div> */}
        </div>
      </div>
    </footer>
  )
}
