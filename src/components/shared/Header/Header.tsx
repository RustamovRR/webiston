import Link from "next/link"
import { useTranslations } from "next-intl"
import React from "react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib"
import LanguageSelector from "../LanguageSelector/LanguageSelector"
import Search from "../Search"
import ThemeToggle from "../ThemeToggle"
import Logo from "./Logo"
import MobileMenuButton from "./MobileMenuButton"

interface HeaderProps {
  showLanguageSelector?: boolean
}

export default function Header({ showLanguageSelector = true }: HeaderProps) {
  const t = useTranslations("Header")

  const books = [
    {
      id: "ai-engineering",
      title: "AI Engineering",
      description:
        "SI texnologiyalarini chuqur o'rganish uchun to'liq qo'llanma."
    },
    {
      id: "javascript-definitive-guide",
      title: "JavaScript The Definitive Guide",
      description: "JavaScript'ni chuqur o'rganish uchun to'liq qo'llanma."
    },
    {
      id: "fluent-react",
      title: "Fluent React",
      description:
        "React.js bo'yicha chuqurlashtirilgan bilimlar va ilg'or patternlar."
    }
  ]

  return (
    // Frosted, not near-opaque. At `bg-background/95` this bar was effectively
    // solid and carried no tint, so where the homepage hero's brand light began
    // — exactly at the header's bottom edge — there was a hard horizontal seam:
    // flat dark above the line, teal below it.
    //
    // At 65% with a real blur the light passes through continuously, so the seam
    // disappears at every scroll position with no scroll listener and no
    // scroll-driven timeline (see the note in hero.css for why the timeline
    // approach was measured and rejected). The heavier blur is what keeps
    // navigation readable once content scrolls underneath — it is doing the work
    // the missing 30% of opacity used to do.
    <div
      data-site-header
      className="sticky top-0 z-50 border-b border-border bg-background/65 backdrop-blur-xl"
    >
      {/* `h-(--header-height)` rather than `h-16`: hero.css reaches its backdrop
          up behind this bar by exactly this value, and two hardcoded `4rem`s in
          separate files is precisely the pair that drifts. */}
      <div className="mx-auto flex h-(--header-height) w-full max-w-[1536px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <section className="flex items-center gap-6">
          <Logo />
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="relative cursor-pointer bg-transparent text-[#8A8A8E] dark:text-[#8D8D93]">
                  <Link href="/books">{t("books")}</Link>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 max-md:max-w-[400px] max-md:!p-1 md:w-[500px]">
                    {books.map((book) => (
                      <ListItem
                        key={book.id}
                        href={`/books/${book.id}`}
                        title={book.title}
                      >
                        {book.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className="relative cursor-pointer bg-transparent text-[#8A8A8E] dark:text-[#8D8D93]"
                >
                  <Link href="/tools">{t("tools")}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </section>

        <section className="flex items-center space-x-2">
          <div className="hidden items-center gap-2 md:flex">
            <Search />
            {showLanguageSelector && <LanguageSelector />}
            <ThemeToggle />
          </div>
          <div className="md:hidden">
            <MobileMenuButton />
          </div>
        </section>
      </div>
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none",
            className
          )}
          {...props}
        >
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
