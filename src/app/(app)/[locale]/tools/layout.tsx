import { Toaster } from "@/components/ui/sonner"

export default function ToolsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main className="min-h-screen py-8">{children}</main>
      <Toaster
        position="top-right"
        richColors
        expand={false}
        visibleToasts={4}
        closeButton
      />
    </>
  )
}
