import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase.config";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase.config";

const fetchUserData = async (uid) => {
  const userDoc = await getDoc(doc(db, "Usuarios", uid));
  return userDoc.exists() ? userDoc.data() : null;
};

const useAuthAdmin = () => {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login"); // Redirigir a la página de inicio de sesión si no está autenticado
      } else {
        const userData = await fetchUserData(user.uid);
        if (userData && userData.cargo !== "admin") {
          router.push("/home"); // Redirigir a la página de inicio si no es admin
        }
        // Si el usuario es admin, no hacemos nada y permitimos el acceso a la página
      }
    });

    return () => unsubscribe();
  }, [router]);
};

export default useAuthAdmin;
