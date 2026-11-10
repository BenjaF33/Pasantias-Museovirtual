export const API_BASE_URL = 'http://localhost/APIproyecto/public';

export function apiImageUrl(path: string | null | undefined): string {
  if (!path) {
    return '';
  }

  if (/^(https?:|data:|blob:)/i.test(path) || path.startsWith('/assets/')) {
    return path;
  }

  const ruta = path.replace(/^\/+/, '');
  const rutaImagen = ruta.startsWith('uploads/') ? ruta : `uploads/${ruta}`;
  return `${API_BASE_URL}/${rutaImagen}`;
}
