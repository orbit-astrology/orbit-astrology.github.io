// cloud-config.js
// ---------------------------------------------------------------
// Where ORBIT's accounts live: a free Supabase project.
//
// These two values are PUBLIC on purpose: every visitor's browser
// needs them to talk to Supabase. They don't give access to anyone's
// data. The protection is on Supabase's side: "row level security"
// rules (development/docs/supabase-setup.sql) let each logged-in
// person read and change only their own row.
//
// Never put the "service_role" or "secret" key here.
// ---------------------------------------------------------------

export const SUPABASE_URL = 'https://inxpjshdjkaedylgjdcz.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlueHBqc2hkamthZWR5bGdqZGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1MDQxMzQsImV4cCI6MjEwODA4MDEzNH0.NIXyCO7SWcrLLsAl8uiD8rBvqjIqzFJMGQd9EdVIm0A'; // the public "anon" key
