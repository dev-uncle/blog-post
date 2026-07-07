# DevScribbles | Engineering & Design Journal

DevScribbles is an elegant, modern engineering and design journal application built using **Next.js 16 (App Router)** and **React 19**. It provides a workspace for writing, organizing, and reading highly engaging articles on topics like frontend engineering, CSS animations, React 19 features, and Next.js design patterns.

---

## Live Demo & Credentials

- **Live Website**: [uncledev-blog-post.vercel.app](https://uncledev-blog-post.vercel.app)
- **Demo Credentials**:
  - **Email**: `demo@devscribbles.com`
  - **Password**: `password123`

---

## Features

- **Modern & Dynamic UI/UX**: Premium aesthetic styling leveraging Tailwind CSS v4, smooth animations, interactive transitions, and modern typography (Inter and Geist).
- **Authentication System**: Secure user registration, login, and sessions using JWT session tokens ([jose](https://github.com/panva/jose)) stored in cookies, integrated with client-side context.
- **Article Management**: Fully featured blog interface allowing users to view, search, and filter articles by category, estimate reading time, and create new posts with custom markdown-ready content and cover images.
- **Data Persistence**: Powered by PostgreSQL database via **Neon Serverless** and styled with **Drizzle ORM** for safe schema-first development.
- **Performance & SEO**: Built on Next.js server actions, server components, and responsive, semantic layouts with clean heading structures and descriptive meta headers.

---

## Folder Architecture

The codebase is organized using a modular, **feature-based architecture**. This keeps business logic, views, hooks, and actions contained within their respective domains.

```text
blog-post/
├── app/                      # Next.js App Router routes & layouts
│   ├── actions/              # Global Server Actions (e.g. Auth)
│   ├── posts/                # Blog post views and detailed layouts
│   ├── globals.css           # Global CSS and Tailwind directives
│   └── layout.tsx            # Main layout providing Font setup & Auth Context
├── components/               # Shareable primitive UI components
│   └── ui/                   # Base UI elements (buttons, inputs, dialogs, etc.)
├── features/                 # Domain-driven features
│   ├── auth/                 # Authentication modals, hooks, and context
│   ├── landing/              # Hero, Navbar, Footer, Newsletter, and Post cards
│   └── posts/                # Post list views, creation dialog, and hooks
├── lib/                      # Core helpers & database configuration
│   ├── db/                   # Database connection, schemas, and seeding
│   ├── auth.ts               # Session encryption, decryption, and verification
│   └── utils.ts              # Styling and CSS class merge utility
```

### Key Directories and Files

- **Application Shell & Navigation**:
  - [app/layout.tsx](file:///home/uncledev/Desktop/Client/blog-post/app/layout.tsx): Configures site fonts, metadata, and binds the global user context using the auth provider.
  - [app/page.tsx](file:///home/uncledev/Desktop/Client/blog-post/app/page.tsx): Main index entry assembling landing sections into the viewport.
  - [features/landing/components/Navbar.tsx](file:///home/uncledev/Desktop/Client/blog-post/features/landing/components/Navbar.tsx): Dynamic header displaying authorization status, user profile, and creation utilities.

- **Modular Features**:
  - **Auth Feature** ([features/auth/](file:///home/uncledev/Desktop/Client/blog-post/features/auth)): Contains the `AuthProvider`, login/registration modals, and auth status display indicators.
  - **Posts Feature** ([features/posts/](file:///home/uncledev/Desktop/Client/blog-post/features/posts)): Houses core logic for managing articles. Includes [create-post-dialog.tsx](file:///home/uncledev/Desktop/Client/blog-post/features/posts/components/create-post-dialog.tsx), category filters, and detail components.

- **Shared UI primitives**:
  - [components/ui/](file:///home/uncledev/Desktop/Client/blog-post/components/ui/): Unstyled primitives from `@base-ui/react` customized with Tailwind CSS v4, supporting theme-friendly buttons, selects, dialog templates, and cards.

- **Data Models & Security**:
  - [lib/db/schema.ts](file:///home/uncledev/Desktop/Client/blog-post/lib/db/schema.ts): Drizzle schema for database definition, specifying `users` and `posts` tables with active foreign key references.
  - [lib/auth.ts](file:///home/uncledev/Desktop/Client/blog-post/lib/auth.ts): Implements secure session generation, token sign/verify operations, and utility hooks to extract user context from cookies.
  - [app/actions/auth.ts](file:///home/uncledev/Desktop/Client/blog-post/app/actions/auth.ts) & [features/posts/actions/posts.ts](file:///home/uncledev/Desktop/Client/blog-post/features/posts/actions/posts.ts): Core server actions for mutation operations (sign in, post creation).

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Server Actions)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Base UI](https://base-ui.com/)
- **Database / ORM**: [Neon Database](https://neon.tech/) & [Drizzle ORM](https://orm.drizzle.team/)
- **Security**: [jose](https://github.com/panva/jose) (JWT sessions), [bcryptjs](https://github.com/dcodeIO/bcrypt.js/) (Password hashing)

---

## Getting Started

### 1. Prerequisite Installations
Ensure you have Node.js installed (v18+ recommended).

### 2. Configure Environment Variables
Duplicate the example environment file and configure variables with your secure keys:
```bash
cp .env.example .env.local
```
Inside [**.env.local**](file:///home/uncledev/Desktop/Client/blog-post/.env.local), add your local/cloud PostgreSQL connection and JWT Secret:
```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="generate-a-secure-random-secret-key"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup & Seeding
Deploy database tables and populate mock initial data for development:
```bash
# Push schemas to Neon DB
npx drizzle-kit push

# Populate mock data
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the journal.
