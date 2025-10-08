# Opentern

> The open-source internship application tracker for developers and students

[![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black)](https://nextjs.org/)
[![Convex](https://img.shields.io/badge/Convex-1.27.0-blue)](https://convex.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.13-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🎯 Mission

Opentern is designed to streamline the internship application process for developers and students. We believe that tracking applications shouldn't be complicated or expensive. Our mission is to provide a powerful, completely free, open-source solution that helps you:

- **Organize** your internship applications efficiently
- **Discover** new opportunities automatically
- **Track** your progress through the application pipeline
- **Collaborate** with the developer community to improve the tool

## ✨ Features

### 🎯 Smart Application Organization

- Track applications by status: Interested → Applied → Assessment → Interviewed → Offered/Rejected
- Add custom notes and links for each application
- Visual status indicators with color-coded badges
- Sortable status history to see your application journey

### 🔍 Automated Opportunity Discovery

- **Automated scraping** from popular GitHub repositories:
  - [vanshb03/Summer2026-Internships](https://github.com/vanshb03/Summer2026-Internships)
  - [SimplifyJobs/Summer2026-Internships](https://github.com/SimplifyJobs/Summer2026-Internships)
- **Real-time updates** via cron jobs (hourly scraping)
- **Smart filtering** by company, location, and keywords
- **One-click application** creation from discovered opportunities

### ⚡ Lightning Fast Performance

- **Virtual scrolling** for handling thousands of applications
- **Real-time search** with fuzzy matching using Fuse.js
- **Optimized database queries** with Convex
- **Responsive design** that works on all devices

### 🔐 Secure & Private

- **Google OAuth** authentication
- **User-specific data** isolation
- **No data sharing** with third parties
- **Open source** - you own your data
- **Completely free** - no subscriptions or payments required

### 🎨 Modern UI/UX

- **DaisyUI** components for consistent design
- **Dark/Light mode** support
- **Intuitive drag-and-drop** status management
- **Mobile-responsive** interface

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- A Google account for authentication
- A Convex account (free tier available)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/gpossst/opentern.git
   cd opentern
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:

   ```env
   # Convex
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   CONVEX_DEPLOY_KEY=your_convex_deploy_key

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # GitHub API (for scraping)
   GITHUB_TOKEN=your_github_token
   ```

4. **Set up Convex**

   ```bash
   npx convex dev
   ```

   This will:
   - Create your Convex project
   - Set up the database schema
   - Deploy your functions

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

### Frontend

- **Next.js 15.2.3** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.1.13** - Utility-first CSS framework
- **DaisyUI 5.1.10** - Component library
- **Lucide React** - Icon library
- **Fuse.js** - Fuzzy search
- **React Virtual** - Virtual scrolling for performance

### Backend

- **Convex 1.27.0** - Real-time backend platform
- **Convex Auth** - Authentication system
- **Zod** - Schema validation

### External Services

- **Google OAuth** - User authentication
- **GitHub API** - Opportunity scraping

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 📁 Project Structure

```
opentern/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── cron/scrape/   # Automated scraping endpoint
│   ├── dashboard/         # Main application dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ApplicationList.tsx    # Application management
│   ├── OpportunitiesList.tsx # Opportunity discovery
│   ├── Sidebar.tsx           # Navigation sidebar
│   └── SortableList.tsx      # Drag-and-drop lists
├── convex/               # Convex backend
│   ├── applications.ts    # Application CRUD operations
│   ├── opportunities.ts   # Opportunity management
│   ├── users.ts          # User management
│   ├── auth.ts           # Authentication
│   └── schema.ts         # Database schema
├── public/               # Static assets
└── rules/                # Convex rules
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Bug Reports

- Use the GitHub issue tracker
- Include steps to reproduce
- Provide your environment details

### 💡 Feature Requests

- Open a GitHub issue with the "enhancement" label
- Describe the use case and expected behavior
- Consider contributing the implementation yourself!

### 🔧 Code Contributions

1. **Fork the repository**

   ```bash
   git clone https://github.com/your-username/opentern.git
   cd opentern
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

4. **Test your changes**

   ```bash
   npm run lint
   npm run build
   ```

5. **Commit your changes**

   ```bash
   git commit -m "feat: add your feature description"
   ```

6. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### 🎯 Areas for Contribution

- **New opportunity sources** - Add scraping for more internship repositories
- **UI/UX improvements** - Enhance the user interface
- **Performance optimizations** - Improve app speed and efficiency
- **API integrations** - Connect with job boards and career sites
- **Analytics** - Add application tracking and insights
- **Documentation** - Improve guides and tutorials

### 📋 Development Guidelines

- **Code Style**: Follow the existing patterns and use Prettier
- **Commits**: Use conventional commit messages
- **Testing**: Add tests for new features
- **Documentation**: Update README and code comments
- **Accessibility**: Ensure UI is accessible to all users

## 🔧 Configuration

### Environment Variables

| Variable                 | Description                   | Required |
| ------------------------ | ----------------------------- | -------- |
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex deployment URL    | Yes      |
| `CONVEX_DEPLOY_KEY`      | Convex deployment key         | Yes      |
| `GOOGLE_CLIENT_ID`       | Google OAuth client ID        | Yes      |
| `GOOGLE_CLIENT_SECRET`   | Google OAuth client secret    | Yes      |
| `GITHUB_TOKEN`           | GitHub API token for scraping | Yes      |

### Convex Setup

1. Create a Convex account at [convex.dev](https://convex.dev)
2. Create a new project
3. Run `npx convex dev` to initialize
4. Copy the deployment URL to your environment variables

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Deploy to your hosting platform**
   - Set environment variables
   - Configure cron jobs for scraping
   - Set up domain and SSL

## 📊 Database Schema

### Applications Table

```typescript
{
  userId: Id<"users">,
  company: string,
  title: string,
  status: "interested" | "applied" | "assessment" | "interviewed" | "offered" | "rejected" | "archived",
  history: Status[],
  notes?: string,
  link?: string,
  dashboardLink?: string,
  lastUpdated?: number,
  opportunityId?: Id<"opportunities">
}
```

### Opportunities Table

```typescript
{
  company: string,
  title: string,
  link?: string,
  location?: string,
  source: string,
  createdAt: number
}
```

## 🔄 Automated Scraping

Opentern automatically scrapes internship opportunities from popular GitHub repositories:

- **Schedule**: Every hour via Vercel cron jobs
- **Sources**:
  - vanshb03/Summer2026-Internships
  - SimplifyJobs/Summer2026-Internships
- **Parsing**: Handles both HTML tables and markdown formats
- **Deduplication**: Prevents duplicate entries
- **Filtering**: Removes expired opportunities (older than 14 days)

## 🛡️ Security & Privacy

- **Authentication**: Secure Google OAuth integration
- **Data Isolation**: User data is completely isolated
- **No Tracking**: We don't track user behavior
- **Open Source**: Full transparency in code
- **GDPR Compliant**: Users control their data

## 📈 Roadmap

### Short Term

- [ ] Add more opportunity sources
- [ ] Improve mobile responsiveness
- [ ] Add application analytics
- [ ] Implement bulk operations
- [ ] Add sponsor recommendations section

### Long Term

- [ ] Team collaboration features
- [ ] Integration with job boards
- [ ] AI-powered opportunity matching
- [ ] Resume integration

## 🤝 Community

- **GitHub Discussions**: Ask questions and share ideas
- **Discord**: Join our community chat
- **Twitter**: Follow for updates [@opentern](https://twitter.com/opentern)

## 💼 Sponsorship Opportunities

We're always looking for ways to improve Opentern and help more students find their dream internships. If you're a company or organization that would like to:

- **Feature your product** in our recommendation section
- **Sponsor development** of new features
- **Partner** with us to reach the developer community

Please get in touch with us! We'd love to discuss how we can work together to make internship tracking even better for students and developers.

**Contact**: Reach out through [GitHub Issues](https://github.com/gpossst/opentern/issues) or [Twitter](https://twitter.com/imgarrettpost) to start the conversation.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **vanshb03** and **SimplifyJobs** for maintaining excellent internship repositories
- **Convex** for providing an amazing real-time backend platform
- **Next.js** team for the incredible React framework
- **All contributors** who help make Opentern better

---

**Made with ❤️ by developers, for developers and students.**

[⭐ Star us on GitHub](https://github.com/gpossst/opentern) | [🐛 Report a bug](https://github.com/gpossst/opentern/issues) | [💡 Request a feature](https://github.com/gpossst/opentern/issues/new?template=feature_request.md)
