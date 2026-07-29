"use client"

import { Globe, ImageIcon, Link2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { StatsDisplay } from "@/components/shared"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface MetaData {
  title: string
  description: string
  image: string
  url: string
  siteName: string
  type: string
  locale: string
  twitterCard: string
  twitterSite: string
  twitterCreator: string
  imageSize?: string
}

interface FormPanelProps {
  metaData: MetaData
  inputStats: Array<{ label: string; value: number }>
  onUpdateField: (field: keyof MetaData, value: string) => void
}

const FormPanel: React.FC<FormPanelProps> = ({
  metaData,
  inputStats,
  onUpdateField
}) => {
  const t = useTranslations("OgMetaGeneratorPage.FormPanel")

  return (
    <div className="rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {t("status")}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <Globe size={16} />
            {t("basicInfo")}
          </h3>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="formpanel-titlelabel"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t("titleLabel")}
              </label>
              <Input
                id="formpanel-titlelabel"
                value={metaData.title}
                onChange={(e) => onUpdateField("title", e.target.value)}
                placeholder={t("titlePlaceholder")}
                className={`border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/50 ${
                  metaData.title.length > 70
                    ? "border-destructive"
                    : metaData.title.length > 50
                      ? "border-warning"
                      : metaData.title.length > 0
                        ? "border-success"
                        : ""
                }`}
              />
              <div className="mt-1 flex items-center justify-between">
                <div
                  className={`text-xs ${
                    metaData.title.length > 70
                      ? "text-red-500"
                      : metaData.title.length > 50
                        ? "text-yellow-500"
                        : metaData.title.length > 0
                          ? "text-green-500"
                          : "text-zinc-500 dark:text-zinc-500"
                  }`}
                >
                  {metaData.title.length}/70 {t("titleCounter")}
                </div>
                {metaData.title.length > 70 && (
                  <div className="text-xs text-red-500">
                    {t("tooLongError")}
                  </div>
                )}
                {metaData.title.length > 50 && metaData.title.length <= 70 && (
                  <div className="text-xs text-yellow-500">
                    {t("gettingLong")}
                  </div>
                )}
                {metaData.title.length > 0 && metaData.title.length <= 50 && (
                  <div className="text-xs text-green-500">{t("perfect")}</div>
                )}
              </div>
              {/* Progress bar */}
              <div className="mt-1 h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className={`h-1 rounded-full transition-all ${
                    metaData.title.length > 70
                      ? "bg-red-500"
                      : metaData.title.length > 50
                        ? "bg-yellow-500"
                        : metaData.title.length > 0
                          ? "bg-green-500"
                          : "bg-zinc-300"
                  }`}
                  style={{
                    width: `${Math.min((metaData.title.length / 70) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="formpanel-desclabel"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t("descLabel")}
              </label>
              <Textarea
                id="formpanel-desclabel"
                value={metaData.description}
                onChange={(e) => onUpdateField("description", e.target.value)}
                placeholder={t("descPlaceholder")}
                className={`min-h-[100px] border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/50 ${
                  metaData.description.length > 200
                    ? "border-destructive"
                    : metaData.description.length > 160
                      ? "border-warning"
                      : metaData.description.length > 0
                        ? "border-success"
                        : ""
                }`}
              />
              <div className="mt-1 flex items-center justify-between">
                <div
                  className={`text-xs ${
                    metaData.description.length > 200
                      ? "text-red-500"
                      : metaData.description.length > 160
                        ? "text-yellow-500"
                        : metaData.description.length > 0
                          ? "text-green-500"
                          : "text-zinc-500 dark:text-zinc-500"
                  }`}
                >
                  {metaData.description.length}/200 {t("titleCounter")}
                </div>
                {metaData.description.length > 200 && (
                  <div className="text-xs text-red-500">
                    {t("tooLongError")}
                  </div>
                )}
                {metaData.description.length > 160 &&
                  metaData.description.length <= 200 && (
                    <div className="text-xs text-yellow-500">
                      {t("gettingLong")}
                    </div>
                  )}
                {metaData.description.length > 0 &&
                  metaData.description.length <= 160 && (
                    <div className="text-xs text-green-500">{t("perfect")}</div>
                  )}
              </div>
              {/* Progress bar */}
              <div className="mt-1 h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className={`h-1 rounded-full transition-all ${
                    metaData.description.length > 200
                      ? "bg-red-500"
                      : metaData.description.length > 160
                        ? "bg-yellow-500"
                        : metaData.description.length > 0
                          ? "bg-green-500"
                          : "bg-zinc-300"
                  }`}
                  style={{
                    width: `${Math.min((metaData.description.length / 200) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="formpanel-imagelabel"
                className="mb-2 block flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                <ImageIcon size={16} />
                {t("imageLabel")}
              </label>
              <Input
                id="formpanel-imagelabel"
                value={metaData.image}
                onChange={(e) => onUpdateField("image", e.target.value)}
                placeholder={t("imagePlaceholder")}
                className="border-border bg-muted/50"
              />
            </div>

            <div>
              <label
                htmlFor="formpanel-urllabel"
                className="mb-2 block flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                <Link2 size={16} />
                {t("urlLabel")}
              </label>
              <Input
                id="formpanel-urllabel"
                value={metaData.url}
                onChange={(e) => onUpdateField("url", e.target.value)}
                placeholder={t("urlPlaceholder")}
                className="border-border bg-muted/50"
              />
            </div>

            <div>
              <label
                htmlFor="formpanel-sitenamelabel"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t("siteNameLabel")}
              </label>
              <Input
                id="formpanel-sitenamelabel"
                value={metaData.siteName}
                onChange={(e) => onUpdateField("siteName", e.target.value)}
                placeholder={t("siteNamePlaceholder")}
                className="border-border bg-muted/50"
              />
            </div>
          </div>

          {/* Advanced Settings - Compact Layout */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label
                htmlFor="formpanel-contenttype"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t("contentType")}
              </label>
              <Select
                value={metaData.type}
                onValueChange={(value) => onUpdateField("type", value)}
              >
                <SelectTrigger
                  id="formpanel-contenttype"
                  className="border-border bg-muted/50"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">🌐 {t("typeWebsite")}</SelectItem>
                  <SelectItem value="article">📰 {t("typeArticle")}</SelectItem>
                  <SelectItem value="video.other">
                    🎥 {t("typeVideo")}
                  </SelectItem>
                  <SelectItem value="book">📚 {t("typeBook")}</SelectItem>
                  <SelectItem value="profile">👤 {t("typeProfile")}</SelectItem>
                  <SelectItem value="music.song">
                    🎵 {t("typeMusic")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                htmlFor="formpanel-twittercard"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t("twitterCard")}
              </label>
              <Select
                value={metaData.twitterCard}
                onValueChange={(value) => onUpdateField("twitterCard", value)}
              >
                <SelectTrigger
                  id="formpanel-twittercard"
                  className="border-border bg-muted/50"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">📄 {t("cardSummary")}</SelectItem>
                  <SelectItem value="summary_large_image">
                    🖼️ {t("cardLargeImage")}
                  </SelectItem>
                  <SelectItem value="app">📱 {t("cardApp")}</SelectItem>
                  <SelectItem value="player">▶️ {t("cardPlayer")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label
                htmlFor="formpanel-language"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t("language")}
              </label>
              <Select
                value={metaData.locale}
                onValueChange={(value) => onUpdateField("locale", value)}
              >
                <SelectTrigger
                  id="formpanel-language"
                  className="border-border bg-muted/50"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uz_UZ">🇺🇿 {t("langUzbek")}</SelectItem>
                  <SelectItem value="en_US">🇺🇸 {t("langEnglish")}</SelectItem>
                  <SelectItem value="ru_RU">🇷🇺 {t("langRussian")}</SelectItem>
                  <SelectItem value="tr_TR">🇹🇷 {t("langTurkish")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                htmlFor="formpanel-imagesize"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t("imageSize")}
              </label>
              <Select
                value={metaData.imageSize || "1200x630"}
                onValueChange={(value) => onUpdateField("imageSize", value)}
              >
                <SelectTrigger
                  id="formpanel-imagesize"
                  className="border-border bg-muted/50"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1200x630">
                    📐 1200x630 ({t("recommended")})
                  </SelectItem>
                  <SelectItem value="1200x675">📐 1200x675 (16:9)</SelectItem>
                  <SelectItem value="1080x1080">
                    📐 1080x1080 ({t("square")})
                  </SelectItem>
                  <SelectItem value="800x600">📐 800x600 (4:3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label
                htmlFor="formpanel-twittersite"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t("twitterSite")}
              </label>
              <Input
                id="formpanel-twittersite"
                value={metaData.twitterSite}
                onChange={(e) => onUpdateField("twitterSite", e.target.value)}
                placeholder="@your_site"
                className="border-border bg-muted/50"
              />
            </div>

            <div>
              <label
                htmlFor="formpanel-twittercreator"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                {t("twitterCreator")}
              </label>
              <Input
                id="formpanel-twittercreator"
                value={metaData.twitterCreator}
                onChange={(e) =>
                  onUpdateField("twitterCreator", e.target.value)
                }
                placeholder="@author"
                className="border-border bg-muted/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Display */}
      <div className="mt-6 border-t border-border pt-6">
        <h4 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("inputStats")}
        </h4>
        <StatsDisplay stats={inputStats} />
      </div>
    </div>
  )
}

export default FormPanel
