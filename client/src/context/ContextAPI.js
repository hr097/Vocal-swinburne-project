import React, { createContext, useState,useEffect } from "react";
import Cookies from "js-cookie";

// Create a new context
export const AppContext = createContext();

export default function ContextAPI(props) {

  const [users, Setusers] = useState([]);
  const [currentUser,SetcurrentUser]=useState([]);

  const [searchUser, setSearchUser] = useState("");

  // State to track which user's chat to show
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedUserInfo,setSelectedUserInfo]= useState(null);

  // Authorization
  const [loginData,setLoginData] = useState({});
  const [registerData,setRegisterData] = useState({"profile_photo":null});

  // Adding Users to conversations
  const [AddUserModalOpen,SetAddUserModalOpen] = useState(false);
  const [AddUser,SetAddUser] = useState("");

  const backendUrl = process.env.REACT_APP_BACKEND_URL;


  // Fetch Users in User-list
  const fetchUsers=async ()=>{
    try{
      const response=await fetch(`${backendUrl}/user/listusers`,{
        method:"GET",
        headers:{
          "Content-type":"application/json",
          Authorization:`Bearer ${Cookies.get("Token")}`,
        },
      });

      const data=await response.json();
      Setusers(data.participantsList);
      SetcurrentUser(data.sender_id);
    }
    catch(err){
      // console.log(err);
    }
  }

  useEffect(()=>{
    fetchUsers();
    // eslint-disable-next-line
  },[])

  // Fetching Selected User
  const FetchSelectedUserInfo = async () => {
    try {
    const response = await fetch(
        `${backendUrl}/user/fetchselecteduser`,
        {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${Cookies.get("Token")}`,
        },
        body: JSON.stringify({ selectedUser: selectedUser }),
        }
    );

    const data = await response.json();

    if (response.ok) {
        setSelectedUserInfo(data);
    }
    } catch (err) { 
        // console.log(err);
    }
};

  useEffect(() => {
    if (selectedUser) {
      FetchSelectedUserInfo();
    }
      // eslint-disable-next-line
  }, [selectedUser]);


  //Fetching chat messages
  const FetchSelectedUserChat = async () => {
    try {
    const response = await fetch(
        `${backendUrl}/user/fetchchatdata`,
        {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${Cookies.get("Token")}`,
        },
        body: JSON.stringify({ roomId: selectedUserInfo.roomId }),
        }
    );
    const data = await response.json();

    if (response.ok) {
      setChatMessages([]);
      data.forEach((data)=>{
        const imageSrc = `https://drive.google.com/uc?export=view&id=${data.message}`;
        addMessage({sender:(data.sender===selectedUserInfo.id)?false:true,text: (data.contentType==="image")?imageSrc:data.message,time:data.time,contentType:data.contentType});
      })
    }
    } catch (err) { 
        // console.log(err);
    }
};

  useEffect(() => {
    if (selectedUserInfo) {
      FetchSelectedUserChat();
    }
      // eslint-disable-next-line
  }, [selectedUserInfo,selectedUser]);


  // Message sending
  const [message,SetMessage]=useState("");
  const [chatMessages, setChatMessages] = useState([]);

  // Function to add a new message to the chatMessages state
  const addMessage = (message) => {
    setChatMessages((prevMessages) =>[...prevMessages, message]);
  };

  //Typing notification states
  const [Typing,SetTyping]=useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  //Delete chat
  const [deleteMenu,setDeleteMenu]=useState(null);

  //Image Preview
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSendingImage, setIsSendingImage] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  //User Detail Menu
  const [userMenu,setUserMenu]=useState(null);

  //User bio
  const [userBio,setUserBio]=useState("");

  //Emoji
  const [Emoji,setEmoji]=useState(false);
  const [selectedEmojis, setSelectedEmojis]=useState([]);

  const [registerClick,setRegisterClick]=useState(false);
  const [profileImage,setProfileImage]=useState();

  const [isMobileScreen,setIsMobileScreen]=useState(false);
  const [isChatOpen,setIsChatOpen]=useState(false);
  const [isBackButton,setBackButton]=useState(true);

  return (
    <AppContext.Provider
      value={{
        users,
        Setusers,
        searchUser,
        setSearchUser,
        selectedUser,
        setSelectedUser,
        loginData,
        setLoginData,
        registerData,
        setRegisterData,
        AddUserModalOpen,
        SetAddUserModalOpen,
        AddUser,
        SetAddUser,
        fetchUsers,
        selectedUserInfo,
        setSelectedUserInfo,
        FetchSelectedUserInfo,
        message,
        SetMessage,
        chatMessages,
        setChatMessages,
        addMessage,
        currentUser,
        SetcurrentUser,
        FetchSelectedUserChat,
        Typing,
        SetTyping,
        isTyping,
        setIsTyping,
        typingTimeout,
        setTypingTimeout,
        deleteMenu,
        setDeleteMenu,
        selectedImage,
        setSelectedImage,
        imagePreview,
        setImagePreview,
        isSendingImage,
        setIsSendingImage,
        isModalOpen,
        setIsModalOpen,
        userMenu,
        setUserMenu,
        userBio,
        setUserBio,
        Emoji,
        setEmoji,
        selectedEmojis,
        setSelectedEmojis,
        registerClick,
        setRegisterClick,
        profileImage,
        setProfileImage,
        isMobileScreen,
        setIsMobileScreen,
        isChatOpen,
        setIsChatOpen,
        isBackButton,
        setBackButton
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
}
