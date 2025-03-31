import React from "react";
import Layout from "../components/Layout";
import ChatBox from "../components/ChatBox";
import "../styles/Chatbot.css"; // Import the new CSS file

const Chatbot = () => {
  return (
    <Layout>
      <div className="chatbot-container">
        <h2 className="chatbot-heading">What is a Chatbot?</h2>
        <p className="chatbot-description">
          A chatbot is a computer program that simulates conversation with users.
        </p>

        {/* Chat Window Section */}
        <div className="chat-window">
          <div className="top-menu">
            <div className="buttons">
              <div className="button close"></div>
              <div className="button minimize"></div>
              <div className="button maximize"></div>
            </div>
            <div className="title">Chat</div>
          </div>

          {/* Message List */}
          <div className="messages-container">
            <ul className="messages"></ul>
          </div>

          {/* Bottom Input Section */}
          <div className="bottom-wrapper">
            <div className="message-input-wrapper">
              <input className="message-input" placeholder="Type your message here..." />
            </div>
            <div className="send-message">
              <div className="text">Send</div>
            </div>
          </div>
        </div>

        {/* Include ChatBox Component */}
        <ChatBox />
      </div>
    </Layout>
  );
};

export default Chatbot;
