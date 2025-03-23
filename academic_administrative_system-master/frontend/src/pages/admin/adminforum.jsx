import React, { useState } from "react";
import Layout from "../../components/admin/ad-Layout"; // Adjust the import path as needed // Modify the Layout component to hide the sidebar if necessary
import "../../styles/Forum.css"; // Import the new CSS file

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
  const [forumPosts, setForumPosts] = useState([
    { title: "Best UI tools?", replies: 12 },
    { title: "React vs Vue?", replies: 20 },
    { title: "JavaScript Tips and Tricks", replies: 5 },
    { title: "Learning React Hooks", replies: 8 },
  ]);

  const handlePostDiscussion = (title, description) => {
    const newPost = {
      title: title,
      description: description,
      replies: 0,
    };
    setForumPosts([newPost, ...forumPosts]); // Add new post at the top
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
          {forumPosts.map((post, index) => (
            <div key={index} className="forum-post-card">
              <div className="card-body">
                <h5 className="card-title">{post.title}</h5>
                <p className="card-text">Replies: {post.replies}</p>
                <textarea className="reply-textarea" placeholder="Write your reply here..."></textarea>
                <button className="reply-button">Reply</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Forum;
