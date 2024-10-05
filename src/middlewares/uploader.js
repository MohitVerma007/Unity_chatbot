const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure a dynamic uploader that accepts a custom path
const configureUploader = (uploadPath) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const folder = uploadPath || 'uploads';  // Use provided uploadPath
            const dir = path.join(__dirname, '..', folder);

            // Ensure directory exists
            fs.mkdirSync(dir, { recursive: true });

            cb(null, dir);
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    });

    return multer({ storage: storage });
};

module.exports = configureUploader;
