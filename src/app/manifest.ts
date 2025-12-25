import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Webiston - Professional Online Tools",
    short_name: "Webiston",
    description:
      "QR kod yaratish, parol generator va boshqa professional vositalar",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    orientation: "portrait",
    categories: ["productivity", "utilities", "developer"],
    lang: "uz",
    icons: [
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png"
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png"
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png"
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    shortcuts: [
      {
        name: "QR Kod Generator",
        short_name: "QR Generator",
        description: "Tez QR kod yaratish",
        url: "/tools/qr-generator",
        icons: [{ src: "/icons/qr-generator.png", sizes: "96x96" }]
      },
      {
        name: "Parol Generator",
        short_name: "Password Gen",
        description: "Xavfsiz parol yaratish",
        url: "/tools/password-generator",
        icons: [{ src: "/icons/password-generator.png", sizes: "96x96" }]
      }
    ]
  }
}
