import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase.config";
import { REGIONES_CHILE } from "@/types/sitio";

export default function AddSitioModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    codigoSitio: "",
    nombreSitio: "",
    region: "",
    contacto: "",
    expediente: ""
  });

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombreSitio || !formData.region) return;

    try {
      await addDoc(collection(db, "Sitios"), {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
        baja: false
      });
      onSave(formData);
      setFormData({
        codigoSitio: "",
        nombreSitio: "",
        region: "",
        contacto: "",
        expediente: ""
      });
      onClose();
    } catch (error) {
      console.error("Error al guardar el sitio:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-2 right-2 text-white" onClick={onClose}>✕</button>
        <h2 className="text-xl font-semibold text-white mb-4">Agregar Nuevo Sitio</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Código sitio"
              value={formData.codigoSitio}
              onChange={(e) => setFormData({ ...formData, codigoSitio: e.target.value })}
              className="input w-full"
            />
            <input
              type="text"
              placeholder="Nombre sitio *"
              value={formData.nombreSitio}
              onChange={(e) => setFormData({ ...formData, nombreSitio: e.target.value })}
              className="input w-full"
              required
            />
            <select
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="input"
              required
            >
              <option value="">Seleccione región *</option>
              {REGIONES_CHILE.map(region => (
                <option key={region.codigo} value={region.codigo}>
                  {region.nombre}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Contacto"
              value={formData.contacto}
              onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
              className="input"
            />
            <input
              type="text"
              placeholder="Expediente"
              value={formData.expediente}
              onChange={(e) => setFormData({ ...formData, expediente: e.target.value })}
              className="input"
            />
          </div>
          <button type="submit" className="button w-full">
            Guardar Sitio
          </button>
        </form>
      </div>
    </div>
  );
}