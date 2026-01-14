import { Metadata } from "next"
import { UserAgentAnalyzer } from "@/modules/tools"

export const metadata: Metadata = {
  title: "User Agent Analyzer | Webiston",
  description:
    "User Agent stringlarini tahlil qilish va brauzer ma'lumotlarini olish. Browser detection and device analysis tool.",
  keywords: [
    "User Agent analyzer",
    "User Agent parser",
    "User Agent tahlil",
    "Browser detection",
    "Device detection",
    "Browser analyzer",
    "User Agent decoder",
    "Bot detection",
    "Browser version",
    "Platform detection",
    "Developer tools",
    "Web analytics",
    "Webiston"
  ],
  openGraph: {
    title: "User Agent Analyzer | Webiston",
    description:
      "User Agent stringlarini tahlil qilish va brauzer ma'lumotlarini olish. Browser detection and device analysis tool.",
    type: "website",
    locale: "uz_UZ",
    siteName: "Webiston"
  },
  twitter: {
    card: "summary_large_image",
    title: "User Agent Analyzer | Webiston",
    description:
      "User Agent stringlarini tahlil qilish va brauzer ma'lumotlarini olish tool."
  },
  alternates: {
    canonical: "/tools/user-agent-analyzer",
    languages: {
      "uz-UZ": "/tools/user-agent-analyzer",
      "en-US": "/tools/user-agent-analyzer"
    }
  }
}

const UserAgentAnalyzerPage = () => {
  return <UserAgentAnalyzer />
}

export default UserAgentAnalyzerPage
