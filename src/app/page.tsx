import { CircleIcon, ReactIcon, JavascriptIcon, ArrowRightIcon } from '@/assets/icons'
import { ButtonLink, Card, SectionTitle } from '@/components'
import { REACT_CHAPTERS } from '@/constants'

export default function HomePage() {
  return (
    <div className="w-full px-16 pb-16 max-sm:px-6">
      <header className="background-pattern mt-8 flex h-full min-h-screen w-full flex-col items-center gap-10 p-10 pt-20 text-center max-lg:px-0">
        <div className="horizontal-line-1 max-sm:hidden"></div>
        <div className="horizontal-line-2 max-sm:hidden"></div>
        <div className="horizontal-line-3 max-sm:hidden"></div>
        <div className="horizontal-line-4 max-sm:hidden"></div>

        <div className="vertical-line-1 max-sm:hidden"></div>
        <div className="vertical-line-2 max-sm:hidden"></div>

        <CircleIcon className="animate-fadeIn absolute left-[12%] top-[20%] max-sm:hidden" />
        <CircleIcon className="animate-fadeIn absolute right-[32%] top-[70%] max-sm:hidden" />

        <h1 className="animate-fadeInText bg-gradient-text bg-clip-text p-6 text-7xl font-extrabold text-transparent max-xl:text-dynamic max-lg:text-5xl max-md:p-0">
          Veb texnologiyalar dunyosiga teran nigoh{' '}
        </h1>

        <p className="animate-fadeInText max-w-[750px] text-center text-xl text-gray-primary md:!w-full">
          Ushbu platforma orqali JavaScript, React, va TypeScript kabi zamonaviy texnologiyalarning ichki ishlashini
          chuqur tushunib, ularda yuqori darajadagi bilim va tajribaga ega bo'ling.
        </p>

        <div className="mt-10 flex gap-2">
          <ButtonLink href="/docs" variant="secondary" className="group">
            O'rganishni boshlash{' '}
            <span className="ml-2 transform transition-all duration-300 ease-in-out group-hover:translate-x-1">
              <ArrowRightIcon />
            </span>
          </ButtonLink>
        </div>
      </header>

      <section className="group flex w-full flex-col gap-8">
        <SectionTitle
          title={
            <div>
              React - <i>"Fluent React"</i> kitobi tarjimasi
            </div>
          }
          description="React kutubxonasining ichki ishlash mexanizmlari."
          icon={<ReactIcon className="h-10 w-10 duration-300 ease-in-out group-hover:scale-110" />}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {REACT_CHAPTERS.map((card, index) => (
            <Card key={index} href={card.href} title={card.title} description={card.description} />
          ))}
        </div>
      </section>

      <section className="mt-12 flex w-full flex-col gap-8">
        <SectionTitle
          title={
            <div>
              JavaScript - <i>"JavaScript: The Definitive Guide, 7th Edition"</i> kitobi tarjimasi
            </div>
          }
          description="Tez kunda..."
          icon={<JavascriptIcon className="h-10 w-10" />}
          disabled
        />
      </section>
    </div>
  )
}
