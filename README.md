This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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
5. Give it a name (e.g., "nika-location-bot")
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

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
