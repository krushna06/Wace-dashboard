# Wace Web Player

A web interface for interacting with your **Wace Music Bot**.

---

## 🌐 Environment Variables

Rename [`.env.example`](./.env.example) file to `.env.local` in the root of your project and configure the following variables:

| Variable Name                | Description                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_API_BASE_URL`   | The IP or domain of your Wace Music Bot (`WEB_SERVER`).                                                                  |
| `NEXT_PUBLIC_API_AUTH_TOKEN` | The authorization token for your Wace Music Bot (`WEB_SERVER` Line 115).                                                 |
| `DISCORD_CLIENT_ID`          | Your Discord bot's client ID (available in the [Discord Developer Portal](https://discord.com/developers/applications)). |
| `DISCORD_CLIENT_SECRET`      | Your Discord bot's client secret (also from the Developer Portal).                                                       |
| `NEXTAUTH_URL`               | The public URL where this web player will be hosted.                                                                     |
| `NEXTAUTH_SECRET`            | A random string used to secure sessions (no spaces).                                                                     |

> 🔁 **Important:** In the [Discord Developer Portal](https://discord.com/developers/applications), under **OAuth2 → Redirects**, add the following URL:
>
> ```
> http://localhost:3000/api/auth/callback/discord
> ```

---

## ⚙️ Setup Instructions

1. **Enable the Web Server**
   In your Wace bot's `app.yml` file, enable the `WEB_SERVER` setting (around Line 110).

2. **Install Dependencies**
   Run:

   ```bash
   npm install
   ```

   If you encounter issues, try:

   ```bash
   npm install --force
   ```

3. **Build and Start the App**

   ```bash
   npm run build
   npm run start
   ```

## 🚀 Deploy via Vercel CLI

You can deploy this project to Vercel from your local machine using the Vercel CLI:

1. **Prepare Environment Variables:**
   - Copy your `.env.local` file to `.env` (or create a `.env` file with the required variables listed above).
   - When you run the deploy command, Vercel will prompt you to enter these environment variables if they are not already set in your Vercel project.

3. **Deploy:**
   ```bash
   npm run deploy
   ```
   - The first time, Vercel will guide you through login and project setup.
   - You can set environment variables interactively or through the Vercel dashboard after the first deploy.

> **Tip:** For automated deployments, you can set environment variables in the Vercel dashboard under your project settings after the initial deploy.

---

## 🛠️ Support

For support, contact me on Discord: **n0step\_**
Or join the community: [https://discord.gg/gWRhsZHHeb](https://discord.gg/gWRhsZHHeb)