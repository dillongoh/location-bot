## Location Bot

Location Bot is a chatbot built with [Next.js](https://nextjs.org) and the App Router. It lets users chat naturally to discover places, get review information, and see locations on an interactive map.

## Project Summary

This project is a chatbot called **Location Bot**. It uses:

- **OpenAI API**: Conversational intelligence and natural language understanding.
- **Google Places API**: Place search, details, and review rating data.
- **Maptiler**: Interactive map tiles to visualize locations returned by the bot.

Users can:

- Ask for recommendations or information about places (e.g., cafes, hotels, attractions).
- Request review ratings and other details powered by Google Places.
- View relevant locations directly on a map embedded in the UI.

## Getting Started

### Environment Variables

Create a `.env.local` file in the root directory with the following:

```
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
NEXT_PUBLIC_MAPTILER_API_KEY=your_maptiler_api_key_here
```

#### Setting up OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Give it a name (e.g., "location-bot")
6. Copy the API key immediately (you won't be able to see it again)
7. Paste it into your `.env.local` file as `OPENAI_API_KEY`

**Note:** The OpenAI API key is required for the chat functionality. The app uses GPT-5-mini model for AI responses.

#### Setting up Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Places API" and "Places API (New)"
4. Create credentials (API Key)
5. Copy the API key to your `.env.local` file

**Note:** The review rating feature requires a Google Places API key. If not configured, the tool will return an error when users ask for review ratings.

#### Setting up Maptiler API Key

1. Go to [Maptiler](https://www.maptiler.com/)
2. Sign up for a free account
3. Navigate to your [API Keys](https://cloud.maptiler.com/account/keys/)
4. Copy your API key
5. Paste it into your `.env.local` file as `NEXT_PUBLIC_MAPTILER_API_KEY`

**Note:** The map display requires a Maptiler API key. You can get a free key that includes map tiles for development. If not configured, the map may not display correctly.

### Running the Development Server

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on Vercel

You can deploy this Next.js app using [Vercel](https://vercel.com), which provides a smooth deployment experience for projects created with `create-next-app`.
