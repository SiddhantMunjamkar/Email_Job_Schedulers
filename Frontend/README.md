# Email Job Schedulers - Frontend

A modern, feature-rich email scheduling application built with Next.js 16 and React 19. This application allows users to compose, schedule, and manage bulk email campaigns with advanced features like delayed sending, hourly limits, and rich text editing.

## 🚀 Features

### Authentication
- **Google OAuth Integration** - Quick sign-in with Google account
- **Email/Password Authentication** - Traditional email-based login
- Secure session management

### Email Composition
- **Rich Text Editor** - Powered by TipTap with extensive formatting options:
  - Headings (H1, H2, H3)
  - Text alignment (left, center, right, justify)
  - Bold, italic, underline, strikethrough
  - Lists (ordered and unordered)
  - Code blocks and inline code
  - Blockquotes
  - Horizontal rules
  - And more...

### Advanced Scheduling
- **Send Later** - Schedule emails to be sent at a specific date and time
- **Delay Between Emails** - Set custom delays between individual emails to avoid spam filters
- **Hourly Limits** - Control the number of emails sent per hour
- **Bulk Recipients** - Send to multiple recipients with CSV/TXT file upload support

### Sender Management
- Multiple sender account support
- Easy switching between different email accounts
- Sender profile management

### Email Management
- **Dashboard** - Overview of all email campaigns
- **Scheduled Emails** - View and manage scheduled email jobs
- **Sent Emails** - Track sent email history
- **Email Details** - Detailed view of individual email campaigns

### UI/UX
- Clean, modern interface built with Tailwind CSS
- Responsive design for all screen sizes
- Loading states and spinners
- Dropdown menus and popovers
- Custom UI components with Radix UI
- Icons from Lucide React and React Icons

## 🛠️ Tech Stack

### Core
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React version
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling

### UI Components
- **Radix UI** - Accessible component primitives
- **Headless UI** - Unstyled, accessible components
- **Lucide React** - Beautiful icon library
- **React Icons** - Additional icon sets

### Rich Text Editor
- **TipTap** - Extensible rich text editor
  - Core, React, and Starter Kit
  - Text formatting extensions
  - Heading extensions
  - List extensions
  - Typography extension

### Utilities
- **class-variance-authority** - Component variants
- **clsx** - Conditional classnames
- **tailwind-merge** - Merge Tailwind classes
- **date-fns** - Date manipulation
- **react-day-picker** - Date picker component
- **react-hotkeys-hook** - Keyboard shortcuts

## 📁 Project Structure

```
Frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   └── login/               # Login page with Google & Email auth
│   ├── compose/                 # Email composition page
│   ├── dashboard/               # Main dashboard
│   │   ├── scheduled/          # Scheduled emails view
│   │   └── sent/               # Sent emails history
│   ├── emaildetail/[id]/       # Individual email details
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
│
├── components/                  # Reusable components
│   ├── Compose/                # Email composition components
│   │   ├── BodyEditor.tsx      # TipTap rich text editor
│   │   ├── Delay-emails.tsx    # Delay configuration
│   │   ├── EditorToolbar.tsx   # Formatting toolbar
│   │   ├── FromEmail.tsx       # Sender selection
│   │   ├── Hourlylimilt.tsx    # Hourly limit settings
│   │   ├── Sendlater-datetime.tsx # Date/time picker
│   │   ├── SendToInput.tsx     # Recipient input
│   │   └── SubjectInput.tsx    # Email subject
│   ├── emails/                 # Email-related components
│   ├── Sidebar/                # Navigation sidebar
│   ├── Topbar/                 # Top navigation bar
│   ├── ui/                     # UI primitives
│   ├── LoadingOverlay.tsx      # Loading state overlay
│   └── profileDropdown.tsx     # User profile menu
│
├── hooks/                       # Custom React hooks
├── lib/                         # Utilities and helpers
│   ├── api/                    # API client
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Utility functions
│
├── public/                      # Static assets
├── styles/                      # Additional styles
└── package.json                # Dependencies and scripts
```

## 🚦 Getting Started

### Prerequisites
- Node.js 20 or higher
- npm, yarn, or pnpm package manager

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Frontend
```

2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_API_URL=your_backend_api_url
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
# Add other required environment variables
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

## 🔑 Authentication Flow

1. Users can sign in using Google OAuth or email/password
2. Upon successful authentication, users are redirected to the dashboard
3. Session tokens are managed securely
4. Protected routes require authentication

## 📧 Email Composition Workflow

1. **Select Sender** - Choose from configured email accounts
2. **Add Recipients** - Enter email addresses manually or upload from file
3. **Compose Email** - Use the rich text editor to create your message
4. **Configure Options**:
   - Set delay between emails
   - Set hourly sending limit
   - Schedule for later (optional)
5. **Send or Schedule** - Send immediately or schedule for later

## 🎨 Styling

This project uses:
- **Tailwind CSS** for utility-first styling
- **PostCSS** for CSS processing
- Custom color scheme and design tokens
- Responsive design patterns
- Dark mode support (if implemented)

## 📦 Component Library

The project uses a combination of:
- **Radix UI** for accessible, unstyled components
- **Custom UI components** in `components/ui/`
- **Shadcn-style** component architecture

## 🔒 Type Safety

Full TypeScript support with:
- Type definitions in `lib/types/`
- Strict type checking
- IntelliSense support
- Type-safe API calls

## 🌐 API Integration

The frontend communicates with a backend API for:
- User authentication
- Email sending and scheduling
- Sender account management
- Email history and analytics

API client is located in `lib/api/api.server.ts`.

## 🐛 Debugging

- Use React DevTools for component inspection
- Check browser console for errors
- Review Network tab for API calls
- Use Next.js built-in error handling

## 📈 Performance Optimization

- Server-side rendering with Next.js App Router
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Optimized bundle size



## 📄 License

This project is private and proprietary.

## 🆘 Support

For support and questions, please contact the development team.

---

Built with ❤️ using Next.js and React
