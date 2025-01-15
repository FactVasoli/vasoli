import { auth } from "@/firebase.config";
import { db } from "@/firebase.config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const registerUser = async (email, password, username) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await setDoc(doc(db, "Usuarios", user.uid), {
    username,
    email,
    createdAt: new Date(),
    role: "user",
  });

  return user;
};

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  const userDoc = await getDoc(doc(db, "Usuarios", user.uid));
  const userData = userDoc.data();
  
  // Guardamos el username del documento de usuario
  localStorage.setItem('username', userData.username);
  
  return user;
};


export const logoutUser = async () => {
  await signOut(auth);
  localStorage.removeItem('username');
};