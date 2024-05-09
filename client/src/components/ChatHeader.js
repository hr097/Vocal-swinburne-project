import React, { useContext, useEffect, } from "react";
import {
    Box,
    Avatar,
    Menu,
    MenuItem,
    IconButton,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import { AppContext } from "../context/ContextAPI";
import { MoreVertical, Trash,ChevronLeft } from "lucide-react";
import { ToastContainer, toast, Slide } from "react-toastify";
import Cookies from 'js-cookie';

import "../style/style.css";

const ITEM_HEIGHT = 50;

export default function ChatHeader({ socket }) {
  //************* Using Context *************
    const Users = useContext(AppContext);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;


    const open = Boolean(Users.deleteMenu);
    const handleClick = (event) => {
        Users.setDeleteMenu(event.currentTarget);
    };

    const handleClose = () => {
        Users.setDeleteMenu(null);
    };


    const backButton=()=>{
        Users.setBackButton(false);
    }

    //Getting typing response from server
    useEffect(() => {
        let currentSocket = socket.current;

        socket.current?.on("typing_msg_send", (data) => {
            if (data.from === Users.selectedUser) {
                Users.SetTyping(Users.selectedUserInfo.name+" "+data.message);
            }
        });

        socket.current?.on("stop_typing_send", (data) => {
            if (data.from === Users.selectedUser) {
                Users.SetTyping("");
            }
        });

        return () => {
            if (currentSocket) {
                currentSocket.off("typing_msg_send");
                currentSocket.off("stop_typing_send");
            }
        };
    });

    // chat deletion
    const deleteChat=async ()=>{
        try{
            const response=await fetch(
                `${backendUrl}/user/deletechatdata`,
                {
                    method:"POST",
                    headers:{
                        "Content-type": "application/json",
                        Authorization: `Bearer ${Cookies.get("Token")}`,
                    },
                    body: JSON.stringify({ roomId: Users.selectedUserInfo.roomId }),
                }
                );
                const data=await response.json();
                
            if(response.ok){
                Users.setDeleteMenu(null);
                Users.FetchSelectedUserChat();

                //sending deletion event to server
                socket.current.emit("delete_chat", {
                    to: Users.selectedUser,
                    roomId: Users.selectedUserInfo.roomId,
                });

                toast.success(data.message, {
                    className: "toast_message",
                });
            }
        }
        catch(err){
            // console.log(err.message)
            toast.error(err.message, {
                className: "toast_message",
            });
        }
    }

    return (
        <>
        <Box className={Users.isMobileScreen?"ChatHeaderMobile":"ChatHeader"}>
            {Users.isMobileScreen?<IconButton onClick={backButton}><ChevronLeft size="24" className="BackIcon"/></IconButton>:""}
            <Avatar src={`https://drive.google.com/uc?export=view&id=${Users.selectedUserInfo?.photo}`} alt="" />

            <div className="name_msg">
                <p className="UserNameTitle">{Users.selectedUserInfo?.name}</p>
                <p className="TypingMsg">{Users?.Typing}</p>
            </div>

            <IconButton
                aria-label="more"
                aria-controls={open ? "long-menu" : undefined}
                aria-expanded={open ? "true" : undefined}
                aria-haspopup="true"
                onClick={handleClick}
                style={{ marginLeft: "auto" }}
            >
                <MoreVertical size="20" className="MoreOptionIcon" />
            </IconButton>

            <Menu
                MenuListProps={{
                    "aria-labelledby": "long-button",
                }}
                anchorEl={Users.deleteMenu}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    style: {
                    maxHeight: ITEM_HEIGHT * 4.5,
                    width: "14ch",
                    backgroundColor: "#282932",
                    },
                }}
            >
                <MenuItem onClick={deleteChat}>
                        <ListItemIcon>
                            <Trash size="16" color="#9A3B3B" />
                        </ListItemIcon>
                        <ListItemText
                            disableTypography
                            primary="Delete chat"
                            style={{ color: "#9A3B3B", fontSize: "14px" }}
                        />
                </MenuItem>
            </Menu>
        </Box>

    {/*-------------- Toast Message --------------*/}
        <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={true}
            theme="dark"
            transition={Slide}
        />
        </>
    );
}
