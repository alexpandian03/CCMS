const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        // Rename file to: fieldName-userId-timestamp.ext
        cb(null, file.fieldname + '-' + req.user._id + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Check file type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|pdf|ppt|pptx|doc|docx/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime - Relaxed for Office docs
    const mimetype = true;

    if (extname) {
        return cb(null, true);
    } else {
        cb('Error: Images, PDFs, PPTs, and Word Docs Only!');
    }
}

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// @desc    Upload student document
// @route   POST /api/upload/:docType
// @access  Private/Student
const uploadDocument = async (req, res) => {
    const uploadSingle = upload.single('document');

    uploadSingle(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file selected' });
        }

        const { docType } = req.params;
        // CRITICAL: 'material' must be in this list
        const validDocTypes = ['aadhar', 'bankPassbook', 'markSheet10', 'markSheet12', 'photo', 'bioData', 'material'];

        if (!validDocTypes.includes(docType)) {
            // Remove uploaded file if invalid type
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Invalid document type' });
        }

        try {
            const filePath = `/uploads/${req.file.filename}`;

            // If it's a generic material, just return the path, don't update user profile
            if (docType === 'material') {
                return res.json({
                    message: 'Material uploaded successfully',
                    filePath,
                    docType
                });
            }

            const user = await User.findById(req.user._id);

            if (!user.documents) {
                user.documents = {};
            }

            // Save relative path
            user.documents[docType] = filePath;

            await user.save();

            res.json({
                message: 'File uploaded successfully',
                filePath,
                docType
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server Error' });
        }
    });
};

// @desc    Delete student document
// @route   DELETE /api/upload/:docType
// @access  Private/Student
const deleteDocument = async (req, res) => {
    const { docType } = req.params;

    try {
        const user = await User.findById(req.user._id);

        if (user.documents && user.documents[docType]) {
            const filePath = path.join(__dirname, '..', user.documents[docType]);

            // Remove file from FS
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // Remove from DB
            user.documents[docType] = undefined;
            await user.save();

            res.json({ message: 'Document deleted' });
        } else {
            res.status(404).json({ message: 'Document not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { uploadDocument, deleteDocument };
