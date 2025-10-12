# ===============================================================
# PASO 1: IMPORTAR LAS HERRAMIENTAS QUE NECESITAMOS
# ===============================================================
from flask import Flask, request, jsonify
from flask_cors import CORS
import fmpy
import os       # Para manejar archivos y directorios
import shutil   # Para borrar directorios
import json # <-- ¡AÑADE ESTA LÍNEA!

# ===============================================================
# PASO 2: CONFIGURAR NUESTRO SERVIDOR (LA APLICACIÓN FLASK)
# ===============================================================
app = Flask(__name__)  # Creamos la instancia de nuestro servidor
CORS(app)              # Le decimos que permita peticiones desde otros orígenes (nuestro frontend)

# ===============================================================
# PASO 3: DEFINIR LA RUTA DE NUESTRA API
# ===============================================================
# Esta función se ejecutará cada vez que alguien envíe una petición POST a http://localhost:5001/api/simulate
@app.route('/api/simulate', methods=['POST'])
def simulate_fmu():
    print("¡Petición recibida en el endpoint /api/simulate!") # Mensaje para ver en la terminal de Python

    # 1. RECIBIR Y GUARDAR EL ARCHIVO FMU
    # Verificamos si la petición contiene un archivo llamado 'fmuFile'
    if 'fmuFile' not in request.files:
        print("Error: No se encontró 'fmuFile' en la petición.")
        return jsonify({'error': 'No se encontró el archivo FMU'}), 400

    file = request.files['fmuFile']
    filename = file.filename
    temp_dir = filename.replace('.fmu', '') # Directorio temporal para la extracción

    print(f"Archivo recibido: {filename}")
    file.save(filename) # Guardamos el archivo .fmu en el disco

    # El bloque try/except/finally es para asegurarnos de que siempre borremos los archivos temporales, incluso si hay un error
    try:
        # 2. SIMULAR EL FMU USANDO FMPY
        print("Iniciando simulación con FMPy...")
        
        # Leemos el modelo para saber qué variables podemos pedirle
        model_description = fmpy.read_model_description(filename)
        # Creamos una lista de todas las variables de salida que nos interesan
        #variables_a_extraer = [v.name for v in model_description.modelVariables if v.causality == 'output']
        variables_a_extraer = [
        "body1.r_0[1]",
        "body1.r_0[2]",
        "body1.r_0[3]"
        ]
        parameters_json = request.form.get('parameters')
        start_values = {}
        params = {}
        if parameters_json:
            try:
                params = json.loads(parameters_json)
                print(f"Parámetros JSON recibidos del frontend: {params}")
            except (json.JSONDecodeError, ValueError) as e:
                print(f"Error al procesar los parámetros JSON: {e}")
        # ¡DEBES REEMPLAZAR 'mass1.m' y 'spring1.c' con los nombres de tu FMU!
        try:
                # FMPy espera un formato específico: {nombre_variable: valor_inicial}
                # ¡DEBES REEMPLAZAR 'mass1.m' y 'spring1.c' con los nombres de tu FMU!
            if 'mass' in params:
                start_values['body1.m'] = float(params['mass'])
            if 'stiffness' in params:
                start_values['body1.frame_a.r_0[2]'] = float(params['stiffness'])
                
                print(f"Usando los siguientes valores de inicio para la simulación: {start_values}")
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error al procesar los parámetros JSON: {e}")
                
        print(f"Solicitando variables específicas: {variables_a_extraer}")        
        
        print(f"Variables a extraer: {variables_a_extraer}")

        # Ejecutamos la simulación
        result = fmpy.simulate_fmu(
            filename=filename,
            stop_time=10.0,         # Simular por 10 segundos (puedes cambiarlo)
            output_interval=1/60,   # Guardar un punto cada 0.05s (puedes cambiarlo)
            output=variables_a_extraer, # Le decimos qué datos queremos que nos devuelva
            start_values=start_values
        )

        print("Simulación completada con éxito.")

        # 3. FORMATEAR LOS RESULTADOS PARA ENVIARLOS DE VUELTA
        formatted_results = []
        for row in result:
            step_data = {name: row[name].item() for name in result.dtype.names}
            formatted_results.append(step_data)

        # NUEVO: Ahora empaquetamos esos resultados en la estructura que el frontend espera.
        # Por ahora, crearemos un único "objeto" cuya propiedad 'data' contiene toda la trayectoria.
        # Más adelante, podrías hacer esto más complejo para representar múltiples objetos 3D.
        final_response = {
            "objects": [
                {
                    "id": "simulation_trajectory",
                    "type": "trajectory", # Un tipo inventado para que el frontend sepa qué es
                    "data": formatted_results # Aquí van todos los puntos de la simulación
                }
            ],
            "timeRange": [result['time'][0].item(), result['time'][-1].item()], # Tiempo de inicio y fin real
            "variables": list(result.dtype.names) # Lista real de variables simuladas
        }

        print(f"Enviando respuesta empaquetada al frontend.")
        return jsonify(final_response) # Enviamos el objeto empaquetado

    except Exception as e:
        # Si algo sale mal durante la simulación, enviamos un mensaje de error claro.
        print(f"ERROR DURANTE LA SIMULACIÓN: {e}")
        return jsonify({'error': str(e)}), 500

    finally:
        # 4. LIMPIAR LOS ARCHIVOS TEMPORALES
        # Este bloque se ejecuta SIEMPRE, haya habido error o no.
        if os.path.exists(filename):
            os.remove(filename)
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        print("Archivos temporales eliminados.")


# ===============================================================
# PASO 4: PONER EN MARCHA EL SERVIDOR
# ===============================================================
# Esta línea hace que el servidor empiece a escuchar peticiones cuando ejecutamos "python app.py"
if __name__ == '__main__':
    # Usamos el puerto 5001 para no chocar con Next.js (que usa el 3000)
    app.run(debug=True, port=5001)