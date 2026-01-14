import Header from "@/components/shared/Header/Header"
import Footer from "@/components/shared/Footer/Footer"

export default function BooksLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header showLanguageSelector={false} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
