// src/components/course/Announcement.jsx
// Purpose: Display course announcements with pinned announcements at the top

import React from 'react';
import '../../styles/Announcement.css';

const Announcement = ({ announcement }) => {
  return (
    <div className={`announcement ${announcement.is_pinned ? 'pinned' : ''}`}>
      {announcement.is_pinned && (
        <div className="pin-indicator">
          <i className="fas fa-thumbtack"></i> Pinned
        </div>
      )}
      <h3>{announcement.title}</h3>
      <p className="announcement-content">{announcement.description}</p>
      <p className="announcement-date">
        Posted on: {new Date(announcement.created_at).toLocaleDateString()}
      </p>
    </div>
  );
};

export default Announcement;
