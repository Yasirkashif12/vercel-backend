# Backend - AI-Powered Notes Summarizer

This is the server that runs the AI-Powered Notes Summarizer app. Built with NestJS, it takes care of letting users sign up and log in, turning their text into smart summaries, and saving everything in the database.

## What Does This Backend Actually Do?

- Lets people create an account and log in with their email and password
- Takes text from people and uses AI to create summaries automatically
- Pulls out important action items, risks, and what to do next from the text
- Saves all the summaries and user information safely in the database
- Makes sure user data stays private and secure

## What You Need to Have Ready

- **Node.js** version 18 or higher
- **npm** (it comes with Node.js automatically)
- **PostgreSQL** database (can be on your computer or on a server)

## How to Get Started

1. Open the backend folder:

```bash
cd backend
```

2. Get all the code it needs:

```bash
npm install
```

## Setting Up Your Configuration File

Create a `.env` file in the backend folder with your information:

```bash
# PostgreSQL Database details
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=notes_summarizer

# Groq API key (get it from https://console.groq.com)
GROQ_API_KEY=your_groq_key

# JWT Secret (just use any random text for security)
JWT_SECRET=your_random_secret_key
```

The server starts on **port 5000**.

## Turn on the Server

To start it up with automatic refresh when you change code:

```bash
npm run start:dev
```

## Commands You Can Use

| Command | What It Does |
|---------|-------------|
| `npm run start` | Run the server normally |
| `npm run start:dev` | Run and restart automatically when you save changes |

## How Everything is Put Together

```
src/
├── main.ts                     # Where the app begins
├── app.module.ts               # Brings everything together
├── auth/                       # Handles logins and signups
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   ├── jwt-payload-interface.ts
│   └── dto/
│       └── auth-credentials.dto.ts
├── summaries/                  # Makes and retrieves summaries
│   ├── summaries.controller.ts
│   ├── summaries.service.ts
│   ├── summaries.module.ts
│   ├── entities/
│   │   └── summary.entity.ts
│   └── dto/
│       └── create-summary.dto.ts
├── user/                       # Stores user information
│   ├── user.entity.ts
│   └── user.module.ts
└── config/
    └── typeorm.config.ts       # Sets up the database
```

## API Routes (Where the Frontend Connects)

Here are the web addresses the frontend uses:

**For accounts:**
- `POST /auth/signup` - Make a new account with email and password
- `POST /auth/signin` - Log in with email and password (you get a token back)

**For summaries:**
- `POST /summaries/post` - Create a summary from text (needs your login token)
- `GET /summaries/get` - Get all your saved summaries (needs your login token)

## How Data is Stored

Uses PostgreSQL with TypeORM. When the server starts, it automatically creates all the tables you need.

## Password Rules

When someone creates an account, their password must:
- Have at least 8 letters
- Have at least one capital letter
- Have at least one small letter
- Have at least one number
- Have at least one symbol like @, $, !, %, *, ?, or &

## Tools and Libraries We Use

- **NestJS** - The framework that runs everything
- **TypeORM** - Talks to the database
- **PostgreSQL** - Where we keep all the data
- **JWT** - Keeps people logged in safely
- **Bcrypt** - Scrambles passwords so they're safe
- **Groq API** - The AI that makes summaries
