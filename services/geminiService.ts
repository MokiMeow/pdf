import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const chatWithPdf = async (file: File, question: string, history: string[] = []): Promise<string> => {
  const base64Data = await fileToBase64(file);
  
  // Construct a chat-like history context manually if needed, or just send prompt
  const fullPrompt = `Based on the attached PDF document, please answer the following question: "${question}". 
  Keep the answer concise and relevant. If it's a technical document, be precise.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: 'application/pdf', data: base64Data } },
        { text: fullPrompt }
      ]
    }
  });
  return response.text || "I couldn't find an answer in the document.";
};

export const generateQuiz = async (file: File): Promise<string> => {
  const base64Data = await fileToBase64(file);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: 'application/pdf', data: base64Data } },
        { text: "Generate a 10-question multiple choice quiz based on this document. Format it as Markdown. Include the correct answers at the very end hidden under a 'Spoiler' tag or separator." }
      ]
    }
  });
  return response.text || "Failed to generate quiz.";
};

export const summarizePdf = async (file: File): Promise<string> => {
  const base64Data = await fileToBase64(file);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: 'application/pdf', data: base64Data } },
        { text: "Provide a structured summary of this document. Include: 1. Executive Summary, 2. Key Points (Bulleted), 3. Actionable Insights or Conclusions." }
      ]
    }
  });
  return response.text || "Failed to summarize.";
};

export const convertToFormat = async (file: File, targetFormat: 'Word' | 'Excel' | 'PowerPoint'): Promise<string> => {
  const base64Data = await fileToBase64(file);
  let prompt = "";
  
  if (targetFormat === 'Word') {
    prompt = "Extract the content of this PDF into a well-structured Markdown format that usually maps to a Word document. Maintain headers, bold text, lists, and tables.";
  } else if (targetFormat === 'Excel') {
    prompt = "Identify all tables in this PDF. Output them strictly as CSV format. If there are multiple tables, separate them with '---TABLE BREAK---'.";
  } else if (targetFormat === 'PowerPoint') {
    prompt = "Create a presentation outline from this PDF. For each slide, provide a Title and 3-4 bullet points. Format it so it's easy to read.";
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: 'application/pdf', data: base64Data } },
        { text: prompt }
      ]
    }
  });
  return response.text || "Conversion failed.";
};

export const analyzeCad = async (file: File): Promise<string> => {
  const base64Data = await fileToBase64(file);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: 'application/pdf', data: base64Data } },
        { text: "Analyze this technical drawing or CAD export. Identify: 1. Dimensions and Units, 2. Materials mentioned, 3. Compliance standards (ISO/ANSI), 4. Potential design warnings." }
      ]
    }
  });
  return response.text || "Analysis failed.";
};

export const fixGrammar = async (file: File): Promise<string> => {
  const base64Data = await fileToBase64(file);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: 'application/pdf', data: base64Data } },
        { text: "Act as a professional editor. Review the text in this PDF. List all grammatical errors, spelling mistakes, and awkward phrasing. Provide corrected versions for each." }
      ]
    }
  });
  return response.text || "No issues found or analysis failed.";
};
