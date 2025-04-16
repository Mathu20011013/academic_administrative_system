import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import "../styles/Forum.css";
import axios from "axios";

// NewDiscussion Component for adding a new discussion thread
const NewDiscussion = ({ onPostDiscussion }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && description) {
      onPostDiscussion(title, description);
      setTitle("");
      setDescription("");
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

const Forum = () => {
  const [forumPosts, setForumPosts] = useState([]);
  const [replies, setReplies] = useState({});
  const [newReply, setNewReply] = useState("");

  // Fetch discussions on page load
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/forum/discussions")
      .then((response) => {
        setForumPosts(response.data);
        response.data.forEach((post) => {
          fetchComments(post.forum_id); // Fetch comments for each discussion
        });
      })
      .catch((error) => {
        console.error("Error fetching the discussions:", error);
      });
  }, []);

  // Fetch comments (replies) for a specific discussion
  const fetchComments = (forum_id) => {
    axios
      .get(`http://localhost:5000/api/forum/comments/forum/${forum_id}`)
      .then((response) => {
        setReplies((prevReplies) => ({
          ...prevReplies,
          [forum_id]: response.data, // Store replies for the specific forum_id
        }));
      })
      .catch((error) => {
        console.error("Error fetching replies:", error);
      });
  };

  // Handle posting a new discussion
  const handlePostDiscussion = (title, description) => {
    const newDiscussion = {
      course_id: 1, // Example course_id, update as per your logic
      user_id: 2,   // Example user_id, update based on your user authentication
      title: title,
      question: description,
    };

    // Post the new discussion to the backend
    axios
      .post("http://localhost:5000/api/forum/discussions", newDiscussion)
      .then((response) => {
        setForumPosts([response.data, ...forumPosts]); // Add new post at the top
        fetchComments(response.data.forum_id); // Fetch comments for the newly created post
      })
      .catch((error) => {
        console.error("Error posting the discussion:", error);
      });
  };

  // Handle posting a new reply
  const handlePostReply = (forum_id, user_id, reply) => {
    if (!reply) return;

    const newComment = {
      forum_id: forum_id,
      user_id: user_id,
      comment: reply,
    };

    // Post the new comment to the backend
    axios
      .post("http://localhost:5000/api/forum/comments", newComment)
      .then((response) => {
        setReplies((prevReplies) => ({
          ...prevReplies,
          [forum_id]: [...(prevReplies[forum_id] || []), response.data], // Add new reply to the discussion
        }));
        setNewReply(""); // Clear the reply input
      })
      .catch((error) => {
        console.error("Error posting the reply:", error);
      });
  };

  return (
    <Layout>
      <div className="container mt-4 home-container">
        <div className="heading-container">
          <h2 className="text-center">Discussion Forum</h2>
        </div>

        {/* New Discussion Section */}
        <NewDiscussion onPostDiscussion={handlePostDiscussion} />

        {/* Forum Posts */}
        <div className="forum-posts-container">
          {forumPosts.length > 0 ? (
            forumPosts.map((post, index) => (
              <div key={index} className="forum-post-card">
                <div className="card-body">
                  <h5 className="card-title">{post.title}</h5>
                  <p className="card-text">{post.question}</p>

                  {/* Display replies for each post */}
                  <p className="card-text">
                    <strong>Replies:</strong> {replies[post.forum_id]?.length || 0}
                  </p>

                  {/* Display replies */}
                  <div className="replies-container">
                    {replies[post.forum_id]?.map((reply, index) => (
                      <div key={index} className="reply">
                        <p>{reply.comment}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add New Reply */}
                  <textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Write your reply here..."
                    className="reply-textarea"
                  ></textarea>
                  <button
                    onClick={() => handlePostReply(post.forum_id, 2, newReply)} // Example: user_id = 2
                    className="reply-button"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No discussions available yet. Be the first to post a question!</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Forum;
