"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "@/firebase.config";
import NavBar from "@/components/NavBar";
import Select from 'react-select';
import AddSitioModal from "@/components/AddSitioModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase.config";

const cargarGestiones = async (setGestiones) => {
  const querySnapshot = await getDocs(collection(db, "Gestiones"));
  const gestionesData = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  setGestiones(gestionesData);
};

const validarFecha = (fecha) => {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(fecha)) {
    return false;
  }

  const [day, month, year] = fecha.split('/').map(Number);
  const inputDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Setea la hora a 00:00:00 para comparar solo la fecha

  return inputDate <= today;
};

export default function GestionesPage() {
  const [clientes, setClientes] = useState([]);
  const [sitios, setSitios] = useState([]);
  const [gestiones, setGestiones] = useState([]);
  const [formData, setFormData] = useState({
    numeroOC: "",
    cliente: "",
    sitio: "",
    nombreSitio: "",
    categoria: "",
    estadoOC: "",
    estadoGestion: "",
    fechaAsignacion: "",
    descripcionOC: "",
    valorNetoUF: ""
  });
  const [filtros, setFiltros] = useState({
    busqueda: "",
    cliente: "",
    categoria: "",
    estadoOC: "",
    estadoGestion: ""
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login"); // Redirigir a la página de inicio de sesión si no está autenticado
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const cargarClientes = async () => {
      const querySnapshot = await getDocs(collection(db, "Clientes"));
      const clientesData = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(cliente => !cliente.baja);
      setClientes(clientesData);
    };

    const cargarSitios = async () => {
      const querySnapshot = await getDocs(collection(db, "Sitios"));
      const sitiosData = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(sitio => !sitio.baja);
      setSitios(sitiosData);
    };

    cargarClientes();
    cargarSitios();
    cargarGestiones(setGestiones);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFecha(formData.fechaAsignacion)) {
      alert("El formato de la fecha debe ser dd/mm/yyyy y no puede ser una fecha futura. Por favor, ingresa el año completo.");
      return;
    }

    await addDoc(collection(db, "Gestiones"), {
      ...formData,
      createdAt: new Date()
    });

    setFormData({
      numeroOC: "",
      cliente: "",
      sitio: "",
      nombreSitio: "",
      categoria: "",
      estadoOC: "",
      estadoGestion: "",
      fechaAsignacion: "",
      descripcionOC: "",
      valorNetoUF: ""
    });

    cargarGestiones(setGestiones);
  };

  const handleSitioChange = (codigoSitio) => {
    const sitio = sitios.find(s => s.codigoSitio === codigoSitio);
    setFormData({
      ...formData,
      sitio: codigoSitio,
      nombreSitio: sitio ? sitio.nombreSitio : ""
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const gestionesFiltradas = gestiones.filter(gestion => {
    const cumpleBusqueda = !filtros.busqueda || 
      gestion.numeroOC.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      gestion.sitio.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      gestion.nombreSitio.toLowerCase().includes(filtros.busqueda.toLowerCase());

    const cumpleCliente = !filtros.cliente || gestion.cliente === filtros.cliente;
    const cumpleCategoria = !filtros.categoria || gestion.categoria === filtros.categoria;
    const cumpleEstadoOC = !filtros.estadoOC || gestion.estadoOC === filtros.estadoOC;
    const cumpleEstadoGestion = !filtros.estadoGestion || gestion.estadoGestion === filtros.estadoGestion;

    return cumpleBusqueda && cumpleCliente && cumpleCategoria && cumpleEstadoOC && cumpleEstadoGestion;
  });

  if (sortConfig.key) {
    gestionesFiltradas.sort((a, b) => {
      if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
      if (!a[sortConfig.key]) return 1;
      if (!b[sortConfig.key]) return -1;

      const comparison = a[sortConfig.key].toLowerCase().localeCompare(b[sortConfig.key].toLowerCase());
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }

  const handleSaveSitio = (newSitio) => {
    setSitios((prevSitios) => [...prevSitios, newSitio]);
    console.log("Nuevo sitio guardado:", newSitio);
  };

  return (
    <div>
      <NavBar />
      <div className="w-full px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Gestiones</h1>
          <div className="flex space-x-4">
            <Link href="/sitios">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Agregar sitio
              </button>
            </Link>
            <Link href="/home">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Volver a inicio
              </button>
            </Link>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Agregar Nueva Gestión</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Número OC"
                value={formData.numeroOC}
                onChange={(e) => setFormData({ ...formData, numeroOC: e.target.value })}
                className="input w-full"
              />
              <select
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                className="input w-full"
                required
              >
                <option value="">Seleccione Cliente *</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.nombre}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="input w-full"
                required
              >
                <option value="">Seleccione Categoría *</option>
                {["Sitios nuevos", "Renegociación", "C13", "BBNNs", "Permiso Instalación", "Aviso Instalación", "Recepción Obras", "Obra menor", "DAS", "Misceláneos"].map(categoria => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                options={sitios.map(sitio => ({ value: sitio.codigoSitio, label: sitio.codigoSitio }))}
                onChange={(selectedOption) => handleSitioChange(selectedOption.value)}
                className="w-full"
                placeholder="Seleccione Sitio *"
                isSearchable
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
                placeholder="Nombre Sitio"
                value={formData.nombreSitio}
                className="input w-full"
                disabled
              />
              <button
                type="button"
                className="button w-full"
                onClick={() => setIsModalOpen(true)}
              >
                Agregar sitio nuevo
              </button>
              <input
                type="text"
                placeholder="Valor Neto UF"
                value={formData.valorNetoUF}
                onChange={(e) => setFormData({ ...formData, valorNetoUF: e.target.value })}
                className="input w-full"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={formData.estadoOC}
                onChange={(e) => setFormData({ ...formData, estadoOC: e.target.value })}
                className="input w-full"
                required
              >
                <option value="">Seleccione Estado OC *</option>
                {["Gestión en trámite", "Terminado sin facturar", "Facturado no pagado", "Terminado", "Eliminado no facturado", "M.Reuse"].map(estado => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
              <select
                value={formData.estadoGestion}
                onChange={(e) => setFormData({ ...formData, estadoGestion: e.target.value })}
                className="input w-full"
                required
              >
                <option value="">Seleccione Estado Gestión *</option>
                {["Búsqueda", "Negociación", "Aprobado CP y ATP", "Carpeta legal", "Fiscalía", "Firmado CP y ATP", "Terminado sin facturar", "Armado expediente", "Ingreso DOM", "Seguimiento DOM", "Rechazo DOM", "Re-Ingreso DOM", "Permiso", "Eliminado", "Facturado"].map(estado => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Fecha Asignación (dd/mm/yyyy) *"
                value={formData.fechaAsignacion}
                onChange={(e) => setFormData({ ...formData, fechaAsignacion: e.target.value })}
                className="input w-full"
                required
              />
            </div>
            <textarea
              placeholder="Descripción OC"
              value={formData.descripcionOC}
              onChange={(e) => setFormData({ ...formData, descripcionOC: e.target.value })}
              className="input w-full h-32"
            />
            <button type="submit" className="button w-full">
              Guardar Gestión
            </button>
          </form>
        </div>

        {/* Filtros */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Buscar por Número OC, Código sitio o Nombre sitio"
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              className="input"
            />
            <select
              value={filtros.cliente}
              onChange={(e) => setFiltros({ ...filtros, cliente: e.target.value })}
              className="input"
            >
              <option value="">Todos los clientes</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.nombre}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
              className="input"
            >
              <option value="">Todas las categorías</option>
              {["Sitios nuevos", "Renegociación", "C13", "BBNNs", "Permiso Instalación", "Aviso Instalación", "Recepción Obras", "Obra menor", "DAS", "Misceláneos"].map(categoria => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
            <select
              value={filtros.estadoOC}
              onChange={(e) => setFiltros({ ...filtros, estadoOC: e.target.value })}
              className="input"
            >
              <option value="">Todos los estados OC</option>
              {["Gestión en trámite", "Terminado sin facturar", "Facturado no pagado", "Terminado", "Eliminado no facturado", "M.Reuse"].map(estado => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
            <select
              value={filtros.estadoGestion}
              onChange={(e) => setFiltros({ ...filtros, estadoGestion: e.target.value })}
              className="input"
            >
              <option value="">Todos los estados de gestión</option>
              {["Búsqueda", "Negociación", "Aprobado CP y ATP", "Carpeta legal", "Fiscalía", "Firmado CP y ATP", "Terminado sin facturar", "Armado expediente", "Ingreso DOM", "Seguimiento DOM", "Rechazo DOM", "Re-Ingreso DOM", "Permiso"].map(estado => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Gestiones */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Lista de Gestiones</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="text-gray-300 text-left">
                  <th className="px-4 py-2">
                    <button 
                      onClick={() => handleSort('numeroOC')}
                      className="flex items-center gap-2 text-gray-300 hover:text-white"
                    >
                      Número OC
                      <span className={`transition-colors ${
                        sortConfig.key === 'numeroOC' 
                          ? 'text-green-500' 
                          : 'text-gray-300'
                      }`}>
                        {sortConfig.key === 'numeroOC' 
                          ? (sortConfig.direction === 'asc' ? '↑' : '↓')
                          : '↓'}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-2">Cliente</th>
                  <th className="px-4 py-2">Código Sitio</th>
                  <th className="px-4 py-2">Nombre Sitio</th>
                  <th className="px-4 py-2">Categoría</th>
                  <th className="px-4 py-2">Estado OC</th>
                  <th className="px-4 py-2">Estado Gestión</th>
                  <th className="px-4 py-2">Valor neto UF</th>
                </tr>
              </thead>
              <tbody>
                {gestionesFiltradas.map(gestion => (
                  <tr key={gestion.id} className="text-gray-300 border-t border-gray-700">
                    <td className="px-4 py-2">{gestion.numeroOC}</td>
                    <td className="px-4 py-2">{gestion.cliente}</td>
                    <td className="px-4 py-2">{gestion.sitio}</td>
                    <td className="px-4 py-2">{gestion.nombreSitio}</td>
                    <td className="px-4 py-2">{gestion.categoria}</td>
                    <td className="px-4 py-2">{gestion.estadoOC}</td>
                    <td className="px-4 py-2">{gestion.estadoGestion}</td>
                    <td className="px-4 py-2">{gestion.valorNetoUF}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <AddSitioModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSitio}
        />
      </div>
    </div>
  );
}