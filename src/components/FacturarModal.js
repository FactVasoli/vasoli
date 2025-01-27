import { useState, useEffect } from "react";
import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase.config";

export default function FacturarModal({ isOpen, onClose, gestion }) {
  const [numeroFactura, setNumeroFactura] = useState("");
  const [fecha, setFecha] = useState("");
  const [ufNeto, setUfNeto] = useState("");
  const [valorUf, setValorUf] = useState(0);
  const [totalUf, setTotalUf] = useState(0);
  const [totalClp, setTotalClp] = useState(0);
  const [ordenCompra, setOrdenCompra] = useState("");
  const [codigoSitio, setCodigoSitio] = useState("");
  const [nombreSitio, setNombreSitio] = useState("");
  const [ida, setIda] = useState("");

  useEffect(() => {
    if (isOpen && gestion) {
      setNumeroFactura(gestion.numeroFactura || "");
      setOrdenCompra(gestion.numeroOC || "");
      setCodigoSitio(gestion.codigoSitio || "");
      setNombreSitio(gestion.nombreSitio || "");
      setIda(gestion.ida || "");
      setUfNeto(gestion.valorNetoUF || "");
    }
  }, [isOpen, gestion]);

  useEffect(() => {
    const calcularValores = async () => {
      if (fecha && ufNeto) {
        const fechaConvertida = fecha.split("-").reverse().join("-");
        try {
          const response = await fetch(`https://mindicador.cl/api/uf/${fechaConvertida}`);
          const data = await response.json();

          if (!data.serie || data.serie.length === 0) {
            throw new Error("No se encontró el valor de la UF para la fecha proporcionada.");
          }

          const valor = data.serie[0].valor;
          setValorUf(valor);

          const totalUfCalculado = parseFloat(ufNeto) * 1.19;
          const totalClpCalculado = totalUfCalculado * valor;

          setTotalUf(totalUfCalculado.toFixed(2));
          setTotalClp(Math.round(totalClpCalculado));
        } catch (error) {
          console.error("Error fetching UF value:", error);
        }
      }
    };

    calcularValores();
  }, [fecha, ufNeto]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "Facturas"), {
        numeroFactura,
        fecha,
        ufNeto: parseFloat(ufNeto),
        valorUf,
        totalUf: parseFloat(totalUf),
        totalClp,
        ordenCompra,
        codigoSitio,
        nombreSitio,
        ida,
      });

      // Actualizar estado de la gestión según las condiciones
      const gestionRef = doc(db, "Gestiones", gestion.id);
      if (gestion.estadoOC === "Eliminado no facturado") {
        await updateDoc(gestionRef, {
          estadoGestion: "Facturado",
        });
      } else if (gestion.estadoOC === "Terminado") {
        // No se realizan cambios
      } else {
        await updateDoc(gestionRef, {
          estadoOC: "Facturado no pagado",
          estadoGestion: "Facturado",
        });
      }

      onClose();
    } catch (error) {
      alert("Error al guardar la factura: " + error.message);
    }
  };

  const handleClose = () => {
    // Limpiar los campos al cerrar el modal
    setNumeroFactura("");
    setFecha("");
    setUfNeto("");
    setValorUf(0);
    setTotalUf(0);
    setTotalClp(0);
    setOrdenCompra("");
    setCodigoSitio("");
    setNombreSitio("");
    setIda("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh" }}
      >
        <button
          className="absolute top-2 right-2 text-white text-lg font-bold"
          onClick={handleClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold text-white mb-4">Facturar</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-1">N° Factura</label>
              <input
                type="text"
                value={numeroFactura}
                onChange={(e) => setNumeroFactura(e.target.value)}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Fecha Facturación</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="input w-full"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-white text-sm mb-1">UF Neto</label>
              <input
                type="number"
                value={ufNeto}
                onChange={(e) => setUfNeto(e.target.value)}
                className="input w-full"
                step="0.01"
                max="999999.99"
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Valor UF</label>
              <input
                type="number"
                value={valorUf}
                className="input w-full"
                disabled
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Total UF</label>
              <input
                type="number"
                value={totalUf}
                className="input w-full"
                disabled
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Total CLP</label>
              <input
                type="number"
                value={totalClp}
                className="input w-full"
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-1">Orden de Compra</label>
              <input
                type="text"
                value={ordenCompra}
                onChange={(e) => setOrdenCompra(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Código Sitio</label>
              <input
                type="text"
                value={codigoSitio}
                onChange={(e) => setCodigoSitio(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">Nombre Sitio</label>
              <input
                type="text"
                value={nombreSitio}
                onChange={(e) => setNombreSitio(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-1">IDA</label>
              <input
                type="text"
                value={ida}
                onChange={(e) => setIda(e.target.value)}
                className="input w-full"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="button bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Guardar Factura
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
