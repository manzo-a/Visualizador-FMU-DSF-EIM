# --- PASO 1: El Plano Base ---
# Empezamos con una imagen oficial de Python 3.11 sobre Debian (Linux).
# Esta imagen ya tiene Python y pip instalados.
FROM python:3.11-slim

# --- PASO 2: Instalar las Herramientas del Sistema ---
# Le decimos al sistema operativo (Debian) que instale las herramientas de construcción que necesitamos.
# 'apt-get' es el 'pip' para el sistema operativo.
# 'RUN' ejecuta un comando durante la construcción de la imagen.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# --- PASO 3: Preparar el Espacio de Trabajo ---
# Creamos una carpeta dentro de nuestro contenedor para poner el código.
WORKDIR /app

# --- PASO 4: Copiar la "Lista de la Compra" ---
# Copiamos solo el archivo requirements.txt primero. Esto es una optimización de caché.
COPY requirements.txt .

# --- PASO 5: Instalar las Dependencias de Python ---
# Ejecutamos pip para instalar todo lo de nuestra lista.
RUN pip install --no-cache-dir -r requirements.txt

# --- PASO 6: Copiar el Resto de Nuestro Código ---
# Copiamos todo lo demás (app.py, etc.) a la carpeta /app.
COPY . .

# --- PASO 7: Las Instrucciones de Arranque ---
# Este es el comando que se ejecutará cuando Render inicie nuestro contenedor.
# Usamos la misma sintaxis que antes para que escuche en el puerto correcto.
# Nota: No usamos 'gunicorn' directamente, sino una forma que permite a Docker pasarle variables.
CMD gunicorn --bind 0.0.0.0:$PORT app:app