
# bitsbysoh4m

A weekly journal/blog of gratitude, learning, favourites, and personal reflections.

## 🚀 Tech Stack

**Frontend:** Next.js App Router, React, TypeScript, TailwindCSS

**Content:** Ghost CMS (Headless) via Ghost Content API

**Newsletter:** Ghost Members via Ghost Admin API

**Admin:** Ghost Admin (/ghost)

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bitsbysoh4m
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
# Ghost Content API
GHOST_URL=https://your-ghost-site.com
GHOST_CONTENT_API_KEY=your_ghost_content_api_key

# Ghost Admin API (for member subscribe endpoint)
GHOST_ADMIN_API_KEY=your_ghost_admin_api_key

# Used by /admin redirect page
NEXT_PUBLIC_GHOST_ADMIN_URL=https://your-ghost-site.com/ghost

# Website URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🎯 Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## 📝 Adding Blog Posts

Create and publish posts in Ghost Admin. New posts are fetched dynamically by the frontend.

## 🔐 Admin Dashboard

Visit `/admin` in this app to be redirected to Ghost Admin.

## 📧 Newsletter System

- Users can subscribe via the existing newsletter form in the frontend
- Subscription requests are created/updated as Ghost Members
- Sending newsletters and member management are handled in Ghost Admin

## 🎨 Dark Mode

The site supports automatic dark mode based on system preferences, with a manual toggle in the header.

## 📂 Project Structure

```
bitsbysoh4m/
├── public/               # Static assets
│   ├── qubit_dark.png
│   └── qubit_light.png
├── src/
│   ├── app/             # Next.js App Router pages and API routes
│   │   ├── api/         # API endpoints
│   │   ├── blog/        # Dynamic blog post pages
│   │   ├── admin/       # Redirects to Ghost Admin
│   │   ├── archive/     # Archive with search
│   │   └── about/       # About page
│   ├── components/      # React components
│   └── lib/             # Utility functions + Ghost clients
├── .env.local          # Environment variables (not in git)
├── next.config.mjs     # Next.js configuration
└── tailwind.config.mjs # Tailwind CSS configuration
```

## 🔒 Security Features

- Ghost Content/Admin API keys for secure CMS access
- Environment variables for all secrets

## 📄 License

This is a personal blog project. All content © Soham.

## 🙏 Acknowledgments

Built with Next.js, React, Ghost, and lots of coffee.


