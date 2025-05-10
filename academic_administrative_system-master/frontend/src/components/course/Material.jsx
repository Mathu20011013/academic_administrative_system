// src/components/course/Material.jsx
// Purpose: Display course materials with download options

import React from 'react';
import '../../styles/Material.css';

const Material = ({ material }) => {
    const getFileIcon = (fileName) => {
        // Check if fileName is undefined or null
        if (!fileName) return 'fa-file';
        
        const extension = fileName.split('.').pop().toLowerCase();
        
        if (['pdf'].includes(extension)) return 'fa-file-pdf';
        if (['doc', 'docx'].includes(extension)) return 'fa-file-word';
        if (['xls', 'xlsx'].includes(extension)) return 'fa-file-excel';
        if (['ppt', 'pptx'].includes(extension)) return 'fa-file-powerpoint';
        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'fa-file-image';
        if (['zip', 'rar'].includes(extension)) return 'fa-file-archive';
        
        return 'fa-file';
      };
      
      return (
        <div className="material">
          <h3>{material.title}</h3>
          <p className="material-description">{material.description}</p>
          
          <div className="material-files">
  {material.files && material.files.length > 0 ? (
    material.files.map((file, index) => (
      <div key={file.file_id || index} className="file-item">
        <i className={`fas ${getFileIcon(file.file_name)}`}></i>
        <span className="file-name">{file.file_name || 'Unnamed file'}</span>
        <a 
          href={file.file_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="download-btn"
          download
        >
          <i className="fas fa-download"></i>
        </a>
      </div>
    ))
  ) : (
    <p>No files available</p>
  )}
</div>

        </div>
      );
      
};

export default Material;
