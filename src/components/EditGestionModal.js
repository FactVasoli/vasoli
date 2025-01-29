import { useState, useEffect } from "react";
import { updateDoc, doc} from "firebase/firestore";
import { db } from "@/firebase.config";
import { auth } from "@/firebase.config";
import { getUserData } from "@/lib/auth";

const REGIONES_CHILE = [
  { codigo: "XV", nombre: "XV - Región de Arica y Parinacota" },
  { codigo: "I", nombre: "I - Región de Tarapacá" },
  { codigo: "II", nombre: "II - Región de Antofagasta" },
  { codigo: "III", nombre: "III - Región de Atacama" },
  { codigo: "IV", nombre: "IV - Región de Coquimbo" },
  { codigo: "V", nombre: "V - Región de Valparaíso" },
  { codigo: "RM", nombre: "RM - Región Metropolitana" },
  { codigo: "VI", nombre: "VI - Región del Libertador General Bernardo O'Higgins" },
  { codigo: "VII", nombre: "VII - Región del Maule" },
  { codigo: "XVI", nombre: "XVI - Región de Ñuble" },
  { codigo: "VIII", nombre: "VIII - Región del Biobío" },
  { codigo: "IX", nombre: "IX - Región de La Araucanía" },
  { codigo: "XIV", nombre: "XIV - Región de Los Ríos" },
  { codigo: "X", nombre: "X - Región de Los Lagos" },
  { codigo: "XI", nombre: "XI - Región de Aysén" },
  { codigo: "XII", nombre: "XII - Región de Magallanes" }
];

export default function EditGestionModal({ isOpen, onClose, gestion, onSave, tipoCategoria }) {
  const [formData, setFormData] = useState({
    numeroOC: "",
    cliente: "",
    codigoSitio: "",
    nombreSitio: "",
    categoria: "",
    estadoOC: "",
    estadoGestion: "",
    fechaAsignacion: "",
    descripcionOC: "",
    observaciones: "",
    valorNetoUF: "",
    region: "",
  });

  
  const [newObservation, setNewObservation] = useState({ date: "", observation: "" });
  const [isAdmin, setIsAdmin] = useState(false);

  const estadosOC = [
    "Gestión en trámite",
    "Terminado sin facturar",
    "Facturado no pagado",
    "Terminado",
    "Delayed",
    "Eliminado no facturado",
    "Eliminado y cobrado",
    "M.Reuse",
  ];

  const estadosGestion = tipoCategoria === "especial"
    ? [
        "Armado expediente",
        "Ingreso DOM",
        "Seguimiento DOM",
        "Rechazo DOM",
        "Re-Ingreso DOM",
        "Permiso",
        "Eliminado",
        "Facturado",
      ]
    : [
        "Búsqueda",
        "Negociación",
        "I.Barrido",
        "Aprobado CP y ATP",
        "Carpeta legal",
        "Fiscalía",
        "Firmado CP y ATP",
        "Terminado sin facturar",
        "Eliminado",
        "Facturado",
      ];

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = await getUserData(auth.currentUser.uid);
      if (user && user.cargo === "admin") {
        setIsAdmin(true);
      }
    };

    if (isOpen) {
      checkAdminStatus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && gestion) {
      setFormData({
        numeroOC: gestion.numeroOC || "",
        cliente: gestion.cliente || "",
        codigoSitio: gestion.codigoSitio || "",
        nombreSitio: gestion.nombreSitio || "",
        categoria: gestion.categoria || "",
        estadoOC: gestion.estadoOC || "",
        estadoGestion: gestion.estadoGestion || "",
        fechaAsignacion: gestion.fechaAsignacion || "",
        descripcionOC: gestion.descripcionOC || "",
        observaciones: gestion.observaciones || "",
        valorNetoUF: gestion.valorNetoUF || "",
        region: gestion.region || "",
      });
    }

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, gestion, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const gestionRef = doc(db, "Gestiones", gestion.id);
    await updateDoc(gestionRef, formData);
    onSave();
    onClose();
  };

  const handleAddObservation = () => {
    const today = new Date();
    const formattedDate = newObservation.date
      ? newObservation.date
      : today.toLocaleDateString("es-CL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
    const newEntry = `${formattedDate} ${newObservation.observation}\n`;
    setFormData((prev) => ({
      ...prev,
      observaciones: newEntry + prev.observaciones,
    }));
    setNewObservation({ date: "", observation: "" });
  };

  const isDisabled = (formData.estadoOC === "Terminado" || formData.estadoOC === "Eliminado y cobrado") && formData.estadoGestion === "Facturado" && !isAdmin;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg p-6 w-full max-w-8xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh' }}
      >
        <h2 className="text-xl font-semibold text-white mb-4">Editar Gestión</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-white text-sm mb-1">Número OC</label>
              <input
                type="text"
                value={formData.numeroOC}
                onChange={(e) => setFormData({ ...formData, numeroOC: e.target.value })}
                className="input w-full"
                disabled={isDisabled}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm mb-1">Cliente</label>
                <input
                  type="text"
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  className="input w-full"
                  disabled
                />
              </div>
              <div></div>
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Fecha Asignación</label>
              <input
                type="date"
                value={formData.fechaAsignacion}
                onChange={(e) => setFormData({ ...formData, fechaAsignacion: e.target.value })}
                className="input w-full"
                required
                disabled={isDisabled}
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="input w-full"
                required
                disabled={isDisabled}
              >
                <option value="">Seleccione Categoría</option>
                {[
                  "Sitios nuevos",
                  "Renegociación",
                  "C13",
                  "Bienes nacionales",
                  "Permiso de instalación",
                  "Aviso de instalación",
                  "Recepción de obras",
                  "Obra menor",
                  "DAS",
                  "Misceláneos",
                ].map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-white text-sm mb-1">Código Sitio</label>
              <input
                type="text"
                value={formData.codigoSitio}
                onChange={(e) => setFormData({ ...formData, codigoSitio: e.target.value })}
                className="input w-full"
                disabled={isDisabled}
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Región</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="input w-full"
                disabled={isDisabled}
              >
                <option value="">Seleccione Región</option>
                {REGIONES_CHILE.map((region) => (
                  <option key={region.codigo} value={region.codigo}>
                    {region.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Nombre Sitio</label>
              <input
                type="text"
                value={formData.nombreSitio}
                onChange={(e) => setFormData({ ...formData, nombreSitio: e.target.value })}
                className="input w-full"
                disabled={isDisabled}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-white text-sm mb-1">Estado OC</label>
              <select
                value={formData.estadoOC}
                onChange={(e) => setFormData({ ...formData, estadoOC: e.target.value })}
                className="input w-full"
                required
                disabled={isDisabled}
              >
                <option value="">Seleccione Estado OC</option>
                {estadosOC.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Estado Gestión</label>
              <select
                value={formData.estadoGestion}
                onChange={(e) => setFormData({ ...formData, estadoGestion: e.target.value })}
                className="input w-full"
                required
                disabled={isDisabled}
              >
                <option value="">Seleccione Estado Gestión</option>
                {estadosGestion.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>
            <div></div>
            {isAdmin && (
              <div>
                <label className="block text-white text-sm mb-1">UF Neto</label>
                <input
                  type="number"
                  value={formData.valorNetoUF}
                  onChange={(e) => setFormData({ ...formData, valorNetoUF: e.target.value })}
                  className="input w-full"
                  step="0.01"
                  disabled={isDisabled}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-1">Observaciones</label>
              <textarea
                value={formData.observaciones}
                className="input w-full h-48"
                disabled
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm mb-1">Agregar Observación</label>
              </div>
              <div>
                <label className="block text-white text-sm mb-1">Fecha</label>
                <input
                  type="date"
                  value={newObservation.date}
                  onChange={(e) =>
                    setNewObservation((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="input w-full"
                  disabled={isDisabled}
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
                  disabled={isDisabled}
                />
              </div>
              <div className="col-span-2">
                <button
                  type="button"
                  onClick={handleAddObservation}
                  className="button w-full"
                  disabled={isDisabled}
                >
                  Agregar Observación
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1">
            <div>
              <label className="block text-white text-sm mb-1">Descripción OC</label>
              <textarea
                value={formData.descripcionOC}
                onChange={(e) => setFormData({ ...formData, descripcionOC: e.target.value })}
                className="input w-full h-32"
                disabled={isDisabled}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="button bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              disabled={isDisabled}
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
