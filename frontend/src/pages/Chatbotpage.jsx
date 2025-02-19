import React from "react";
import Layout from "../components/Layout";
import ChatBox from "../components/ChatBox";

const Chatbot = () => {
  return (
    <Layout>
      <h2>What is a Chatbot?</h2>
      <p>A chatbot is a computer program that simulates conversation with users.</p>
      <ChatBox />
    </Layout>
  );
};

export default Chatbot;
