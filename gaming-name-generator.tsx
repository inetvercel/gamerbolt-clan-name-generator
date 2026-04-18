"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { generateNamesWithAI, checkAvailability } from "./utils/nameGenerator"

export default function GamingNameGenerator() {
  const [keyword, setKeyword] = useState("")
  const [nameType, setNameType] = useState("default")
  const [generatedNames, setGeneratedNames] = useState<string[]>([])
  const [selectedName, setSelectedName] = useState("")
  const [platform, setPlatform] = useState("")
  const [availability, setAvailability] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (keyword) {
      setIsGenerating(true)
      try {
        const names = await generateNamesWithAI(keyword, nameType)
        setGeneratedNames(names)
        setSelectedName("")
        setAvailability(null)
      } catch (error) {
        console.error("Error generating names:", error)
        toast({
          title: "Error",
          description: "Failed to generate names. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsGenerating(false)
      }
    }
  }

  const handleCheckAvailability = async () => {
    if (selectedName && platform) {
      setIsChecking(true)
      const isAvailable = await checkAvailability(selectedName, platform)
      setAvailability(isAvailable)
      setIsChecking(false)
    }
  }

  const handleCopyName = (name: string) => {
    navigator.clipboard.writeText(name).then(() => {
      toast({
        title: "Copied!",
        description: `"${name}" has been copied to your clipboard.`,
      })
    })
  }

  return (
    <>
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">AI Gaming Name Generator</h1>

        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="keyword">Favorite word or theme</Label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter a keyword"
            />
          </div>

          <div>
            <Label>Name Type</Label>
            <RadioGroup value={nameType} onValueChange={setNameType} className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="default" id="default" />
                <Label htmlFor="default">Default</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="funny" id="funny" />
                <Label htmlFor="funny">Funny</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="aggressive" id="aggressive" />
                <Label htmlFor="aggressive">Aggressive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="futuristic" id="futuristic" />
                <Label htmlFor="futuristic">Futuristic</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fantasy" id="fantasy" />
                <Label htmlFor="fantasy">Fantasy</Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleGenerate} className="w-full" disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Names"}
          </Button>
        </div>

        {generatedNames.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Generated Names:</h2>
            <ul className="space-y-2">
              {generatedNames.map((name, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RadioGroup value={selectedName} onValueChange={setSelectedName}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={name} id={`name-${index}`} />
                        <Label htmlFor={`name-${index}`}>{name}</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleCopyName(name)}>
                    📋 Copy
                  </Button>
                </li>
              ))}
            </ul>
            <Button onClick={handleGenerate} className="w-full mt-4" disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Again"}
            </Button>
          </div>
        )}

        {selectedName && (
          <div className="space-y-4">
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xbox">Xbox</SelectItem>
                <SelectItem value="playstation">PlayStation</SelectItem>
                <SelectItem value="steam">Steam</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleCheckAvailability} disabled={!platform || isChecking} className="w-full">
              {isChecking ? "Checking..." : "Check Availability"}
            </Button>

            {availability !== null && (
              <p className={`text-center font-semibold ${availability ? "text-green-600" : "text-red-600"}`}>
                {availability ? "Username is available!" : "Username is not available."}
              </p>
            )}
          </div>
        )}
      </div>
      <Toaster />
    </>
  )
}
