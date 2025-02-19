import React from "react";
import Layout from "../components/Layout";
import ForumPost from "../components/ForumPost";

const Forum = () => {
  return (
    <Layout>
      <h2>Discussion Forum</h2>
      <ForumPost title="Best UI tools?" replies={12} />
      <ForumPost title="React vs Vue?" replies={20} />
    </Layout>
  );
};

export default Forum;
