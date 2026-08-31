import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseMissing = !supabaseUrl || !supabaseAnonKey
  || supabaseUrl === 'your-supabase-project-url'
  || supabaseAnonKey === 'your-supabase-anon-key'

let supabase = null
let initError = null

if (supabaseMissing) {
  initError = (
    'Supabase env vars are not configured. ' +
    'Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
    'from your Supabase project settings → API.'
  )
  console.warn(initError)
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } catch (err) {
    initError = 'Failed to initialise Supabase client: ' + (err?.message || err)
    console.error(err)
  }
}

export { supabase, initError }
