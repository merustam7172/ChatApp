import React, { useContext, useEffect, useState } from 'react'
import './ProfileUpdate.css'
import assets from '../../assets/assets.js'
import { useAsyncError, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import upload from '../../lib/upload.js';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext.jsx';

const ProfileUpdate = () => {

  const [image, setImage] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const navigate = useNavigate();
  const {setUserData} = useContext(AppContext);

  const profileUpdateHandler = async(e) => {
    e.preventDefault();
    try{
      if(!prevImage && image){
        toast.error("Upload profile picture");
      }
      const docRef = doc(db, 'users',uid);
      if(image){
        const imgUrl = await upload(image);
        setPrevImage(imgUrl);
        // updating avatar, name and bio
        await updateDoc(docRef, {
          avatar : imgUrl,
          bio : bio,
          name : name
        })
      }
      // else{// user does not  want to change the image
      //     await updateDoc(docRef, {
      //     bio : bio,
      //     name : name
      //   })
      // }
      
      // setting profile updated data to public variable setUserData
      const snap = await getDoc(docRef);
      setUserData(snap.data());
      navigate('/chat');
    }
    catch(error){
      console.log(error);
      toast.error(error.message);
    }

  }

  useEffect(() => {
    onAuthStateChanged(auth, async(user) => {
      if(user){
        setUid(user.uid);
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        const userData = docSnap.data();
        if(userData.name){
          setName(userData.name);
        }
        if(userData.bio){
          setBio(userData.bio);
        }
        if(userData.avatar){
          setPrevImage(userData.avatar);
        }
      }
      else{
        navigate('/');  // if user not exist
      }
    })
  },[])
  
  return (
    <div className='profile'>
      <div className="profile-container">

        <form onSubmit={profileUpdateHandler}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input onChange={(e) => setImage(e.target.files[0])} type="file" id='avatar' accept='.png, .jpg, .jpeg' hidden />
            <img src={image ? URL.createObjectURL(image) :assets.avatar_icon} alt="" />
            upload profile image
          </label> 
          <input onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder='Your name' required />
          <textarea onChange={(e) => setBio(e.target.bio)} value={bio} placeholder='write profile bio' required></textarea>
          <button type='submit'>Save</button>
        </form>

        <img className='profile-pic' src={image ? URL.createObjectURL(image) : prevImage ? prevImage : assets.logo_icon} alt="" />
      </div>
    </div>
  )
}

export default ProfileUpdate
