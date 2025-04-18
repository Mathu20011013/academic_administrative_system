import React, { useState, useEffect } from "react";
import "../styles/Forum.css";
import axios from "axios";

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

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/forum/discussions")
      .then((response) => {
        setForumPosts(response.data);
        response.data.forEach((post) => {
          fetchComments(post.forum_id);
        });
      })
      .catch((error) => {
        console.error("Error fetching the discussions:", error);
      });
  }, []);

  const fetchComments = (forum_id) => {
    axios
      .get(`http://localhost:5000/api/forum/comments/forum/${forum_id}`)
      .then((response) => {
        setReplies((prevReplies) => ({
          ...prevReplies,
          [forum_id]: response.data,
        }));
      })
      .catch((error) => {
        console.error("Error fetching replies:", error);
      });
  };

  const handlePostDiscussion = (title, description) => {
    const newDiscussion = {
      course_id: 1,
      user_id: 2,
      title: title,
      question: description,
    };

    axios
      .post("http://localhost:5000/api/forum/discussions", newDiscussion)
      .then((response) => {
        setForumPosts([response.data, ...forumPosts]);
        fetchComments(response.data.forum_id);
      })
      .catch((error) => {
        console.error("Error posting the discussion:", error);
      });
  };

  const handlePostReply = (forum_id, user_id, reply) => {
    if (!reply) return;

    const newComment = {
      forum_id: forum_id,
      user_id: user_id,
      comment: reply,
    };

    axios
      .post("http://localhost:5000/api/forum/comments", newComment)
      .then((response) => {
        setReplies((prevReplies) => ({
          ...prevReplies,
          [forum_id]: [...(prevReplies[forum_id] || []), response.data],
        }));
        setNewReply("");
      })
      .catch((error) => {
        console.error("Error posting the reply:", error);
      });
  };

  return (
    <div className="container mt-4 home-container">
      <div className="heading-container">
        <h2 className="text-center">Discussion Forum</h2>
      </div>

      <NewDiscussion onPostDiscussion={handlePostDiscussion} />

      <div className="forum-posts-container">
        {forumPosts.length > 0 ? (
          forumPosts.map((post, index) => (
            <div key={index} className="forum-post-card">
              <div className="card-body">
                <h5 className="card-title">{post.title}</h5>
                <p className="card-text">{post.question}</p>
                <p className="card-text">
                  <strong>Replies:</strong> {replies[post.forum_id]?.length || 0}
                </p>
                <div className="replies-container">
                  {replies[post.forum_id]?.map((reply, index) => (
                    <div key={index} className="reply">
                      <p>{reply.comment}</p>
                    </div>
                  ))}
                </div>
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Write your reply here..."
                  className="reply-textarea"
                ></textarea>
                <button
                  onClick={() => handlePostReply(post.forum_id, 2, newReply)}
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
  );
};

export default Forum;