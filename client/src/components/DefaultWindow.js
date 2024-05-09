import React from 'react'
import { Box} from "@mui/material";
import icon  from "../assets/imgs/default_screen.png";

export default function DefaultWindow() {
  return (
    <>
      <Box className="defaultwindow">
        <img src={icon} alt='Icon' className="default_screen_icon"/>
        <p>Welcome to Vocal !</p>
      </Box>
    </>
  )
}
