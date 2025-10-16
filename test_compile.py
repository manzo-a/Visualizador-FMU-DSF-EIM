# test_compile.py
import os
from fmpy.util import compile_platform_binary

FMU_FILENAME = 'SpringDamperSystem_ME.fmu'

print("--- INICIO DE LA PRUEBA DE COMPILACIÓN DE FMU ---")

if not os.path.exists(FMU_FILENAME):
    print(f"ERROR: No se encontró el archivo '{FMU_FILENAME}'. Asegúrate de que está en el mismo directorio.")
else:
    print(f"Archivo FMU '{FMU_FILENAME}' encontrado. Intentando compilar...")
    try:
        # La función que queremos probar
        compile_platform_binary(FMU_FILENAME)
        print("\n*******************************************************")
        print("¡ÉXITO! El binario fue compilado y añadido al FMU.")
        print("*******************************************************")
    except Exception as e:
        print("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print(f"FALLO LA COMPILACIÓN. Error: {e}")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        
print("\n--- FIN DE LA PRUEBA ---")