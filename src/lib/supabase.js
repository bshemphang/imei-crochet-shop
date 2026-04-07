import { createClient } from '@supabase/supabase-js'

// ⚠️  Fill these in your .env file (copy .env.example → .env)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = (SUPABASE_URL && SUPABASE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null

// 👇 Replace with your WhatsApp number — digits only, no + or spaces
// Example: +91 98765 43210  →  '919876543210'
export const WHATSAPP_NUMBER = '91XXXXXXXXXX'

export const CATEGORIES = [
  'Keychains',
  'Bouquets',
  'Amigurumi',
  'Headbands',
  'Bags',
  'Flowers',
  'Other',
]