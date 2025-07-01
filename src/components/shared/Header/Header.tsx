import { Search } from '@/components/shared/Search/Search'
import ThemeToggle from '@/components/shared/ThemeToggle/ThemeToggle'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import Link from 'next/link'
import Logo from './Logo'
import MobileMenuButton from './MobileMenuButton'

export default function Header() {
  return (
    <div className="container mx-auto">
      <div className="flex h-14 items-center px-4">
        <section className="flex items-center gap-6">
          <Logo />

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/tutorials" passHref>
                  <NavigationMenuTrigger className="relative cursor-pointer text-[#8A8A8E] dark:text-[#8D8D93]">
                    Darsliklar
                  </NavigationMenuTrigger>
                </Link>
                <NavigationMenuContent>
                  {/* TODO: Populate with actual tutorials */}
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li title="Asoslar">React asoslari bilan tanishing</li>
                    <li title="Hooks">React Hooks-ni o'rganing</li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </section>

        <section className="ml-auto flex items-center space-x-4">
          <Search />
          <ThemeToggle />
        </section>

        <section className="flex items-center justify-center">
          <MobileMenuButton />
        </section>
      </div>
    </div>
  )
}
