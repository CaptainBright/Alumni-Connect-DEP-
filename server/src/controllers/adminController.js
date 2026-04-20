const supabase = require('@supabase/supabase-js');

// Initialize Supabase Admin Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabase.createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

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

// Export Users as Excel
exports.exportUsersExcel = async (req, res) => {
    try {
        const { user_type, graduation_year, branch } = req.query;

        let query = supabaseAdmin
            .from('profiles')
            .select('*')
            .in('user_type', ['Student', 'Alumni'])
            .eq('approval_status', 'APPROVED')
            .order('created_at', { ascending: false });

        // Apply filters
        if (user_type) {
            query = query.eq('user_type', user_type); // 'Alumni' or 'Student'
        }
        if (graduation_year) {
            query = query.eq('graduation_year', parseInt(graduation_year));
        }
        if (branch) {
            query = query.ilike('branch', `%${branch}%`);
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        // Build Excel workbook
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Alumni Connect Admin';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Users');

        // Define columns
        sheet.columns = [
            { header: 'Full Name', key: 'full_name', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'User Type', key: 'user_type', width: 14 },
            { header: 'Graduation Year', key: 'graduation_year', width: 18 },
            { header: 'Branch', key: 'branch', width: 20 },
            { header: 'Company', key: 'company', width: 22 },
            { header: 'Role', key: 'role', width: 20 },
            { header: 'LinkedIn', key: 'linkedin_url', width: 35 },
            { header: 'Joined On', key: 'created_at', width: 20 },
        ];

        // Style header row
        sheet.getRow(1).font = { bold: true, size: 12 };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF8B1A1A' }, // dark cardinal
        };
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };

        // Add data rows
        data.forEach((profile) => {
            sheet.addRow({
                full_name: profile.full_name || '',
                email: profile.email || '',
                user_type: profile.user_type || '',
                graduation_year: profile.graduation_year || '',
                branch: profile.branch || '',
                company: profile.company || '',
                role: profile.role || '',
                linkedin_url: profile.linkedin_url || '',
                created_at: profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-IN')
                    : '',
            });
        });

        // Build filename
        const parts = ['Alumni_Connect_Users'];
        if (user_type) parts.push(user_type);
        if (graduation_year) parts.push(`Batch_${graduation_year}`);
        if (branch) parts.push(branch);
        const filename = parts.join('_') + '.xlsx';

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting users:', error);
        res.status(500).json({ message: 'Server error exporting users' });
    }
};
