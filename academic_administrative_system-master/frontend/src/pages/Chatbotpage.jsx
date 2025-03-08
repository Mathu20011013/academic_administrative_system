import React from "react";
import Layout from "../components/Layout";
import ChatBox from "../components/ChatBox";
import "../styles/Chatbot.css"; // Import the new CSS file


const Chatbot = () => {
  return (
    <Layout>
      <h2>What is a Chatbot?</h2>
      <p>A chatbot is a computer program that simulates conversation with users.</p>

      {/* Chat Window Section */}
      <div className="chat_window">
        <div className="top_menu">
          <div className="buttons">
            <div className="button close"></div>
            <div className="button minimize"></div>
            <div className="button maximize"></div>
          </div>
          <div className="title">Chat</div>
        </div>

        {/* Message List */}
        <ul className="messages"></ul>

        {/* Bottom Input Section */}
        <div className="bottom_wrapper clearfix">
          <div className="message_input_wrapper">
            <input className="message_input" placeholder="Type your message here..." />
          </div>
          <div className="send_message">
            <div className="icon"></div>
            <div className="text">Send</div>
          </div>
        </div>
      </div>

      {/* Hidden Message Template (used for creating new messages dynamically) */}
      <div className="message_template">
        <li className="message">
          <div className="avatar"></div>
          <div className="text_wrapper">
            <div className="text"></div>
          </div>
        </li>
      </div>

      {/* Include ChatBox Component */}
      <ChatBox />
    </Layout>
  );
};

export default Chatbot;
