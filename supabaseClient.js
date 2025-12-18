import { createClient } from '@supabase/supabase-js'

// Sua URL correta
const supabaseUrl = 'https://bxgpfvzfhjmyljqpyrbh.supabase.co'

// A Chave que começa com eyJh... (Cole a sua aqui dentro)
const supabaseKey = 'sb_publishable_YtwJXizwMUGnLhG0MDxXmQ_CzWEWwLl'

export const supabase = createClient(supabaseUrl, supabaseKey)