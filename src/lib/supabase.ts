import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { supabaseConfig, validateEnvironment } from '@/config/environment'

// Validate environment variables on initialization
validateEnvironment()

const supabaseUrl = supabaseConfig.url
const supabaseAnonKey = supabaseConfig.anonKey

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
