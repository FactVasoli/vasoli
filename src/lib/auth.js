import { auth } from "@/firebase.config";
import { db } from "@/firebase.config";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateEmail, 
  updatePassword 
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

export const registerUser = async (email, password, username, nombre, apellido) => {
  // Crear el usuario en Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Crear el documento del usuario en Firestore
  await setDoc(doc(db, "Usuarios", user.uid), {
    username,
    nombre,
    apellido,
    email,
    cargo: "gestor",
    estadoUsuario: "Por confirmar",
    createdAt: new Date(),
    role: "user",
  });

  // Cerrar sesión inmediatamente después de registrar
  await signOut(auth);

  return user;
};

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  const userDoc = await getDoc(doc(db, "Usuarios", user.uid));
  const userData = userDoc.data();
  
  if (userData.estadoUsuario === "Por confirmar") {
    throw new Error("Tu cuenta aún está pendiente de verificación por el administrador.");
  }
  
  if (userData.estadoUsuario === "De baja") {
    throw new Error("Esta cuenta ha sido desactivada.");
  }
  
  localStorage.setItem('username', userData.username);
  
  return user;
};

export const logoutUser = async () => {
  await signOut(auth);
  localStorage.removeItem('username');
};

export const updateUserProfile = async (uid, data) => {
  const userRef = doc(db, "Usuarios", uid);
  
  if (data.email) {
    await updateEmail(auth.currentUser, data.email);
  }
  
  if (data.password) {
    await updatePassword(auth.currentUser, data.password);
  }
  
  await updateDoc(userRef, data);
  
  if (data.username) {
    localStorage.setItem('username', data.username);
  }
  
  return true;
};

export const getUserData = async (uid) => {
  const userDoc = await getDoc(doc(db, "Usuarios", uid));
  return userDoc.data();
};