// =============================================================================
// ENVIRONMENT VARIABLE UTILITIES
// =============================================================================

/**
 * Get environment variable with type safety
 */
export const getEnv = (key: keyof ImportMetaEnv): string => {
    const value = import.meta.env[key]
    if (!value) {
        throw new Error(`Environment variable ${key} is not defined`)
    }
    return value
}

/**
 * Get optional environment variable
 */
export const getOptionalEnv = (key: keyof ImportMetaEnv): string | undefined => {
    return import.meta.env[key]
}

/**
 * Get boolean environment variable
 */
export const getBooleanEnv = (key: keyof ImportMetaEnv): boolean => {
    const value = getEnv(key)
    return value.toLowerCase() === 'true'
}

/**
 * Get optional boolean environment variable
 */
export const getOptionalBooleanEnv = (key: keyof ImportMetaEnv): boolean | undefined => {
    const value = getOptionalEnv(key)
    if (value === undefined) return undefined
    return value.toLowerCase() === 'true'
}

/**
 * Get number environment variable
 */
export const getNumberEnv = (key: keyof ImportMetaEnv): number => {
    const value = getEnv(key)
    const num = parseInt(value, 10)
    if (isNaN(num)) {
        throw new Error(`Environment variable ${key} is not a valid number`)
    }
    return num
}

/**
 * Get optional number environment variable
 */
export const getOptionalNumberEnv = (key: keyof ImportMetaEnv): number | undefined => {
    const value = getOptionalEnv(key)
    if (value === undefined) return undefined
    const num = parseInt(value, 10)
    if (isNaN(num)) {
        throw new Error(`Environment variable ${key} is not a valid number`)
    }
    return num
}

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

export const env = {
    // Supabase Configuration
    supabase: {
        url: getEnv('VITE_SUPABASE_URL'),
        anonKey: getEnv('VITE_SUPABASE_ANON_KEY'),
        serviceRoleKey: getOptionalEnv('VITE_SUPABASE_SERVICE_ROLE_KEY'),
    },

    // Application Configuration
    app: {
        name: getEnv('VITE_APP_NAME'),
        version: getEnv('VITE_APP_VERSION'),
        environment: getEnv('VITE_APP_ENV') as Environment,
        baseUrl: getEnv('VITE_APP_BASE_URL'),
        apiBaseUrl: getOptionalEnv('VITE_API_BASE_URL'),
    },

    // Authentication & Security
    auth: {
        jwtSecret: getOptionalEnv('VITE_JWT_SECRET'),
        sessionTimeout: getNumberEnv('VITE_SESSION_TIMEOUT'),
        oauthRedirectUrl: getEnv('VITE_OAUTH_REDIRECT_URL'),
    },

    // Internationalization
    i18n: {
        defaultLocale: getEnv('VITE_DEFAULT_LOCALE'),
        supportedLocales: getEnv('VITE_SUPPORTED_LOCALES').split(','),
        fallbackLocale: getEnv('VITE_FALLBACK_LOCALE'),
    },

    // Feature Flags
    features: {
        analytics: getBooleanEnv('VITE_ENABLE_ANALYTICS'),
        musicPlayer: getBooleanEnv('VITE_ENABLE_MUSIC_PLAYER'),
        excelExport: getBooleanEnv('VITE_ENABLE_EXCEL_EXPORT'),
        goals: getBooleanEnv('VITE_ENABLE_GOALS'),
        timer: getBooleanEnv('VITE_ENABLE_TIMER'),
        keyboardShortcuts: getBooleanEnv('VITE_ENABLE_KEYBOARD_SHORTCUTS'),
        virtualization: getBooleanEnv('VITE_ENABLE_VIRTUALIZATION'),
    },

    // Analytics & Tracking
    analytics: {
        gaTrackingId: getOptionalEnv('VITE_GA_TRACKING_ID'),
        gtmId: getOptionalEnv('VITE_GTM_ID'),
    },

    // External Services
    services: {
        youtubeApiKey: getOptionalEnv('VITE_YOUTUBE_API_KEY'),
        spotify: {
            clientId: getOptionalEnv('VITE_SPOTIFY_CLIENT_ID'),
            clientSecret: getOptionalEnv('VITE_SPOTIFY_CLIENT_SECRET'),
        },
    },

    // Performance & Optimization
    performance: {
        monitoring: getBooleanEnv('VITE_ENABLE_PERFORMANCE_MONITORING'),
        virtualScroll: {
            itemHeight: getNumberEnv('VITE_VIRTUAL_SCROLL_ITEM_HEIGHT'),
            overscan: getNumberEnv('VITE_VIRTUAL_SCROLL_OVERSCAN'),
        },
    },

    // Development & Debugging
    debug: {
        mode: getBooleanEnv('VITE_DEBUG_MODE'),
        logging: getBooleanEnv('VITE_ENABLE_LOGGING'),
        logLevel: getEnv('VITE_LOG_LEVEL') as LogLevel,
    },

    // Storage & Caching
    storage: {
        prefix: getEnv('VITE_STORAGE_PREFIX'),
        cacheExpiration: getNumberEnv('VITE_CACHE_EXPIRATION'),
    },

    // Notifications
    notifications: {
        enabled: getBooleanEnv('VITE_ENABLE_NOTIFICATIONS'),
        timeout: getNumberEnv('VITE_NOTIFICATION_TIMEOUT'),
    },

    // Export & Import
    export: {
        filename: getEnv('VITE_EXCEL_EXPORT_FILENAME'),
        sheetName: getEnv('VITE_EXCEL_EXPORT_SHEET_NAME'),
    },

    // Theme & UI
    ui: {
        defaultTheme: getEnv('VITE_DEFAULT_THEME') as Theme,
        animations: getBooleanEnv('VITE_ENABLE_ANIMATIONS'),
    },

    // Timer & Pomodoro
    timer: {
        defaultWorkDuration: getNumberEnv('VITE_DEFAULT_WORK_DURATION'),
        defaultBreakDuration: getNumberEnv('VITE_DEFAULT_BREAK_DURATION'),
        defaultLongBreakDuration: getNumberEnv('VITE_DEFAULT_LONG_BREAK_DURATION'),
        sessionsBeforeLongBreak: getNumberEnv('VITE_SESSIONS_BEFORE_LONG_BREAK'),
    },

    // Goals & Targets
    goals: {
        defaultDailyHours: getNumberEnv('VITE_DEFAULT_DAILY_HOURS'),
        defaultWeeklyHours: getNumberEnv('VITE_DEFAULT_WEEKLY_HOURS'),
    },

    // Security & Privacy
    security: {
        encryption: getBooleanEnv('VITE_ENABLE_ENCRYPTION'),
        privacyMode: getBooleanEnv('VITE_PRIVACY_MODE'),
    },

    // Backup & Sync
    backup: {
        autoBackup: getBooleanEnv('VITE_ENABLE_AUTO_BACKUP'),
        interval: getNumberEnv('VITE_BACKUP_INTERVAL'),
    },

    // Integrations
    integrations: {
        slack: {
            webhookUrl: getOptionalEnv('VITE_SLACK_WEBHOOK_URL'),
        },
        discord: {
            webhookUrl: getOptionalEnv('VITE_DISCORD_WEBHOOK_URL'),
        },
        email: {
            serviceUrl: getOptionalEnv('VITE_EMAIL_SERVICE_URL'),
            apiKey: getOptionalEnv('VITE_EMAIL_API_KEY'),
        },
    },
}

// =============================================================================
// ENVIRONMENT UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if current environment is development
 */
export const isDevelopment = (): boolean => {
    return env.app.environment === 'development'
}

/**
 * Check if current environment is staging
 */
export const isStaging = (): boolean => {
    return env.app.environment === 'staging'
}

/**
 * Check if current environment is production
 */
export const isProduction = (): boolean => {
    return env.app.environment === 'production'
}

/**
 * Check if debug mode is enabled
 */
export const isDebugMode = (): boolean => {
    return env.debug.mode
}

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
    switch (feature) {
        case 'analytics':
            return env.features.analytics
        case 'musicPlayer':
            return env.features.musicPlayer
        case 'excelExport':
            return env.features.excelExport
        case 'goals':
            return env.features.goals
        case 'timer':
            return env.features.timer
        case 'keyboardShortcuts':
            return env.features.keyboardShortcuts
        case 'virtualization':
            return env.features.virtualization
        default:
            return false
    }
}

/**
 * Get storage key with prefix
 */
export const getStorageKey = (key: string): string => {
    return `${env.storage.prefix}${key}`
}

/**
 * Log environment information (only in development)
 */
export const logEnvironmentInfo = (): void => {
    if (isDevelopment() && env.debug.logging) {
        console.group('🌍 Environment Information')
        console.log('App Name:', env.app.name)
        console.log('Version:', env.app.version)
        console.log('Environment:', env.app.environment)
        console.log('Debug Mode:', env.debug.mode)
        console.log('Log Level:', env.debug.logLevel)
        console.groupEnd()
    }
}

// =============================================================================
// GLOBAL ENVIRONMENT OBJECT
// =============================================================================

// Expose environment info globally for debugging
if (typeof window !== 'undefined') {
    window.__ENV__ = {
        isDevelopment: isDevelopment(),
        isStaging: isStaging(),
        isProduction: isProduction(),
        isDebug: isDebugMode(),
        appName: env.app.name,
        appVersion: env.app.version,
        environment: env.app.environment,
    }
}

// Log environment info on module load
logEnvironmentInfo() 