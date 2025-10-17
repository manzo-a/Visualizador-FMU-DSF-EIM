# test_compile.py (versión con diagnóstico)
import os

print("--- INICIO DE LA PRUEBA DE COMPILACIÓN DE FMU (CON DIAGNÓSTICO) ---")

# Primero, intentamos importar FMPy para ver su versión
try:
    import fmpy
    print(f"Versión de FMPy encontrada: {fmpy.__version__}")
    print(f"FMPy está instalado en: {fmpy.__file__}")
except ImportError:
    print("ERROR CRÍTICO: La librería FMPy ni siquiera pudo ser importada.")
    exit(1) # Salir del script si fmpy no está

# Ahora, intentamos importar la función específica
try:
    from fmpy.util import compile_platform_binary
    print("La función 'compile_platform_binary' fue importada con éxito.")
except ImportError as e:
    print("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    print(f"FALLO LA IMPORTACIÓN. Error: {e}")
    print("Esto confirma que la versión de FMPy que se está usando es demasiado antigua o está corrupta.")
    print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    exit(1) # Salir del script

# Si la importación fue exitosa, procedemos con la compilación
FMU_FILENAME = 'First.fmu'

if not os.path.exists(FMU_FILENAME):
    print(f"ERROR: No se encontró el archivo '{FMU_FILENAME}'.")
else:
    print(f"Archivo FMU '{FMU_FILENAME}' encontrado. Intentando compilar...")
    try:
        compile_platform_binary(FMU_FILENAME)
        print("\n*******************************************************")
        print("¡ÉXITO! El binario fue compilado y añadido al FMU.")
        print("*******************************************************")
    except Exception as e:
        print(f"\nFALLO LA COMPILACIÓN. Error: {e}")
        
print("\n--- FIN DE LA PRUEBA ---")