"use client";

const BottomNavBar = ({ categoriaInicial, setCategoriaInicial }) => {
  const categorias = [
    { nombre: "Sitios nuevos", valor: "Sitios nuevos" },
    { nombre: "Renegociación", valor: "Renegociación" },
    { nombre: "C13", valor: "C13" },
    { nombre: "BBNNs", valor: "Bienes nacionales" },
    { nombre: "P.Instalación", valor: "Permiso de instalación" },
    { nombre: "A.Instalación", valor: "Aviso de instalación" },
    { nombre: "R.Obras", valor: "Recepción de obras" },
    { nombre: "O.Menor", valor: "Obra menor" },
    { nombre: "DAS", valor: "DAS" },
    { nombre: "Misceláneos", valor: "Misceláneos" },
  ];

  const handleTabClick = (valor) => {
    setCategoriaInicial(valor);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 pb-0 flex justify-between border-t border-gray-700">
      <div className="flex bg-gray-800 rounded-t-lg pb-0 space-x-1 w-full overflow-x-auto">
        {categorias.map((categoria) => {
          const isActive = categoriaInicial === categoria.valor;
          return (
            <button
              key={categoria.valor}
              onClick={() => handleTabClick(categoria.valor)}
              className={`flex-1 px-4 py-2 text-sm transition-all duration-200 rounded-t-lg ${
                isActive
                  ? "bg-gray-100 text-gray-900 h-12 shadow-md"
                  : "bg-gray-700 text-gray-400 h-10 hover:bg-gray-600 hover:text-white"
              }`}
            >
              {categoria.nombre}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavBar;
