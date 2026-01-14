import { Metadata } from "next"
import { KeycodeInfo } from "@/modules/tools"

export const metadata: Metadata = {
  title: "Keycode Ma'lumotlari - Keyboard Key Info Tool | Webiston",
  description:
    "Klaviatura tugmalarining kodlarini va ma'lumotlarini aniqlash tool. Professional keyboard keycode detector va analyzer. Get keyboard key codes, detect key events.",
  keywords: [
    "keycode info",
    "klaviatura kodlari",
    "keyboard codes",
    "key codes",
    "keycode detector",
    "keyboard events",
    "key events",
    "keyboard tester",
    "tugma kodlari",
    "klaviatura test",
    "ASCII codes",
    "key bindings",
    "keyboard shortcuts",
    "key mapping",
    "input events",
    "event codes",
    "JavaScript keycode",
    "developer tools",
    "dasturlash vositalari",
    "webiston tools",
    "foydali vositalar"
  ],
  authors: [{ name: "Webiston" }],
  creator: "Webiston",
  publisher: "Webiston",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  alternates: {
    canonical: "/tools/keycode-info",
    languages: {
      "uz-UZ": "/tools/keycode-info",
      "en-US": "/tools/keycode-info"
    }
  },
  openGraph: {
    title: "Keycode Ma'lumotlari - Professional Keyboard Key Info Tool",
    description:
      "Klaviatura tugmalarining kodlarini va ma'lumotlarini aniqlash. Professional keycode detector va analyzer.",
    type: "website",
    locale: "uz_UZ",
    siteName: "Webiston",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Keycode Ma'lumotlari Tool"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Keycode Ma'lumotlari - Keyboard Key Info Tool",
    description:
      "Klaviatura tugmalarining kodlarini va ma'lumotlarini aniqlash tool.",
    images: ["/logo.png"]
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

// Structured Data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Keycode Ma'lumotlari - Keyboard Key Info",
  description:
    "Professional klaviatura tugma kodlarini aniqlash va ma'lumot olish vositasi",
  url: "https://webiston.uz/tools/keycode-info",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  permissions: "keyboard",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD"
  },
  author: {
    "@type": "Organization",
    name: "Webiston",
    url: "https://webiston.uz"
  },
  featureList: [
    "Real-time Keycode Detection",
    "Key Event Analysis",
    "Keyboard Shortcuts Testing",
    "Common Keys Reference",
    "Key History Tracking",
    "Professional Interface",
    "Copy Key Information",
    "Modifier Keys Support"
  ]
}

const KeycodeInfoPage = () => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <KeycodeInfo />
    </>
  )
}

export default KeycodeInfoPage
