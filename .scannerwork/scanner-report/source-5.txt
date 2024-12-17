const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const sanitize = require('sanitize-filename');

// Secure storage configuration
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		// Ensure the upload directory is outside the source code directory
		cb(null, path.resolve(__dirname, '../uploads'));
	},
	filename: (req, file, cb) => {
		// Generate a unique suffix for the file name
		const uniqueSuffix = crypto.randomBytes(16).toString('hex');
		// Sanitize the original file name to prevent security issues
		const sanitizedFileName = sanitize(file.originalname);
		// Construct the new file name
		cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(sanitizedFileName)}`);
	},
});

// Configure multer with additional limits
const upload = multer({
	storage: storage,
	limits: { fileSize: 2 * 1024 * 1024 }, // Restrict file size to 2MB
});

module.exports = upload;
