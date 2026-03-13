const supabase = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabase.createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

// GET /api/experiences — list all experiences (optional ?category= filter)
exports.getExperiences = async (req, res) => {
    try {
        let query = supabaseAdmin
            .from('experiences')
            .select('*')
            .order('created_at', { ascending: false });

        if (req.query.category && req.query.category !== 'all') {
            query = query.eq('category', req.query.category);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.status(200).json({ experiences: data });
    } catch (error) {
        console.error('Error fetching experiences:', error);
        res.status(500).json({ message: 'Server error fetching experiences' });
    }
};

// GET /api/experiences/:id — single experience
exports.getExperience = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('experiences')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ message: 'Experience not found' });

        res.status(200).json({ experience: data });
    } catch (error) {
        console.error('Error fetching experience:', error);
        res.status(500).json({ message: 'Server error fetching experience' });
    }
};

// POST /api/experiences — create a new experience
exports.createExperience = async (req, res) => {
    try {
        const { title, subtitle, body, category, tags, cover_image } = req.body;

        if (!title || !body) {
            return res.status(400).json({ message: 'Title and body are required' });
        }

        const validCategories = ['interview', 'job', 'internship', 'advice'];
        const expCategory = validCategories.includes(category) ? category : 'advice';

        // Parse tags: accept comma-separated string or array
        let tagsArr = [];
        if (Array.isArray(tags)) {
            tagsArr = tags.map(s => s.trim()).filter(Boolean);
        } else if (typeof tags === 'string') {
            tagsArr = tags.split(',').map(s => s.trim()).filter(Boolean);
        }

        // Determine author name and role from profile
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('full_name, role')
            .eq('id', req.user.id)
            .single();

        const authorName = profile?.full_name || req.user.email || 'Anonymous';
        const authorRole = (profile?.role || '').toLowerCase() === 'student' ? 'Student' : 'Alumni';

        const { data, error } = await supabaseAdmin
            .from('experiences')
            .insert({
                title,
                subtitle: subtitle || null,
                body,
                category: expCategory,
                tags: tagsArr,
                cover_image: cover_image || null,
                author_id: req.user.id,
                author_name: authorName,
                author_role: authorRole,
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ experience: data });
    } catch (error) {
        console.error('Error creating experience:', error);
        res.status(500).json({ message: 'Server error creating experience' });
    }
};

// PUT /api/experiences/:id — update own experience
exports.updateExperience = async (req, res) => {
    try {
        // First check ownership
        const { data: existing, error: fetchErr } = await supabaseAdmin
            .from('experiences')
            .select('author_id')
            .eq('id', req.params.id)
            .single();

        if (fetchErr || !existing) {
            return res.status(404).json({ message: 'Experience not found' });
        }

        if (existing.author_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only edit your own experiences' });
        }

        const { title, subtitle, body, category, tags, cover_image } = req.body;

        const validCategories = ['interview', 'job', 'internship', 'advice'];
        const updates = {};
        if (title) updates.title = title;
        if (subtitle !== undefined) updates.subtitle = subtitle || null;
        if (body) updates.body = body;
        if (category && validCategories.includes(category)) updates.category = category;
        if (cover_image !== undefined) updates.cover_image = cover_image || null;
        if (tags !== undefined) {
            if (Array.isArray(tags)) {
                updates.tags = tags.map(s => s.trim()).filter(Boolean);
            } else if (typeof tags === 'string') {
                updates.tags = tags.split(',').map(s => s.trim()).filter(Boolean);
            }
        }
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabaseAdmin
            .from('experiences')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ experience: data });
    } catch (error) {
        console.error('Error updating experience:', error);
        res.status(500).json({ message: 'Server error updating experience' });
    }
};

// DELETE /api/experiences/:id — delete own experience (or admin)
exports.deleteExperience = async (req, res) => {
    try {
        const { data: existing, error: fetchErr } = await supabaseAdmin
            .from('experiences')
            .select('author_id')
            .eq('id', req.params.id)
            .single();

        if (fetchErr || !existing) {
            return res.status(404).json({ message: 'Experience not found' });
        }

        const isAdmin = req.user.role && req.user.role.toLowerCase() === 'admin';
        if (existing.author_id !== req.user.id && !isAdmin) {
            return res.status(403).json({ message: 'You can only delete your own experiences' });
        }

        const { error } = await supabaseAdmin
            .from('experiences')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.status(200).json({ message: 'Experience deleted successfully' });
    } catch (error) {
        console.error('Error deleting experience:', error);
        res.status(500).json({ message: 'Server error deleting experience' });
    }
};
