const path = require('path');
const fs = require('fs');
const Material = require('../models/materialModel');
const db = require('../config/db');
const cloudinary = require('../config/cloudinary');

// Get all materials for a course
const getMaterialsByCourseId = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const materials = await Material.getByCourseId(courseId);
        res.status(200).json(materials);
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ message: 'Error fetching materials', error: error.message });
    }
};

// Get a specific material file
const getMaterialById = async (req, res) => {
    try {
        const materialId = req.params.materialId;
        
        const query = 'SELECT * FROM course_materials WHERE material_id = ?';
        db.query(query, [materialId], (err, results) => {
            if (err) {
                console.error('Error fetching material:', err);
                return res.status(500).json({ message: 'Error fetching material', error: err.message });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ message: 'Material not found' });
            }
            
            res.status(200).json(results[0]);
        });
    } catch (error) {
        console.error('Error in getMaterialById:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Upload a new material
const uploadMaterial = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { contentId, courseId } = req.body;
        const filePath = req.file.path;
        const fileName = req.file.originalname;

        // Upload file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'auto',
            folder: 'course_materials',
            public_id: `material_${Date.now()}`,
            use_filename: true
        });

        // Remove temporary file
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting temporary file:', err);
        });

        // Get Cloudinary URL
        const fileUrl = result.secure_url;
        const cloudinaryId = result.public_id;

        // Save file info to database
        const insertResult = await Material.addFile(contentId, courseId, fileName, fileUrl, cloudinaryId);
        
        res.status(201).json({
            message: 'Material uploaded successfully',
            materialId: insertResult.insertId,
            fileName,
            fileUrl
        });
    } catch (error) {
        console.error('Error in uploadMaterial:', error);
        
        // If there's a file, try to clean up
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting temporary file:', err);
            });
        }
        
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Download a material file
const downloadMaterial = async (req, res) => {
    try {
        const materialId = req.params.materialId;
        
        const query = 'SELECT * FROM course_materials WHERE material_id = ?';
        db.query(query, [materialId], (err, results) => {
            if (err) {
                console.error('Error fetching material for download:', err);
                return res.status(500).json({ message: 'Error fetching material', error: err.message });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ message: 'Material not found' });
            }
            
            const material = results[0];
            
            // For Cloudinary URLs, we create a URL with better download attributes
            if (material.material_url) {
                // Get file extension from title or URL
                let fileExt = '';
                if (material.material_title) {
                    fileExt = material.material_title.split('.').pop().toLowerCase();
                } else {
                    fileExt = material.material_url.split('.').pop().toLowerCase();
                }
                
                // Generate a download URL with 'fl_attachment' parameter for Cloudinary
                // This will tell browsers to download rather than display the file
                let downloadUrl;
                if (material.material_url.includes('cloudinary.com')) {
                    // Extract base URL without file extension
                    const baseUrl = material.material_url.substring(0, material.material_url.lastIndexOf('.'));
                    downloadUrl = `${baseUrl}.${fileExt}?fl_attachment=true`;
                } else {
                    // If not a Cloudinary URL, use as is
                    downloadUrl = material.material_url;
                }
                
                // Redirect to the download URL
                return res.redirect(downloadUrl);
            } else {
                return res.status(404).json({ message: 'Material URL not found' });
            }
        });
    } catch (error) {
        console.error('Error in downloadMaterial:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a material
const deleteMaterial = async (req, res) => {
    try {
        const materialId = req.params.materialId;
        
        // First get the material to find the Cloudinary ID
        const query = 'SELECT * FROM course_materials WHERE material_id = ?';
        db.query(query, [materialId], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error finding material', error: err.message });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ message: 'Material not found' });
            }
            
            const material = results[0];
            
            // Delete from Cloudinary if there's a cloudinary_id
            if (material.cloudinary_id) {
                try {
                    await cloudinary.uploader.destroy(material.cloudinary_id);
                } catch (cloudErr) {
                    console.error('Error deleting from Cloudinary:', cloudErr);
                    // Continue with database deletion even if Cloudinary deletion fails
                }
            }
            
            // Delete from database
            await Material.deleteFile(materialId);
            
            res.status(200).json({ message: 'Material deleted successfully' });
        });
    } catch (error) {
        console.error('Error in deleteMaterial:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getMaterialsByCourseId,
    getMaterialById,
    uploadMaterial,
    downloadMaterial,
    deleteMaterial
};