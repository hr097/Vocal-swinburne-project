import React, {useEffect, useContext } from "react";
import { Box, Button, TextField, Stack } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/ContextAPI";
import { ToastContainer, toast, Slide } from "react-toastify";
import Cookies from 'js-cookie';
import "react-toastify/dist/ReactToastify.css";

import "../style/style.css";

export default function Login() {
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
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const phoneRegex = /^[0-9]{10,12}$/;

    const isEmail = emailRegex.test(value);
    const isPhone = phoneRegex.test(value);

    if (name === "password") {
      Users.setLoginData({ ...Users.loginData, [name]: value });
    } else if (isEmail) {
      Users.setLoginData({ ...Users.loginData, email: value });
    } else if (isPhone) {
      Users.setLoginData({ ...Users.loginData, phone_no: value });
    }
  };

  //-------------- Handling API --------------
  const handleLogin = async () => {
    try {
      //-------------- Fetching API --------------
      const response = await fetch(`${backendUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Users.loginData),
      });

      const data = await response.json();

      if (response.ok) {
      //-------------- Setting up cookie --------------
        Cookies.set('Token', data.Token, { expires: 365 })
        navigate("/");
        Users.setLoginData({});
      } 
      else {
        toast.error(data.message, {
          className: "toast_message",
        });
      }
    } catch (err) {
      toast.error(err.message, {
        className: "toast_message",
      });
    }
  };

  return (
    <>
      <Box className="Login">
        <Stack className="LoginContainer">
          <p className="LoginTitle">Login</p>

          {/*-------------- Email / phone no --------------*/}
          <TextField
            placeholder="Phone no / Email"
            className="LoginFields"
            size="small"
            InputProps={{
              style: { color: "#dfdfdf", fontSize: "16px" },
            }}
            onChange={handleInputChange}
          />

          {/*-------------- Password --------------*/}
          <TextField
            name="password"
            placeholder="Password"
            type="password"
            className="LoginFields"
            size="small"
            InputProps={{
              style: { color: "#dfdfdf", fontSize: "16px" },
            }}
            onChange={handleInputChange}
          />

          <Button className="LoginButton" size="small" onClick={handleLogin}>
            Let me in
          </Button>

          <Link to="/register" className="link">
            Don't have any account?
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
