// src/lib/firestore.js

import { db } from "@/firebase.config"; // Asegúrate de que db esté exportado correctamente desde firebase.config.js
import { collection, getDocs, setDoc, doc } from "firebase/firestore"; // Asegúrate de importar getDocs

// Función para inicializar la base de datos
export const initializeDatabase = async () => {
  const colecciones = [
    "Sitio", 
    "Cliente", 
    "Categoría", 
    "EstadoOC", 
    "Facturas", 
    "Gestor", 
    "EstadoGestion", 
    "Honorarios", 
    "Región", 
    "OC", 
    "Usuario", 
    "TipoUsuario"
  ];

  // Verificar si ya existen las colecciones en la base de datos
  for (const coleccion of colecciones) {
    const colRef = collection(db, coleccion); // Asegúrate de pasar db como primer argumento
    const snapshot = await getDocs(colRef); // Verificar si la colección está vacía

    if (snapshot.empty) {
      // Si la colección está vacía o no existe, la creamos con un documento de ejemplo
      await setDoc(doc(db, coleccion, "defaultDoc"), {
        nombre: `${coleccion} ejemplo`,
      });
    }
  }
};