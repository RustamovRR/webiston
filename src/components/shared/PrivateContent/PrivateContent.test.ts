import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Every result that shows a visitor's data stays out of session replay.
 *
 * Read from the source, like `proxy.test.ts`: the masks are attributes, and a
 * refactor that drops one leaves a page that still works and still passes
 * every behaviour test — while Clarity and Yandex start recording passport
 * numbers. Each entry names the file and what it would leak.
 *
 * Fields need no entry: both recorders skip `<input>`/`<textarea>` on their
 * own. `DualTextPanel` holds its own default (see its tests). Deliberately
 * NOT listed: the Latin-Cyrillic converter, whose text the owner chose to see
 * (2026-10-26, disclosed in the privacy policy).
 */

const SRC = path.join(import.meta.dirname, "../../..")

const MASKED_OUTPUTS: Record<string, string> = {
  "modules/tools/Documents/components/DocumentSheet.tsx": "application letters",
  "modules/tools/Documents/templates/tatil/TatilFields.tsx": "leave dates",
  "modules/tools/ResumeBuilder/components/ResumeSheet.tsx": "the CV",
  "modules/tools/ResumeBuilder/components/DesignFields.tsx": "the CV photo",
  "modules/tools/ResumeBuilder/components/RowShell.tsx": "job/school rows",
  "modules/tools/ResumeBuilder/components/TagInput.tsx": "skills",
  "modules/tools/JwtDecoder/JwtDecoder.tsx": "decoded claims",
  "modules/tools/PasswordGenerator/components/PasswordDisplay.tsx": "passwords",
  "modules/tools/UrlEncoder/UrlEncoder.tsx": "URL query values",
  "modules/tools/NumberToWords/NumberToWords.tsx": "amounts",
  "modules/tools/OgMetaGenerator/components/SocialPreview.tsx": "OG preview",
  "modules/tools/OgMetaGenerator/components/OutputPanel.tsx": "meta tags",
  "modules/tools/QrGenerator/components/QrPreview.tsx": "QR content",
  "modules/tools/UuidGenerator/components/UuidList.tsx": "UUIDs",
  "modules/tools/UuidGenerator/components/InspectField.tsx": "inspected UUID",
  "modules/tools/IpInfo/components/IpHeadline.tsx": "the visitor's IP",
  "modules/tools/IpInfo/components/SignalsCard.tsx": "timezone signals",
  "modules/tools/IpInfo/components/LocationMap.tsx": "location tiles",
  "modules/tools/CameraRecorder/components/CaptureGallery.tsx": "captures",
  "components/shared/DetailList/DetailList.tsx": "device fingerprint, IP data",
  "components/shared/MediaAccessPanel/DeviceSelect.tsx": "device names"
}

describe("results holding visitor data", () => {
  it.each(Object.entries(MASKED_OUTPUTS))(
    "%s keeps %s out of session replay",
    (file) => {
      // Arrange
      const source = readFileSync(path.join(SRC, file), "utf8")

      // Act
      const masked =
        source.includes("<PrivateContent") ||
        (source.includes('data-clarity-mask="True"') &&
          source.includes("ym-hide-content"))

      // Assert
      expect(masked).toBe(true)
    }
  )
})
