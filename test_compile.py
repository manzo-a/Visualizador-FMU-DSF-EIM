# test_compile.py (versión corregida para FMPy v0.3.26)
import os
import fmpy # Importamos para verificar la versión

# ¡LA IMPORTACIÓN CORRECTA!
from fmpy.build import build_platform_binary

print("--- INICIO DE LA PRUEBA DE COMPILACIÓN (v0.3.26) ---")
print(f"Versión de FMPy en uso: {fmpy.__version__}")

FMU_FILENAME = 'SpringDamperSystem_ME.fmu'

if not os.path.exists(FMU_FILENAME):
    print(f"ERROR: No se encontró el archivo '{FMU_FILENAME}'.")
else:
    try:
        # ¡LA LLAMADA A LA FUNCIÓN CORRECTA!
        build_platform_binary(FMU_FILENAME)
        
        print("\n*******************************************************")
        print("¡ÉXITO! El binario fue compilado usando build_platform_binary.")
        print("*******************************************************")

    except Exception as e:
        print("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print(f"FALLO LA COMPILACIÓN. Error: {e}")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")

print("--- FIN DE LA PRUEBA ---")