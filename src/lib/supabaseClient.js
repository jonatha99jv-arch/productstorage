import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey)

let supabase
if (hasSupabase) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Fallback stub to avoid crashes when env vars are missing; operations will no-op
  console.warn('Supabase env vars ausentes. Usando fallback que utiliza localStorage.')
  supabase = {
    from() {
      return {
        select() { return Promise.resolve({ data: [], error: { message: 'no-op', code: 'NO_ENV' } }) },
        insert() { return Promise.resolve({ data: [], error: { message: 'no-op', code: 'NO_ENV' } }) },
        update() { return Promise.resolve({ data: [], error: { message: 'no-op', code: 'NO_ENV' } }) },
        delete() { return Promise.resolve({ error: { message: 'no-op', code: 'NO_ENV' } }) },
        eq() { return this },
        order() { return this },
        limit() { return this },
        selectOne() { return Promise.resolve({ data: null, error: { message: 'no-op', code: 'NO_ENV' } }) }
      }
    },
    rpc() { return Promise.resolve({ data: null, error: { message: 'no-op', code: 'NO_ENV' } }) }
  }
}

export { supabase }

