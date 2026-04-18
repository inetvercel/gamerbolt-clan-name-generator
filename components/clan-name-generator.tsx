"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { Star, Copy, Save, RefreshCw, Trash2, Check, Flame, Laugh, Target, Zap, CopyPlus } from "lucide-react"
import { generateNamesWithAI } from "@/lib/nameGenerator"

const RATE_LIMIT = {
  MAX_GENERATIONS: 50, // Max generations per time window
  TIME_WINDOW: 60 * 60 * 1000, // 1 hour in milliseconds
  COOLDOWN: 3000, // 3 seconds cooldown between generations
}

interface RateLimitData {
  count: number
  timestamp: number
  lastGeneration: number
}

export default function ClanNameGenerator() {
  const [keyword, setKeyword] = useState("")
  const [nameType, setNameType] = useState("default")
  const [nameLength, setNameLength] = useState("varied")
  const [generatedNames, setGeneratedNames] = useState<string[]>([])
  const [savedNames, setSavedNames] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSavedNames, setShowSavedNames] = useState(false)
  const [copiedName, setCopiedName] = useState<string | null>(null)
  const [remainingGenerations, setRemainingGenerations] = useState(RATE_LIMIT.MAX_GENERATIONS)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [copyAllClicked, setCopyAllClicked] = useState(false)
  const { toast } = useToast()
  const contentRef = useRef<HTMLDivElement>(null)

  const trendingTags = [
    { emoji: "🔥", label: "Elite Clans", type: "aggressive", length: "short" },
    { emoji: "😂", label: "Funny Clans", type: "funny", length: "varied" },
    { emoji: "🎯", label: "Short Clans", type: "default", length: "short" },
    { emoji: "⚡", label: "Pro Clans", type: "futuristic", length: "short" },
    { emoji: "🌟", label: "Legendary Clans", type: "fantasy", length: "long" },
  ]

  const checkRateLimit = (): boolean => {
    const now = Date.now()
    const stored = localStorage.getItem("rateLimitData")
    let rateLimitData: RateLimitData = stored ? JSON.parse(stored) : { count: 0, timestamp: now, lastGeneration: 0 }

    // Reset if time window has passed
    if (now - rateLimitData.timestamp > RATE_LIMIT.TIME_WINDOW) {
      rateLimitData = { count: 0, timestamp: now, lastGeneration: 0 }
    }

    // Check cooldown
    const timeSinceLastGeneration = now - rateLimitData.lastGeneration
    if (timeSinceLastGeneration < RATE_LIMIT.COOLDOWN) {
      const remaining = Math.ceil((RATE_LIMIT.COOLDOWN - timeSinceLastGeneration) / 1000)
      setCooldownRemaining(remaining)
      toast({
        title: "Please Wait",
        description: `Wait ${remaining} seconds before generating again.`,
        variant: "destructive",
      })
      return false
    }

    // Check if rate limit exceeded
    if (rateLimitData.count >= RATE_LIMIT.MAX_GENERATIONS) {
      const timeUntilReset = RATE_LIMIT.TIME_WINDOW - (now - rateLimitData.timestamp)
      const minutesUntilReset = Math.ceil(timeUntilReset / 60000)
      setIsRateLimited(true)
      toast({
        title: "Rate Limit Reached",
        description: `You've reached the maximum of ${RATE_LIMIT.MAX_GENERATIONS} generations per hour. Try again in ${minutesUntilReset} minutes.`,
        variant: "destructive",
      })
      return false
    }

    // Update rate limit data
    rateLimitData.count++
    rateLimitData.lastGeneration = now
    localStorage.setItem("rateLimitData", JSON.stringify(rateLimitData))
    setRemainingGenerations(RATE_LIMIT.MAX_GENERATIONS - rateLimitData.count)
    setIsRateLimited(false)

    return true
  }

  const updateRemainingGenerations = () => {
    const now = Date.now()
    const stored = localStorage.getItem("rateLimitData")
    if (!stored) {
      setRemainingGenerations(RATE_LIMIT.MAX_GENERATIONS)
      setIsRateLimited(false)
      return
    }

    const rateLimitData: RateLimitData = JSON.parse(stored)

    // Reset if time window has passed
    if (now - rateLimitData.timestamp > RATE_LIMIT.TIME_WINDOW) {
      setRemainingGenerations(RATE_LIMIT.MAX_GENERATIONS)
      setIsRateLimited(false)
      localStorage.removeItem("rateLimitData")
      return
    }

    const remaining = RATE_LIMIT.MAX_GENERATIONS - rateLimitData.count
    setRemainingGenerations(remaining)
    setIsRateLimited(remaining <= 0)
  }

  const generateRandomNames = async (count: number, skipRateLimit = false) => {
    console.log("[v0] generateRandomNames called with count:", count)

    if (!skipRateLimit && !checkRateLimit()) {
      return []
    }

    const randomKeywords = ["epic", "shadow", "crystal", "storm", "neon", "cosmic"]
    const randomTypes = ["default", "funny", "aggressive", "futuristic", "fantasy"]
    const randomLengths = ["short", "medium", "long", "varied"]

    const keyword = randomKeywords[Math.floor(Math.random() * randomKeywords.length)]
    const type = randomTypes[Math.floor(Math.random() * randomTypes.length)]
    const length = randomLengths[Math.floor(Math.random() * randomLengths.length)]

    console.log("[v0] Random parameters selected:", { keyword, type, length })

    try {
      const names = await generateNamesWithAI(keyword, type, length, count)
      console.log("[v0] Successfully generated names:", names)
      return names
    } catch (error) {
      console.error("[v0] Error in generateRandomNames:", error)
      throw error
    }
  }

  const generateInitialNames = async () => {
    console.log("[v0] generateInitialNames starting")
    setIsGenerating(true)
    try {
      const names = await generateRandomNames(15, true)
      console.log("[v0] Setting generated names:", names)
      if (names && names.length > 0) {
        setGeneratedNames(names)
        console.log("[v0] Generated names successfully set")
      } else {
        console.warn("[v0] No names returned, using fallback")
        const fallbackNames = [
          "ShadowStrike", "NeonNinja", "CyberDragon", "StormRider", "PhantomBlade",
          "CosmicHunter", "ThunderFox", "CrystalWolf", "BlazeFury", "FrostByte",
          "VoidWalker", "StarKnight", "EchoWarrior", "NovaGhost", "IronPhoenix"
        ]
        setGeneratedNames(fallbackNames)
      }
    } catch (error) {
      console.error("[v0] Error generating initial names:", error)
      const fallbackNames = [
        "ShadowStrike", "NeonNinja", "CyberDragon", "StormRider", "PhantomBlade",
        "CosmicHunter", "ThunderFox", "CrystalWolf", "BlazeFury", "FrostByte",
        "VoidWalker", "StarKnight", "EchoWarrior", "NovaGhost", "IronPhoenix"
      ]
      setGeneratedNames(fallbackNames)
      toast({
        title: "Using Sample Names",
        description: "Showing sample names. Enter a keyword to generate custom ones.",
      })
    } finally {
      setIsGenerating(false)
      console.log("[v0] generateInitialNames completed")
    }
  }

  useEffect(() => {
    console.log("[v0] Component mounted, starting initialization")

    const saved = localStorage.getItem("savedNames")
    if (saved) {
      setSavedNames(JSON.parse(saved))
      console.log("[v0] Loaded saved names from localStorage")
    }

    updateRemainingGenerations()

    console.log("[v0] About to call generateInitialNames")
    generateInitialNames()

    const handlePostMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "containerHeight") {
        const namesContainer = document.getElementById("names-container")
        if (namesContainer) {
          namesContainer.style.maxHeight = `${event.data.height - 400}px`
        }
      }
    }

    window.addEventListener("message", handlePostMessage)

    return () => {
      window.removeEventListener("message", handlePostMessage)
    }
  }, [])

  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(cooldownRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownRemaining])

  useEffect(() => {
    window.parent.postMessage({ type: "contentChanged" }, "*")
  }, [])

  const handleGenerate = async () => {
    if (keyword) {
      if (!checkRateLimit()) {
        return
      }

      setIsGenerating(true)
      console.log("Generating names for keyword:", keyword)
      try {
        console.log("Calling generateNamesWithAI")
        const names = await generateNamesWithAI(keyword, nameType, nameLength, 15)
        console.log("Generated names:", names)
        if (names.length === 0) {
          throw new Error("No names were generated. Please try again.")
        }
        setGeneratedNames(names)
      } catch (error) {
        console.error("Error generating names:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to generate names. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsGenerating(false)
      }
    } else {
      console.log("No keyword provided")
      toast({
        title: "Error",
        description: "Please enter a keyword before generating names.",
        variant: "destructive",
      })
    }
  }

  const handleRefreshAll = async () => {
    if (!checkRateLimit()) {
      return
    }
    await generateInitialNames()
  }

  const handleCopyName = (name: string) => {
    const fallbackCopy = (text: string) => {
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "0"
      textArea.style.top = "0"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand("copy")
        setCopiedName(text)
        setTimeout(() => setCopiedName(null), 2000)
        toast({
          title: "Copied!",
          description: `"${name}" has been copied to your clipboard.`,
        })
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err)
        toast({
          title: "Error",
          description: "Unable to copy. Please try again.",
          variant: "destructive",
        })
      }
      document.body.removeChild(textArea)
    }

    if (!navigator.clipboard) {
      fallbackCopy(name)
      return
    }

    navigator.clipboard
      .writeText(name)
      .then(() => {
        setCopiedName(name)
        setTimeout(() => setCopiedName(null), 2000)
        toast({
          title: "Copied!",
          description: `"${name}" has been copied to your clipboard.`,
        })
      })
      .catch((err) => {
        console.error("Could not copy text: ", err)
        fallbackCopy(name)
      })
  }

  const handleCopyAll = () => {
    const allNames = generatedNames.join("\n")
    if (!navigator.clipboard) {
      const textArea = document.createElement("textarea")
      textArea.value = allNames
      textArea.style.position = "fixed"
      textArea.style.left = "0"
      textArea.style.top = "0"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand("copy")
        setCopyAllClicked(true)
        setTimeout(() => setCopyAllClicked(false), 2000)
        toast({
          title: "All Copied!",
          description: `${generatedNames.length} names copied to clipboard.`,
        })
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err)
      }
      document.body.removeChild(textArea)
      return
    }

    navigator.clipboard
      .writeText(allNames)
      .then(() => {
        setCopyAllClicked(true)
        setTimeout(() => setCopyAllClicked(false), 2000)
        toast({
          title: "All Copied!",
          description: `${generatedNames.length} names copied to clipboard.`,
        })
      })
      .catch((err) => {
        console.error("Could not copy text: ", err)
      })
  }

  const handleTrendingTagClick = (tag: typeof trendingTags[0]) => {
    setNameType(tag.type)
    setNameLength(tag.length)
    if (!checkRateLimit()) {
      return
    }
    handleGenerateWithParams(tag.type, tag.length)
  }

  const handleGenerateWithParams = async (type: string, length: string) => {
    setIsGenerating(true)
    try {
      const randomKeywords = ["elite", "shadow", "royal", "storm", "neon", "cosmic", "dragon", "viper", "phantom", "cyber", "legion", "empire"]
      const randomKeyword = randomKeywords[Math.floor(Math.random() * randomKeywords.length)]
      const names = await generateNamesWithAI(randomKeyword, type, length, 15)
      if (names.length === 0) {
        throw new Error("No names were generated. Please try again.")
      }
      setGeneratedNames(names)
    } catch (error: any) {
      console.error("Error generating names:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate names. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveName = (name: string) => {
    if (!savedNames.includes(name)) {
      const updatedSavedNames = [...savedNames, name]
      setSavedNames(updatedSavedNames)
      localStorage.setItem("savedNames", JSON.stringify(updatedSavedNames))
      toast({
        title: "Saved!",
        description: `"${name}" has been added to your saved names.`,
      })
    } else {
      toast({
        title: "Already Saved",
        description: `"${name}" is already in your saved names.`,
        variant: "destructive",
      })
    }
  }

  const handleRemoveSavedName = (nameToRemove: string) => {
    const updatedSavedNames = savedNames.filter((name) => name !== nameToRemove)
    setSavedNames(updatedSavedNames)
    localStorage.setItem("savedNames", JSON.stringify(updatedSavedNames))
    toast({
      title: "Removed!",
      description: `"${nameToRemove}" has been removed from your saved names.`,
    })
  }

  const handleClearSavedNames = () => {
    setSavedNames([])
    localStorage.removeItem("savedNames")
    toast({
      title: "Cleared!",
      description: "All saved names have been cleared.",
    })
  }

  useEffect(() => {
    const sendHeightToParent = () => {
      if (contentRef.current) {
        const height = contentRef.current.offsetHeight
        window.parent.postMessage({ type: "iframeHeight", height: height }, "*")
      }
    }

    sendHeightToParent()

    const observer = new MutationObserver(sendHeightToParent)
    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      })
    }

    window.addEventListener("resize", sendHeightToParent)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", sendHeightToParent)
    }
  }, [contentRef])

  return (
    <div className="bg-white text-gray-900 p-4 sm:p-6 md:p-8 max-w-full overflow-hidden" ref={contentRef}>
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8">
        <div className="space-y-6">
          <div>
            <Label htmlFor="keyword" className="text-base sm:text-lg mb-2 block">
              Enter your keyword
            </Label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., Dragon, Ninja, Shadow"
              className="bg-gray-100 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-amber-500 transition-all duration-200"
            />
          </div>

          <div className="mb-6">
            <Label className="text-base sm:text-lg mb-3 block font-semibold text-gray-800">
              🔥 Try a style (click to generate instantly):
            </Label>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag, index) => (
                <Button
                  key={index}
                  onClick={() => handleTrendingTagClick(tag)}
                  variant="outline"
                  size="default"
                  disabled={isGenerating || cooldownRemaining > 0 || isRateLimited}
                  className="bg-gradient-to-r from-blue-50 to-sky-50 border-blue-300 hover:from-blue-100 hover:to-sky-100 hover:border-blue-400 hover:shadow-md text-gray-900 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2"
                >
                  <span className="mr-2 text-lg">{tag.emoji}</span>
                  {tag.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base sm:text-lg mb-2 block">Name Type</Label>
            <RadioGroup value={nameType} onValueChange={setNameType} className="flex flex-wrap gap-2 sm:gap-4">
              {["default", "funny", "aggressive", "futuristic", "fantasy"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={type} className="text-blue-500 border-blue-400" />
                  <Label htmlFor={type} className="capitalize text-sm sm:text-base">
                    {type}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="text-base sm:text-lg mb-2 block">Name Length</Label>
            <RadioGroup value={nameLength} onValueChange={setNameLength} className="flex flex-wrap gap-2 sm:gap-4">
              {["short", "medium", "long", "varied"].map((length) => (
                <div key={length} className="flex items-center space-x-2">
                  <RadioGroupItem value={length} id={length} className="text-blue-500 border-blue-400" />
                  <Label htmlFor={length} className="capitalize text-sm sm:text-base">
                    {length}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Button
            onClick={handleGenerate}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 font-bold py-3 sm:py-4 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            disabled={isGenerating || cooldownRemaining > 0 || isRateLimited}
          >
            {isGenerating
              ? "Generating Names..."
              : cooldownRemaining > 0
                ? `Wait ${cooldownRemaining}s...`
                : "Generate Clan Names"}
          </Button>
        </div>

        <div className="mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-600 mb-2 sm:mb-0">Your Clan Tags:</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setShowSavedNames(!showSavedNames)}
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Star size={16} className="mr-2" />
                Saved Names ({savedNames.length})
              </Button>
              <Button
                onClick={handleCopyAll}
                variant="outline"
                className={`border-green-600 text-sm sm:text-base transition-all duration-200 hover:scale-105 active:scale-95 ${
                  copyAllClicked
                    ? "bg-green-600 text-white border-green-600"
                    : "text-green-600 hover:bg-green-600 hover:text-white"
                }`}
                disabled={generatedNames.length === 0}
              >
                {copyAllClicked ? (
                  <Check size={16} className="mr-2" />
                ) : (
                  <CopyPlus size={16} className="mr-2" />
                )}
                Copy All
              </Button>
              <Button
                onClick={handleRefreshAll}
                variant="outline"
                className="text-blue-600 border-blue-400 hover:bg-blue-500 hover:text-white text-sm sm:text-base bg-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                disabled={isGenerating || cooldownRemaining > 0 || isRateLimited}
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh All
              </Button>
            </div>
          </div>
          {showSavedNames && savedNames.length > 0 && (
            <div className="mb-4 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Saved Names:</h3>
              <ul className="space-y-2 max-h-40 sm:max-h-60 overflow-y-auto">
                {savedNames.map((name, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span className="text-sm sm:text-base">{name}</span>
                    <div className="space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyName(name)}
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        {copiedName === name ? (
                          <Check size={16} className="text-green-600 animate-in zoom-in duration-200" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSavedName(name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleClearSavedNames}
                className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white text-sm sm:text-base"
              >
                Clear All Saved Names
              </Button>
            </div>
          )}
          <div
            id="names-container"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto"
            style={{ maxHeight: "400px" }}
          >
            {generatedNames.map((name, index) => (
              <div
                key={index}
                className="bg-gray-100 p-3 sm:p-4 rounded-lg hover:bg-gray-200 transition-all duration-200 flex justify-between items-center hover:shadow-md transform hover:-translate-y-0.5"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-sm sm:text-base lg:text-lg break-all">{name}</span>
                <div className="flex space-x-1 sm:space-x-2 ml-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyName(name)}
                    className={`p-1 sm:p-2 transition-all duration-200 hover:scale-110 active:scale-95 ${
                      copiedName === name
                        ? "bg-green-600 text-white border-green-600 scale-110 hover:bg-green-700"
                        : "text-blue-400 bg-white border-blue-400 hover:bg-blue-400 hover:text-white hover:border-blue-400"
                    }`}
                  >
                    {copiedName === name ? (
                      <Check size={14} className="animate-in zoom-in duration-200" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveName(name)}
                    className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white p-1 sm:p-2 transition-all duration-200 hover:scale-110 active:scale-95"
                  >
                    <Save size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 mt-4">
        {remainingGenerations} / {RATE_LIMIT.MAX_GENERATIONS} generations remaining this hour
      </div>

      <Toaster />
    </div>
  )
}
