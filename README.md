# AI Schedule Planner

A Next.js application that helps you plan your courses, clubs, and goals with AI-powered recommendations using Google's Gemini API.

## Features

- 📚 Add multiple courses with their schedules
- 🎯 Add clubs and activities with their times
- ✍️ Enter your goals and objectives
- 🤖 Get AI-powered recommendations and insights
- 🔒 Secure API key handling with environment variables
- 🎨 Modern, responsive UI with dark mode support

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Kousthubh-Veturi/anthropic-hack.git
cd anthropic-hack
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
cp .env.local.example .env.local
```

4. Add your Gemini API key to `.env.local`:
```
GEMINI_API_KEY=your_actual_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Security

- **Never commit your `.env.local` file** - it's already in `.gitignore`
- API keys are only used on the server-side (API routes)
- Never expose API keys to the client-side code

## Project Structure

```
anthropic-hack/
├── app/
│   ├── api/
│   │   └── gemini/
│   │       └── route.ts          # API route for Gemini integration
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main page
├── components/
│   ├── ScheduleForm.tsx          # Form component
│   └── ResponseDisplay.tsx       # Response display component
├── .env.local                    # Environment variables (not in git)
└── package.json
```

## Usage

1. Fill in your courses with their times
2. Add your clubs and activities with their schedules
3. Write 5 sentences about your goals and what you need to do
4. Click "Get AI Recommendations" to receive personalized insights

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Google Gemini API** - AI recommendations
- **@google/generative-ai** - Official Gemini SDK

## License

MIT
