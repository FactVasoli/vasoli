export const validatePassword = (password) => {
    const minLength = 8;
    const maxLength = 20;
    
    if (password.length < minLength || password.length > maxLength) {
      return {
        isValid: false,
        error: `La contraseña debe tener entre ${minLength} y ${maxLength} caracteres`
      };
    }
  
    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        error: "La contraseña debe contener al menos una letra mayúscula"
      };
    }
  
    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        error: "La contraseña debe contener al menos una letra minúscula"
      };
    }
  
    if (!/[0-9]/.test(password)) {
      return {
        isValid: false,
        error: "La contraseña debe contener al menos un número"
      };
    }
  
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return {
        isValid: false,
        error: "La contraseña debe contener al menos un carácter especial (!@#$%^&*(),.?\":{}|<>)"
      };
    }
  
    return {
      isValid: true,
      error: null
    };
  };