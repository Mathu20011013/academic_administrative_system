import React from "react";

const ChatBox = () => {
  return (
    <div className="chatbox">
      <p>Ask me anything about courses!</p>
      <input type="text" placeholder="Type here..." />
      <button>Send</button>
    </div>
  );
};

export default ChatBox;
