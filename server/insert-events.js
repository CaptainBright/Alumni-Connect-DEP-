const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const events = [
  { title: 'Alumni Mentorship Webinar', event_date: '2026-05-20', event_time: '7:00 PM IST', location: 'Online', description: 'Join us for a mentorship session with top alumni from various industries.' },
  { title: 'Startup Networking Circle', event_date: '2026-05-25', event_time: '6:30 PM IST', location: 'New Delhi', description: 'Network with startup founders and venture capitalists.' },
  { title: 'Annual Alumni Meet Planning', event_date: '2026-06-02', event_time: '5:00 PM IST', location: 'IIT Ropar Campus', description: 'Help us plan the biggest alumni meetup of the year.' },
  { title: 'Mock Interviews Session', event_date: '2026-06-10', event_time: '10:00 AM IST', location: 'Online', description: 'Practice your interview skills with FAANG engineers.' },
  { title: 'Product Management Masterclass', event_date: '2026-06-15', event_time: '6:00 PM IST', location: 'Online', description: 'Learn the ins and outs of product management.' }
];

async function insertEvents() {
  const { data, error } = await supabase.from('events').insert(events);
  if (error) {
    console.error("Error inserting events:", error);
  } else {
    console.log("Events inserted successfully!");
  }
}

insertEvents();
