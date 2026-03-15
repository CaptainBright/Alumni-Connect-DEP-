const supabase = require('@supabase/supabase-js');

// Service-role Supabase client (bypasses RLS)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabase.createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

// Update avatar_url on the user's profile
exports.updateAvatar = async (req, res) => {
    try {
        const { avatar_url } = req.body;
        const userId = req.user.id;

        if (!avatar_url) {
            return res.status(400).json({ message: 'avatar_url is required' });
        }

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ avatar_url })
            .eq('id', userId);

        if (error) {
            throw error;
        }

        res.status(200).json({ message: 'Avatar updated successfully', avatar_url });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({ message: 'Server error updating avatar' });
    }
};

// Update user profile details
exports.updateProfile = async (req, res) => {
    try {
        const updates = req.body;
        const userId = req.user.id;

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'Update fields are required' });
        }

        // Bypasses RLS utilizing the service role
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.status(200).json({ message: 'Profile updated successfully', profile: data });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};
