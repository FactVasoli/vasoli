import { db } from "@/firebase.config";
import { collection, doc, setDoc } from "firebase/firestore";

// Estructura simulada en Firestore
export const initializeDatabase = async () => {
  const data = {
    Sitios: {},
    Clientes: {},
    Facturas: {},
    Gestor: {},
    Honorarios: {},
    Gestiones: {},
    Usuarios: {},
  };

  for (const [collectionName, documents] of Object.entries(data)) {
    const colRef = collection(db, collectionName);
    for (const [docId, docData] of Object.entries(documents)) {
      await setDoc(doc(colRef, docId), docData);
    }
  }
};
