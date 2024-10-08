// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
import { ToastContainer, collapseToast, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const firebaseConfig = {
  apiKey: "AIzaSyABz0--yKV4NI0yK58wWaoRClrtIGI-FHw",
  authDomain: "chat-app-7172.firebaseapp.com",
  projectId: "chat-app-7172",
  storageBucket: "chat-app-7172.appspot.com",
  messagingSenderId: "277244805937",
  appId: "1:277244805937:web:4cc648406e229b3d70a610"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app); // initialize database

// sign up method using firebase
const signup = async (username, email, password) => {
    try{
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        // storing data on firebase
        await setDoc(doc(db, "users", user.uid), {   // (database, collections, user_ID)
            id : user.uid,
            username : username.toLowerCase(),
            email,
            name : "",
            avatar : "",
            bio : "Hey, there i am using chat app",
            lastSeen : Date.now()
        })
        
        // storing chat data on firebase for new user
        await setDoc(doc(db,"chats", user.uid), {
            chatsData : []
        })

        toast("Sign up Successfully")
    }
    catch(error){
        console.log(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const login = async( email, password) => {
    try{
        await signInWithEmailAndPassword(auth,email, password);
        toast(`Welcome back! user`);
    }
    catch(error){
        console.log(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
}

const logout = async() => {
    try{
        await signOut(auth);
        toast("Logout Successfully")
    }
    catch(error){
        console.log(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
   
}

const resetPass = async(email) => {
    if(!email){
        toast.error("Enter Your Email");
        return null;
    }
    try {
        const userRef = collection(db, 'users');
        const q = query(userRef, where("email", "==", email));
        const querySnap = await getDocs(q);
        if(!querySnap.empty){
            await sendPasswordResetEmail(auth,email);
            toast.success("Reset Email Sent");
        }
        else{
            toast.error("Email doesn't exists");
        }
    } catch (error) {
        console.error(error);
        toast.error(error.message);
    }

}

export {signup, login, logout, auth, db, resetPass};