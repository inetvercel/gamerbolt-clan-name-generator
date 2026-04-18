"use client"

import dynamic from "next/dynamic"

const GamingNameGenerator = dynamic(() => import("@/components/gaming-name-generator"), { ssr: false })

export default function EmbedClientWrapper() {
  return (
    <div className="embed-container">
      <GamingNameGenerator />
    </div>
  )
}
