# ChampionsVIP - Next.js (TypeScript) + Supabase + Netlify

Este proyecto es la versión completa y modernizada de **ChampionsVIP** desarrollada con **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** y **Supabase**, lista para funcionar al 100% en **Netlify** o **Vercel**.

---

## 1. Configuración de Supabase (Base de Datos)

1. Crea una cuenta gratuita en [supabase.com](https://supabase.com) y crea un nuevo proyecto.
2. En el panel lateral de Supabase, ve a **SQL Editor**.
3. Abre el archivo `supabase/schema.sql` de este proyecto, copia todo su contenido y pégalo en el editor de Supabase.
4. Haz clic en **Run**. Esto creará automáticamente:
   * Tablas: `users`, `products`, `transactions`, `user_products`.
   * Usuario Administrador: `saturno6` (clave: `h36dt100`).
   * Usuario Demo Cliente: `+593984917595` (clave: `client123`).
   * Los 9 Tokens de Jugadores con sus precios y rendimientos diarios.
5. Ve a **Project Settings** -> **API** y copia:
   * **Project URL**
   * **anon public key**
   * **service_role secret key**

---

## 2. Variables de Entorno

Crea un archivo `.env.local` con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 3. Ejecutar en Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre en tu navegador: `http://localhost:3000`

---

## 4. Despliegue en Netlify

1. Sube este repositorio a **GitHub**.
2. Entra en [netlify.com](https://www.netlify.com) y haz clic en **Add new site** -> **Import an existing project**.
3. Selecciona tu repositorio de GitHub.
4. En **Build settings**:
   * **Build command**: `npm run build`
   * **Publish directory**: `.next`
5. En la sección **Environment variables**, agrega las 3 variables de Supabase:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
6. Haz clic en **Deploy site**. ¡Tu app estará online con URL `.netlify.app`!
