export async function generateNamesWithAI(keyword: string, type: string): Promise<string[]> {
  try {
    const response = await fetch("/api/generate-names", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keyword, type }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate names")
    }

    const data = await response.json()
    return data.names
  } catch (error) {
    console.error("Error generating names:", error)
    return []
  }
}

export async function checkAvailability(name: string, platform: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return Math.random() > 0.5
}
