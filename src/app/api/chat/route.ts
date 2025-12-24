import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { jsonSchema } from 'ai';
import { searchLocation } from '@/tools/location';
import { getReviewRating } from '@/tools/ratings';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Convert UI → Core messages
  const coreMessages = messages
  .map((m: any) => {
    const text = m.parts
      ?.filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join('');

    return text
      ? { role: m.role, content: text }
      : null;
  })
  .filter(Boolean);

  // System message
  const systemMessage = {
    role: 'system' as const,
    content: `
You are a friendly local hangout guide and location expert.
Assume Singapore unless the user explicitly specifies otherwise.
Keep responses short and concise.
Provide concrete, specific recommendations first, then ask for clarification if needed.
Use only ONE tool at a time.

SYSTEM CAPABILITY:
- Location search is NAME-BASED only.
- Searching a brand or place name (e.g. “McDonald’s”, “Starbucks”) returns
  multiple matching locations in Singapore.
- Proximity / nearby / “near X” searches are NOT supported.

For generic questions or recommendations:
- Respond with helpful text only.
- Recommend specific restaurants, cafes, bars, malls, parks, etc.
- Do NOT attempt map searches for these.
- Keep responses ~100 words.

IMPORTANT — search_location tool:
- Singapore ONLY unless specified otherwise.
- Use when the user mentions a PLACE NAME or BRAND and asks to:
  • find it
  • locate it
  • show it on a map
  • get directions
  • asks “where is X”
- Can output multiple locations. eg. "Mcdonald's west region"
- Supports exact or partial name searches (e.g. “McDonald’s”).
- Can return multiple matching locations.
- DO NOT use for:
  • food types (“japanese food”, “pizza”)
  • categories (“cafes”, “parks”)
  • general recommendations
  • proximity queries (“near”, “around”, “nearby”)
- Do NOT use places mentioned earlier — only the latest USER message.

IMPORTANT — get_review_rating tool:
- Use ONLY when the user explicitly asks about ratings or reviews.
- Do NOT infer review intent.
- Do NOT use places mentioned earlier — only the latest USER message.

If the user asks for something the system cannot do:
- Explain the limitation briefly
- Provide text recommendations instead
- Ask for a specific place or brand name if they want it on the map

If unsure whether a tool should be used:
- Respond with text only.


    `,
  };

  // Tool: search_location
  const tools = {
    search_location: {
      description: `Search for a location name, address, landmark, or place and return GeoJSON data to display on the map. Only use this tool when the user wants to know about specific location(s) on the map. Do NOT use for generic queries like food types or categories.`,
      inputSchema: jsonSchema({
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'A specific location name, address, landmark, or place to search for. Do NOT use for generic terms like "japanese food" or "cafes".',
          },
        },
        required: ['query'],
      }),
      execute: async ({ query }: { query: string }) => {
        const geojson = await searchLocation(query);
        return geojson;
      },
    },
    get_review_rating: {
      description: `Get Google review ratings, review count for a specific location using Google Places API (New). Use this when the user asks about ratings, reviews, or what people say about a place.`,
      inputSchema: jsonSchema({
        type: 'object',
        properties: {
          locationName: {
            type: 'string',
            description: 'The name of the location to get review ratings for (e.g., "Marina Bay Sands", "Orchard Road", "Sentosa")',
          },
        },
        required: ['locationName'],
      }),
      execute: async ({ locationName }: { locationName: string }) => {
        const result = await getReviewRating(locationName);
        return result;
      },
    },
  };

  const result = await streamText({
    model: openai('gpt-5-mini'),
    messages: [systemMessage, ...coreMessages],
    tools,
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
  });
}
