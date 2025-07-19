/// <reference types="vite/client" />

interface ImportMetaEnv {
    // =============================================================================
    // SUPABASE CONFIGURATION
    // =============================================================================
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_SUPABASE_SERVICE_ROLE_KEY?: string

    // =============================================================================
    // APPLICATION CONFIGURATION
    // =============================================================================
    readonly VITE_APP_NAME: string
    readonly VITE_APP_VERSION: string
    readonly VITE_APP_ENV: 'development' | 'staging' | 'production'
    readonly VITE_APP_BASE_URL: string
    readonly VITE_API_BASE_URL?: string

    // =============================================================================
    // AUTHENTICATION & SECURITY
    // =============================================================================
    readonly VITE_JWT_SECRET?: string
    readonly VITE_SESSION_TIMEOUT: string
    readonly VITE_OAUTH_REDIRECT_URL: string

    // =============================================================================
    // INTERNATIONALIZATION (i18n)
    // =============================================================================
    readonly VITE_DEFAULT_LOCALE: string
    readonly VITE_SUPPORTED_LOCALES: string
    readonly VITE_FALLBACK_LOCALE: string

    // =============================================================================
    // FEATURE FLAGS
    // =============================================================================
    readonly VITE_ENABLE_ANALYTICS: string
    readonly VITE_ENABLE_MUSIC_PLAYER: string
    readonly VITE_ENABLE_EXCEL_EXPORT: string
    readonly VITE_ENABLE_GOALS: string
    readonly VITE_ENABLE_TIMER: string
    readonly VITE_ENABLE_KEYBOARD_SHORTCUTS: string
    readonly VITE_ENABLE_VIRTUALIZATION: string

    // =============================================================================
    // ANALYTICS & TRACKING
    // =============================================================================
    readonly VITE_GA_TRACKING_ID?: string
    readonly VITE_GTM_ID?: string

    // =============================================================================
    // EXTERNAL SERVICES
    // =============================================================================
    readonly VITE_YOUTUBE_API_KEY?: string
    readonly VITE_SPOTIFY_CLIENT_ID?: string
    readonly VITE_SPOTIFY_CLIENT_SECRET?: string

    // =============================================================================
    // PERFORMANCE & OPTIMIZATION
    // =============================================================================
    readonly VITE_ENABLE_PERFORMANCE_MONITORING: string
    readonly VITE_VIRTUAL_SCROLL_ITEM_HEIGHT: string
    readonly VITE_VIRTUAL_SCROLL_OVERSCAN: string

    // =============================================================================
    // DEVELOPMENT & DEBUGGING
    // =============================================================================
    readonly VITE_DEBUG_MODE: string
    readonly VITE_ENABLE_LOGGING: string
    readonly VITE_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error'

    // =============================================================================
    // STORAGE & CACHING
    // =============================================================================
    readonly VITE_STORAGE_PREFIX: string
    readonly VITE_CACHE_EXPIRATION: string

    // =============================================================================
    // NOTIFICATIONS
    // =============================================================================
    readonly VITE_ENABLE_NOTIFICATIONS: string
    readonly VITE_NOTIFICATION_TIMEOUT: string

    // =============================================================================
    // EXPORT & IMPORT
    // =============================================================================
    readonly VITE_EXCEL_EXPORT_FILENAME: string
    readonly VITE_EXCEL_EXPORT_SHEET_NAME: string

    // =============================================================================
    // THEME & UI
    // =============================================================================
    readonly VITE_DEFAULT_THEME: 'light' | 'dark' | 'system'
    readonly VITE_ENABLE_ANIMATIONS: string

    // =============================================================================
    // TIMER & POMODORO
    // =============================================================================
    readonly VITE_DEFAULT_WORK_DURATION: string
    readonly VITE_DEFAULT_BREAK_DURATION: string
    readonly VITE_DEFAULT_LONG_BREAK_DURATION: string
    readonly VITE_SESSIONS_BEFORE_LONG_BREAK: string

    // =============================================================================
    // GOALS & TARGETS
    // =============================================================================
    readonly VITE_DEFAULT_DAILY_HOURS: string
    readonly VITE_DEFAULT_WEEKLY_HOURS: string

    // =============================================================================
    // SECURITY & PRIVACY
    // =============================================================================
    readonly VITE_ENABLE_ENCRYPTION: string
    readonly VITE_PRIVACY_MODE: string

    // =============================================================================
    // BACKUP & SYNC
    // =============================================================================
    readonly VITE_ENABLE_AUTO_BACKUP: string
    readonly VITE_BACKUP_INTERVAL: string

    // =============================================================================
    // INTEGRATIONS
    // =============================================================================
    readonly VITE_SLACK_WEBHOOK_URL?: string
    readonly VITE_DISCORD_WEBHOOK_URL?: string
    readonly VITE_EMAIL_SERVICE_URL?: string
    readonly VITE_EMAIL_API_KEY?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

// =============================================================================
// ENVIRONMENT UTILITY TYPES
// =============================================================================

type Environment = 'development' | 'staging' | 'production'

type FeatureFlag =
    | 'analytics'
    | 'musicPlayer'
    | 'excelExport'
    | 'goals'
    | 'timer'
    | 'keyboardShortcuts'
    | 'virtualization'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type Theme = 'light' | 'dark' | 'system'

// =============================================================================
// ENVIRONMENT UTILITY FUNCTIONS
// =============================================================================

declare global {
    interface Window {
        __ENV__: {
            isDevelopment: boolean
            isStaging: boolean
            isProduction: boolean
            isDebug: boolean
            appName: string
            appVersion: string
            environment: Environment
        }
    }
}

export { } 