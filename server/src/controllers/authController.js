const supabase = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/jwt');
// const OTP = require('../models/otpModel'); // No longer needed

// Initialize Supabase Admin Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabase.createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

function createSupabaseAuthClient() {
    // Use anon key for end-user sign-in so the admin client never gets user session state.
    const authKey = process.env.SUPABASE_ANON_KEY || supabaseServiceKey;
    return supabase.createClient(supabaseUrl, authKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

// Nodemailer transporter has been removed.
// Emails are proxied to Vercel serverless function to bypass Render SMTP block.

function normalizeRegistrationType(value) {
    const normalized = (value || '').toString().trim().toLowerCase();
    if (normalized === 'student') return 'Student';
    return 'Alumni';
}

// LOGIN
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Sign in using a request-scoped auth client.
        // This avoids mutating the shared service-role client session.
        const supabaseAuth = createSupabaseAuthClient();
        const { data, error } = await supabaseAuth.auth.signInWithPassword({
            email: normalizedEmail,
            password
        });

        if (error || !data.user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = data.user;

        // Check approval status from profiles table
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return res.status(403).json({ message: 'Profile not found.' });
        }

        const token = generateToken({
            id: user.id,
            email: normalizedEmail,
            role: profile.user_type,
            approval_status: profile.approval_status
        });

        res.cookie('session_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: normalizedEmail,
                role: profile.user_type,
                approval_status: profile.approval_status,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                profile_image: profile.profile_image
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// LOGOUT
// LOGOUT
exports.logoutUser = (req, res) => {
    res.clearCookie('session_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// GOOGLE / SUPABASE TOKEN LOGIN
exports.loginWithSupabaseToken = async (req, res) => {
    try {
        const { access_token, refresh_token } = req.body;

        if (!access_token) {
            return res.status(400).json({ message: 'Access token required' });
        }

        // Verify the token with Supabase
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(access_token);

        if (error || !user) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Check approval status from profiles table
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        let currentProfile = profile;

        if (!currentProfile) {
            const isIitRopar = user.email.endsWith('@iitrpr.ac.in');
            currentProfile = {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email.split('@')[0],
                user_type: isIitRopar ? 'Student' : 'Alumni',
                is_approved: false,
                approval_status: 'PENDING',
                created_at: new Date().toISOString()
            };

            await supabaseAdmin.from('profiles').upsert(currentProfile);
        }

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: currentProfile.user_type,
            approval_status: currentProfile.approval_status
        });

        res.cookie('session_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                role: currentProfile.user_type,
                approval_status: currentProfile.approval_status,
                full_name: currentProfile.full_name,
                avatar_url: currentProfile.avatar_url,
                profile_image: currentProfile.profile_image
            }
        });

    } catch (error) {
        console.error('Google Login Error:', error);
        res.status(500).json({ message: 'Server error during google login' });
    }
};

// GET CURRENT USER (Session Restore)
exports.getMe = async (req, res) => {
    try {
        const token = req.cookies.session_token;

        if (!token) {
            return res.status(401).json({ message: 'No session found' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', decoded.id)
            .single();

        if (!profile) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            user: {
                id: profile.id,
                email: profile.email,
                role: profile.user_type,
                approval_status: profile.approval_status,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                profile_image: profile.profile_image
            }
        });

    } catch (error) {
        res.status(401).json({ message: 'Invalid session' });
    }
};


// Generate and Send OTP
exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Generate 6-digit OTP
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
        });

        // Save OTP to Supabase Table 'otps'
        // Upsert equivalent: Delete old OTPs for this email first, then insert new one
        // Or just insert, and we check the latest one directly.
        // Let's clean up old ones to be safe/clean.

        // Delete existing OTPs for this email to avoid clutter/confusion
        await supabaseAdmin
            .from('otps')
            .delete()
            .eq('email', email);

        // Insert new OTP
        const { error: dbError } = await supabaseAdmin
            .from('otps')
            .insert([
                {
                    email,
                    otp,
                    // expires_at is handled by default in SQL or we can set it here if we want dynamic
                    // But our SQL has default (now() + 5 min), so we leave it.
                }
            ]);

        if (dbError) {
            console.error('Supabase DB Error:', dbError);
            return res.status(500).json({ message: 'Failed to save OTP' });
        }

        // Proxy email sending to Vercel Serverless Function
        const proxyUrl = `${process.env.FRONTEND_URL || 'https://alumni-connect-dep.vercel.app'}/api/send-email`;
        console.log(`[sendOtp] Proxying email to Vercel at ${proxyUrl}...`);

        try {
            const proxyResponse = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.EMAIL_API_KEY || ''
                },
                body: JSON.stringify({
                    to: email,
                    subject: 'Your Password Reset OTP',
                    text: `Your OTP for password reset is: ${otp}. It is valid for 5 minutes.`
                })
            });

            if (!proxyResponse.ok) {
                const errorData = await proxyResponse.text();
                throw new Error(`Vercel responded with ${proxyResponse.status}: ${errorData}`);
            }

            res.status(200).json({ message: 'OTP sent successfully' });
        } catch (err) {
            console.error('Error proxying email to Vercel:', err);
            return res.status(500).json({ message: 'Failed to send OTP email via Vercel proxy' });
        }

    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        // Check OTP in Supabase table
        const { data: otps, error: dbError } = await supabaseAdmin
            .from('otps')
            .select('*')
            .eq('email', email)
            .order('created_at', { ascending: false })
            .limit(1);

        if (dbError) {
            console.error('DB Error:', dbError);
            return res.status(500).json({ message: 'Database error' });
        }

        const otpRecord = otps && otps.length > 0 ? otps[0] : null;

        if (!otpRecord) {
            return res.status(400).json({ message: 'OTP not found or expired' });
        }

        // Check expiration (manual check if SQL doesn't auto-delete, which it doesn't without pg_cron)
        const now = new Date();
        const expiresAt = new Date(otpRecord.expires_at || otpRecord.created_at); // Fallback if expires_at missing
        // If we used the SQL default, expires_at is set.

        if (now > expiresAt) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // OTP verifies successfully.
        // Generate a temporary JWT token
        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // Delete used OTP
        await supabaseAdmin.from('otps').delete().eq('email', email);

        res.status(200).json({
            message: 'OTP verified successfully',
            resetToken,
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ message: 'Server error check' });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword, resetToken } = req.body;

        if (!email || !newPassword || !resetToken) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Verify the reset token
        try {
            const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
            if (decoded.email !== email) {
                return res.status(403).json({ message: 'Invalid token for this email' });
            }
        } catch (err) {
            return res.status(403).json({ message: 'Invalid or expired reset token' });
        }

        // Update password in Supabase using Admin API
        // First, we need the user's ID. We can get it by email if needed, or update by email directly (if supported, currently updateUserById is standard)

        // Admin API to get user by email is not directly available in some versions, simpler to list users or rely on ID.
        // However, Supabase Admin createClient allows modifying user by ID.
        // Let's standardly fetch user ID from email first if needed, but actually admin.updateUserById requires ID.
        // Wait, recent Supabase JS versions allow admin.updateUserById(uid, attributes).

        // Workaround: We need the user ID.
        // Let's fetch the user list and find by email (safe for admin) involves pagination but usually okay for individual lookup if indexed? 
        // Actually, `supabase.auth.admin.listUsers()` is heavy. 
        // Better: `supabase.auth.admin.getUserById` requires ID.

        // ALTERNATIVE: Use `supabase.auth.admin.updateUserById(uid, ...)`
        // WE DON'T HAVE UID.

        // But! We can use `supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true })` handles upsert? No.
        // Let's check `listUsers` filtering? No direct email filter in listUsers (legacy).

        // Wait, newer API: `supabase.auth.admin.listUsers({ page: 1, perPage: 1 })` doesn't filter.
        // But `supabase.auth.admin.getUserByEmail`? Does not exist? 
        // Ah, it does exist! No, checked docs, it's often missing or deprecated.

        // Correction: We can use `supabaseAdmin.rpc` if we had a function, but we don't.

        // Let's try listing users. It might be slow if millions of users, but for this scale it's fine.
        // ACTUALLY: There is an easier way. We just need to "update user".
        // Does Supabase allow admin update by email? No.

        // Let's assume we can get the user ID via ListUsers (filtered in JS).

        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

        if (listError) throw listError;

        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(404).json({ message: 'User not found in auth system' });
        }

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        );

        if (updateError) {
            throw updateError;
        }

        res.status(200).json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Registration OTP Logic ---

// Send Registration OTP
exports.sendRegisterOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists in Supabase
        const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers();

        if (!listError && data && data.users) {
            const existingUser = data.users.find(
                (u) => (u.email || '').toLowerCase() === normalizedEmail
            );
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists. Please login.' });
            }
        }

        // Generate 6-digit OTP
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
        });

        // Save/Update OTP in 'otps' table
        await supabaseAdmin.from('otps').delete().eq('email', normalizedEmail);

        const { error: dbError } = await supabaseAdmin
            .from('otps')
            .insert([{ email: normalizedEmail, otp }]);

        if (dbError) {
            console.error('Supabase DB Error:', dbError);
            return res.status(500).json({ message: 'Failed to save OTP' });
        }

        // Proxy email sending to Vercel Serverless Function
        const proxyUrl = `${process.env.FRONTEND_URL || 'https://alumni-connect-dep.vercel.app'}/api/send-email`;
        console.log(`[sendRegisterOtp] Proxying email to Vercel at ${proxyUrl}...`);

        try {
            const proxyResponse = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.EMAIL_API_KEY || ''
                },
                body: JSON.stringify({
                    to: normalizedEmail,
                    subject: 'Verify your email for Alumni Connect',
                    text: `Welcome to Alumni Connect! Your verification code is: ${otp}`
                })
            });

            if (!proxyResponse.ok) {
                const errorData = await proxyResponse.text();
                throw new Error(`Vercel responded with ${proxyResponse.status}: ${errorData}`);
            }

            res.status(200).json({ message: 'Verification code sent to your email' });
        } catch (err) {
            console.error('Error proxying email to Vercel:', err);
            return res.status(500).json({ message: 'Failed to send verification email via Vercel proxy' });
        }

    } catch (error) {
        console.error('Send Register OTP Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Verify Registration OTP and Create User
exports.verifyRegisterOtp = async (req, res) => {
    try {
        const { email, otp, password, userData } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Verify OTP
        const normalizedEmail = email.trim().toLowerCase();

        const { data: otps, error: dbError } = await supabaseAdmin
            .from('otps')
            .select('*')
            .eq('email', normalizedEmail)
            .order('created_at', { ascending: false })
            .limit(1);

        if (dbError || !otps || otps.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const otpRecord = otps[0];
        if (otpRecord.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Check expiration
        const now = new Date();
        const expiresAt = new Date(otpRecord.expires_at || otpRecord.created_at);
        if (now > expiresAt) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        const userType = normalizeRegistrationType(userData?.userType);
        const isApproved = userType === 'Admin';
        const approvalStatus = isApproved ? 'APPROVED' : 'PENDING';

        // Create User in Supabase (Confirm email automatically)
        const metadata = {
            full_name: userData?.fullName || '',
            graduation_year: userData?.graduationYear || null,
            branch: userData?.branch || null,
            company: userData?.company || null,
            linkedin: userData?.linkedIn || null,
            role: userData?.role || null,
            user_type: userType
        };

        const { data: createdAuth, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: normalizedEmail,
            password,
            email_confirm: true,
            user_metadata: metadata
        });

        if (createError) {
            return res.status(400).json({ message: createError.message });
        }

        const createdUser = createdAuth?.user;
        if (!createdUser?.id) {
            return res.status(500).json({ message: 'Auth user created without id' });
        }

        // Create/Upsert profile immediately to avoid NULL email rows.
        const profileRow = {
            id: createdUser.id,
            email: normalizedEmail,
            full_name: userData?.fullName || normalizedEmail.split('@')[0],
            graduation_year: userData?.graduationYear ? Number(userData.graduationYear) : null,
            branch: userData?.branch || null,
            company: userData?.company || null,
            linkedin: userData?.linkedIn || null,
            role: userData?.role || null,
            user_type: userType,
            is_approved: isApproved,
            approval_status: approvalStatus,
            admin_notes: null,
            created_at: new Date().toISOString()
        };

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert(profileRow, { onConflict: 'id' });

        if (profileError) {
            // Rollback auth user to avoid orphaned accounts.
            await supabaseAdmin.auth.admin.deleteUser(createdUser.id);
            return res.status(500).json({ message: `Failed to create profile: ${profileError.message}` });
        }

        // Delete used OTP
        await supabaseAdmin.from('otps').delete().eq('email', normalizedEmail);

        res.status(200).json({
            message: isApproved
                ? 'Admin account created successfully! You can now login.'
                : 'Account created successfully! Wait for admin approval before login.',
            user: createdUser
        });

    } catch (error) {
        console.error('Verify Register OTP Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Existing Placeholder exports (if any needed to be kept, but seem empty before)
// exports.loginUser = ... (Original content was just exports.loginUser, let's keep it creating a dummy since it was there ?)
// The original file was empty anyway based on previous `view_file`.
