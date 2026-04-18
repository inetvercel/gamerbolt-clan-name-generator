import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  console.log("[v0] API route called")
  try {
    const { keyword, type, length, count } = await req.json()
    console.log("[v0] Received parameters:", { keyword, type, length, count })

    console.log("[v0] OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY)

    const prompt = `Generate ${count} unique and creative ${type} gaming clan names based on the keyword "${keyword}". 
    The clan names should be ${length} in length (short: 3-8 characters, medium: 9-14 characters, long: 15-20 characters, varied: mix of all lengths).
    Each clan name should be highly unique, creative, memorable, and ideal for gaming clans/teams.
    The names should follow these rules:
    1. Be appropriate for all ages
    2. Use camelCase, underscores, or numbers for spacing/variation
    3. Include creative variations of the keyword
    4. Match the selected type (${type})
    5. Be unique and catchy for gaming communities
    6. Sound like a team/clan/guild name (e.g., "Shadow Legion", "Elite Squad", "Viper Clan")
    7. Incorporate unexpected combinations of letters, numbers, or symbols
    8. Consider using creative misspellings or wordplay
    
    Return only the clan names separated by commas, no additional text.`

    console.log("[v0] Calling OpenAI API with model: gpt-4o-mini")
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
    })

    console.log("[v0] OpenAI raw response:", text)

    const names = text
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .slice(0, count)

    console.log("[v0] Processed names:", names)

    return NextResponse.json({ names })
  } catch (error) {
    console.error("[v0] Error generating names:", error)
    return NextResponse.json(
      {
        error: "Failed to generate names",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
