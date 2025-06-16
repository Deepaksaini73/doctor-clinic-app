import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyDB30Xaxig5oBEppFOONxLHcTMlteq2S9o",
  authDomain: "doctor-dashboard001.firebaseapp.com",
  projectId: "doctor-dashboard001",
  storageBucket: "doctor-dashboard001.firebasestorage.app",
  messagingSenderId: "484931734628",
  appId: "1:484931734628:web:8bbbc32630e46fc19ee371",
  measurementId: "G-K9BN21FF4S",
  databaseURL: "https://doctor-dashboard001-default-rtdb.asia-southeast1.firebasedatabase.app"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Analytics and get a reference to the service
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app)

export { app, analytics, database } 