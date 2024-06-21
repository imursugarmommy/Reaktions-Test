// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
  getDatabase,
  get,
  ref,
  child,
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAULBr6iOVYBW0955-UUcV4dY2aENDZwFU",
  authDomain: "login-example-203c0.firebaseapp.com",
  projectId: "login-example-203c0",
  storageBucket: "login-example-203c0.appspot.com",
  messagingSenderId: "537606564773",
  appId: "1:537606564773:web:d2a24123abf008eacf964c",
  databaseURL:
    "https://login-example-203c0-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

const adminList = ["levi.besch@gmail.com", "etifri2007@web.de"];

export { app, adminList };
