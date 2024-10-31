import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBqxm5BTYlXPORYMlWqSLnI-9m3DNpvoBM";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export default async function run(prompt) {
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.log(error);
    return "I am Offline, Replay You Later";
  }
}
