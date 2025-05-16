import React, { useState } from 'react';
import '../../styles/Material.css';

const Material = ({ material }) => {
    console.log('Material component received:', material); // Debug log
    const [fileErrors, setFileErrors] = useState({});
    
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
    
    // Handle file download with error tracking
    const handleDownload = async (fileUrl, fileName, fileId) => {
        try {
            if (!fileUrl) {
                throw new Error("File URL is missing");
            }
            
            // For Cloudinary URLs, special handling
            if (fileUrl.includes('cloudinary.com')) {
                console.log(`Attempting to download file: ${fileName} from ${fileUrl}`);
                
                // For PDFs, try multiple URL formats
                if (fileName && fileName.toLowerCase().endsWith('.pdf')) {
                    // Try various URL transformations for PDFs
                    const baseUrl = fileUrl.split('/upload/')[0];
                    const filePathPart = fileUrl.split('/upload/')[1];
                    
                    // Try different URL formats for PDFs
                    const urlOptions = [
                        `${baseUrl}/upload/fl_attachment/${filePathPart}`,
                        `${baseUrl}/raw/upload/${filePathPart}`,
                        fileUrl
                    ];
                    
                    // Try each URL option
                    for (let i = 0; i < urlOptions.length; i++) {
                        try {
                            const response = await fetch(urlOptions[i], { method: 'HEAD' });
                            if (response.ok) {
                                console.log(`URL option ${i+1} worked: ${urlOptions[i]}`);
                                window.open(urlOptions[i], '_blank');
                                return;
                            }
                        } catch (error) {
                            console.log(`URL option ${i+1} failed: ${urlOptions[i]}`);
                            // Continue to next option
                        }
                    }
                    
                    // If all options failed
                    setFileErrors(prev => ({...prev, [fileId]: "File unavailable. Please contact support."}));
                    console.error(`All URL options failed for ${fileName}`);
                } else {
                    // For non-PDFs
                    window.open(fileUrl, '_blank');
                }
            } else {
                // For non-Cloudinary URLs
                window.open(fileUrl, '_blank');
            }
        } catch (error) {
            console.error('Error downloading file:', error);
            setFileErrors(prev => ({...prev, [fileId]: "Download failed. Try again later."}));
        }
    };
    
    // If material doesn't exist or has no files
    if (!material) {
        return <div className="material"><p>No material information available</p></div>;
    }
    
    return (
        <div className="material">
            <h3>{material.title}</h3>
            <p className="material-description">{material.description}</p>
            
            <div className="material-files">
                {material.files && material.files.length > 0 ? (
                    material.files.map((file, index) => (
                        <div key={file.material_id || index} className="file-item">
                            <i className={`fas ${getFileIcon(file.material_title)}`}></i>
                            <span className="file-name">{file.material_title || 'Unnamed file'}</span>
                            {fileErrors[file.material_id] ? (
                                <span className="file-error">{fileErrors[file.material_id]}</span>
                            ) : (
                                <button 
                                    className="download-btn"
                                    onClick={() => handleDownload(
                                        file.material_url, 
                                        file.material_title,
                                        file.material_id
                                    )}
                                >
                                    <i className="fas fa-download"></i> Download
                                </button>
                            )}
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
