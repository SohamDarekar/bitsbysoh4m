
# bitsbysoh4m

A weekly journal/blog of gratitude, learning, favourites, and personal reflections.

## 🚀 Tech Stack

**Frontend:** Next.js 14 (App Router), React 18, TypeScript, TailwindCSS

**Backend:** Next.js API Routes, MongoDB, JWT Authentication

**Email:** Nodemailer for newsletter delivery

**Content:** Markdown with gray-matter, remark, and remark-html

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
# MongoDB
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=newsletter

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Admin Password Hash (use npm run hash-password to generate)
ADMIN_PASSWORD_HASH=your_bcrypt_hashed_password

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
SMTP_FROM_NAME=Bits by Soham

# Website URL
WEBSITE_URL=http://localhost:3000/
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Generate a password hash:
```bash
npm run hash-password your_password_here
```
Copy the output and paste it as `ADMIN_PASSWORD_HASH` in your `.env.local` file.

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

1. Create a new folder in `_content/blog/` with your post date as the folder name
2. Create a markdown file inside (e.g., `june 1, 2025.md`)
3. Add frontmatter at the top:
```markdown
---
title: "Your Post Title"
description: "A brief description"
date: "2025-06-01T09:41:00"
customSlug: "your-custom-slug"
---

Your content here...
```

4. The post will automatically appear on the homepage and archive page

## 🔐 Admin Dashboard

Access the admin dashboard at `/admin` with your configured password.

Features:
- Test database connection
- View all subscribers
- Send newsletters to all active subscribers

## 📧 Newsletter System

- Users can subscribe via the newsletter form on any page
- Admin can send newsletters with custom HTML content
- Automatic unsubscribe links included in every email
- Tracks subscription dates and status

## 🎨 Dark Mode

The site supports automatic dark mode based on system preferences, with a manual toggle in the header.

## 📂 Project Structure

```
bitsbysoh4m/
├── _content/              # Markdown blog posts and about page
│   ├── blog/
│   └── about/
├── public/               # Static assets
│   ├── qubit_dark.png
│   └── qubit_light.png
├── src/
│   ├── app/             # Next.js App Router pages and API routes
│   │   ├── api/         # API endpoints
│   │   ├── blog/        # Dynamic blog post pages
│   │   ├── admin/       # Admin dashboard
│   │   ├── archive/     # Archive with search
│   │   └── about/       # About page
│   ├── components/      # React components
│   ├── lib/            # Utility functions and database
│   └── middleware.ts   # JWT authentication middleware
├── .env.local          # Environment variables (not in git)
├── next.config.mjs     # Next.js configuration
└── tailwind.config.mjs # Tailwind CSS configuration
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication for admin routes
- Middleware protection for sensitive endpoints
- Environment variables for all secrets
- httpOnly cookies for tokens

## 📄 License

This is a personal blog project. All content © Soham.

## 🙏 Acknowledgments

Built with Next.js, React, MongoDB, and lots of ☕️


