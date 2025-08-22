const SUPABASE_URL = import.meta.env.VITE_APP_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_APP_SUPABASE_KEY
const SUPABASE_CALLBACK_URL = import.meta.env.VITE_APP_SUPABASE_CALLBACK_URL

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
console.log("🚀 ~ supabase:", supabase)

export {supabase}