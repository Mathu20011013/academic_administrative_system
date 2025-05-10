// src/components/course/ClassLink.jsx
// Purpose: Display virtual class links with join options

import React from 'react';
import '../../styles/ClassLink.css';

const ClassLink = ({ classLink }) => {
  const isUpcoming = classLink.meeting_time && new Date(classLink.meeting_time) > new Date();
  
  const formatMeetingTime = (timeString) => {
    if (!timeString) return 'No scheduled time';
    return new Date(timeString).toLocaleString();
  };

  return (
    <div className={`class-link ${isUpcoming ? 'upcoming' : ''}`}>
      <h3>{classLink.title}</h3>
      <p className="class-description">{classLink.description}</p>
      
      <div className="meeting-details">
        <p>
          <strong>Meeting Time:</strong> {formatMeetingTime(classLink.meeting_time)}
        </p>
        
        <a 
          href={classLink.meeting_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="join-meeting-btn"
        >
          <i className="fas fa-video"></i> Join Meeting
        </a>
      </div>
    </div>
  );
};

export default ClassLink;
