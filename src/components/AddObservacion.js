"use client";

import { useState, useEffect } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase.config";

export default function AddObservacion({ isOpen, onClose, gestion, onSave }) {
  const [newObservation, setNewObservation] = useState({ date: "", observation: "" });
  const [formData, setFormData] = useState({ observaciones: "" });

  useEffect(() => {
    if (isOpen && gestion) {
      setFormData({ observaciones: gestion.observaciones || "" });
    }
  }, [isOpen, gestion]);

  const handleAddObservation = async () => {
    const today = new Date();
    const formattedDate = newObservation.date || today.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const newEntry = `${formattedDate} ${newObservation.observation}\n`;

    const gestionRef = doc(db, "Gestiones", gestion.id);
    await updateDoc(gestionRef, {
      observaciones: newEntry + formData.observaciones,
    });

    setFormData((prev) => ({
      ...prev,
      observaciones: newEntry + prev.observaciones,
    }));

    setNewObservation({ date: "", observation: "" });
    onSave();
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleClose = () => {
    setNewObservation({ date: "", observation: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-white mb-4">Agregar Observación</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm mb-1">Agregar Observación</label>
          </div>
          <div>
          <span title="Si no defines una fecha, se usará la fecha de hoy"
              ><label className="block text-white hover:text-yellow-300 text-sm mb-1">Fecha ( ! )</label></span>
            <input
              type="date"
              value={newObservation.date}
              onChange={(e) =>
                setNewObservation((prev) => ({ ...prev, date: e.target.value }))
              }
              className="input w-full"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-white text-sm mb-1">Observación</label>
            <input
              type="text"
              value={newObservation.observation}
              onChange={(e) =>
                setNewObservation((prev) => ({ ...prev, observation: e.target.value }))
              }
              className="input w-full"
            />
          </div>
          <div className="col-span-2">
            <button
              type="button"
              onClick={handleAddObservation}
              className="button w-full"
            >
              Agregar Observación
            </button>
          </div>
          <div className="col-span-2">
            <label className="block text-white text-sm mb-1">Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              className="input w-full h-[350px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
