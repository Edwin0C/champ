# Guía de Despliegue en PythonAnywhere

Sigue estos pasos para publicar tu aplicación Flask de forma gratuita en **PythonAnywhere**.

## 1. Crear Cuenta y Configuración Inicial
1.  Regístrate en [pythonanywhere.com](https://www.pythonanywhere.com/).
2.  Ve a la pestaña **Web** y haz clic en **Add a new web app**.
3.  Elige tu dominio gratuito (ej: `tuusuario.pythonanywhere.com`).
4.  Selecciona **Flask** -> **Python 3.10** (o la versión que prefieras).
5.  En "Path", deja el valor por defecto (`/home/tuusuario/mysite/flask_app.py`) por ahora.

## 2. Subir Archivos
1.  Ve a la pestaña **Files**.
2.  Navega a la carpeta `mysite` (o crea una nueva carpeta para tu proyecto).
3.  Sube todos los archivos de tu proyecto (puedes comprimirlos en un `.zip` y subirlos, luego descomprimirlos usando la consola Bash).
    *   Sube: `app/`, `instance/`, `requirements.txt`, `run.py`, `.env` (o crea uno nuevo).
    *   **Nota:** Si subes `instance/investment_sim.db`, tendrás tus datos actuales. Si no, la app creará una base de datos vacía.

## 3. Configurar Entorno Virtual
1.  Abre una **Bash console** desde el Dashboard.
2.  Navega a tu carpeta de proyecto:
    ```bash
    cd mysite
    ```
3.  Crea y activa el entorno virtual:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
4.  Instala las dependencias:
    ```bash
    pip install -r requirements.txt
    ```

## 4. Configurar WSGI
1.  Ve a la pestaña **Web**.
2.  En la sección **Code**, haz clic en el enlace del **WSGI configuration file** (algo como `/var/www/tuusuario_pythonanywhere_com_wsgi.py`).
3.  Borra todo el contenido y pega lo siguiente (ajustando la ruta a tu proyecto):

    ```python
    import sys
    import os
    
    # Ajusta la ruta a tu carpeta de proyecto
    path = '/home/tuusuario/mysite'
    if path not in sys.path:
        sys.path.append(path)

    from app import create_app
    application = create_app()
    ```
    *   Sustituye `tuusuario` por tu nombre de usuario real.

## 5. Variables de Entorno (Importante)
Como usamos `python-dotenv`, asegúrate de subir tu archivo `.env` a la carpeta raíz del proyecto en PythonAnywhere (`/home/tuusuario/mysite/.env`), o configura las variables manualmente en el archivo WSGI:

```python
os.environ['SECRET_KEY'] = 'tu_clave_secreta_aqui'
os.environ['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////home/tuusuario/mysite/instance/investment_sim.db'
```

*   **Nota sobre la ruta de la DB:** SQLite requiere **rutas absolutas** en PythonAnywhere. Asegúrate de usar `/home/tuusuario/mysite/instance/investment_sim.db`.

## 6. Finalizar
1.  Ve a la pestaña **Web**.
2.  En la sección **Virtualenv**, introduce la ruta a tu entorno virtual: `/home/tuusuario/mysite/venv`.
3.  Haz clic en el botón verde **Reload** al inicio de la página.
4.  Visita tu URL (`tuusuario.pythonanywhere.com`) ¡y listo!

## Solución de Problemas
-   Revisa los **Error log** en la pestaña Web si algo falla.
-   Si la base de datos no se encuentra, verifica la ruta absoluta en `SQLALCHEMY_DATABASE_URI`.
