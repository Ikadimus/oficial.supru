import { createClient } from '@supabase/supabase-js'

// Tenta pegar do localStorage (caso o usuário configure via UI na tela de login)
const localUrl = typeof window !== 'undefined' ? localStorage.getItem('supabase_url') : null;
const localKey = typeof window !== 'undefined' ? localStorage.getItem('supabase_key') : null;

// URL e Chave fornecidas
const defaultUrl = 'https://ucyybgyhnwnpkfhwsoea.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjeXliZ3lobnducGtmaHdzb2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMDIwODYsImV4cCI6MjA3OTU3ODA4Nn0.XFtRxT69WWda-M6WrS3LRHXT-Wh4tA9ZOD20BTPx-8A';

const supabaseUrl = localUrl || defaultUrl;
const supabaseAnonKey = localKey || defaultKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);