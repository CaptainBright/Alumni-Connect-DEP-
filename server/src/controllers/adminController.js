const supabase = require('@supabase/supabase-js');

// Initialize Supabase Admin Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabase.createClient(supabaseUrl, supabaseServiceKey);

// Get All Profiles (Filtered by status if query param provided)
exports.getProfiles = async (req, res) => {
    try {
        const { status } = req.query; // 'pending', 'approved', 'rejected'

        let query = supabaseAdmin
            .from('profiles')
            .select('*')
            .in('user_type', ['Student', 'Alumni'])
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('approval_status', status.toUpperCase());
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        res.status(200).json({ profiles: data });
    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({ message: 'Server error fetching profiles' });
    }
};

// Approve Profile
exports.approveProfile = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Profile ID is required' });
        }

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({
                approval_status: 'APPROVED',
                is_approved: true,
                admin_notes: null
            })
            .eq('id', id);

        if (error) {
            throw error;
        }

        res.status(200).json({ message: 'Profile approved successfully' });
    } catch (error) {
        console.error('Error approving profile:', error);
        res.status(500).json({ message: 'Server error approving profile' });
    }
};

// Reject Profile
exports.rejectProfile = async (req, res) => {
    try {
        const { id, notes } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Profile ID is required' });
        }

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({
                approval_status: 'REJECTED',
                is_approved: false,
                admin_notes: notes || 'Rejected by admin'
            })
            .eq('id', id);

        if (error) {
            throw error;
        }

        res.status(200).json({ message: 'Profile rejected successfully' });
    } catch (error) {
        console.error('Error rejecting profile:', error);
        res.status(500).json({ message: 'Server error rejecting profile' });
    }
};
