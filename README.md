<h1 align="center">✨ Video Calling Interview Platform ✨</h1>

![Demo App](/public/screenshot-for-readme.png)

Highlights:

- 🚀 Tech stack: Next.js & TypeScript, Stream, Convex, Clerk, OpenAI
- 🎥 Video Calls
- 🖥️ Screen Sharing
- 🎬 Screen Recording
- 🔒 Authentication & Authorization
- 🤖 AI-Powered Problem Generation
- 📚 Problem Library Management
- 💻 Server Components, Layouts, Server Actions
- 🎭 Client & Server Components
- 🛣️ Dynamic & Static Routes
- 🎨 Styling with Tailwind & Shadcn
- ✨ Server Actions

### Setup .env file

```js
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
CLERK_JWT_ISSUER_DOMAIN=https://flexible-jaybird-51.clerk.accounts.dev
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_STREAM_API_KEY=
STREAM_SECRET_KEY=
OPENAI_API_KEY=  # Required for AI problem generation
```

### Important: Clerk JWT Template Setup

**You must create a JWT template in Clerk for Convex authentication:**

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **JWT Templates** in the left sidebar
4. Click **"New template"** or **"Create template"**
5. **Name the template exactly:** `convex` (this must match the `applicationID` in `convex/auth.config.ts`)
6. Set token lifetime (e.g., 60 minutes)
7. Copy the **Signing Key** - you'll need to add it to your Convex dashboard
8. Update the `CLERK_JWT_ISSUER_DOMAIN` in your `.env` file to match your Clerk instance domain (found in Clerk Dashboard → API Keys)

**After creating the JWT template:**
- Go to your [Convex Dashboard](https://dashboard.convex.dev)
- Navigate to Settings → Environment Variables
- Add the Clerk JWT Signing Key as an environment variable (Convex will automatically use it)

### OpenAI API Setup (for AI Problem Generation)

1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your Convex environment variables:
   - Go to [Convex Dashboard](https://dashboard.convex.dev) → Settings → Environment Variables
   - Add `OPENAI_API_KEY` with your API key value
3. The AI problem generation feature will use `gpt-4o-mini` model (cost-effective)

### New Features

#### 🤖 AI Problem Generation
- Generate coding problems automatically using AI
- Customize difficulty (Easy, Medium, Hard)
- Specify category and topics
- Problems include examples, constraints, starter code, and hints

#### 📚 Problem Library
- Manage your coding problems
- View all problems you've created
- Delete problems you no longer need
- Filter by difficulty and category

#### 🎯 Interview Problem Assignment
- Assign problems to interviews when scheduling
- Select multiple problems per interview
- Problems are linked to interviews for easy access during the interview

### Run the app

```shell
npm run dev
```
