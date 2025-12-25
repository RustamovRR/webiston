"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  Globe,
  Code,
  Info,
  BookOpen,
  Zap,
  Shield,
  RefreshCw,
  Server
} from "lucide-react"

// UI Components
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CodeHighlight } from "@/components/ui/code-highlight"

// Shared Components
import { ToolHeader, SectionTitle, StatsDisplay } from "@/components/shared"

// Utils & Hooks
import { useHttpStatus } from "./hooks/useHttpStatus"

const HttpStatus = () => {
  const {
    searchTerm,
    selectedCategory,
    selectedStatus,
    filteredCodes,
    categories,
    popularCodes,
    handleSearch,
    handleCategoryFilter,
    selectStatus,
    clearSelection,
    getStats
  } = useHttpStatus()

  // Clear selection when category changes
  const handleCategoryChange = (category: string) => {
    clearSelection()
    handleCategoryFilter(category)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="HTTP Status Kodlari"
        description="Barcha HTTP status kodlari va ularning tafsilotli ma'lumotlari"
      />

      {/* Stats Display */}
      <div className="mb-8">
        <StatsDisplay stats={getStats()} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Panel - Search & Categories */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="h-full border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 p-4 pt-0">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-sm font-medium text-zinc-300">
                  Status Kodlar
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                <span className="text-xs text-zinc-400">Online</span>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* Search */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Search className="h-4 w-4" />
                  Qidiruv
                </div>
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-zinc-400" />
                  <Input
                    placeholder="Status kod yoki nom bo'yicha qidiring..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="border-zinc-700 bg-zinc-800/50 pl-10 text-white placeholder-zinc-400 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Categories Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Filter className="h-4 w-4" />
                  Kategoriyalar
                </div>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.value}
                      onClick={() => handleCategoryChange(category.value)}
                      className={`group relative cursor-pointer overflow-hidden rounded-lg border transition-all duration-300 ${
                        selectedCategory === category.value
                          ? "border-blue-500 bg-blue-600/20 shadow-lg shadow-blue-500/20"
                          : "border-zinc-700 bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-700/50"
                      }`}
                    >
                      <div className="relative z-10 flex items-center gap-3 p-4">
                        <div
                          className={`h-3 w-3 rounded-full ${category.color} ${
                            selectedCategory === category.value
                              ? "animate-pulse"
                              : ""
                          }`}
                        ></div>
                        <span
                          className={`flex-1 font-medium transition-colors ${
                            selectedCategory === category.value
                              ? "text-white"
                              : "text-zinc-300"
                          }`}
                        >
                          {category.label}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs transition-colors ${
                            selectedCategory === category.value
                              ? "border-blue-400/30 bg-blue-500/20 text-blue-300"
                              : "bg-zinc-700/80 text-zinc-400"
                          }`}
                        >
                          {category.value === "all"
                            ? filteredCodes.length
                            : filteredCodes.filter(
                                (code) => code.category === category.value
                              ).length}
                        </Badge>
                      </div>
                      {selectedCategory === category.value && (
                        <motion.div
                          layoutId="category-selection"
                          className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-blue-500/5"
                          initial={false}
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Status Codes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                  <Zap className="h-4 w-4" />
                  Mashhur Kodlar
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {popularCodes.map((code) => (
                    <Button
                      key={code.code}
                      variant="outline"
                      onClick={() => selectStatus(code)}
                      className="h-auto border-zinc-700 bg-zinc-800/50 p-3 text-zinc-300 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-700/50"
                    >
                      <div className="w-full text-center">
                        <div className="font-mono text-lg font-bold text-white">
                          {code.code}
                        </div>
                        <div className="truncate text-xs text-zinc-400">
                          {code.title}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Right Panel - Status Codes List or Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 p-4 pt-0">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-sm font-medium text-zinc-300">
                  {selectedStatus ? "Kod Tafsilotlari" : "Kodlar Ro'yxati"}
                </span>
              </div>
              {selectedStatus && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="text-zinc-400 hover:text-white"
                >
                  Orqaga
                </Button>
              )}
            </div>

            <div className="p-6">
              {selectedStatus ? (
                /* Status Details */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Status Code Header */}
                  <div className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <div
                        className={`h-4 w-4 rounded-full ${selectedStatus.color}`}
                      ></div>
                      <span className="font-mono text-4xl font-bold text-white">
                        {selectedStatus.code}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedStatus.title}
                    </h2>
                    <p className="text-lg text-zinc-300">
                      {selectedStatus.description}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-zinc-400">
                        RFC Hujjat
                      </div>
                      <div className="text-zinc-200">
                        {selectedStatus.rfc || "Belgilanmagan"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-zinc-400">
                        Kategoriya
                      </div>
                      <Badge className={`${selectedStatus.color} text-white`}>
                        {
                          categories.find(
                            (cat) => cat.value === selectedStatus.category
                          )?.label
                        }
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-zinc-400">
                        Misol
                      </div>
                      <div className="text-zinc-200">
                        {selectedStatus.example}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-zinc-400">
                        Qo'llanilishi
                      </div>
                      <div className="text-zinc-200">
                        {selectedStatus.usage}
                      </div>
                    </div>
                  </div>

                  {/* Code Examples */}
                  <div className="space-y-6">
                    {/* HTTP Response Example */}
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-zinc-300">
                        HTTP Javob Misoli
                      </div>
                      <CodeHighlight
                        code={`HTTP/1.1 ${selectedStatus.code} ${selectedStatus.title}
Content-Type: application/json
Date: ${new Date().toUTCString()}
Server: nginx/1.18.0
Content-Length: 123`}
                        language="text"
                      />
                    </div>

                    {/* JSON Response Example */}
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-zinc-300">
                        JSON Javob Misoli
                      </div>
                      <CodeHighlight
                        code={JSON.stringify(
                          {
                            status: selectedStatus.code,
                            message: selectedStatus.title,
                            description: selectedStatus.description,
                            timestamp: new Date().toISOString(),
                            path: "/api/example"
                          },
                          null,
                          2
                        )}
                        language="json"
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Status Codes List */
                <div className="space-y-4">
                  {filteredCodes.length === 0 ? (
                    <div className="py-12 text-center text-zinc-400">
                      <Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
                      <p>Hech qanday status kod topilmadi</p>
                    </div>
                  ) : (
                    <div className="scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800 grid max-h-[600px] grid-cols-1 gap-3 overflow-y-auto">
                      {filteredCodes.map((code) => (
                        <motion.div
                          key={code.code}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group cursor-pointer overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-700/50"
                          onClick={() => selectStatus(code)}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`h-3 w-3 rounded-full ${code.color}`}
                            ></div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-lg font-bold text-white">
                                  {code.code}
                                </span>
                                <span className="truncate font-medium text-white">
                                  {code.title}
                                </span>
                              </div>
                              <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                                {code.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Info Section - Card Based Layout */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-12"
      >
        <SectionTitle
          href=""
          icon={<Server className="h-6 w-6" />}
          title="HTTP Status Kodlari Haqida"
          description="Web development uchun zarur bo'lgan ma'lumotlar"
        />

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* 1xx - Informational */}
          <Card className="border-zinc-800/30 bg-zinc-900/60 backdrop-blur-sm">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  1xx - Ma'lumot
                </h3>
              </div>
              <p className="mb-4 leading-relaxed text-zinc-400">
                Ma'lumot status kodlari so'rov qabul qilinganligini va jarayon
                davom etayotganini bildiradi.
              </p>
              <div className="space-y-2">
                <code className="block rounded bg-zinc-800 px-2 py-1 text-xs text-blue-400">
                  100 Continue
                </code>
                <code className="block rounded bg-zinc-800 px-2 py-1 text-xs text-blue-400">
                  101 Switching Protocols
                </code>
              </div>
            </div>
          </Card>

          {/* 2xx - Success */}
          <Card className="border-zinc-800/30 bg-zinc-900/60 backdrop-blur-sm">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                  <Zap className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  2xx - Muvaffaqiyat
                </h3>
              </div>
              <p className="mb-4 leading-relaxed text-zinc-400">
                Muvaffaqiyat kodlari so'rov muvaffaqiyatli qabul qilingan va
                qayta ishlanganligini ko'rsatadi.
              </p>
              <div className="space-y-2">
                <code className="block rounded bg-zinc-800 px-2 py-1 text-xs text-green-400">
                  200 OK
                </code>
                <code className="block rounded bg-zinc-800 px-2 py-1 text-xs text-green-400">
                  201 Created
                </code>
                <code className="block rounded bg-zinc-800 px-2 py-1 text-xs text-green-400">
                  204 No Content
                </code>
              </div>
            </div>
          </Card>

          {/* 3xx - Redirection */}
          <Card className="border-zinc-800/30 bg-zinc-900/60 backdrop-blur-sm">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20">
                  <RefreshCw className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  3xx - Yo'naltirish
                </h3>
              </div>
              <p className="mb-4 leading-relaxed text-zinc-400">
                Yo'naltirish kodlari so'rovni yakunlash uchun qo'shimcha amallar
                zarurligini bildiradi.
              </p>
              <div className="space-y-2">
                <code className="block rounded bg-zinc-800 px-2 py-1 text-xs text-yellow-400">
                  301 Moved Permanently
                </code>
                <code className="block rounded bg-zinc-800 px-2 py-1 text-xs text-yellow-400">
                  302 Found
                </code>
                <code className="block rounded bg-zinc-800 px-2 py-1 text-xs text-yellow-400">
                  304 Not Modified
                </code>
              </div>
            </div>
          </Card>

          {/* 4xx - Client Error */}
          <Card className="border-zinc-800/30 bg-zinc-900/60 backdrop-blur-sm">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                  <Globe className="h-5 w-5 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  4xx - Mijoz Xatosi
                </h3>
              </div>
              <p className="mb-4 leading-relaxed text-zinc-400">
                Mijoz xato kodlari so'rovda xato borligini bildiradi va mijoz
                tomonidan tuzatilishi kerak.
              </p>
              <div className="space-y-2">
                <code className="block rounded bg-zinc-800 px-2 py-1 text-xs text-red-400">
                  404 Not Found
                </code>
                <code className="block rounded bg-zinc-800 px-2 py-1 text-xs text-red-400">
                  401 Unauthorized
                </code>
                <code className="block rounded bg-zinc-800 px-2 py-1 text-xs text-red-400">
                  403 Forbidden
                </code>
              </div>
            </div>
          </Card>

          {/* 5xx - Server Error */}
          <Card className="border-zinc-800/30 bg-zinc-900/60 backdrop-blur-sm">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                  <Shield className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  5xx - Server Xatosi
                </h3>
              </div>
              <p className="mb-4 leading-relaxed text-zinc-400">
                Server xato kodlari server tomonida xato yuz berganligini
                bildiradi va server admin tomonidan hal qilinishi kerak.
              </p>
              <div className="space-y-2">
                <code className="block rounded bg-zinc-800 px-2 py-1 text-xs text-purple-400">
                  500 Internal Server Error
                </code>
                <code className="block rounded bg-zinc-800 px-2 py-1 text-xs text-purple-400">
                  502 Bad Gateway
                </code>
                <code className="block rounded bg-zinc-800 px-2 py-1 text-xs text-purple-400">
                  503 Service Unavailable
                </code>
              </div>
            </div>
          </Card>

          {/* Best Practices */}
          <Card className="border-zinc-800/30 bg-zinc-900/60 backdrop-blur-sm">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20">
                  <BookOpen className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Best Practices
                </h3>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-zinc-400">
                <p>
                  <strong className="text-zinc-300">GET:</strong> 200, 404, 304
                </p>
                <p>
                  <strong className="text-zinc-300">POST:</strong> 201, 400, 422
                </p>
                <p>
                  <strong className="text-zinc-300">PUT/PATCH:</strong> 200, 204
                </p>
                <p>
                  <strong className="text-zinc-300">DELETE:</strong> 204, 404
                </p>
                <p className="mt-3 text-xs">
                  To'g'ri status kodlarni tanlash API'ning professional
                  ko'rinishini ta'minlaydi.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

export default HttpStatus
