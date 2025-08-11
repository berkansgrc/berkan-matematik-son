// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  "projectId": "berkan-matematik-pkotx",
  "appId": "1:641384261184:web:7e9ae15584ea7f829421a5",
  "storageBucket": "berkan-matematik-pkotx.appspot.com",
  "apiKey": "AIzaSyB673gxS9PuXNJH-5vUP98zcunCAZ9ja80",
  "authDomain": "berkan-matematik-pkotx.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "641384261184"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
