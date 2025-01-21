"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "@/firebase.config";
import NavBar from "@/components/NavBar";
import { REGIONES_CHILE } from "@/types/sitio";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SitiosPage() {
  const [sitios, setSitios] = useState([]);
  const [formData, setFormData] = useState({
    codigoSitio: "",
    nombreSitio: "",
    region: "",
    contacto: "",
    expediente: ""
  });
  const [filtros, setFiltros] = useState({
    busqueda: "",
    region: "",
    mostrarEliminados: false,
    soloEliminados: false,
    sinCodigo: false
  });
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const cargarSitios = useCallback(async () => {
    let q = query(collection(db, "Sitios"));

    if (!filtros.mostrarEliminados && !filtros.soloEliminados) {
      q = query(q, where("baja", "!=", true));
    } else if (filtros.soloEliminados) {
      q = query(q, where("baja", "==", true));
    }

    const querySnapshot = await getDocs(q);
    const sitiosData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    let sitiosFiltrados = sitiosData.filter(sitio => {
      const cumpleBusqueda = !filtros.busqueda || 
        sitio.codigoSitio?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        sitio.nombreSitio.toLowerCase().includes(filtros.busqueda.toLowerCase());

      const cumpleRegion = !filtros.region || sitio.region === filtros.region;
      const cumpleSinCodigo = !filtros.sinCodigo || !sitio.codigoSitio;

      return cumpleBusqueda && cumpleRegion && cumpleSinCodigo;
    });

    if (sortConfig.key) {
      sitiosFiltrados.sort((a, b) => {
        if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
        if (!a[sortConfig.key]) return 1;
        if (!b[sortConfig.key]) return -1;

        const comparison = a[sortConfig.key].toLowerCase().localeCompare(b[sortConfig.key].toLowerCase());
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    setSitios(sitiosFiltrados);
  }, [filtros, sortConfig]);

  useEffect(() => {
    cargarSitios();
  }, [cargarSitios]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombreSitio || !formData.region) return;

    if (editMode) {
      const sitioRef = doc(db, "Sitios", editingId);
      await updateDoc(sitioRef, {
        ...formData,
        updatedAt: new Date()
      });
      setEditMode(false);
      setEditingId(null);
    } else {
      await addDoc(collection(db, "Sitios"), {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
        baja: false
      });
    }

    setFormData({
      codigoSitio: "",
      nombreSitio: "",
      region: "",
      contacto: "",
      expediente: ""
    });

    cargarSitios();
  };

  const handleEdit = (sitio) => {
    setFormData({
      codigoSitio: sitio.codigoSitio || "",
      nombreSitio: sitio.nombreSitio || "",
      region: sitio.region || "",
      contacto: sitio.contacto || "",
      expediente: sitio.expediente || ""
    });
    setEditMode(true);
    setEditingId(sitio.id);
  };

  const handleCancel = () => {
    setFormData({
      codigoSitio: "",
      nombreSitio: "",
      region: "",
      contacto: "",
      expediente: ""
    });
    setEditMode(false);
    setEditingId(null);
  };

  const handleBaja = async (id) => {
    const sitioRef = doc(db, "Sitios", id);
    await updateDoc(sitioRef, {
      baja: true,
      updatedAt: new Date()
    });
    cargarSitios();
  };

  return (
    <div>
      <NavBar />
      <div className="w-full px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Sitios</h1>
          <div className="flex space-x-4">
            <Link href="/gestiones">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Agregar gestión
              </button>
            </Link>
            <Link href="/home">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Volver a Inicio
              </button>
            </Link>
          </div>
        </div>

        {/* Formulario de ingreso/edición */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            {editMode ? "Editar Sitio" : "Agregar Nuevo Sitio"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Código sitio"
                  value={formData.codigoSitio}
                  onChange={(e) => setFormData({...formData, codigoSitio: e.target.value})}
                  className="input w-full"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Nombre sitio *"
                  value={formData.nombreSitio}
                  onChange={(e) => setFormData({...formData, nombreSitio: e.target.value})}
                  className="input w-full"
                  required
                />
              </div>
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
            <div className="flex gap-4">
              {editMode ? (
                <>
                  <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    Actualizar sitio
                  </button>
                  <button 
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button type="submit" className="button">
                  Agregar Sitio
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Filtros */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Buscar por código o nombre"
              value={filtros.busqueda}
              onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
              className="input"
            />
            <select
              value={filtros.region}
              onChange={(e) => setFiltros({...filtros, region: e.target.value})}
              className="input"
            >
              <option value="">Todas las regiones</option>
              {REGIONES_CHILE.map(region => (
                <option key={region.codigo} value={region.codigo}>
                  {region.nombre}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="mostrarEliminados"
                checked={filtros.mostrarEliminados}
                onChange={(e) => setFiltros({...filtros, mostrarEliminados: e.target.checked, soloEliminados: false})}
                className="form-checkbox"
              />
              <label htmlFor="mostrarEliminados" className="text-white">
                Mostrar sitios eliminados
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="soloEliminados"
                checked={filtros.soloEliminados}
                onChange={(e) => setFiltros({...filtros, soloEliminados: e.target.checked, mostrarEliminados: false})}
                className="form-checkbox"
              />
              <label htmlFor="soloEliminados" className="text-white">
                Ver solo sitios eliminados
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sinCodigo"
                checked={filtros.sinCodigo}
                onChange={(e) => setFiltros({...filtros, sinCodigo: e.target.checked})}
                className="form-checkbox"
              />
              <label htmlFor="sinCodigo" className="text-white">
                Ver solo sitios sin código
              </label>
            </div>
          </div>
        </div>

        {/* Lista de sitios */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Lista de Sitios</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="text-gray-300 text-left">
                  <th className="px-4 py-2">
                    <button 
                      onClick={() => handleSort('codigoSitio')}
                      className="flex items-center gap-2 text-gray-300 hover:text-white"
                    >
                      Código
                      <span className={`transition-colors ${
                        sortConfig.key === 'codigoSitio' 
                          ? 'text-green-500' 
                          : 'text-gray-300'
                      }`}>
                        {sortConfig.key === 'codigoSitio' 
                          ? (sortConfig.direction === 'asc' ? '↑' : '↓')
                          : '↓'}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-2">
                    <button 
                      onClick={() => handleSort('nombreSitio')}
                      className="flex items-center gap-2 text-gray-300 hover:text-white"
                    >
                      Nombre
                      <span className={`transition-colors ${
                        sortConfig.key === 'nombreSitio' 
                          ? 'text-green-500' 
                          : 'text-gray-300'
                      }`}>
                        {sortConfig.key === 'nombreSitio' 
                          ? (sortConfig.direction === 'asc' ? '↑' : '↓')
                          : '↓'}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-2">
                    <button 
                      onClick={() => handleSort('region')}
                      className="flex items-center gap-2 text-gray-300 hover:text-white"
                    >
                      Región
                      <span className={`transition-colors ${
                        sortConfig.key === 'region' 
                          ? 'text-green-500' 
                          : 'text-gray-300'
                      }`}>
                        {sortConfig.key === 'region' 
                          ? (sortConfig.direction === 'asc' ? '↑' : '↓')
                          : '↓'}
                      </span>
                    </button>
                  </th>
                  <th className="px-4 py-2">Contacto</th>
                  <th className="px-4 py-2">Expediente</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sitios.map(sitio => (
                  <tr key={sitio.id} className="text-gray-300 border-t border-gray-700">
                    <td className={`px-4 py-2 ${
                      !sitio.codigoSitio 
                        ? 'text-red-500' 
                        : ''
                    }`}>
                      {sitio.codigoSitio || "Sin código"}
                    </td>
                    <td className="px-4 py-2">
                      {sitio.nombreSitio}
                    </td>
                    <td className="px-4 py-2">{sitio.region}</td>
                    <td className="px-4 py-2">{sitio.contacto}</td>
                    <td className="px-4 py-2">{sitio.expediente}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEdit(sitio)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        Editar
                      </button>
                      {!sitio.baja && (
                        <button
                          onClick={() => handleBaja(sitio.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Dar de baja
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}