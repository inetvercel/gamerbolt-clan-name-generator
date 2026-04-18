export async function generateNamesWithAI(
  keyword: string,
  type: string,
  length: string,
  count = 15,
): Promise<string[]> {
  console.log("[v0] generateNamesWithAI called with:", { keyword, type, length, count })

  try {
    console.log("[v0] Making fetch request to /api/generate-names")
    const response = await fetch("/api/generate-names", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keyword, type, length, count }),
    })

    console.log("[v0] Response status:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API error response:", errorText)
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] API response data:", data)

    if (!data.names || !Array.isArray(data.names)) {
      console.error("[v0] Invalid response format, data:", data)
      throw new Error("Invalid response format")
    }

    console.log("[v0] Returning names:", data.names)
    return data.names
  } catch (error) {
    console.error("[v0] Error in generateNamesWithAI:", error)
    throw error
  }
}

export async function checkAvailability(name: string, platform: string): Promise<boolean> {
  // This is still a mock function. In a real application, you would call an API to check availability.
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return Math.random() > 0.5
}
