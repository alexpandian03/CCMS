const Material = require('../models/Material');

// @desc    Upload material
// @route   POST /api/materials
// @access  Private/Coordinator
const uploadMaterial = async (req, res) => {
    const { title, description, clubId, type, fileUrl, externalLink, tags } = req.body;

    try {
        const material = await Material.create({
            title,
            description,
            club: clubId,
            uploadedBy: req.user._id,
            type,
            fileUrl,
            externalLink,
            tags
        });
        res.status(201).json(material);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get club materials
// @route   GET /api/materials/club/:clubId
// @access  Private
const getClubMaterials = async (req, res) => {
    try {
        const materials = await Material.find({ club: req.params.clubId })
            .sort({ createdAt: -1 });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { uploadMaterial, getClubMaterials };
