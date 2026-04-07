const multer = require('multer');

// Store files in memory (Buffer) so we can forward them to Supabase Storage
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, PNG, WebP, and GIF images are allowed'), false);
        }
    },
});

module.exports = upload;
