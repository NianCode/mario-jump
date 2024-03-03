// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNBM1yPYmRRui4Ba1Vv-Zk9VSaW0e2RbY",
  authDomain: "nian-code.firebaseapp.com",
  projectId: "nian-code",
  storageBucket: "nian-code.appspot.com",
  messagingSenderId: "388387613829",
  appId: "1:388387613829:web:7bfc12a7e1281ec4884dec",
  measurementId: "G-66WXRDSMY8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;