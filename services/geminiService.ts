import OpenAI from 'openai';
import { AiPolishedResponse, ReadingAnalysis } from '../types';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const getClient = () => {
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    // Browser use is requested; keep key in env and consider proxying in production.
    dangerouslyAllowBrowser: true,
  });
};

const fallbackRequest = (rawText: string): AiPolishedResponse => ({
  polishedText: rawText,
  category: 'Other',
  emoji: '📝',
});

const safeParse = <T>(text: string | null | undefined, fallback: T): T => {
  if (!text) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
};

const extractText = (response: any): string =>
  response?.choices?.[0]?.message?.content || '';

export const polishHelpRequest = async (rawText: string): Promise<AiPolishedResponse> => {
  const client = getClient();
  if (!client) return fallbackRequest(rawText);

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-5-nano',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'Return a JSON object with polishedText, category (Physical | Social | School | Community | Other), and emoji.',
        },
        {
          role: 'user',
          content: `Rewrite politely and categorize: "${rawText}".`,
        },
      ],
    });

    const parsed = safeParse<AiPolishedResponse>(extractText(completion), fallbackRequest(rawText));
    return parsed;
  } catch (error) {
    console.error('Error polishing request:', error);
    return fallbackRequest(rawText);
  }
};

export const celebrateKindness = async (action: string): Promise<string> => {
  const client = getClient();
  if (!client) return "Great job! Kindness makes the world go round! 🌍❤️";

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'Be excited, brief, and supportive for elementary students.',
        },
        {
          role: 'user',
          content: `Celebrate this kind act in 2 sentences max with emojis: "${action}".`,
        },
      ],
    });
    return extractText(completion) || "That's amazing! Keep up the great work! 🌟";
  } catch (error) {
    console.error('Error generating celebration:', error);
    return "Great job! Kindness makes the world go round! 🌍❤️";
  }
};

export const generateJokeOrFunFact = async (type: 'joke' | 'fact'): Promise<string> => {
  const client = getClient();
  if (!client) {
    return type === 'joke'
      ? "Why did the cookie go to the hospital? Because he felt crummy! 🍪"
      : "Smile! You make the world brighter. ☀️";
  }

  const userPrompt =
    type === 'joke'
      ? 'Tell a clean, simple joke for kids about kindness, friendship, or school. Just the joke.'
      : 'Share a short, awesome fun fact about animals or nature that kids would love.';

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        { role: 'system', content: 'Be playful and concise for elementary students.' },
        { role: 'user', content: userPrompt },
      ],
    });
    return extractText(completion) || "Why did the cookie go to the hospital? Because he felt crummy! 🍪";
  } catch (error) {
    console.error('Error generating content:', error);
    return "Smile! You make the world brighter. ☀️";
  }
};

export const explainHomework = async (question: string, subject: string): Promise<string> => {
  const client = getClient();
  if (!client) return "I'm having a little trouble thinking right now. Try asking again!";

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        { role: 'system', content: 'You are a friendly 4th-grade tutor. Give hints, not final answers.' },
        {
          role: 'user',
          content: `Subject: ${subject}. Question: "${question}". Explain steps simply, no final answer.`,
        },
      ],
    });
    return extractText(completion) || "I'm having a little trouble thinking right now. Try asking again!";
  } catch (error) {
    console.error('Error explaining homework:', error);
    return "Oops! My brain needs a recharge. Try again later.";
  }
};

export const analyzeReadingText = async (text: string): Promise<ReadingAnalysis> => {
  const client = getClient();
  if (!client) {
    return {
      summary: "I couldn't read that text clearly. Can you try pasting it again?",
      vocabulary: [],
      questions: [],
    };
  }

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-5-nano',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'Return JSON with summary, vocabulary (array of {word, definition}), and questions (array).',
        },
        {
          role: 'user',
          content: `Analyze for a 4th grader:\n${text}`,
        },
      ],
    });

    const fallback: ReadingAnalysis = {
      summary: "I couldn't read that text clearly. Can you try pasting it again?",
      vocabulary: [],
      questions: [],
    };

    return safeParse<ReadingAnalysis>(extractText(completion), fallback);
  } catch (error) {
    console.error('Error analyzing text:', error);
    return {
      summary: "I couldn't read that text clearly. Can you try pasting it again?",
      vocabulary: [],
      questions: [],
    };
  }
};
