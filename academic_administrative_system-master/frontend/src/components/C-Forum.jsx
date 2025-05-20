import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Forum.css";

const NewDiscussion = ({ onPostDiscussion, currentUser }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && description) {
      onPostDiscussion(title, description);
      setTitle("");
      setDescription("");
    } else {
      alert("Please fill in all fields");
    }
  };

  return (
    <div className="new-discussion-box">
      <h3>Create a New Discussion</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            placeholder="Enter the discussion title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            placeholder="Enter the discussion description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit">Post</button>
      </form>
    </div>
  );
};

const Forum = ({ currentUser, onSubmitComment }) => {
  const [discussions, setDiscussions] = useState([]);
  const [comments, setComments] = useState({});
  const [newReplies, setNewReplies] = useState({});
  const [error, setError] = useState("");

  // Fetch discussions and comments on component mount
  useEffect(() => {
    fetchDiscussions();
  }, []);

  // Debug log to check if currentUser is properly received
  useEffect(() => {
    console.log("Forum received currentUser:", currentUser);
  }, [currentUser]);

  // Fetch all discussions
  const fetchDiscussions = () => {
    axios
      .get("http://localhost:5000/api/forum/discussions")
      .then((response) => {
        setDiscussions(response.data);
        // For each discussion, fetch its comments
        response.data.forEach((discussion) => {
          fetchComments(discussion.forum_id);
        });
      })
      .catch((error) => {
        console.error("Error fetching discussions:", error);
        setError("Failed to load discussions. Please try again later.");
      });
  };

  // Fetch comments for a specific discussion
  const fetchComments = (forumId) => {
    axios
      .get(`http://localhost:5000/api/forum/comments/forum/${forumId}`)
      .then((response) => {
        console.log(`[Debug] Comments for forum ${forumId}:`, response.data);
        
        // Check if role is present in the data
        const hasRoles = response.data.some(comment => comment.role);
        console.log(`Comments for forum ${forumId} have roles: ${hasRoles}`);
        
        setComments((prev) => ({
          ...prev,
          [forumId]: response.data,
        }));
        setNewReplies((prev) => ({
          ...prev,
          [forumId]: "",
        }));
      })
      .catch((error) => {
        console.error(`Error fetching comments for discussion ${forumId}:`, error);
      });
  };

  // Handle posting a new discussion
  const handlePostDiscussion = (title, description) => {
    // Get token using the same approach as MyCourses.jsx
    const token = localStorage.getItem("authToken") || 
                  localStorage.getItem("token") || 
                  localStorage.getItem("jwt");
    
    if (!token) {
      alert("You must be logged in to post a discussion");
      return;
    }

    // Get user ID from localStorage - same as MyCourses.jsx
    const userId = localStorage.getItem('userId');
    console.log("[Debug] User ID for new discussion:", userId);
    
    if (!userId) {
      alert("User ID not found. Please log in again.");
      return;
    }

    const newDiscussion = {
      title,
      question: description,
      user_id: userId, // Use userId from localStorage
    };

    axios
      .post("http://localhost:5000/api/forum/discussions", newDiscussion, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      .then((response) => {
        // Add the new discussion to the list and fetch its comments
        fetchDiscussions(); // Refetch all discussions to get the latest
      })
      .catch((error) => {
        console.error("[Debug] Error posting discussion:", error);
        alert("Failed to post discussion. Please try again.");
      });
  };

  // Handle posting a reply to a discussion
  const handleReply = (forum_id) => {
    const replyText = newReplies[forum_id] || "";
    
    if (!replyText || replyText.trim() === "") {
      alert("Please enter a comment before posting");
      return;
    }
    
    // Get token using the same approach as MyCourses.jsx
    const token = localStorage.getItem("authToken") || 
                  localStorage.getItem("token") || 
                  localStorage.getItem("jwt");
    
    if (!token) {
      alert("You must be logged in to post a comment");
      return;
    }

    // Get user ID from localStorage - same as MyCourses.jsx
    const userId = localStorage.getItem('userId');
    console.log("[Debug] User ID for comment:", userId);
    
    if (!userId) {
      alert("User ID not found. Please log in again.");
      return;
    }

    console.log("[Debug] Submitting comment with user ID:", userId);
    
    axios
      .post("http://localhost:5000/api/forum/comments", {
        forum_id,
        user_id: userId, // Use userId from localStorage
        comment: replyText
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      .then((response) => {
        console.log("[Debug] Comment posted successfully:", response.data);
        // Clear the reply text area and fetch updated comments
        setNewReplies((prev) => ({
          ...prev,
          [forum_id]: "",
        }));
        fetchComments(forum_id);
      })
      .catch((error) => {
        console.error("[Debug] Error posting comment:", error);
        alert("Failed to post comment. Please try again.");
      });
  };

  // Format date to a readable string
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Updated formatRole function
  const formatRole = (role) => {
    if (!role) return null;
    
    // Capitalize first letter
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="forum-container">
      <NewDiscussion onPostDiscussion={handlePostDiscussion} currentUser={currentUser} />
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="forum-posts">
        {discussions.length > 0 ? (
          discussions.map((discussion) => (
            <div key={discussion.forum_id} className="forum-post">
              <div className="post-header">
                <h3>{discussion.title}</h3>
                <div className="post-meta">
                  <span className="author">
                    {discussion.username}
                    {discussion.role && (
                      <span className="user-role" data-role={discussion.role}>
                        {formatRole(discussion.role)}
                      </span>
                    )}
                  </span>
                  <span className="date">{formatDate(discussion.created_at)}</span>
                </div>
              </div>
              
              <div className="post-content">
                <p>{discussion.question}</p>
              </div>
              
              <div className="comments-section">
                <h4>Comments ({comments[discussion.forum_id]?.length || 0})</h4>
                
                <div className="comments-list">
                  {comments[discussion.forum_id]?.map((comment) => (
                    <div key={comment.comment_id} className="comment">
                      <div className="comment-header">
                        <span className="comment-author">
                          {comment.username || 'Anonymous'}
                          {comment.role && (
                            <span className="user-role" data-role={comment.role}>
                              {formatRole(comment.role)}
                            </span>
                          )}
                        </span>
                        <span className="comment-date">{formatDate(comment.created_at)}</span>
                      </div>
                      <div className="comment-content">
                        <p>{comment.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="comment-form">
                  <textarea
                    placeholder="Write a comment..."
                    value={newReplies[discussion.forum_id] || ''}
                    onChange={(e) => setNewReplies(prev => ({
                      ...prev,
                      [discussion.forum_id]: e.target.value
                    }))}
                  />
                  <button 
                    onClick={() => handleReply(discussion.forum_id)}
                    className="comment-submit-btn"
                    type="button"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-discussions">No discussions found</div>
        )}
      </div>
    </div>
  );
};

export default Forum;
