import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface Disease {
  name: string;
  probability: number;
  description: string;
  suggestedAction: string;
}

export async function predictDisease(symptoms: string[]): Promise<Disease[]> {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Construct the prompt
    const prompt = `
      Based on the following symptoms, predict the most likely diseases or conditions.
      Format your response as a JSON array with 3-5 potential diagnoses.
      For each diagnosis, include:
      - name: Disease or condition name
      - probability: A number between 0-1 representing likelihood
      - description: A brief description of the condition
      - suggestedAction: Recommended next steps

      Symptoms: ${symptoms.join(", ")}
      
      Remember, this is not medical advice, just AI-assisted suggestions.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract the JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON response from Gemini");
    }

    // Parse the JSON
    const diseases = JSON.parse(jsonMatch[0]) as Disease[];

    // Sort by probability
    return diseases.sort((a, b) => b.probability - a.probability);
  } catch (error) {
    console.error("Error predicting disease:", error);
    throw error;
  }
}
