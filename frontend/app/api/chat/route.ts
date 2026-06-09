import { NextResponse } from "next/server";
import { generateAcknowledgment } from "@/lib/chat-utils";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequest = {
  message: string;
  history: ChatMessage[];
};

function calcDays(startDate: string, endDate: string): number {
  const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function buildSystemPrompt(today: string): string {
  return `You are a travel eSIM planning assistant. Extract trip information from the user's message and return ONLY valid JSON with no markdown, no backticks, no preamble.

Today's date is ${today}. Use this for all date calculations.

Return an object with exactly these fields:
{
  "complete": boolean,
  "clarification": string or null,
  "trip": object or null
}

The trip object fields:
{
  "destination": string (ALWAYS the country name, never a city — see DESTINATION RULES below),
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "travelerType": "SOLO" or "COUPLE" or "FAMILY" or "BUSINESS",
  "usage": {
    "maps": "NONE" or "LIGHT" or "MODERATE" or "HEAVY",
    "streaming": "NONE" or "LIGHT" or "MODERATE" or "HEAVY",
    "socialMedia": "NONE" or "LIGHT" or "MODERATE" or "HEAVY",
    "videoCalls": "NONE" or "LIGHT" or "MODERATE" or "HEAVY",
    "hotspot": "NONE" or "LIGHT" or "MODERATE" or "HEAVY",
    "work": "NONE" or "LIGHT" or "MODERATE" or "HEAVY"
  }
}

DATE RULES — follow these exactly:
- If the user gives a specific start date, use it.
- If the user says "X days" or "X day trip" without specific dates, set startDate to today (${today}) and endDate to today plus X days.
- If the user says "X weeks", treat it as X*7 days and apply the same rule.
- If the user gives a month name without a year, use ${today.slice(0, 4)} if that month has not passed, otherwise use the next year.
- If duration is 1 day, startDate = ${today} and endDate = one day after ${today}.
- If destination is present but NO date and NO duration hint is given at all, set startDate = ${today} and endDate = ${today} plus 7 days. Never ask about dates.

DEFAULTS — apply automatically, never ask:
- travelerType: default to "SOLO" if not mentioned.
- All usage fields: default to "MODERATE" if not mentioned.

CLARIFICATION RULES:
- Set complete=false ONLY if destination is completely missing.
- When complete=false: trip must be null, clarification must be a single short question asking only for the destination.
- Never ask about travelerType, usage, duration preferences, or anything else.
- Never ask more than one clarification question per response.
- When complete=true: clarification must be null, trip must be fully populated.

Inferring usage from context (only when user volunteers these details):
- "remote work", "work remotely", "working trip" → work: HEAVY, hotspot: HEAVY, videoCalls: MODERATE
- "Maps constantly", "navigation all day" → maps: HEAVY
- "stream video", "Netflix", "watch shows" → streaming: HEAVY
- "stream music", "Spotify" → streaming: MODERATE
- "video calls", "Zoom meetings" → videoCalls: HEAVY
- "social media", "Instagram", "posting photos" → socialMedia: HEAVY

Inferring travelerType (only when user volunteers):
- "partner", "girlfriend", "boyfriend", "spouse", "wife", "husband" → COUPLE
- "kids", "children", "family trip" → FAMILY
- "business", "work trip", "conference", "meetings", "remote work" → BUSINESS
- Otherwise: SOLO

DESTINATION RULES — always return the country name in English, never a city:
- Tokyo, Osaka, Kyoto, Hiroshima → Japan
- Bangkok, Phuket, Chiang Mai, Koh Samui → Thailand
- Paris, Lyon, Nice, Marseille → France
- Rome, Milan, Florence, Venice, Naples → Italy
- Berlin, Munich, Hamburg, Frankfurt → Germany
- New York, Los Angeles, Miami, Chicago, Las Vegas, San Francisco → United States
- London, Manchester, Edinburgh, Birmingham → United Kingdom
- Barcelona, Madrid, Seville → Spain
- Amsterdam, Rotterdam → Netherlands
- Dubai, Abu Dhabi → United Arab Emirates
- Mumbai, Delhi, Goa, Bangalore, Chennai → India
- Sydney, Melbourne, Brisbane, Perth → Australia
- Toronto, Vancouver, Montreal → Canada
- Bali, Jakarta, Lombok → Indonesia
- Singapore → Singapore
- Seoul, Busan → South Korea
- Beijing, Shanghai, Shenzhen → China
- Lisbon, Porto → Portugal
- Athens, Santorini, Mykonos → Greece
- Cairo, Hurghada → Egypt
- Mexico City, Cancun → Mexico
- Rio de Janeiro, São Paulo → Brazil
If the city is not listed, identify and return its country name. Never return a city name as the destination.`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;
    const { message, history } = body;

    console.log('Chat API called with:', message?.slice(0, 50));

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY is not configured" }, { status: 500 });
    }

    const today = new Date().toISOString().slice(0, 10);

    const messages = [
      { role: "system" as const, content: buildSystemPrompt(today) },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: message },
    ];

    console.log('Calling Groq with model:', 'llama-3.3-70b-versatile');
    console.log('GROQ_API_KEY present:', !!process.env.GROQ_API_KEY);

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    const groqResponseText = await groqResponse.text();
    console.log('Groq response status:', groqResponse.status);
    console.log('Groq response body:', groqResponseText.slice(0, 500));

    if (!groqResponse.ok) {
      if (groqResponse.status === 429) {
        return Response.json({
          complete: false,
          clarification: "I'm handling too many requests right now. Please try again in a few minutes.",
        });
      }
      return Response.json({
        complete: false,
        clarification: "Something went wrong. Please try again.",
      });
    }

    const groqData = JSON.parse(groqResponseText) as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = groqData.choices[0]?.message?.content ?? "";

    try {
      const parsed = JSON.parse(content) as {
        complete: boolean;
        trip?: { destination: string; startDate: string; endDate: string; travelerType?: string } | null;
        clarification?: string | null;
      };
      if (parsed.complete && parsed.trip) {
        const { destination, startDate, endDate, travelerType } = parsed.trip;
        const days = calcDays(startDate, endDate);
        const acknowledgment = generateAcknowledgment(destination, days, travelerType ?? "SOLO");
        return NextResponse.json({ ...parsed, acknowledgment });
      }
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({
        complete: false,
        clarification: "Which destination are you travelling to?",
        trip: null,
      });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return Response.json({
      complete: false,
      clarification: 'Something went wrong. Please try again.',
    }, { status: 200 });
  }
}
