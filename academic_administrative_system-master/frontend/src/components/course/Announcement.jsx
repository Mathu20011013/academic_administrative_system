// src/components/course/Announcement.jsx
// Purpose: Display course announcements with pinned announcements at the top

import React from 'react';
import '../../styles/Announcement.css';

const Announcement = ({ announcement }) => {
    // Get appropriate icon based on file type
    const getFileIcon = (fileName) => {
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
    
    // Handle file download directly
    const handleDownload = async (fileUrl, fileName) => {
        try {
            if (!fileUrl) {
                throw new Error('File URL is missing');
            }
            
            // For Cloudinary URLs, we need special handling
            if (fileUrl.includes('cloudinary.com')) {
                console.log(`Attempting to download: ${fileName} from ${fileUrl}`);
                
                // For PDFs, use specialized handling
                if (fileName && fileName.toLowerCase().endsWith('.pdf')) {
                    // Transform the URL to get the raw file instead of the default viewer
                    const baseUrl = fileUrl.split('/upload/')[0];
                    const filePathPart = fileUrl.split('/upload/')[1];
                    
                    // Try the fl_attachment approach first (works in most browsers)
                    const downloadUrl = `${baseUrl}/upload/fl_attachment/${filePathPart}`;
                    console.log(`Using PDF download URL: ${downloadUrl}`);
                    
                    // Open in new tab with download flag
                    window.open(downloadUrl, '_blank');
                } else {
                    // For non-PDFs, try the fetch approach with fallback
                    try {
                        const response = await fetch(fileUrl);
                        
                        if (!response.ok) {
                            throw new Error(`HTTP error: ${response.status}`);
                        }
                        
                        const blob = await response.blob();
                        
                        // Create object URL and trigger download
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = fileName || 'download';
                        document.body.appendChild(link);
                        link.click();
                        
                        // Cleanup
                        setTimeout(() => {
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                        }, 100);
                    } catch (fetchError) {
                        console.warn(`Fetch download failed: ${fetchError.message}, falling back to direct link`);
                        // Fallback to direct link opening
                        window.open(fileUrl, '_blank');
                    }
                }
            } else {
                // For non-Cloudinary URLs, use the original method
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = fileName || 'download';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download file. Please try again later.');
        }
    };
    
    return (
        <div className={`announcement ${announcement.is_pinned ? 'pinned' : ''}`}>
            {announcement.is_pinned && (
                <div className="pin-indicator">
                    <i className="fas fa-thumbtack"></i> Pinned
                </div>
            )}
            <div className="announcement-header">
                <h3>{announcement.title}</h3>
                <span className="announcement-date">
                    {new Date(announcement.created_at).toLocaleDateString()}
                </span>
            </div>
            
            <div className="announcement-content">
                <p>{announcement.description}</p>
            </div>
            
            {/* Display any attachments */}
            {announcement.attachments && announcement.attachments.length > 0 && (
                <div className="announcement-attachments">
                    <h4>Attachments:</h4>
                    {announcement.attachments.map((file, index) => (
                        <div key={file.file_id || index} className="file-item">
                            <i className={`fas ${getFileIcon(file.file_name)}`}></i>
                            <span className="file-name">{file.file_name || 'Unnamed file'}</span>
                            <button 
                                className="download-btn"
                                onClick={() => handleDownload(file.file_url, file.file_name)}
                            >
                                <i className="fas fa-download"></i> Download
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Announcement;
