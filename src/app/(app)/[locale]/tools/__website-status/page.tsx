import { Metadata } from "next"
import { WebsiteStatus } from "@/modules/tools"

export const metadata: Metadata = {
  title: "Website Status - Sayt Holati Tekshirish | Webiston",
  description:
    "Professional website status checker. Sayt holatini tekshirish, server javob vaqtini o'lchash va SSL sertifikat tahlili. Real-time website monitoring tool.",
  keywords: [
    "website status checker",
    "sayt holati tekshirish",
    "server monitoring",
    "website uptime",
    "HTTP status checker",
    "SSL certificate check",
    "website performance",
    "site availability",
    "response time checker",
    "website analyzer",
    "webiston tools"
  ],
  openGraph: {
    title: "Website Status - Sayt Holati Tekshirish | Webiston",
    description:
      "Professional website status checker. Sayt holatini tekshirish, server javob vaqtini o'lchash va SSL sertifikat tahlili.",
    type: "website",
    locale: "uz_UZ",
    siteName: "Webiston"
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Status - Sayt Holati Tekshirish | Webiston",
    description:
      "Professional website status checker. Sayt holatini tekshirish va performance tahlili."
  },
  alternates: {
    canonical: "/tools/website-status",
    languages: {
      "uz-UZ": "/tools/website-status",
      "en-US": "/tools/website-status"
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
}

const WebsiteStatusPage = () => {
  return <WebsiteStatus />
}

export default WebsiteStatusPage
