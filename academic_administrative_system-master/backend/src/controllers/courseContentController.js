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
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
        });

        // Add file to database with course_id
        await Material.addFile(
          contentId,
          course_id,
          file.originalname,
          result.secure_url
        );

        // Add to response
        fileUrls.push({
          name: file.originalname,
          url: result.secure_url,
        });

        // Remove temp file
        fs.unlinkSync(file.path);
      }
    }

    // Handle assignment-specific data
    if (content_type === "assignment" && req.body.due_date) {
      await Assignment.createForContent(
        contentId,
        req.body.due_date,
        req.body.max_score || 100
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
        is_pinned: req.body.is_pinned || false,
      });
    }

    res.status(201).json({
      message: "Content created successfully",
      contentId,
      files: fileUrls,
    });
  } catch (error) {
    console.error("Error creating course content:", error);
    res
      .status(500)
      .json({ message: "Error creating course content", error: error.message });
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
        const files = await Material.getFilesByContentId(item.content_id);

        // Get additional data based on content type
        if (item.content_type === "assignment") {
          const assignmentData = await Assignment.getByContentId(
            item.content_id
          );
          return { ...item, files, assignmentData };
        }

        if (item.content_type === "class_link") {
          const linkData = await ClassLink.getByContentId(item.content_id);
          return { ...item, files, linkData };
        }
        if (item.content_type === "announcement") {
          const Announcement = require("../models/announcementModel");
          const announcementData = await Announcement.getByContentId(
            item.content_id
          );
          return { ...item, files, announcementData };
        }

        return { ...item, files };
      })
    );

    res.status(200).json({ content: contentWithFiles });
  } catch (error) {
    console.error("Error fetching course content:", error);
    res
      .status(500)
      .json({ message: "Error fetching course content", error: error.message });
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
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
        });

        // Add file to database
        await Material.addFile(
          contentId,
          course_id,
          file.originalname,
          result.secure_url
        );

        // Add to response
        fileUrls.push({
          name: file.originalname,
          url: result.secure_url,
        });

        // Remove temp file
        fs.unlinkSync(file.path);
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
