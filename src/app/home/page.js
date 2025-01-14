import NavBar from "@/components/NavBar";

export default function Home() {
  return (
    <div>
      <NavBar />
      <main style={{ padding: "20px" }}>
        <h1>Página de Inicio</h1>
        <p>¡Bienvenido! La base de datos se ha inicializado correctamente.</p>
      </main>
    </div>
  );
}
