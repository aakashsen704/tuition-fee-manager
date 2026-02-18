import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymblddkgxbrvsvyrpcdr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYmxkZGtneGJydnN2eXJwY2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MjYxMTksImV4cCI6MjA4NzAwMjExOX0.KGx87irSUCwHeVAucdkQJiGken5EfAGV0enRmLPQWUU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
