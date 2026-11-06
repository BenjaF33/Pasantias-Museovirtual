 
// guard/auth.interceptor.ts 
import { HttpInterceptorFn } from "@angular/common/http"; 
import { inject } from "@angular/core"; 
import { AuthService } from "../servicios/auth-service"; 
  
export const authInterceptor: HttpInterceptorFn = (peticion, siguiente) => { 
  const token = inject(AuthService).getToken(); 
  
  if (token) { 
    // las peticiones son inmutables: se clona la original agregándole el header 
    peticion = peticion.clone({ 
      setHeaders: { Authorization: `Bearer ${token}` } 
    }); 
  } 
  return siguiente(peticion);   // sigue su camino hacia la API 
}; 