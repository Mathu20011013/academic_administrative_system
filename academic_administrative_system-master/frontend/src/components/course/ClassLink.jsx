// src/components/course/ClassLink.jsx
// Purpose: Display virtual class links with join options

import React from 'react';
import '../../styles/ClassLink.css';

const ClassLink = ({ classLink }) => {
  console.log("ClassLink component received:", classLink); // Debug log
  
  // Extract meeting URL and time correctly, checking both possible locations
  const meetingUrl = classLink.classLinkData?.meeting_url || classLink.meeting_url;
  const meetingTime = classLink.classLinkData?.meeting_time || classLink.meeting_time;
  
  const isUpcoming = meetingTime && new Date(meetingTime) > new Date();
  
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
          <strong>Meeting Time:</strong> {formatMeetingTime(meetingTime)}
        </p>
        
        {meetingUrl && (
          <a 
            href={meetingUrl.startsWith('http') ? meetingUrl : `https://${meetingUrl}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="join-meeting-btn"
          >
            <i className="fas fa-video"></i> Join Meeting
          </a>
        )}
        
        {!meetingUrl && (
          <span style={{color: 'red', fontStyle: 'italic'}}>No meeting URL provided</span>
        )}
      </div>
      
      {/* Debug info - can be removed after confirming it works */}
      <div style={{marginTop: '10px', fontSize: '12px', color: '#666', backgroundColor: '#f9f9f9', padding: '5px'}}>
        Debug: Meeting URL: {meetingUrl || "None"}
      </div>
    </div>
  );
};

export default ClassLink;
