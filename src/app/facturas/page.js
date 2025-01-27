"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "@/firebase.config";
import NavBar from "@/components/NavBar";
import Select from "react-select";
import useAuthAdmin from "@/hooks/useAuthAdmin";

const validarFecha = (fecha) => {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(fecha)) {
    return false;
  }

  const [day, month, year] = fecha.split("/").map(Number);

  if (month < 1 || month > 12) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;

  const inputDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return inputDate <= today;
};

const convertirFecha = (fecha) => {
  const [day, month, year] = fecha.split("/");
  return `${day}-${month}-${year}`;
};

export default function FacturasPage() {
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
  const [gestiones, setGestiones] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [filtroNumeroFactura, setFiltroNumeroFactura] = useState("");

  useAuthAdmin();

  useEffect(() => {
    const cargarGestiones = async () => {
      const querySnapshot = await getDocs(collection(db, "Gestiones"));
      const gestionesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGestiones(gestionesData);
    };

    cargarGestiones();
  }, []);

  useEffect(() => {
    const cargarFacturas = async () => {
      const querySnapshot = await getDocs(collection(db, "Facturas"));
      const facturasData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFacturas(facturasData);
    };

    cargarFacturas();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (validarFecha(fecha) && parseFloat(ufNeto) > 0) {
        const fechaConvertida = convertirFecha(fecha);
        try {
          const response = await fetch(`https://mindicador.cl/api/uf/${fechaConvertida}`);
          const data = await response.json();

          if (!data.serie || data.serie.length === 0) {
            throw new Error("No se encontró el valor de la UF para la fecha proporcionada.");
          }

          const valorUfFecha = data.serie[0].valor;

          setValorUf(valorUfFecha);

          const totalUfCalculado = parseFloat(ufNeto) * 1.19;
          const totalClpCalculado = totalUfCalculado * valorUfFecha;

          setTotalUf(parseFloat(totalUfCalculado.toFixed(2))); // Máximo 2 decimales
          setTotalClp(Math.round(totalClpCalculado)); // Redondeo sin decimales
        } catch (error) {
          alert(error.message);
        }
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [fecha, ufNeto]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFecha(fecha)) {
      alert("Fecha inválida. Asegúrate de usar el formato dd/mm/yyyy y no ingresar fechas futuras.");
      return;
    }

    if (parseFloat(ufNeto) <= 0 || valorUf === 0) {
      alert("Por favor, ingrese un valor UF Neto válido y asegúrese de que el valor UF haya sido obtenido.");
      return;
    }

    try {
      await addDoc(collection(db, "Facturas"), {
        numeroFactura,
        fecha,
        ufNeto: parseFloat(ufNeto),
        valorUf,
        totalUf,
        totalClp,
        ordenCompra,
        codigoSitio,
        nombreSitio,
        ida,
      });

      // Resetear el formulario
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
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUfNetoChange = (value) => {
    setUfNeto(value.replace("UF", "")); // Eliminar prefijo al guardar
  };

  const handleOrdenCompraChange = (selectedOption) => {
    setOrdenCompra(selectedOption.value);
    const gestionSeleccionada = gestiones.find(
      (gestion) => gestion.numeroOC === selectedOption.value
    );
    if (gestionSeleccionada) {
      setCodigoSitio(gestionSeleccionada.sitio); 
      setNombreSitio(gestionSeleccionada.nombreSitio);
    } else {
      setCodigoSitio("");
      setNombreSitio("");
    }
  };

  const filtrarFacturas = () => {
    return facturas.filter((factura) => {
      const cumpleNumeroFactura = !filtroNumeroFactura || factura.numeroFactura.includes(filtroNumeroFactura);

      return cumpleNumeroFactura;
    });
  };

  return (
    <div>
      <NavBar />
      <div className="w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Agregar Nueva Factura</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="N° de Factura"
              value={numeroFactura}
              onChange={(e) => setNumeroFactura(e.target.value)}
              className="input w-full"
              required
            />
            <input
              type="text"
              placeholder="Fecha (dd/mm/yyyy)"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="input w-full"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="UF Neto"
              value={`UF${ufNeto}`}
              onChange={(e) => handleUfNetoChange(e.target.value)}
              className="input w-full"
              required
            />
            <input
              type="text"
              placeholder="Valor UF en Fecha"
              value={`$${valorUf}`}
              className="input w-full"
              disabled
            />
            <input
              type="text"
              placeholder="Total UF"
              value={`UF${totalUf}`}
              className="input w-full"
              disabled
            />
            <input
              type="text"
              placeholder="Total CLP"
              value={`$${totalClp}`}
              className="input w-full"
              disabled
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              options={gestiones.map((gestion) => ({
                value: gestion.numeroOC,
                label: gestion.numeroOC,
              }))}
              onChange={handleOrdenCompraChange}
              className="w-full"
              placeholder="Seleccione Orden de Compra *"
              isSearchable
              required
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: '#1f2937',
                  borderColor: '#4b5563',
                  color: '#f9fafb',
                  '&:hover': {
                    borderColor: '#9ca3af'
                  }
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: '#f9fafb'
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: '#1f2937'
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused ? '#374151' : '#1f2937',
                  color: '#f9fafb'
                }),
                input: (provided) => ({
                  ...provided,
                  color: '#f9fafb'
                })
              }}
            />
            <input
              type="text"
              placeholder="Código Sitio"
              value={codigoSitio}
              className="input w-full"
              disabled
            />
            <input
              type="text"
              placeholder="Nombre Sitio"
              value={nombreSitio}
              className="input w-full"
              disabled
            />
            <input
              type="text"
              placeholder="IDA"
              value={ida}
              onChange={(e) => setIda(e.target.value)}
              className="input w-full"
            />
          </div>

          <button type="submit" className="button w-full">
            Guardar Factura
          </button>
        </form>

        {/* Módulo de Filtros */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="N° de Factura"
              value={filtroNumeroFactura}
              onChange={(e) => setFiltroNumeroFactura(e.target.value)}
              className="input w-full"
            />
          </div>
        </div>

        {/* Módulo de Lista de Facturas */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Lista de Facturas</h2>
          <table className="min-w-full table-auto">
            <thead>
              <tr className="text-gray-300 text-left">
                <th className="px-4 py-2">N° de Factura</th>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Total CLP</th>
                <th className="px-4 py-2">Total UF</th>
                <th className="px-4 py-2">UF Neto</th>
                <th className="px-4 py-2">Valor UF</th>
                <th className="px-4 py-2">N° OC</th>
                <th className="px-4 py-2">Código Sitio</th>
                <th className="px-4 py-2">Nombre Sitio</th>
              </tr>
            </thead>
            <tbody>
              {filtrarFacturas().map((factura) => (
                <tr key={factura.id} className="text-gray-300 border-t border-gray-700">
                  <td className="px-4 py-2">{factura.numeroFactura}</td>
                  <td className="px-4 py-2">{factura.fecha}</td>
                  <td className="px-4 py-2">${factura.totalClp}</td>
                  <td className="px-4 py-2">UF{factura.totalUf}</td>
                  <td className="px-4 py-2">UF{factura.ufNeto}</td>
                  <td className="px-4 py-2">${factura.valorUf}</td>
                  <td className="px-4 py-2">{factura.ordenCompra}</td>
                  <td className="px-4 py-2">{factura.codigoSitio}</td>
                  <td className="px-4 py-2">{factura.nombreSitio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
