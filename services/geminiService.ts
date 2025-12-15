import { GoogleGenAI, Type } from "@google/genai";
import { AiPolishedResponse, ReadingAnalysis } from '../types';

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const polishHelpRequest = async (rawText: string): Promise<AiPolishedResponse> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";

  const prompt = `
    You are a helpful assistant for an elementary school community board. 
    A student has written a request for help: "${rawText}".
    
    1. Rewrite this request to be polite, clear, inviting, and grammatically correct. Keep it simple.
    2. Categorize it into one of these: 'Physical', 'Social', 'School', 'Community', 'Other'.
    3. Choose a single emoji that best represents this request.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            polishedText: { type: Type.STRING },
            category: { type: Type.STRING },
            emoji: { type: Type.STRING }
          },
          required: ["polishedText", "category", "emoji"]
        }
      }
    });

    const jsonStr = response.text || "{}";
    return JSON.parse(jsonStr) as AiPolishedResponse;
  } catch (error) {
    console.error("Error polishing request:", error);
    // Fallback if AI fails
    return {
      polishedText: rawText,
      category: 'Other',
      emoji: '📝'
    };
  }
};

export const celebrateKindness = async (action: string): Promise<string> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";

  const prompt = `
    A student in elementary school just did a kind act: "${action}".
    Write a short, enthusiastic, 2-sentence celebration message for them. 
    Use emojis! Do not give a score or ranking. Focus on the positive impact.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "That's amazing! Keep up the great work! 🌟";
  } catch (error) {
    console.error("Error generating celebration:", error);
    return "Great job! Kindness makes the world go round! 🌍❤️";
  }
};

export const generateJokeOrFunFact = async (type: 'joke' | 'fact'): Promise<string> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";

  const prompt = type === 'joke' 
    ? "Tell me a clean, funny, simple joke for elementary school kids about kindness, friendship, or school. Just the joke."
    : "Tell me a short, amazing fun fact about animals or nature that kids would love.";

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "Why did the cookie go to the hospital? Because he felt crummy! 🍪";
  } catch (error) {
    console.error("Error generating content:", error);
    return "Smile! You make the world brighter. ☀️";
  }
};

export const explainHomework = async (question: string, subject: string): Promise<string> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";

  const prompt = `
    You are a friendly, encouraging 4th-grade tutor. 
    A student asked this ${subject} question: "${question}".
    
    Explain how to solve this step-by-step using simple words suitable for a 4th grader.
    IMPORTANT: DO NOT provide the final answer. Only provide hints and the method to solve it.
    If it is a writing assignment, give ideas, not the full text.
    Keep the tone positive and confidence-building. Use emojis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "I'm having a little trouble thinking right now. Try asking again!";
  } catch (error) {
    console.error("Error explaining homework:", error);
    return "Oops! My brain needs a recharge. Try again later.";
  }
};

export const analyzeReadingText = async (text: string): Promise<ReadingAnalysis> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";

  const prompt = `
    Analyze the following text for a 4th-grade student who needs reading support:
    "${text}"

    1. Provide a simple summary (max 2 sentences).
    2. Identify 3 difficult words and provide very simple definitions.
    3. Create 3 simple comprehension questions to check understanding.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  definition: { type: Type.STRING }
                }
              }
            },
            questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const jsonStr = response.text || "{}";
    return JSON.parse(jsonStr) as ReadingAnalysis;
  } catch (error) {
    console.error("Error analyzing text:", error);
    return {
      summary: "I couldn't read that text clearly. Can you try pasting it again?",
      vocabulary: [],
      questions: []
    };
  }
};