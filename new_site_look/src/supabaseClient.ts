import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mcsqxmsvyckabbgefixy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jc3F4bXN2eWNrYWJiZ2VmaXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDM2MjcsImV4cCI6MjA2Mzg3OTYyN30.uMw5Pe4JuB8rbi92Iq7o8Ef-Zf7KNsIFWtyG9strItE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);