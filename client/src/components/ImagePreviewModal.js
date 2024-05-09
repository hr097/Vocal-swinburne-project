import React, { useContext } from "react";
import { Box, Modal, Button, Backdrop, Typography } from "@mui/material";
import { AppContext } from "../context/ContextAPI";
import { X, ArrowRightFromLine } from "lucide-react";
import { ToastContainer, toast, Slide } from "react-toastify";
import Cookies from "js-cookie";

import "react-toastify/dist/ReactToastify.css";

export default function ImagePreviewModal({ open, close, socket }) {

    //-------------- Using Context --------------
    const Users = useContext(AppContext);
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const currTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    
    //sending image to server
    const sendImage = async () => {
        if (Users.isSendingImage) {
            return;
        }

        try {
            Users.setIsSendingImage(true);
            let formData = new FormData();
            formData.append('image', Users.selectedImage.image);

            //-------------- Fetching API --------------
            const response = await fetch(`${backendUrl}/user/upload_img`, {
                method: "POST",
                headers:{
                    Authorization:`Bearer ${Cookies.get("Token")}`,
                },
                body: formData,
            });

            const data = await response.json();
            // console.log(data)
            if (response.ok) {

                const to = Users.selectedUserInfo.id;
                const from = Users.currentUser;
                const room = Users.selectedUserInfo.roomId;
                const contentType = "image";
        
                if (Users.selectedImage) {
                    const newImageMsg = {
                        sender: true,
                        contentType: "image",
                        text: `https://drive.google.com/uc?export=view&id=${data}`,
                        time: currTime,
                    };
        
                    socket.current?.emit("send_img",{ room, to, from,message:data, contentType },(response) => {
                        // console.log("Message sent successfully:", response.message);
                        Users.addMessage(newImageMsg);
                        }
                    );
                    Users.setIsSendingImage(false);
                    close();
                }
            } else {
                toast.error(data.message, {
                    className: "toast_message",
                });
                Users.setIsSendingImage(false);
                close();

            }
        } catch (err) {
            toast.error(err.message, {
                className: "toast_message",
            });
        }
    };

    return (
        <>
        <Modal
            open={open}
            onClose={close}
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                },
            }}
        >
            <Box
            sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                border: "1px solid #000",
                boxShadow: 24,
                p: 3,
            }}
            className="ImagePreviewModal"
            >
            <Box
                component="div"
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
                <Typography
                id="modal-modal-title"
                variant="h6"
                fontWeight="bold"
                mb={2}
                >
                Attached Image
                </Typography>
                <X className="close-icon" onClick={close} size={18} />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                {Users.selectedImage && (
                <img
                    src={Users.imagePreview.image}
                    alt="Selected"
                    className="PreviewImage"
                />
                )}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "end", mt: 3 }}>
                <Button
                onClick={sendImage}
                variant="text"
                color="primary"
                sx={{
                    "&:hover": {
                    backgroundColor: "#282932",
                    },
                }}
                endIcon={<ArrowRightFromLine size={16} color="#296eff" />}
                className="ImageSendButton"
                >
                Send
                </Button>
            </Box>
            </Box>
        </Modal>

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
