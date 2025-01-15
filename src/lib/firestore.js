// src/lib/firestore.js

import { db } from "@/firebase.config";
import { collection, doc, setDoc } from "firebase/firestore";

// Estructura simulada en Firestore
export const initializeDatabase = async () => {
  const data = {
    Sitio: {
      default: { codigo: "CL-XXX-0000", nombre: "Sitio Ejemplo", region: "1" },
    },
    Cliente: {
      default: { nombre: "ATP" },
    },
    Categoría: {
      default: { nombre: "Sitios nuevos" },
    },
    EstadoOC: {
      default: { estado: "Pendiente" },
    },
    Facturas: {
      default: { numero: 1001, fecha: "2023-01-01", valorUF: 30.5 },
    },
    Gestor: {
      default: { nombre: "Gestor Ejemplo" },
    },
    EstadoGestion: {
      default: { estado: "Búsqueda" },
    },
    Honorarios: {
      default: { numero: 100, fecha: "2023-01-01" },
    },
    Región: {
      default: { numero: "I", nombre: "Región Ejemplo" },
    },
    OC: {
      default: {
        idSitio: "default",
        idCliente: "default",
        idCategoria: "default",
        estadoOC: "default",
        descripcionOC: "Descripción de ejemplo",
      },
    },
    Usuario: {
      default: { username: "admin", password: "hashed-password", tipoUsuario: 1 },
    },
    TipoUsuario: {
      default: { tipo: "Admin" },
    },
  };

  for (const [collectionName, documents] of Object.entries(data)) {
    const colRef = collection(db, collectionName);
    for (const [docId, docData] of Object.entries(documents)) {
      await setDoc(doc(colRef, docId), docData);
    }
  }
};
