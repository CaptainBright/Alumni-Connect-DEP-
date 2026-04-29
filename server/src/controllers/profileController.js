const supabase = require('@supabase/supabase-js');

// Service-role Supabase client (bypasses RLS)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// DEBUG: verify which role the key maps to
try {
    const payload = JSON.parse(Buffer.from(supabaseServiceKey.split('.')[1], 'base64').toString());
    console.log('🔑 Profile controller Supabase role:', payload.role);
} catch (e) {
    console.error('⚠️ Could not decode SUPABASE_SERVICE_ROLE_KEY — is it set correctly?');
}

const supabaseAdmin = supabase.createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

// Remove avatar: delete from storage + clear profile URL
exports.deleteAvatar = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch current avatar_url so we know which file to delete from storage
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('avatar_url')
            .eq('id', userId)
            .single();

        if (profile?.avatar_url) {
            // Extract the storage path from the public URL
            // Public URLs look like: https://<ref>.supabase.co/storage/v1/object/public/avatars/<path>
            const match = profile.avatar_url.match(/\/storage\/v1\/object\/public\/avatars\/(.+)/);
            if (match) {
                const filePath = decodeURIComponent(match[1].split('?')[0]); // strip cache-buster
                await supabaseAdmin.storage.from('avatars').remove([filePath]);
            }
        }

        // Clear the avatar_url on the profile
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ avatar_url: null })
            .eq('id', userId);

        if (error) throw error;

        res.status(200).json({ message: 'Avatar deleted successfully' });
    } catch (error) {
        console.error('Error deleting avatar:', error);
        res.status(500).json({ message: 'Server error deleting avatar' });
    }
};

// Upload avatar: receive file from multer, push to Supabase Storage, save URL
exports.uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const ext = file.originalname.split('.').pop();
        const filePath = `${userId}.${ext}`;

        // Delete any previous avatar for this user (different extension)
        const { data: existingFiles } = await supabaseAdmin.storage
            .from('avatars')
            .list('', { search: userId });

        if (existingFiles && existingFiles.length > 0) {
            const toRemove = existingFiles
                .filter(f => f.name.startsWith(userId))
                .map(f => f.name);
            if (toRemove.length > 0) {
                await supabaseAdmin.storage.from('avatars').remove(toRemove);
            }
        }

        // Upload the new file
        const { error: uploadError } = await supabaseAdmin.storage
            .from('avatars')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from('avatars')
            .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;

        // Save to profile
        const { error: dbError } = await supabaseAdmin
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', userId);

        if (dbError) throw dbError;

        res.status(200).json({ message: 'Avatar updated successfully', avatar_url: publicUrl });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ message: 'Server error uploading avatar' });
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
            console.error('Supabase Admin update error:', error);
            throw error;
        }

        res.status(200).json({ message: 'Profile updated successfully', profile: data });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error updating profile', details: error.message || error });
    }
};
