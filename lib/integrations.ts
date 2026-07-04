/**
 * Provider registry — the single source of truth for every platform Kizuna
 * can connect to. The connections hub UI and the generic OAuth routes are
 * both driven by this list, so adding a platform = adding an entry here
 * (plus its API keys in env for OAuth providers).
 */

export type IntegrationCategory =
  | 'recovery'
  | 'activity'
  | 'nutrition'
  | 'body'
  | 'glucose'
  | 'aggregator'

export type AuthMethod = 'apple_health' | 'oauth' | 'aggregator' | 'api'

export type IntegrationStatus = 'live' | 'beta' | 'soon'

export interface OAuthConfig {
  /** Provider authorize endpoint. */
  authorizeUrl: string
  tokenUrl: string
  scopes: string
  /** Env var names holding the client id/secret. */
  clientIdEnv: string
  clientSecretEnv: string
}

export interface Provider {
  key: string
  name: string
  category: IntegrationCategory
  auth: AuthMethod
  status: IntegrationStatus
  /** What this platform contributes. */
  dataTypes: string[]
  blurb: string
  brand: string // hex for the accent dot
  oauth?: OAuthConfig
}

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  recovery: 'Sleep & Recovery',
  activity: 'Activity & Training',
  nutrition: 'Nutrition',
  body: 'Body Composition',
  glucose: 'Metabolic',
  aggregator: 'Connect Everything',
}

export const PROVIDERS: Provider[] = [
  {
    key: 'apple_health',
    name: 'Apple Health',
    category: 'recovery',
    auth: 'apple_health',
    status: 'beta',
    dataTypes: ['Sleep', 'HRV', 'Resting HR', 'Workouts', 'Steps'],
    blurb: 'Sync Apple Watch sleep, HRV & workouts via the Kizuna Shortcut.',
    brand: '#F2EEE6',
  },
  {
    key: 'oura',
    name: 'Oura',
    category: 'recovery',
    auth: 'oauth',
    status: 'soon',
    dataTypes: ['Sleep stages', 'Readiness', 'HRV', 'Temp'],
    blurb: 'Best-in-class sleep and readiness data.',
    brand: '#7AA0C4',
    oauth: {
      authorizeUrl: 'https://cloud.ouraring.com/oauth/authorize',
      tokenUrl: 'https://api.ouraring.com/oauth/token',
      scopes: 'daily personal',
      clientIdEnv: 'OURA_CLIENT_ID',
      clientSecretEnv: 'OURA_CLIENT_SECRET',
    },
  },
  {
    key: 'whoop',
    name: 'Whoop',
    category: 'recovery',
    auth: 'oauth',
    status: 'soon',
    dataTypes: ['Recovery', 'Strain', 'Sleep', 'HRV'],
    blurb: 'Strain and recovery for hard-training athletes.',
    brand: '#12A594',
    oauth: {
      authorizeUrl: 'https://api.prod.whoop.com/oauth/oauth2/auth',
      tokenUrl: 'https://api.prod.whoop.com/oauth/oauth2/token',
      scopes: 'read:recovery read:sleep read:workout read:cycles',
      clientIdEnv: 'WHOOP_CLIENT_ID',
      clientSecretEnv: 'WHOOP_CLIENT_SECRET',
    },
  },
  {
    key: 'fitbit',
    name: 'Fitbit',
    category: 'recovery',
    auth: 'oauth',
    status: 'soon',
    dataTypes: ['Sleep', 'HR', 'Steps', 'Weight'],
    blurb: 'Widely-used sleep, heart rate and activity tracking.',
    brand: '#00B0B9',
    oauth: {
      authorizeUrl: 'https://www.fitbit.com/oauth2/authorize',
      tokenUrl: 'https://api.fitbit.com/oauth2/token',
      scopes: 'sleep heartrate activity weight',
      clientIdEnv: 'FITBIT_CLIENT_ID',
      clientSecretEnv: 'FITBIT_CLIENT_SECRET',
    },
  },
  {
    key: 'garmin',
    name: 'Garmin',
    category: 'recovery',
    auth: 'oauth',
    status: 'soon',
    dataTypes: ['Sleep', 'Stress', 'Body Battery', 'Activities'],
    blurb: 'Deep training + recovery data (partner API).',
    brand: '#007CC3',
  },
  {
    key: 'strava',
    name: 'Strava',
    category: 'activity',
    auth: 'oauth',
    status: 'soon',
    dataTypes: ['Runs', 'Rides', 'Workouts'],
    blurb: 'Endurance activity for the training pillar.',
    brand: '#FC4C02',
    oauth: {
      authorizeUrl: 'https://www.strava.com/oauth/authorize',
      tokenUrl: 'https://www.strava.com/oauth/token',
      scopes: 'activity:read_all',
      clientIdEnv: 'STRAVA_CLIENT_ID',
      clientSecretEnv: 'STRAVA_CLIENT_SECRET',
    },
  },
  {
    key: 'withings',
    name: 'Withings',
    category: 'body',
    auth: 'oauth',
    status: 'soon',
    dataTypes: ['Weight', 'Body fat', 'Sleep', 'BP'],
    blurb: 'Smart scale body-composition and sleep.',
    brand: '#00C2A8',
    oauth: {
      authorizeUrl: 'https://account.withings.com/oauth2_user/authorize2',
      tokenUrl: 'https://wbsapi.withings.net/v2/oauth2',
      scopes: 'user.metrics,user.activity',
      clientIdEnv: 'WITHINGS_CLIENT_ID',
      clientSecretEnv: 'WITHINGS_CLIENT_SECRET',
    },
  },
  {
    key: 'dexcom',
    name: 'Dexcom',
    category: 'glucose',
    auth: 'oauth',
    status: 'soon',
    dataTypes: ['Glucose (CGM)'],
    blurb: 'Continuous glucose for a metabolic premium tier.',
    brand: '#5BC500',
  },
  {
    key: 'terra',
    name: 'Terra',
    category: 'aggregator',
    auth: 'aggregator',
    status: 'soon',
    dataTypes: ['Oura', 'Whoop', 'Garmin', 'Apple', 'Google Fit', '+more'],
    blurb: 'One connection unlocks the whole ecosystem, incl. Apple via SDK.',
    brand: '#E7B24C',
  },
]

export function getProvider(key: string): Provider | undefined {
  return PROVIDERS.find((p) => p.key === key)
}

/** An OAuth provider is "configured" once its client id/secret env vars exist. */
export function isOAuthConfigured(p: Provider): boolean {
  if (!p.oauth) return false
  return Boolean(process.env[p.oauth.clientIdEnv] && process.env[p.oauth.clientSecretEnv])
}

export const STATUS_LABELS: Record<IntegrationStatus, string> = {
  live: 'Connect',
  beta: 'Connect · Beta',
  soon: 'Coming soon',
}
