import { describe, expect, it } from "vitest"

import en from "../../../../../messages/tools/rezyume/en.json"
import ru from "../../../../../messages/tools/rezyume/ru.json"
import uz from "../../../../../messages/tools/rezyume/uz.json"
import { FAQ_KEYS } from "../constants"
import { applicationSchema, generateFAQSchema } from "./schemas"

/**
 * The FAQ's failure mode is not a wrong answer — it is a MISSING one.
 *
 * `FAQ_KEYS` drives both the visible accordion and the `FAQPage` structured
 * data. Add a key without its copy and next-intl renders the raw key path into
 * a rich result, which is the exact class of bug that already shipped once on
 * this page (`t("skills")` printing "ResumePage.form.skills"). `pnpm i18n`
 * proves the three locales agree with each other; only this proves they agree
 * with the code.
 */

const BUNDLES = { uz, en, ru } as const

describe("resume FAQ", () => {
  it("has a question and an answer in every locale", () => {
    // Arrange / Act / Assert
    for (const [locale, bundle] of Object.entries(BUNDLES)) {
      const items = bundle.ResumePage.faq.items as Record<
        string,
        { question?: string; answer?: string }
      >
      for (const key of FAQ_KEYS) {
        expect(items[key]?.question, `${locale}.${key}.question`).toBeTruthy()
        expect(items[key]?.answer, `${locale}.${key}.answer`).toBeTruthy()
      }
    }
  })

  it("publishes every visible question as structured data", () => {
    // Arrange — the schema takes the translator the accordion uses, so a
    // stand-in that echoes the key proves the mapping, not the copy.
    const t = ((key: string) => key) as never

    // Act
    const schema = generateFAQSchema(t)

    // Assert
    expect(schema["@type"]).toBe("FAQPage")
    expect(schema.mainEntity).toHaveLength(FAQ_KEYS.length)
    expect(schema.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer")
  })

  it("claims only features the tool actually ships", () => {
    // Arrange / Act — the P1 list predated docx, the second template and the
    // script toggle, so the schema under-sold the tool for three phases.
    const features = applicationSchema.featureList.join(" ")

    // Assert
    expect(features).toContain("docx")
    expect(features).toContain("kirill")
    expect(features).toContain("Zamonaviy")
  })
})
