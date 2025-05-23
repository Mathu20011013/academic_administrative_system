// src/controllers/courseContentController.js
const CourseContent = require("../models/courseContentModel");
const Material = require("../models/materialModel");
const Assignment = require("../models/assignmentModel");
const ClassLink = require("../models/classLinkModel");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// Create course content (announcement, material, assignment, class link)
exports.createContent = async (req, res) => {
  try {
    const { course_id, content_type, title, description } = req.body;

    // Validate required fields
    if (!course_id || !content_type || !title) {
      return res
        .status(400)
        .json({ message: "Course ID, content type, and title are required" });
    }

    // Create content entry
    const contentId = await CourseContent.create({
      course_id,
      content_type,
      title,
      description: description || "",
    });

    // Handle file uploads if files are included
    let fileUrls = [];
    const uploadToCloudinary = async (file) => {
      try {
        // Determine file type and set resource_type accordingly
        const fileExtension = file.originalname.split(".").pop().toLowerCase();
        const resourceType = [
          "pdf",
          "doc",
          "docx",
          "ppt",
          "pptx",
          "xls",
          "xlsx",
        ].includes(fileExtension)
          ? "raw"
          : "auto";

        console.log(
          `Uploading ${file.originalname} as resource_type: ${resourceType}`
        );

        // Upload to Cloudinary with correct resource type
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: resourceType,
          folder: "course_materials",
          use_filename: true,
          chunk_size: 20000000, // 20MB chunks for larger files
          timeout: 120000, // Increased timeout (120 seconds)
        });

        console.log(
          `Upload success for ${file.originalname}: ${result.secure_url}`
        );
        return result;
      } catch (error) {
        console.error(`Upload failed for ${file.originalname}:`, error);
        throw error;
      }
    };

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await uploadToCloudinary(file);

          // Add file to database with course_id
          await Material.addFile(
            contentId,
            course_id,
            file.originalname,
            result.secure_url,
            result.public_id // Store cloudinary public_id for later reference
          );

          // Add to response
          fileUrls.push({
            name: file.originalname,
            url: result.secure_url,
          });

          // Remove temp file
          fs.unlinkSync(file.path);
        } catch (uploadError) {
          console.error(`Error uploading file ${file.originalname}:`, uploadError);
          // Continue with other files even if one fails
          fileUrls.push({
            name: file.originalname,
            error: uploadError.message,
          });
        }
      }
    }

    // Handle assignment-specific data
    if (content_type === "assignment" && req.body.due_date) {
      await Assignment.createForContent(
        contentId,
        req.body.due_date,
        req.body.max_score || 100,
        course_id
      );
    }

    // Handle class link data
    if (content_type === "class_link" && req.body.meeting_url) {
      await ClassLink.create({
        content_id: contentId,
        meeting_url: req.body.meeting_url,
        meeting_time: req.body.meeting_time || null,
      });
    }

    // Handle announcement data
    if (content_type === "announcement") {
      const Announcement = require("../models/announcementModel");
      await Announcement.create({
        content_id: contentId,
        is_pinned: req.body.is_pinned ? 1 : 0,
      });
    }

    res.status(201).json({
      message: "Content created successfully",
      contentId,
      files: fileUrls,
    });
  } catch (error) {
    console.error("Error creating course content:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    res.status(500).json({
      message: "Error creating course content",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get all content for a course
exports.getCourseContent = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Get all content for the course
    const content = await CourseContent.getByCourseId(courseId);

    // Check if content is an array and not empty
    if (!content || !Array.isArray(content)) {
      return res.status(200).json({ content: [] });
    }

    // Get files for each content item
    const contentWithFiles = await Promise.all(
      content.map(async (item) => {
        // Get files for this content item
        const files = await Material.getFilesByContentId(item.content_id);
        console.log(
          `Content ${item.content_id} (${item.title}) has ${files.length} files`
        );

        // Get additional data based on content type
        if (item.content_type === "assignment") {
          const assignmentData = await Assignment.getByContentId(item.content_id);

          // Return assignment with files
          return {
            ...item,
            files: files,
            assignmentData: {
              ...assignmentData,
              title: item.title,
              description: item.description,
            },
          };
        }

        if (item.content_type === "class_link") {
          const classLinkData = await ClassLink.getByContentId(item.content_id);

          return {
            ...item,
            files: files,
            classLinkData,
          };
        }

        // For other content types (material, announcement)
        return {
          ...item,
          files: files,
        };
      })
    );

    res.json({ content: contentWithFiles });
  } catch (error) {
    console.error("Error getting course content:", error);
    res.status(500).json({
      message: "Error getting course content",
      error: error.message,
    });
  }
};

// Update course content
exports.updateContent = async (req, res) => {
  try {
    const contentId = req.params.contentId;
    const { title, description, course_id } = req.body;

    // Update content
    await CourseContent.update(contentId, { title, description });

    // Handle file uploads if files are included
    let fileUrls = [];
    const uploadToCloudinary = async (file) => {
      try {
        // Determine file type and set resource_type accordingly
        const fileExtension = file.originalname.split(".").pop().toLowerCase();
        const resourceType = [
          "pdf",
          "doc",
          "docx",
          "ppt",
          "pptx",
          "xls",
          "xlsx",
        ].includes(fileExtension)
          ? "raw"
          : "auto";

        console.log(
          `Uploading ${file.originalname} as resource_type: ${resourceType}`
        );

        // Upload to Cloudinary with correct resource type
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: resourceType,
          folder: "course_materials",
          use_filename: true,
          chunk_size: 20000000, // 20MB chunks for larger files
          timeout: 120000, // Increased timeout (120 seconds)
        });

        console.log(
          `Upload success for ${file.originalname}: ${result.secure_url}`
        );
        return result;
      } catch (error) {
        console.error(`Upload failed for ${file.originalname}:`, error);
        throw error;
      }
    };

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await uploadToCloudinary(file);

          // Add file to database
          await Material.addFile(
            contentId,
            course_id,
            file.originalname,
            result.secure_url,
            result.public_id
          );

          // Add to response
          fileUrls.push({
            name: file.originalname,
            url: result.secure_url,
          });

          // Remove temp file
          fs.unlinkSync(file.path);
        } catch (uploadError) {
          console.error(`Error uploading file ${file.originalname}:`, uploadError);
          // Continue with other files even if one fails
          fileUrls.push({
            name: file.originalname,
            error: uploadError.message,
          });
        }
      }
    }

    res.status(200).json({
      message: "Content updated successfully",
      files: fileUrls,
    });
  } catch (error) {
    console.error("Error updating course content:", error);
    res
      .status(500)
      .json({ message: "Error updating course content", error: error.message });
  }
};

// Delete course content
exports.deleteContent = async (req, res) => {
  try {
    const contentId = req.params.contentId;

    // Delete content (cascade will delete related files)
    await CourseContent.delete(contentId);

    res.status(200).json({ message: "Content deleted successfully" });
  } catch (error) {
    console.error("Error deleting course content:", error);
    res
      .status(500)
      .json({ message: "Error deleting course content", error: error.message });
  }
};

// Delete a file
exports.deleteFile = async (req, res) => {
  try {
    const fileId = req.params.fileId;

    // Delete file from database
    await Material.deleteFile(fileId);

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res
      .status(500)
      .json({ message: "Error deleting file", error: error.message });
  }
};
