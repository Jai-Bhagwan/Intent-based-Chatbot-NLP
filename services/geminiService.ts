import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NlpAnalysis } from "../types";

// Schema for the structured output we want from Gemini to simulate an NLP backend
const nlpResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    detectedIntents: {
      type: Type.ARRAY,
      description: "List of top 3 possible intents detected from the user input, sorted by confidence.",
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "The intent label (e.g., book_flight, greeting, technical_support)" },
          score: { type: Type.NUMBER, description: "Confidence score between 0.0 and 1.0" }
        },
        required: ["label", "score"]
      }
    },
    extractedEntities: {
      type: Type.ARRAY,
      description: "List of named entities extracted from the text.",
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "Entity type (e.g., LOCATION, DATE, PRODUCT, PERSON)" },
          value: { type: Type.STRING, description: "The extracted text value" },
          description: { type: Type.STRING, description: "Brief context or normalized value if applicable" }
        },
        required: ["label", "value"]
      }
    },
    response: {
      type: Type.STRING,
      description: "The natural language response to the user based on the intent."
    }
  },
  required: ["detectedIntents", "extractedEntities", "response"]
};

export const analyzeText = async (text: string, history: {role: string, content: string}[]): Promise<NlpAnalysis> => {
  const startTime = performance.now();
  
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    const ai = new GoogleGenAI({ apiKey });
    const now = new Date();

    const systemInstruction = `
      You are NeuroChat, an advanced NLP simulation engine. 
      Your task is to act as a backend NLU (Natural Language Understanding) service.
      
      REAL-TIME CONTEXT:
      - Current Date: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      - Current Time: ${now.toLocaleTimeString('en-US')}
      - Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
      
      For every user input:
      1. Analyze the Intent: Determine what the user wants to do. Provide the top 3 potential intents.
      2. Extract Entities: Identify key pieces of information (NER).
      3. Generate a Response: Provide a natural, helpful, and concise chat response.
      
      Context: The user is interacting with a demo chatbot designed to show off these capabilities.
      Be diverse in intent classification. If the input is ambiguous, reflect that in lower confidence scores.
    `;

    // Format history for better context awareness
    const contextString = history.slice(-10).map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n');

    const prompt = `
      Previous conversation context:
      ${contextString}
      
      Current User Input to Analyze: "${text}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: nlpResponseSchema,
        temperature: 0.3, 
        // Enable thinking to improve reasoning capabilities ("Thinking Memory")
        thinkingConfig: { thinkingBudget: 1024 }, 
        maxOutputTokens: 2048,
      }
    });

    const endTime = performance.now();
    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);

    return {
      detectedIntents: data.detectedIntents || [],
      extractedEntities: data.extractedEntities || [],
      response: data.response || "I couldn't process that request.",
      processingTimeMs: Math.round(endTime - startTime)
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      detectedIntents: [{ label: "error_processing", score: 0 }],
      extractedEntities: [],
      response: "System error: Unable to analyze intent. Please check your API key or connection.",
      processingTimeMs: 0
    };
  }
};