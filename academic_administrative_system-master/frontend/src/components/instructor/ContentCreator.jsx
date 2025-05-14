// src/components/instructor/ContentCreator.jsx
// Purpose: Form to create different types of course content (announcements, materials, assignments, class links)

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import '../../styles/ContentCreator.css';

const ContentCreator = ({ onContentCreated }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [contentType, setContentType] = useState('material');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  


  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const formData = new FormData();
    formData.append('course_id', courseId);
    formData.append('content_type', contentType);
    formData.append('title', title);
    formData.append('description', description);

    // Add content-type specific fields
    if (contentType === 'assignment') {
      formData.append('due_date', dueDate);
      formData.append('max_score', maxScore);
    } else if (contentType === 'class_link') {
      formData.append('meeting_url', meetingUrl);
      if (meetingTime) formData.append('meeting_time', meetingTime);
    } else if (contentType === 'announcement') {
      formData.append('is_pinned', isPinned);
    }

    // Add files if any
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post('/content/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('Content created successfully:', response.data);

    // Reset form
    setTitle('');
    setDescription('');
    setFiles([]);
    setDueDate('');
    setMaxScore(100);
    setMeetingUrl('');
    setMeetingTime('');
    setIsPinned(false);

    // Notify parent component
    if (onContentCreated) {
      onContentCreated(response.data);
    }

    // Navigate back to course page with refresh state
    navigate(`/course/${courseId}`, { state: { refresh: true } });
    
  } catch (err) {
    console.error('Error creating content:', err);
    setError(err.response?.data?.message || err.message || 'Failed to create content');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="content-creator">
      <h2>Create New Content</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Content Type</label>
          <select 
            value={contentType} 
            onChange={(e) => setContentType(e.target.value)}
            required
          >
            <option value="material">Material</option>
            <option value="assignment">Assignment</option>
            <option value="class_link">Class Link</option>
            <option value="announcement">Announcement</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
          />
        </div>
        
        {/* Conditional fields based on content type */}
        {contentType === 'material' && (
          <div className="form-group">
            <label>Upload Files</label>
            <input 
              type="file" 
              onChange={handleFileChange}
              multiple
            />
            {files.length > 0 && (
              <div className="selected-files">
                <p>Selected files:</p>
                <ul>
                  {files.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {contentType === 'assignment' && (
          <>
            <div className="form-group">
              <label>Due Date</label>
              <input 
                type="datetime-local" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Maximum Score</label>
              <input 
                type="number" 
                value={maxScore} 
                onChange={(e) => setMaxScore(e.target.value)}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Upload Files (Optional)</label>
              <input 
                type="file" 
                onChange={handleFileChange}
                multiple
              />
            </div>
          </>
        )}
        
        {contentType === 'class_link' && (
          <>
            <div className="form-group">
              <label>Meeting URL</label>
              <input 
                type="url" 
                value={meetingUrl} 
                onChange={(e) => setMeetingUrl(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Meeting Time (Optional)</label>
              <input 
                type="datetime-local" 
                value={meetingTime} 
                onChange={(e) => setMeetingTime(e.target.value)}
              />
            </div>
          </>
        )}
        
        {contentType === 'announcement' && (
          <div className="form-group checkbox">
            <label>
              <input 
                type="checkbox" 
                checked={isPinned} 
                onChange={(e) => setIsPinned(e.target.checked)}
              />
              Pin this announcement
            </label>
          </div>
        )}
        
        <button 
          type="submit" 
          className="create-btn"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Content'}
        </button>
      </form>
    </div>
  );
};

export default ContentCreator;
