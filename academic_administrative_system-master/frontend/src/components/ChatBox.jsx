import React, { useState } from "react";

const ChatBox = () => {
  const [message, setMessage] = useState(""); // State to hold the message

  const handleSendMessage = () => {
    if (message.trim()) {
      alert(`Message Sent: ${message}`); // For now, just alerting the message
      setMessage(""); // Clear the input field after sending
    }
  };

  return (
    <div className="chatbox">
      <p className="chatbox-text">Ask me anything about courses!</p>
      <div className="chatbox-input-wrapper">
        <input
          type="text"
          className="chatbox-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)} // Handle input change
          placeholder="Type here..."
        />
        <button
          className="chatbox-button"
          onClick={handleSendMessage} // Trigger sending message
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
