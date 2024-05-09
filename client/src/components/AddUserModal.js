import React, { useContext } from "react";
import {
  Modal,
  Box,
  Button,
  Backdrop,
  Typography,
  TextField,
} from "@mui/material";
import { AppContext } from "../context/ContextAPI";
import { X } from "lucide-react";
import { ToastContainer, toast, Slide } from "react-toastify";
import Cookies from "js-cookie";

import "react-toastify/dist/ReactToastify.css";


export default function AddUserModal({ open, handleClose }) {
  //-------------- Using Context --------------
  const Users = useContext(AppContext);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  
  //closing Modal
  const handleCloseButtonClick = () => {
    handleClose();
  };

  //Taking Input
  const handleMobile = (event) => {
    const { name, value } = event.target;
    Users.SetAddUser({ [name]: value });
  };

  //Add Users
  const AddUser = async () => {
    try {
      if(Users.AddUser){
      const response = await fetch(`${backendUrl}/user/addusers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("Token")}`,
        },
        body: JSON.stringify(Users.AddUser),
      });

      const data = await response.json();

      if (response.ok) {
        Users.fetchUsers();
        toast.success(data.message, {
          className: "toast_message",
        });
        handleCloseButtonClick();


      } else {
        toast.error(data.message, {
          className: "toast_message",
        });
      }
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
        onClose={handleClose}
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
            width: Users.isMobileScreen?"80%":"30%",
            border: "1px solid #000",
            boxShadow: 24,
            p: 3,
          }}
          className="AddUserModal"
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
              Add Friend
            </Typography>
            <X
              className="close-icon"
              onClick={handleCloseButtonClick}
              size={18}
            />
          </Box>

          <TextField
            name="phone_no"
            placeholder="Mobile Number"
            className="SearchBox"
            size="small"
            autoComplete="off"
            InputProps={{
              style: { color: "#ffffff" },
            }}
            onChange={handleMobile}
          />
          <Box sx={{ mt: 2, display: "flex", flexDirection: "row-reverse" }}>
            <Button
              className="Add-User"
              variant="contained"
              sx={{
                backgroundColor: "#2153bf",
                color: "#dfdfdf",
                textTransform: "none",
                ml: 1,
              }}
              onClick={AddUser}
            >
              Add
            </Button>
            <Button
              onClick={handleCloseButtonClick}
              sx={{
                color: "#dfdfdf",
                textTransform: "none",
                ml: 1,
              }}
            >
              Cancle
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
