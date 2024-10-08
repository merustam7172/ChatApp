import React, { useContext, useEffect, useState } from 'react'
import './ChatBox.css'
import assets from '../../assets/assets'
import {AppContext} from '../../context/AppContext'
import { Timestamp, arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { toast } from 'react-toastify'
import upload from '../../lib/upload'
const ChatBox = () => {
  const {userData, messagesId, chatUser, messages, setMessages, chatVisible, setChatVisible} = useContext(AppContext);
  
  const [input, setInput] = useState("");
  const sendMessage = async() => {
    try{
      if(input && messagesId){
        await updateDoc(doc(db, 'messages', messagesId), {
          messages : arrayUnion({
            sId : userData.id,
            text : input,
            createdAt: new Date()
          })
        })

        const userIds = [chatUser.rId, userData.id];
        userIds.forEach(async (id) => {
          const userChatsRef = doc(db,'chats',id);
          const userChatSnapshot = await getDoc(userChatsRef);

          if(userChatSnapshot.exists()){
            const userChatData = userChatSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId);
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0,30);
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if(userChatData.chatsData[chatIndex].rId === userData.id){
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef, {
              chatsData : userChatData.chatsData
            })
          }
        })
      }
    }
    catch(error){
      toast.error(error.message);
    }
    setInput("");
  }

  const sendImage = async(e) => {
    try{
      const fileUrl = await upload(e.target.files[0]);

      if(fileUrl && messagesId){
        await updateDoc(doc(db, 'messages', messagesId), {
          messages : arrayUnion({
            sId : userData.id,
            image : fileUrl,
            createdAt: new Date()
          })
        })

        const userIds = [chatUser.rId, userData.id];
        userIds.forEach(async (id) => {
          const userChatsRef = doc(db,'chats',id);
          const userChatSnapshot = await getDoc(userChatsRef);

          if(userChatSnapshot.exists()){
            const userChatData = userChatSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId);
            userChatData.chatsData[chatIndex].lastMessage = "Image";
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if(userChatData.chatsData[chatIndex].rId === userData.id){
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef, {
              chatsData : userChatData.chatsData
            })
          }
        })
      }
    }catch(error){
      toast.error(error.message);
    }
  }

  // conver time stamp
  const  convertTimeStamp = (timeStamp) => {
    let date = timeStamp.toDate();
    const hour = date.getHours();
    const minute =  date.getMinutes();
    if(hour > 12){
      return hour - 12 + ":" + minute + " PM";
    }
    else{
      return hour + ":" + minute + " AM";
    }
  }
  
  useEffect(() => {
    if(messagesId){
      const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
        setMessages(res.data().messages.reverse());
        console.log(messages);
      })
      return () => {
        unSub();
      }
    }
  },[messagesId])

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? "" : "hiddeni"}`}>
      <div className="chat-user">
        <img src={chatUser.userData.avatar}  alt="" />
        
        <p>{chatUser.userData.name} {Date.now() - chatUser.userData.lastSeen <= 70000 ? <img className='dot' src={assets.green_dot} alt="" /> : null}</p>
        
        <img src={assets.help_icon} alt="" className='help' />
        <img onClick={() => setChatVisible(false)} src={assets.arrow_icon} alt="" className='arrow' />
      </div>
      

      {/* chat section */}

      <div className="chat-msg">
        
        {messages.map((msg, index) => (
          <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
            {msg["image"]
             ? <img className='msg-img' src={msg.image}></img> 
              : <p className="msg">
                  {msg.text}
                </p>
            }
            
            <div>
              <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="img" />
              <p>{convertTimeStamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}
        
      </div>


      {/* input section */}
      <div className="chat-input">
          <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='send a message' />
          <input onChange={sendImage} type="file" id='image' accept='image/png, image/jpeg' hidden />
          <label htmlFor="image">
            <img  src={assets.gallery_icon} alt="" />
          </label>
          <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  )
  : <div className={`chat-welcome ${chatVisible ? "" : "hiddeni"}`}>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime, anywhere</p>
  </div>
}

export default ChatBox
