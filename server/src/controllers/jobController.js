const supabase = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabase.createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

// GET /api/jobs — list all jobs
exports.getJobs = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({ jobs: data });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ message: 'Server error fetching jobs' });
    }
};

// POST /api/jobs — create a job (Alumni & Admin only)
exports.createJob = async (req, res) => {
    try {
        const userRole = (req.user.role || '').toLowerCase();

        if (userRole === 'student') {
            return res.status(403).json({ message: 'Students cannot post opportunities' });
        }

        const { title, company, location, description, type, skills, url } = req.body;

        if (!title || !company) {
            return res.status(400).json({ message: 'Title and company are required' });
        }

        const validTypes = ['Full-time', 'Internship', 'Part-time', 'Contract'];
        const jobType = validTypes.includes(type) ? type : 'Full-time';

        // Parse skills: accept comma-separated string or array
        let skillsArr = [];
        if (Array.isArray(skills)) {
            skillsArr = skills.map(s => s.trim()).filter(Boolean);
        } else if (typeof skills === 'string') {
            skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean);
        }

        const { data, error } = await supabaseAdmin
            .from('jobs')
            .insert({
                title,
                company,
                location: location || 'Remote',
                description: description || null,
                type: jobType,
                skills: skillsArr,
                url: url || null,
                posted_by: req.user.id,
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ job: data });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ message: 'Server error creating job' });
    }
};
