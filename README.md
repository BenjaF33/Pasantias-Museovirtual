# Museo Virtual

Aplicación Angular 21 para el Museo Virtual de Cipolletti. El frontend conserva las páginas y el diseño existentes y obtiene el catálogo, carrito, favoritos, sesión, compras y tickets desde la API PHP.

## Desarrollo

```bash
npm install
npm start
```

La aplicación se sirve en `http://localhost:4200`.

## API local

El código PHP está en `C:\Users\Usuario\Desktop\API-Proyecto\APIproyecto`. Configura Apache para que la carpeta `public` de esa API quede accesible en:

```text
http://localhost/APIproyecto/public
```

Si tu Apache publica la API en otra URL, cambia `API_BASE_URL` en [src/app/servicios/api.ts](src/app/servicios/api.ts). La API necesita Apache con `mod_rewrite`, MySQL con la base `museo` y CORS habilitado para `http://localhost:4200`.

Para entrar al panel, la base debe tener una cuenta con rol `admin`. Desde **Panel admin** puedes crear productos, subir imágenes y consultar usuarios y ventas.

## Validación

```bash
npm run build
npm test -- --watch=false
```
