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
  const [forumPosts, setForumPosts] = useState([]);
  const [replies, setReplies] = useState({});
  const [newReplies, setNewReplies] = useState({}); // Track new replies for each post
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
        setForumPosts(response.data);
        // For each discussion, fetch its comments
        response.data.forEach((post) => {
          fetchComments(post.discussion_id);
        });
      })
      .catch((error) => {
        console.error("Error fetching discussions:", error);
        setError("Failed to load discussions. Please try again later.");
      });
  };

  // Fetch comments for a specific discussion
  const fetchComments = (forum_id) => {
    axios
      .get(`http://localhost:5000/api/forum/comments/forum/${forum_id}`)
      .then((response) => {
        setReplies((prevReplies) => ({
          ...prevReplies,
          [forum_id]: response.data,
        }));
        // Initialize the new reply text area for this discussion
        setNewReplies((prev) => ({
          ...prev,
          [forum_id]: "",
        }));
      })
      .catch((error) => {
        console.error(`Error fetching comments for discussion ${forum_id}:`, error);
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

  return (
    <div className="forum-container">
      <NewDiscussion onPostDiscussion={handlePostDiscussion} currentUser={currentUser} />
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="forum-posts">
        {forumPosts.length > 0 ? (
          forumPosts.map((post) => (
            <div key={post.discussion_id} className="forum-post">
              <div className="post-header">
                <h3>{post.title}</h3>
                <div className="post-meta">
                  <span className="post-author">
                    Posted by: <strong>{post.username}</strong>
                    {post.user_type && <span className="user-type">({post.user_type})</span>}
                  </span>
                  <span className="post-date">{formatDate(post.created_at)}</span>
                </div>
              </div>
              
              <div className="post-content">
                <p>{post.content}</p>
              </div>
              
              <div className="comments-section">
                <h4>Comments ({replies[post.discussion_id]?.length || 0})</h4>
                
                {replies[post.discussion_id] && replies[post.discussion_id].length > 0 ? (
                  <div className="comments-list">
                    {replies[post.discussion_id].map((comment) => (
                      <div key={comment.comment_id} className="comment">
                        <div className="comment-header">
                          <strong>{comment.username}</strong>
                          {comment.user_type && <span className="user-type">({comment.user_type})</span>}
                          <span className="comment-date">{formatDate(comment.created_at)}</span>
                        </div>
                        <div className="comment-content">{comment.comment}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-comments">No comments yet</p>
                )}
                
                <div className="comment-form">
                  <textarea
                    placeholder="Write a comment..."
                    value={newReplies[post.discussion_id] || ""}
                    onChange={(e) => 
                      setNewReplies({
                        ...newReplies,
                        [post.discussion_id]: e.target.value,
                      })
                    }
                  />
                  <button
                    onClick={() => {
                      console.log("Comment button clicked for post:", post.discussion_id);
                      handleReply(post.discussion_id);
                    }}
                    className="comment-button"
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
