# test_compile.py (versión final, correcta y moderna)
import os

# ¡LA IMPORTACIÓN Y EL MÉTODO CORRECTOS PARA VERSIONES MODERNAS!
from fmpy import FMU

print(f"--- INICIO DE LA PRUEBA FINAL Y MODERNA ---")

FMU_FILENAME = 'SpringDamperSystem_ME.fmu'

try:
    # Paso 1: Crear un objeto FMU a partir del archivo
    print(f"Cargando la descripción del modelo desde '{FMU_FILENAME}'...")
    fmu = FMU(filename=FMU_FILENAME)
    
    # Paso 2: Llamar al método .compile() en el objeto
    # Esto busca la carpeta 'sources' y construye el binario nativo.
    print("Iniciando la compilación del binario de la plataforma...")
    fmu.compile()
    
    print("\n*******************************************************")
    print("¡ÉXITO! El FMU fue compilado exitosamente usando el método fmu.compile().")
    print("*******************************************************")

    # (Opcional) Pasos siguientes para una simulación real
    # print("\nInstanciando el modelo para una prueba rápida...")
    # fmu.instantiate()
    # fmu.free_instance()
    # print("Instanciación exitosa.")

except Exception as e:
    print("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    print(f"FALLO. Error: {e}")
    print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    # Lanza el error de nuevo para que el despliegue de Render falle claramente
    raise e

print("--- FIN DE LA PRUEBA ---")