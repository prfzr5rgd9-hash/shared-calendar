import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBfm0RakOvmDmVMUyMXCq2v3ALdc5qZCKs",
  authDomain: "shared-calendar-88b11.firebaseapp.com",
  databaseURL: "https://shared-calendar-88b11-default-rtdb.firebaseio.com",
  projectId: "shared-calendar-88b11",
  storageBucket: "shared-calendar-88b11.firebasestorage.app",
  messagingSenderId: "467228978556",
  appId: "1:467228978556:web:b06df515cc9aae7f16c8f9"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
