import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://yvxapejtkqryjyueefxb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2eGFwZWp0a3FyeWp5dWVlZnhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODUyMjksImV4cCI6MjA5MzA2MTIyOX0.a0U1cAL8D4hzmJc4wUQinjO48u559qNryyDGLuiRcq8";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function test() {
  const { data, error } = await supabase.from('feedback').select('*').limit(1);
  console.log("Error:", error);
  console.log("Data:", data);
}

test();
