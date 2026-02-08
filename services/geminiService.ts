
import { GoogleGenAI } from "@google/genai";

// Guideline enforcement: API key is accessed directly from environment variables.

export const geminiService = {
  /**
   * Recommends a service category based on user query using Gemini 3 Flash.
   */
  async recommendCategory(userInput: string) {
    // Initializing Gemini client with named parameter and direct environment variable access.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given the following user financial query: "${userInput}", classify it into one of these service categories: "Income Tax Services", "GST Services", "Audit & Assurance", "Business & Company Services", "Accounting & Bookkeeping", "Financial Advisory", "Compliance & Legal". Return only the category name.`,
      });
      // Correct extraction of text from GenerateContentResponse as per documentation.
      return response.text?.trim() || null;
    } catch (error) {
      console.error("Gemini Error:", error);
      return null;
    }
  },

  /**
   * Summarizes professional profiles using Gemini 3 Flash.
   */
  async summarizeCAProfile(profileText: string) {
    // Ensuring a fresh instance for each request to capture latest API key state.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize this Chartered Accountant's profile in 2 punchy professional sentences: ${profileText}`,
      });
      // Correct extraction of text from GenerateContentResponse.
      return response.text?.trim() || null;
    } catch (error) {
      console.error("Gemini Error:", error);
      return null;
    }
  }
};
