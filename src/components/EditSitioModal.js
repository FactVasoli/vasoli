"use client";

import { useState } from "react";
import { REGIONES_CHILE } from "@/types/sitio";

export default function EditSitioModal({ sitio, onSave, onClose }) {
  const [formData, setFormData] = useState({
    codigoSitio: sitio.codigoSitio || "",
    nombreSitio: sitio.nombreSitio || "",
    region: sitio.region || "",
    contacto: sitio.contacto || "",
    expediente: sitio.expediente || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...sitio, ...formData });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-xl font-semibold text-white mb-4">Editar Sitio</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Código sitio"
              value={formData.codigoSitio}
              onChange={(e) => setFormData({...formData, codigoSitio: e.target.value})}
              className="input"
            />
            <input
              type="text"
              placeholder="Nombre sitio *"
              value={formData.nombreSitio}
              onChange={(e) => setFormData({...formData, nombreSitio: e.target.value})}
              className="input"
              required
            />
            <select
              value={formData.region}
              onChange={(e) => setFormData({...formData, region: e.target.value})}
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
              onChange={(e) => setFormData({...formData, contacto: e.target.value})}
              className="input"
            />
            <input
              type="text"
              placeholder="Expediente"
              value={formData.expediente}
              onChange={(e) => setFormData({...formData, expediente: e.target.value})}
              className="input"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="button bg-gray-600">
              Cancelar
            </button>
            <button type="submit" className="button">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}