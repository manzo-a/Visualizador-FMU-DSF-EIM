# test_compile.py (versión de verificación de archivo físico)
import os
import sys

print("--- INICIO DE LA PRUEBA DE DIAGNÓSTICO PROFUNDO ---")

# Primero, verificamos la versión de FMPy como antes
try:
    import fmpy
    print(f"Versión de FMPy reportada: {fmpy.__version__}")
    fmpy_path = os.path.dirname(fmpy.__file__)
    print(f"Directorio de instalación de FMPy: {fmpy_path}")
except ImportError:
    print("ERROR CRÍTICO: La librería FMPy no pudo ser importada.")
    sys.exit(1)

# --- NUEVO CÓDIGO DE DIAGNÓSTICO ---
# Ahora, vamos a leer el archivo util.py directamente del disco.
util_file_path = os.path.join(fmpy_path, 'util.py')
function_signature = "def compile_platform_binary"

print(f"Verificando el contenido del archivo: {util_file_path}")

try:
    with open(util_file_path, 'r', encoding='utf-8') as f:
        file_content = f.read()
    
    if function_signature in file_content:
        print("\n****************************************************************")
        print("¡VERIFICACIÓN EXITOSA! La función SÍ existe físicamente en el archivo util.py.")
        print("****************************************************************")
    else:
        print("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("VERIFICACIÓN FALLIDA. La función NO existe físicamente en el archivo util.py.")
        print("Esto confirma que el archivo instalado está corrupto o es de una versión antigua.")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        sys.exit(1)

except FileNotFoundError:
    print(f"ERROR CRÍTICO: No se encontró el archivo {util_file_path}. La instalación está rota.")
    sys.exit(1)

# --- FIN DEL NUEVO CÓDIGO ---

# Si la verificación del archivo fue exitosa, ahora intentamos la importación.
# Si esto falla ahora, el problema es extremadamente profundo (ej. un conflicto de Python).
try:
    from fmpy.util import compile_platform_binary
    print("La importación de 'compile_platform_binary' fue exitosa después de la verificación.")
    # Procedemos con la compilación real
    FMU_FILENAME = 'First.fmu'
    print(f"Intentando compilar '{FMU_FILENAME}'...")
    compile_platform_binary(FMU_FILENAME)
    print("¡ÉXITO en la compilación!")

except ImportError as e:
    print("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    print(f"FALLO LA IMPORTACIÓN A PESAR DE LA VERIFICACIÓN. Error: {e}")
    print("CONCLUSIÓN: El entorno de Python está en un estado inconsistente e impredecible.")
    print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    sys.exit(1)
except Exception as e:
    print(f"\nFALLO la compilación del FMU. Error: {e}")
    sys.exit(1)

print("\n--- FIN DE LA PRUEBA ---")