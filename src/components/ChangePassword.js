"use client";

import { useState } from "react";
import { updateUserProfile } from "@/lib/auth";
import { auth } from "@/firebase.config";
import { validatePassword } from "@/lib/passwordValidation";

export default function ChangePassword() {
  const [isChanging, setIsChanging] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleChangePassword = async () => {
    setError("");

    // Validar la nueva contraseña
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await updateUserProfile(auth.currentUser.uid, { password: newPassword });
      setIsChanging(false);
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    } catch (error) {
      setError(error.message);
    }
  };

  if (isChanging) {
    return (
      <div className="space-y-4">
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button onClick={handleChangePassword} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Guardar
          </button>
          <button
            onClick={() => setIsChanging(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-md">
      <span className="text-gray-900">••••••••</span>
      <button
        onClick={() => setIsChanging(true)}
        className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
      >
        [✎ Cambiar contraseña]
      </button>
    </div>
  );
}