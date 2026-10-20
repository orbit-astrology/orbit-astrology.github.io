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

export const SUPABASE_URL = '';  // e.g. 'https://abcdxyz.supabase.co'
export const SUPABASE_KEY = '';  // the "anon public" / "publishable" key
