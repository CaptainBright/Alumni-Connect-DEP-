const supabase = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabase.createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

// GET /api/connections — Fetch all connections for the logged-in user
exports.getUserConnections = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabaseAdmin
            .from('connections')
            .select(`
                id, status, created_at,
                requester:profiles!requester_id(id, full_name, avatar_url, role, company, user_type),
                receiver:profiles!receiver_id(id, full_name, avatar_url, role, company, user_type)
            `)
            .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching connections:', error);
            return res.status(500).json({ message: 'Failed to fetch connections' });
        }

        res.status(200).json({ connections: data || [] });
    } catch (err) {
        console.error('getUserConnections error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/connections/request — Send a connection request
exports.sendRequest = async (req, res) => {
    try {
        const requesterId = req.user.id;
        const { receiverId } = req.body;

        if (!receiverId) {
            return res.status(400).json({ message: 'receiverId is required' });
        }

        if (requesterId === receiverId) {
            return res.status(400).json({ message: 'Cannot connect to yourself' });
        }

        // Check if connection already exists (either direction)
        const { data: existing } = await supabaseAdmin
            .from('connections')
            .select('id, status')
            .or(
                `and(requester_id.eq.${requesterId},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${requesterId})`
            )
            .maybeSingle();

        if (existing) {
            return res.status(400).json({ message: `Connection already exists with status: ${existing.status}` });
        }

        const { data, error } = await supabaseAdmin
            .from('connections')
            .insert([{
                requester_id: requesterId,
                receiver_id: receiverId,
                status: 'PENDING'
            }])
            .select()
            .single();

        if (error) {
            console.error('Error sending connection request:', error);
            return res.status(500).json({ message: 'Failed to send connection request' });
        }

        res.status(201).json({ connection: data });
    } catch (err) {
        console.error('sendRequest error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/connections/:id/status — Accept or reject a connection
exports.updateStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const connectionId = req.params.id;
        const { status } = req.body; // 'ACCEPTED' or 'REJECTED'

        if (!['ACCEPTED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: 'Status must be ACCEPTED or REJECTED' });
        }

        // Verify the user is part of this connection
        const { data: conn, error: fetchErr } = await supabaseAdmin
            .from('connections')
            .select('id, requester_id, receiver_id')
            .eq('id', connectionId)
            .single();

        if (fetchErr || !conn) {
            return res.status(404).json({ message: 'Connection not found' });
        }

        if (conn.requester_id !== userId && conn.receiver_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this connection' });
        }

        const { data, error } = await supabaseAdmin
            .from('connections')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', connectionId)
            .select()
            .single();

        if (error) {
            console.error('Error updating connection:', error);
            return res.status(500).json({ message: 'Failed to update connection' });
        }

        res.status(200).json({ connection: data });
    } catch (err) {
        console.error('updateStatus error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/connections/:id — Delete a connection (Reject completely)
exports.deleteConnection = async (req, res) => {
    try {
        const userId = req.user.id;
        const connectionId = req.params.id;

        // Verify the user is part of this connection
        const { data: conn, error: fetchErr } = await supabaseAdmin
            .from('connections')
            .select('id, requester_id, receiver_id')
            .eq('id', connectionId)
            .single();

        if (fetchErr || !conn) {
            return res.status(404).json({ message: 'Connection not found' });
        }

        if (conn.requester_id !== userId && conn.receiver_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this connection' });
        }

        const { error } = await supabaseAdmin
            .from('connections')
            .delete()
            .eq('id', connectionId);

        if (error) {
            console.error('Error deleting connection:', error);
            return res.status(500).json({ message: 'Failed to delete connection' });
        }

        res.status(200).json({ message: 'Connection deleted successfully' });
    } catch (err) {
        console.error('deleteConnection error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
