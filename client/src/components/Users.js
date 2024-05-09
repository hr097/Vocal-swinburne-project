import React, { useContext, useEffect } from "react";
import {
  TextField,
  InputAdornment,
  Container,
  Box,
  Avatar,
  IconButton,
  Button,
  Menu,
} from "@mui/material";
import { Search, MessagesSquare, ArrowRightToLine, Plus,Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { AppContext } from "../context/ContextAPI";
import AddUserModal from "./AddUserModal";

import "../style/style.css";
import "react-toastify/dist/ReactToastify.css";
const ITEM_HEIGHT = 100;

export default function Users({ socket }) {

  //************* Using Context *************
  const Users = useContext(AppContext);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const navigate = useNavigate();

  //Logout user
  const LogOutUser = () => {
    Cookies.remove("Token");
    navigate("/login");
  };

  //Searching User
  const FilterdUsers = Users.users?.filter((user) =>
    user.participant.name.toLowerCase().includes(Users.searchUser.toLowerCase())
  );

  // Selecting User
  const handleUserClick = (userId) => {
    Users.setSelectedUser(userId);
    Users.SetTyping("");
    Users.setIsChatOpen(true);
    Users.setBackButton(true);
  };

  //Add user Modal
  const handleOpenModal = () => {
    Users.SetAddUserModalOpen(true);
  };

  const handleCloseModal = () => {
    Users.SetAddUserModalOpen(false);
  };

  // Fetching userdata after loading
  useEffect(() => {
    Users.fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchUserDetails();
    // eslint-disable-next-line
  }, [Users.currentUser]);

  useEffect(() => {
    Users.setChatMessages([]);
    // eslint-disable-next-line
  }, [Users.selectedUser]);


  const open = Boolean(Users.userMenu);
  const handleClick = (event) => {
    Users.setUserMenu(event.currentTarget);
    fetchUserDetails();
  };

  const handleClose = () => {
      Users.setUserMenu(null);
  };

  const fetchUserDetails=async ()=>{
    try{
      const response=await fetch(`${backendUrl}/user/loggedinuserinfo`,{
        method:"POST",
        headers:{
          "Content-type":"application/json",
          Authorization:`Bearer ${Cookies.get("Token")}`,
        },
        body: JSON.stringify({ userId: Users.currentUser }),
      });

      const data=await response.json();
        Users.setUserBio(data);
        Users.setProfileImage(data.profile_photo);
    }catch(err){
      console.log(err);
    }
  }

  return (
    <>
      {/*----------------------- Sidebar -----------------------*/}
      <Box className="Sidebar">
        <Box style={{ display: 'flex', flexDirection: 'column',justifyContent: 'space-between', alignItems: 'center', height: '98%' }}>
          <IconButton className="add-user-btn" onClick={handleOpenModal}>
            <Plus color="#296eff" />
          </IconButton>
          <Button
            aria-label="more"
            aria-controls={open ? "long-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-haspopup="true"
            onClick={handleClick}
          >
            <Avatar className="ProfileMenu" src={`https://drive.google.com/uc?export=view&id=${Users.profileImage}`}/>
          </Button>

          <Menu
              MenuListProps={{
                    "aria-labelledby": "long-button",
              }}
              anchorEl={Users.userMenu}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              transformOrigin={{vertical: 'top',horizontal: 'right'}}
              PaperProps={{
                  style: {
                  maxHeight: ITEM_HEIGHT * 4.5,
                  width: "32ch",
                  backgroundColor: "#282932",
                  margin:'0px 0px 0px 30px'
                  },
              }}
          >
                <Box className="UserDetails">
                    <Box className="userAvatar">
                      <Avatar className="ProfileIcon" src={`https://drive.google.com/uc?export=view&id=${Users.userBio.profile_photo}`}/>
                    </Box>

                    <Box className="DetailsContainer">
                      <Box className="DataContainer">
                        <p className="textlbl">Name</p>
                        <p className="datalbl">{Users.userBio.name}</p>
                      </Box>
                      <Box className="DataContainer">
                        <p className="textlbl">Phone no</p>
                        <p className="datalbl">+91 {Users.userBio.phone_no}</p>
                      </Box>
                      <Box className="DataContainer">
                        <p className="textlbl">email</p>
                        <p className="datalbl">{Users.userBio.email}</p>
                      </Box>
                    </Box> 

                    <Box className="logoutContainer">
                      <Button className="logoutbtn" onClick={LogOutUser}>Logout</Button>
                    </Box>
                </Box>
          </Menu>
        </Box>
      </Box>

      <AddUserModal
        open={Users.AddUserModalOpen}
        handleClose={handleCloseModal}
      />

      {/*----------------------- User List -----------------------*/}
      <Container className={Users.isMobileScreen?"UserContactsMobile":"UserContacts"}>
        {/* App header and search */}
        <Box className="Heading_Search">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p className="Heading">Vocal</p>
            <ArrowRightToLine
              size="16"
              className="logout-icon"
              onClick={LogOutUser}
            />
          </Box>
          {/* Search box */}
          <TextField
            placeholder="Search..."
            className="SearchBox"
            size="small"
            autoComplete="off"
            onChange={(e) => {
              Users.setSearchUser(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size="16" />
                </InputAdornment>
              ),
              style: { color: "#ffffff" },
            }}
          />
        </Box>

        {/* User component start*/}
        <Box className="allmsglbl">
          <MessagesSquare size="14" color="#aaaaaa" />
          <p className="lbltext">All messages</p>
        </Box>

        <Box className="UserList">
          {/* Users list */}
          {FilterdUsers?.map((user) => (
            <div className={`profile_Container ${user.participant.id === Users.selectedUser? "selected-user": ""}`}
              key={user.participant.id}
              onClick={() => handleUserClick(user.participant.id)} 
            >
              <Avatar src={`https://drive.google.com/uc?export=view&id=${user.participant.photo}`} alt="" />
              <div className="user-info ">
                <div className="username-time">
                  <p className="username">{user.participant.name}</p>
                  <p className="recent-time">{user.participant.last_message_time}</p>
                </div>
                {
                  user.participant.last_message_type==='image'?
                  <div style={{display: "flex", alignItems: "center",marginTop:"4px" }}><Image size="14" style={{ marginRight: "5px" }} /><p className="last-message" style={{ margin: '0' }}>Image</p></div>:
                  <p className="last-message" >{user.participant.last_message?user.participant.last_message:"Hello, there!"}</p>
                }
              </div>
            </div>
          ))}
        </Box>
        {/* User component end*/}
      </Container>
    </>
  );
}
