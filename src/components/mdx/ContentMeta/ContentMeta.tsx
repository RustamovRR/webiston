interface ContentMetaProps {
  updatedAt?: string | null
}

export default function ContentMeta({ updatedAt }: ContentMetaProps) {
  return (
    // `border-border`, not a light hex plus a dark-mode hex override.
    //
    // ⚠️ NOTE FOR REVIEW, not a fix: every child of this element is commented
    // out, so all this component contributes to 226 chapter pages is an empty
    // 40px-tall bordered strip. `updatedAt` is accepted and never read, and
    // `TutorialContent` computes `frontmatter.updatedAt || new Date()` purely to
    // feed it. Deleting a component needs explicit approval, so it is listed in
    // the roadmap rather than removed here.
    <div className="my-0 flex items-center justify-between border-border border-b py-5 max-sm:flex-col max-sm:gap-2">
      {/* <Link
        href={`https://github.com/RustamovRR/webiston/issues/new`}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2"
      >
        <span className="text-[15px] font-normal text-[#8D8D93] transition-colors duration-200 group-hover:text-black dark:group-hover:text-white">
          Kontentni yaxshilash uchun Githubda muammo ochish
        </span>
        <ArrowUpRightIcon className="stroke-[1px] text-[#8D8D93] duration-200 group-hover:text-black dark:group-hover:text-white" />
      </Link> */}

      {/* temporary disabled */}
      {/* {updatedAt && (
        <div className="text-muted-foreground text-sm">
          Oxirgi yangilanish:{' '}
          {new Date(updatedAt).toLocaleDateString('uz-UZ', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      )} */}
    </div>
  )
}
