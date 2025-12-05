# Party Up - D&D Campaign Scheduler

A modern web application for scheduling D&D campaigns with timezone-aware session planning and player voting.

## Features

- 🎲 **Campaign Creation**: Set up your D&D campaign with DM details and timezone
- 📅 **Session Planning**: Propose multiple session times for your players
- 🗳️ **Player Voting**: Players can vote Yes/Maybe/No on proposed session times
- 🌍 **Timezone Support**: Automatic timezone conversion for all players
- 💾 **Local Storage**: Data persists in browser (no backend required for MVP)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns & date-fns-tz

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── campaign/
│   │   ├── create/          # Campaign creation wizard
│   │   └── [id]/vote/       # Voting page for players
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/
│   └── TimezoneDisplay.tsx  # Timezone conversion component
├── lib/
│   └── storage.ts           # LocalStorage utilities
└── types.ts                 # TypeScript type definitions
```

## Usage

1. **Create a Campaign**: Click "Create Campaign" on the landing page
2. **Fill in Details**: Enter campaign name, DM name, and select your timezone
3. **Add Sessions**: Add one or more proposed session dates and times
4. **Share the Link**: Share the voting page URL with your players
5. **Vote**: Players can identify themselves and vote on session times

## Future Enhancements

- Supabase integration for persistent storage
- User authentication
- Email notifications
- Results dashboard for DMs
- Recurring session support

