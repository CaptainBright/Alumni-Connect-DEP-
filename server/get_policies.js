const { Client } = require('pg');
require('dotenv').config();

async function getPolicies() {
    // Construct postgres connection string from supabase url
    // SUPABASE_URL: https://mdvdhqvtecpoohqxdftn.supabase.co
    // Usually host is db.mdvdhqvtecpoohqxdftn.supabase.co
    
    // We don't have the DB password. 
    // Is there a way to query pg_policies via supabaseAdmin? Yes, if we use the REST API for query.
    // supabase doesn't expose meta tables by default via API.
}
getPolicies();
