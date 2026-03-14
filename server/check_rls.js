const fs = require('fs');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkPolicies() {
    let result = { alumniError: null, initError: null };
    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        
        // 2. Alumni exactly as in authController.js
        const normalizedEmail = 'test_alumni_full@example.com';
        const userType = 'Alumni';
        const { data: alumniAuth, error: alumniAuthErr } = await supabaseAdmin.auth.admin.createUser({
            email: normalizedEmail,
            password: 'password123',
            email_confirm: true,
            user_metadata: { 
                full_name: 'Test Alumni Full',
                graduation_year: 2020,
                branch: 'Computer Science',
                company: 'Google',
                linkedin: 'https://linkedin.com/in/test',
                role: 'Software Engineer',
                user_type: userType
            }
        });
        
        if (alumniAuthErr) {
            result.alumniError = "Auth: " + alumniAuthErr.message;
        } else {
            const profileRow = {
                id: alumniAuth.user.id,
                email: normalizedEmail,
                full_name: 'Test Alumni Full',
                graduation_year: 2020,
                branch: 'Computer Science',
                company: 'Google',
                linkedin: 'https://linkedin.com/in/test',
                role: 'Software Engineer',
                user_type: userType,
                is_approved: false,
                approval_status: 'PENDING',
                admin_notes: null,
                created_at: new Date().toISOString()
            };

            const { error: alumniError } = await supabaseAdmin.from('profiles').upsert(profileRow, { onConflict: 'id' });
            result.alumniError = alumniError ? alumniError.message : "Success";
            await supabaseAdmin.auth.admin.deleteUser(alumniAuth.user.id);
        }

    } catch (e) {
        result.initError = e.message;
    }
    fs.writeFileSync('output.json', JSON.stringify(result));
}

checkPolicies();
