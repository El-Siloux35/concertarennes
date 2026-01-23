import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pfvfssqlcfodwbsbiciu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmdmZzc3FsY2ZvZHdic2JpY2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MTYwNTAsImV4cCI6MjA4MzM5MjA1MH0.Rw5DhXkWahsr-7_kP8lIWJQSmIxAyQzPYBb1iBQE9zo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
