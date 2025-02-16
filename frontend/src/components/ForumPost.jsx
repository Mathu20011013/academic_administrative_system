import React from "react";

const ForumPost = ({ title, replies }) => {
  return (
    <div className="forum-post">
      <h3>{title}</h3>
      <p>{replies} replies</p>
    </div>
  );
};

export default ForumPost;
