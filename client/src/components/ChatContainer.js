import React, { useContext, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { AppContext } from "../context/ContextAPI";

import "../style/style.css";

export default function ChatContainer({ socket }) {
  //************* Using Context *************
  const Users = useContext(AppContext);

  const scrollRef = useRef();
  const currTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Receiving messages from server
  useEffect(() => {
    let currentSocket = socket.current;

    if (socket.current) {
      
      //text message
      socket.current.on("receive_msg", (data) => {
        const { message,contentType } = data;
        if (data.from === Users.selectedUser) {
          Users.addMessage({ sender: false, text: message, time: currTime,contentType });
        }
      });

      //image message
      socket.current.on("receive_img", (data) => {
        const { message,contentType } = data;
        if (data.from === Users.selectedUser) {
          const imageSrc = `https://drive.google.com/uc?export=view&id=${message}`;
          Users.addMessage({ sender: false, text: imageSrc, time: currTime,contentType });
        }
      });
    }

    Users.SetMessage("");

    return () => {
      if (currentSocket) {
        currentSocket.off("receive_msg");
        currentSocket.off("receive_img");

      }
    };

  // eslint-disable-next-line
  }, [Users.chatMessages]);

  // scrolling to the last message
  useEffect(() => {
    if (scrollRef.current) {
      const lastMessage = scrollRef.current.lastChild;
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [Users.chatMessages]);


  // updating chat on chat deletion by other user
  useEffect(() => {
    let currentSocket = socket.current;

    if (socket.current) {
      socket.current.on("updated_chat_messages", (data) => {
        const { roomId } = data;

        // Check if the received chat deletion notification is for the current chat room
        if (roomId === Users.selectedUserInfo.roomId) {
          Users.FetchSelectedUserChat();
        }

      });
    }

    return () => {
      if (currentSocket) {
        currentSocket.off("updated_chat_messages");
      }
    };

  });


  return (
    <>
      <Box className={Users.isMobileScreen?"ChatContainerMobile":"ChatContainer"} ref={scrollRef}>
        {Users.chatMessages.map((message, index) => (
          <Box className={"MessageGroup"} key={index}>

            {/* If message is text */}
            {message.contentType === "text" && (
              <>
                <Box className={`${message.sender ? "SenderMsg" : "ReceiverMsg"}`}>
                  <p>{message.text}</p>
                </Box>

                <Box className={`${message.sender ? "msgSentTime" : "msgReceiveTime"}`}>
                  <p>{message.time}</p>
                </Box>
              </>
            )}

            {/* If message is image */}
            {message.contentType === "image" && (
              <>
                <Box className={`${message.sender ? "SenderImageMsg" : "ReceiverImageMsg"}`}>
                  <img src={message.text} className="displayImage" alt="data not found!" />
                </Box>

                <Box className={`${message.sender ? "msgSentTime" : "msgReceiveTime"}`}>
                  <p>{message.time}</p>
                </Box>
              </>
            )}

            
          </Box>
        ))}
      </Box>
    </>
  );
}
