# 🌍 WorkTrackr - Environment Variables Setup

## 🚀 Quick Start

### 1. Setup Environment Variables

```bash
# Interactive setup (recommended)
npm run setup

# Quick setup options
npm run setup:dev     # Development environment
npm run setup:staging # Staging environment
npm run setup:prod    # Production environment
```

### 2. Start Development Server

```bash
npm run dev
```

Server will start at: http://localhost:5173/

## 📋 Environment Configuration

The project includes comprehensive environment variable management:

- **`env.example`** - Complete template with all variables
- **`env.development`** - Development environment defaults
- **`env.staging`** - Staging environment configuration
- **`env.production`** - Production environment configuration

## 🔧 Required Variables

Make sure to configure these required variables:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_NAME=WorkTrackr
VITE_APP_ENV=development
VITE_APP_BASE_URL=http://localhost:5173
```

## 📚 Documentation

- **`ENVIRONMENT.md`** - Comprehensive environment variables guide
- **`ENVIRONMENT_SUMMARY.md`** - Quick reference and setup summary

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
npm run setup        # Interactive environment setup
```

## 🔒 Security

- Environment files (`.env`) are excluded from git
- Type-safe environment variable access
- Validation for required variables
- Environment-specific security settings

## 🌟 Features

- **Type Safety** - All environment variables are fully typed
- **Feature Flags** - Easy feature toggling
- **Environment-Specific** - Different configs for dev/staging/prod
- **Interactive Setup** - Guided configuration process
- **Comprehensive Documentation** - Detailed guides and examples

## 📖 Next Steps

1. Review `ENVIRONMENT.md` for detailed configuration options
2. Configure your Supabase project settings
3. Customize feature flags based on your needs
4. Set up external service integrations as needed

---

For detailed documentation, see [ENVIRONMENT.md](./ENVIRONMENT.md)
