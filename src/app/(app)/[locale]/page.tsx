import { CircleIcon, ReactIcon, JavascriptIcon, ArrowRightIcon, ToolsIcon } from '@/assets/icons'
import { ButtonLink, SimpleCard, SectionTitle } from '@/components/shared'
import { REACT_CHAPTERS, TOOLS_LIST } from '@/constants'
import { getTranslations } from 'next-intl/server'

export default async function HomePage() {
  const t = await getTranslations('HomePage')

  return (
    <div className="w-full px-16 pb-16 max-sm:px-6">
      <header className="background-pattern mt-8 flex h-full min-h-screen w-full flex-col items-center gap-10 p-10 pt-20 text-center max-lg:px-0">
        <div className="horizontal-line-1 max-sm:hidden"></div>
        <div className="horizontal-line-2 max-sm:hidden"></div>
        <div className="horizontal-line-3 max-sm:hidden"></div>
        <div className="horizontal-line-4 max-sm:hidden"></div>

        <div className="vertical-line-1 max-sm:hidden"></div>
        <div className="vertical-line-2 max-sm:hidden"></div>

        <CircleIcon className="animate-fadeIn absolute top-[20%] left-[12%] max-sm:hidden" />
        <CircleIcon className="animate-fadeIn absolute top-[70%] right-[32%] max-sm:hidden" />

        <h1 className="animate-fadeInText bg-gradient-text max-xl:text-dynamic bg-clip-text p-6 text-7xl font-extrabold text-transparent max-lg:text-5xl max-md:p-0">
          {t('title')}
        </h1>

        <p className="animate-fadeInText text-gray-primary max-w-[750px] text-center text-xl md:w-full!">
          {t('description')}
        </p>

        <div className="mt-10 flex gap-4">
          <ButtonLink href="/books" variant="secondary" className="group">
            {t('startLearning')}
            <span className="ml-2 transform transition-all duration-300 ease-in-out group-hover:translate-x-1">
              <ArrowRightIcon />
            </span>
          </ButtonLink>
          <ButtonLink href="/tools" variant="outline" className="group">
            {t('usefulTools')}
            <span className="ml-2 transform transition-all duration-300 ease-in-out group-hover:scale-110">
              <ToolsIcon className="h-4 w-4" />
            </span>
          </ButtonLink>
        </div>
      </header>

      <section className="group flex w-full flex-col gap-8">
        <SectionTitle
          title={t.rich('reactSectionTitle', {
            i: (chunks) => <i>{chunks}</i>,
          })}
          description={t('reactSectionDescription')}
          icon={<ReactIcon className="h-10 w-10 duration-300 ease-in-out group-hover:scale-110" />}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {REACT_CHAPTERS.map((card, index) => (
            <SimpleCard key={index} href={card.href} title={card.title} description={card.description} />
          ))}
        </div>
      </section>

      <section className="group mt-12 flex w-full flex-col gap-8">
        <SectionTitle
          title={t('toolsSectionTitle')}
          description={t('toolsSectionDescription')}
          icon={<ToolsIcon className="h-10 w-10 duration-300 ease-in-out group-hover:scale-110" />}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {TOOLS_LIST.map((tool, index) => (
            <SimpleCard key={index} href={tool.href} title={tool.title} description={tool.description} />
          ))}
        </div>
      </section>

      <section className="mt-12 flex w-full flex-col gap-8">
        <SectionTitle
          title={t.rich('jsSectionTitle', {
            i: (chunks) => <i>{chunks}</i>,
          })}
          description={t('jsSectionDescription')}
          icon={<JavascriptIcon className="h-10 w-10" />}
          disabled
        />
      </section>
    </div>
  )
}
