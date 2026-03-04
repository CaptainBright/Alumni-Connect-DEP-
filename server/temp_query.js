const fs = require('fs');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

try {
    const envConfig = dotenv.parse(fs.readFileSync('.env'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} catch (e) {
    fs.writeFileSync('output.json', JSON.stringify({ error: 'Error loading .env file', details: e.toString() }));
    process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    try {
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');

        const { data: policies, error: policiesError } = await supabase
            .rpc('get_policies_dummy'); // This will fail but show connection works, let's query pg_policies using service role? 
        // Supabase REST doesn't expose pg_policies by default. It's fine, getting profiles is enough.

        if (profilesError) {
            fs.writeFileSync('output.json', JSON.stringify({ error: profilesError }));
            return;
        }

        fs.writeFileSync('output.json', JSON.stringify({ profiles }, null, 2));
    } catch (err) {
        fs.writeFileSync('output.json', JSON.stringify({ error: err.message }));
    }
}

checkData();
