import { NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // El límite que necesites
    },
  },
}

export async function POST(request: Request) {
  // Cámara de seguridad 1: ¿Entró la petición a nuestra API de Next.js?
  console.log('[Next.js API] -> Petición recibida desde el frontend.');

  try {
    const formData = await request.formData();
    const file = formData.get('fmuFile') as File;
    const parameters = formData.get('parameters') as string | null;
    console.log("[Next.js API] -> Campo 'parameters' recibido:", parameters);
    if (!file) {
      console.error('[Next.js API] -> ERROR: No se encontró el archivo en la petición.');
      return NextResponse.json({ error: 'No se encontró el archivo' }, { status: 400 });
    }

    // Cámara de seguridad 2: ¿Recibimos el archivo correctamente?
    console.log(`[Next.js API] -> Archivo recibido: ${file.name}, Tamaño: ${file.size} bytes.`);

    const pythonFormData = new FormData();
    pythonFormData.append('fmuFile', file);
    if (parameters) {
      pythonFormData.append('parameters', parameters);
    }
    const pythonBackendUrl = 'http://127.0.0.1:5001/api/simulate';

    // Cámara de seguridad 3: Justo antes de intentar hablar con Python.
    console.log(`[Next.js API] -> Reenviando petición a Python en: ${pythonBackendUrl}`);
    
    const pythonResponse = await fetch(pythonBackendUrl, {
      method: 'POST',
      body: pythonFormData,
    });

    // Cámara de seguridad 4: Recibimos una respuesta de Python. ¿Fue buena o mala?
    console.log(`[Next.js API] -> Respuesta recibida de Python con estado: ${pythonResponse.status}`);

    if (!pythonResponse.ok) {
      const errorData = await pythonResponse.json().catch(() => ({ error: 'Python devolvió un error no-JSON' }));
      console.error('[Next.js API] -> ERROR: Python respondió con un error:', errorData);
      return NextResponse.json({ error: errorData.error || 'Error en el backend de Python' }, { status: pythonResponse.status });
    }
    
    const simulationResults = await pythonResponse.json();
    
    // Cámara de seguridad 5: ¡Éxito! Reenviando los resultados al frontend.
    console.log('[Next.js API] -> Éxito. Reenviando resultados de Python al frontend.');
    return NextResponse.json(simulationResults);

  } catch (error) {
    // Cámara de seguridad 6: Ocurrió un error catastrófico DENTRO de la API de Next.js
    console.error('[Next.js API] -> ERROR CATASTRÓFICO:', error);
    return NextResponse.json({ error: 'Error interno del servidor en la API de Next.js' }, { status: 500 });
  }
}