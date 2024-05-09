import React, { useEffect,useContext } from "react";
import { Box, Button, TextField, Stack } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/ContextAPI";
import { ToastContainer, toast, Slide } from "react-toastify";
import Cookies from 'js-cookie';

import "react-toastify/dist/ReactToastify.css";

import "../style/style.css";

export default function Register() {

  //-------------- Using Context --------------
  const Users = useContext(AppContext);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const navigate = useNavigate();

  //-------------- Redirecting if cookie is set --------------
  useEffect(() => {
    if (Cookies.get('Token')) {
      navigate("/");
    }
  }, [navigate]);

  //-------------- Handling User Input --------------
  const handleInput = (event) => {
    const { name, value } = event.target;
    Users.setRegisterData({ ...Users.registerData, [name]: value });
  };

  const handleImage = (event) => {
    Users.setRegisterData({
      ...Users.registerData,
      profile_photo: event.target.files[0],
    });
  };


  //-------------- Handling API --------------
  const handleRegister = async () => {
    try {
      Users.setRegisterClick(true);
      let formData = new FormData();

      formData.append('name', Users.registerData.name);   
      formData.append('phone_no', Users.registerData.phone_no);
      formData.append('profile_photo', Users.registerData.profile_photo);
      formData.append('email', Users.registerData.email);
      formData.append('password', Users.registerData.password);


      //-------------- Fetching API --------------
      const response = await fetch(`${backendUrl}/register`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message, {
          className: "toast_message",
        });
        setTimeout(()=>{

          navigate("/login");

        },2000);
        Users.setRegisterData({});
      } 
      else {
        toast.error(data.message, {
          className: "toast_message",
        });
      }
      Users.setRegisterClick(false);

    } 
    catch (err) {
      Users.setRegisterClick(false);
      toast.error(err.message, {
        className: "toast_message",
      });
    }
  };
  return (
    <>
      <Box className="Login">
        <Stack className="LoginContainer">

          <p className="LoginTitle">Register</p>

          {/* -------------- Name -------------- */}
          <TextField
            name="name"
            placeholder="Name"
            className="LoginFields"
            size="small"
            InputProps={{
              style: { color: "#dfdfdf", fontSize: "16px" },
            }}
            onChange={handleInput}
          />

          {/* -------------- Phone no -------------- */}
          <TextField
            name="phone_no"
            placeholder="Phone no"
            className="LoginFields"
            size="small"
            InputProps={{
              style: { color: "#dfdfdf", fontSize: "16px" },
            }}
            onChange={handleInput}
          />

          {/* -------------- Profile picture -------------- */}
          <Button className="ProfilePic" component="label">
            Profile photo
            <input
              name="profile_photo"
              hidden
              accept="image/*"
              multiple
              type="file"
              onChange={handleImage}
            />
          </Button>

          {/* -------------- Email -------------- */}
          <TextField
            name="email"
            placeholder="Email"
            className="LoginFields"
            size="small"
            InputProps={{
              style: { color: "#dfdfdf", fontSize: "16px" },
            }}
            onChange={handleInput}
          />

          {/* -------------- Password -------------- */}
          <TextField
            name="password"
            type="password"
            placeholder="Password"
            className="LoginFields"
            size="small"
            InputProps={{
              style: { color: "#dfdfdf", fontSize: "16px" },
            }}
            onChange={handleInput}
          />

          <Button className="LoginButton" size="small" onClick={handleRegister} disabled={Users.registerClick}>
            Sign up{" "}
          </Button>

          <Link to="/login" className="link">
            Already have account?
          </Link>

        </Stack>
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
