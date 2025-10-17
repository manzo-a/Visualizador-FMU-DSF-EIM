# PASO 1: IMAGEN BASE
# Empezamos con una imagen oficial de Python 3.11, versión "slim" (ligera).
# Esta imagen está basada en Linux (Debian).
FROM python:3.11

# PASO 2: INSTALAR DEPENDENCIAS DEL SISTEMA OPERATIVO
# Este es el paso más crucial. Instalamos todas las herramientas que FMPy necesitará
# para compilar el FMU de código fuente dentro del servidor.
# - build-essential: Instala el compilador de C/C++ (gcc, g++).
# - cmake: El sistema de construcción que FMPy usa para orquestar la compilación.
# - python3-dev: Los "headers" de desarrollo de Python, necesarios para que gcc pueda crear extensiones de Python.
# - unzip: Utilidad para descomprimir archivos, usada por FMPy bajo el capó.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    python3-dev \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# PASO 3: CONFIGURAR EL DIRECTORIO DE TRABAJO
# Creamos una carpeta /app dentro del contenedor y la establecemos como nuestro directorio de trabajo.
WORKDIR /app

# PASO 4: INSTALAR DEPENDENCIAS DE PYTHON (Optimizado para caché)
# Copiamos solo el archivo de requerimientos primero. Si este archivo no cambia en futuros
# despliegues, Docker reutilizará la capa cacheada de este paso, haciendo el build mucho más rápido.
COPY requirements.txt .
RUN pip uninstall -y fmpy && pip install --no-cache-dir -r requirements.txt

# PASO 5: COPIAR EL CÓDIGO DE LA APLICACIÓN
# Copiamos el resto de los archivos de nuestro proyecto (app.py, etc.) al directorio de trabajo.
COPY . .

# PASO 6: COMANDO DE INICIO
# Este es el comando que Render ejecutará cuando el contenedor se inicie.
# - Usamos la forma "shell" (sin corchetes) para que la variable de entorno $PORT sea interpretada.
# - --bind 0.0.0.0:$PORT: Le dice a Gunicorn que escuche en el puerto que Render le asigne.
# - --timeout 120: Le da al worker hasta 120 segundos para responder, crucial para la lenta
#   primera compilación del FMU.
# - app:app: Le dice a Gunicorn que busque en el archivo app.py la variable app.
CMD gunicorn --bind 0.0.0.0:$PORT --timeout 120 app:app