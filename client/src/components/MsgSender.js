import React, { useContext,useEffect, useRef } from "react";
import { Box, TextField, InputAdornment, IconButton } from "@mui/material";
import { AppContext } from "../context/ContextAPI";
import { ImagePlus, ArrowUpFromLine, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

// import { google } from 'googleapis';

import "../style/style.css";
import ImagePreviewModal from "./ImagePreviewModal";

export default function MsgSender({ socket }) {
    //************* Using Context *************
    const Users = useContext(AppContext);
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);


    // emoji picker open/close
    useEffect(() => {
    const handleOutsideClick = (event) => {
      if (Users.Emoji && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        Users.setEmoji(false);
        Users.setSelectedEmojis([]);
        // console.log(Users.Emoji)
      }
    };
    
      document.addEventListener("mousedown", handleOutsideClick);
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
      // eslint-disable-next-line
    }, []);


    const currTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // handle input
    const HandleMsgInput = (event) => {
        const { value } = event.target;
        const to = Users.selectedUserInfo.id;
        const from = Users.currentUser;
        Users.SetMessage(value);

        // sending Typing event to server
        if (!Users.isTyping) {
          socket.current?.emit("typing_msg", { to, from });
          Users.setIsTyping(true);
        }

        if (Users.typingTimeout) {
          clearTimeout(Users.typingTimeout);
        }

        // sending stop Typing event to server
        const newTypingTimeout = setTimeout(() => {
          socket.current?.emit("stop_typing", { to, from });
          Users.setIsTyping(false);
        }, 3000);

        Users.setTypingTimeout(newTypingTimeout);
    };

  // sending text message to server
  const HandleMsgSend = () => {
    const newMsg = Users.message;
    const to = Users.selectedUserInfo.id;
    const from = Users.currentUser;
    const room = Users.selectedUserInfo.roomId;
    const contentType = "text";
    if (newMsg.trim()) {
      socket.current?.emit(
        "send_msg",
        { room, to, from, message: newMsg, contentType },
        (response) => {
          // console.log("Message sent successfully:", response.message);
          Users.addMessage({
            sender: true,
            contentType: "text",
            text: newMsg,
            time: currTime,
          });
          Users.SetMessage("");
        }
      );
    }
  };

  // sending message on enter
  const HandleEnterKeyPress = (event) => {
    if (event.key === "Enter") {
      HandleMsgSend();
    }
  };


  // select image
  const handleImageUpload = () => {
    fileInputRef.current.click();
  };

  // select emoji
  const selectEmoji = (emojiObject) => {
    const newEmoji = emojiObject.emoji;
    Users.setSelectedEmojis([newEmoji]);
  };

  const updateMessageWithEmojis = () => {
    const { message } = Users;
    const updatedMessage = `${message} ${Users.selectedEmojis.join(' ')}`;
    Users.SetMessage(updatedMessage);
  };

  useEffect(() => {
    updateMessageWithEmojis();
    // eslint-disable-next-line
  }, [Users.selectedEmojis]); 
  
  // handling image input
  const handleFileInputChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        Users.setSelectedImage({image:selectedFile});
        Users.setImagePreview({image:e.target.result});
        Users.setIsModalOpen(true);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  //closing image preview modal
  const closeModal = () => {
    Users.setSelectedImage(null);
    Users.setIsModalOpen(false);
  };

  // emoji container
  const emojiPicker = Users.Emoji ? (
    <div className="emoji_picker_div" ref={emojiPickerRef}>
      <EmojiPicker
        className="emoji-picker"
        theme="dark"
        emojiStyle="google"
        onEmojiClick={selectEmoji}
        lazyLoadEmojis={true}
        previewConfig={{ showPreview: false }}
      />
    </div>
  ) : null;

  const emojiOpen = () => {
    // console.log(Users.Emoji);
    Users.setEmoji(!Users.Emoji);
  };

  return (
    <>
      {emojiPicker}
      <Box className={Users.isMobileScreen?"MsgSenderContainerMobile":"MsgSenderContainer"}>
        <TextField
          name="msg"
          placeholder="Type a message..."
          className="MsgBox"
          autoComplete="off"
          size="small"
          value={Users.message}
          onChange={HandleMsgInput}
          onKeyDown={HandleEnterKeyPress}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <input
                  name="image"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileInputChange}
                />
                <IconButton onClick={handleImageUpload}>
                  <ImagePlus size="18" className="AttachIcon" />
                </IconButton>
                <IconButton onClick={emojiOpen}>
                  <Smile size="18" />
                </IconButton>
                <IconButton onClick={HandleMsgSend}>
                  <ArrowUpFromLine
                    size="18"
                    className="sendIcon"
                    color="#296eff"
                  />
                </IconButton>
              </InputAdornment>
            ),
            style: {
              color: "#ffffff",
              backgroundColor: "#1e1f25",
              borderRadius: "13px",
              padding: "7px",
            },
          }}
        />
      </Box>

      {/* Image preview modal */}
      <ImagePreviewModal
        open={Users.isModalOpen}
        close={closeModal}
        socket={socket}
      />
    </>
  );
}
