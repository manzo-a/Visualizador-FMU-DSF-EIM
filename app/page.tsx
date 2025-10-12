"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Grid, Html } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Settings, Info } from "lucide-react"
import { SimulationScene } from "@/components/simulation-scene"
import { FileUploader } from "@/components/file-uploader"
import { SimulationControls } from "@/components/simulation-controls"
import { ObjectInspector } from "@/components/object-inspector"
import { ParameterControls } from "@/components/ParameterControls";
import { RealTimeChart } from "@/components/RealTimeChart";
import { VariableSelector } from "@/components/VariableSelector";

type Parameters = {
  mass: number;
  stiffness: number;
};

export default function FMUVisualizer() {
  const [fmuFile, setFmuFile] = useState<File | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [simulationData, setSimulationData] = useState<any>(null)
  const [selectedObject, setSelectedObject] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [parameters, setParameters] = useState<Parameters>({ mass: 1.0, stiffness: 100.0 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedGraphVariables, setSelectedGraphVariables] = useState<string[]>([]);

  const animationFrameId = useRef<number>();
  const lastTimeRef = useRef<number>();

  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current != null) {
        const deltaTime = (time - lastTimeRef.current) / 1000; // en segundos

        setCurrentTime(prevTime => {
          const newTime = prevTime + deltaTime;
          if (simulationData && newTime >= simulationData.timeRange[1]) {
            setIsPlaying(false);
            return simulationData.timeRange[1];
          }
          return newTime;
        });
      }
      lastTimeRef.current = time;
      animationFrameId.current = requestAnimationFrame(animate);
    };

    if (isPlaying && simulationData) {
      console.log("[Page] ¡Animación INICIADA!");
      lastTimeRef.current = performance.now();
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      console.log("[Page] Animación DETENIDA.");
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, simulationData]);

  const handleFileUpload = useCallback(async (file: File, paramsToSimulate: Parameters) => {
    setFmuFile(file);
    setSimulationData(null);
    setCurrentTime(0); // Reiniciar tiempo al cargar nuevo archivo
    setIsPlaying(false); // Pausar al cargar nuevo archivo

    const formData = new FormData();
    formData.append("fmuFile", file);
    formData.append("parameters", JSON.stringify(paramsToSimulate));

    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falló la simulación");
      }

      const results = await response.json();
      setSimulationData(results);
      
    } catch (error) {
      console.error("Error al procesar el FMU:", error);
      alert(String(error));
    }
  }, []);

  const runSimulation = useCallback(async (file: File, paramsToSimulate: Parameters) => {
    if (!file) return;

    setIsSimulating(true);
    setSimulationData(null);
    setCurrentTime(0);
    setIsPlaying(false);
    console.log("[Page.tsx] Iniciando simulación con los parámetros:", paramsToSimulate);
    const formData = new FormData();
    formData.append("fmuFile", file);
    const parametersJsonString = JSON.stringify(paramsToSimulate);
    console.log("[Page.tsx] String JSON que se adjuntará al FormData:", parametersJsonString);
    formData.append("parameters", parametersJsonString);

    try {
      console.log("[Page.tsx] Enviando petición a /api/simulate...");
      const response = await fetch("/api/simulate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falló la simulación");
      }

      const results = await response.json();
      setSimulationData(results);
      if (results && results.variables) {
        // Seleccionamos la primera variable que no sea 'time', hasta un máximo de 2.
        const defaultVars = results.variables.filter((v: string) => v !== 'time').slice(0, 2);
        setSelectedGraphVariables(defaultVars);
      }

    } catch (error) {
      console.error("Error al procesar el FMU:", error);
      alert(String(error));
    } finally {
      setIsSimulating(false);
    }
  }, []); // El array de dependencias vacío significa que esta función nunca cambia

  // Esta función se activa cuando se sube un archivo por PRIMERA VEZ
  const handleInitialFileUpload = (file: File) => {
    setFmuFile(file); // Guardamos el archivo para futuras re-simulaciones
    // Ejecutamos la simulación con el nuevo archivo y los parámetros que estén en la UI en ese momento
    runSimulation(file, parameters);
  };
  
  // Esta función se activa con el botón "Re-simular"
  const handleResimulate = () => {
    if (!fmuFile) {
      alert("Por favor, carga un archivo FMU primero.");
      return;
    }
    // Ejecutamos la simulación con el archivo guardado y los parámetros actuales de la UI
    runSimulation(fmuFile, parameters);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetSimulation = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  return (
    // CONTENEDOR RAÍZ:
    // Ocupa el 100% de la altura y anchura de la ventana.
    // Es una columna flex: pone a sus hijos (header y content) uno encima del otro.
    <div className="h-screen w-screen flex flex-col bg-background text-foreground">
      
      {/* HEADER:
          Tiene una altura fija y no se encoge. */}
      <header className="shrink-0 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FMU 3D Visualizer
            </h1>
            <Badge variant="secondary" className="text-xs">v1.0 - Gratuito</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowControls(!showControls)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm"><Info className="h-4 w-4" /> Ayuda</Button>
          </div>
        </div>
      </header>

      {/* CONTENEDOR DE CONTENIDO PRINCIPAL:
          - 'flex-1': Crece para ocupar todo el espacio vertical sobrante bajo el header.
          - 'flex': Pone a sus hijos (sidebar y main) en una FILA, uno al lado del otro.
          - 'min-h-0': Un truco de CSS crucial para que Flexbox funcione correctamente en layouts complejos. */}
      <div className="flex-1 flex min-h-0">
        
        {/* BARRA LATERAL (SIDEBAR):
            - 'w-80': Ancho fijo.
            - 'shrink-0': Le prohíbe encogerse.
            - 'flex flex-col': Para organizar su contenido interno verticalmente. */}
        {showControls && (
          <aside className="w-80 border-r border-border bg-card/30 backdrop-blur-sm flex flex-col shrink-0">
            {/* Div interno para el scroll: el contenido se desplaza, pero el pie de página no. */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {/* Aquí va todo el contenido de tu sidebar, en el orden que prefieras */}
              {simulationData && (
                <SimulationControls
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  timeRange={simulationData.timeRange}
                  onPlay={togglePlayback}
                  onReset={resetSimulation}
                  onTimeChange={setCurrentTime}
                />
              )}
            {/* Tarjeta de carga de archivo */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Archivo de Simulación</CardTitle></CardHeader>
              <CardContent>
                <FileUploader onFileUpload={handleInitialFileUpload} />
                {fmuFile && <div className="mt-2 text-xs text-muted-foreground truncate">Archivo: {fmuFile.name}</div>}
              </CardContent>
            </Card>

            {/* Nuestro nuevo y robusto componente de parámetros */}
            <ParameterControls
              parameters={parameters}
              onParametersChange={setParameters}
              onResimulate={handleResimulate}
              isSimulating={isSimulating}
              disabled={!fmuFile} // Deshabilitamos si no hay archivo
            />
            </div>

            {/* PIE DE PÁGINA DE LA BARRA LATERAL:
                - 'mt-auto': Empuja este div hacia el fondo. */}
            <div className="p-4 border-t border-border">
              <div className="text-xs text-muted-foreground space-y-2">
                <p><strong>Instrucciones:</strong></p>
                <ul className="space-y-1 ml-2">
                  <li>• Arrastra un archivo .fmu para cargar.</li>
                  <li>• Usa el mouse para interactuar con la escena.</li>
                </ul>
              </div>
            </div>
          </aside>
        )}

        {/* VIEWPORT 3D (ÁREA PRINCIPAL):
            - 'flex-1': Crece para ocupar todo el espacio HORIZONTAL sobrante.
            - 'relative': Necesario para posicionar elementos hijos (como el status). */}
        <main className="flex-1 relative">
          <Canvas shadows camera={{ position: [5, 5, 5], fov: 60 }}>
            <Environment preset="city" /> {/* Prueba un preset diferente para un look más interesante */}
            <ambientLight intensity={0.4} />
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={2}
            maxDistance={20} />

              <Grid
                args={[20, 20]}
                position={[0, -2, 0]}
                cellSize={1}
                cellThickness={0.5}
                cellColor="#6366f1"
                sectionSize={5}
                sectionThickness={1}
                sectionColor="#8b5cf6"
                fadeDistance={15}
                fadeStrength={1}
              />

            {simulationData ? (
              <SimulationScene data={simulationData} currentTime={currentTime} onObjectSelect={setSelectedObject} />
            ) : (
              <Html center>
                <div className="text-center p-8 bg-background/50 backdrop-blur-sm rounded-lg">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Esperando archivo FMU</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Arrastra y suelta un archivo en el panel de la izquierda para comenzar.
                  </p>
                </div>
              </Html>
            )}
          </Canvas>

          {/* Status flotante (sin cambios) */}
          {simulationData && (
            <div className="absolute top-4 right-4 bg-background/50 backdrop-blur-sm rounded-lg p-3 pointer-events-none">
              <div className="text-xs space-y-1">
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Tiempo:</span><span className="font-mono">{currentTime.toFixed(2)}s</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Objetos:</span><span>{simulationData.objects.length}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Estado:</span><Badge variant={isPlaying ? "default" : "secondary"} className="text-xs">{isPlaying ? "Ejecutando" : "Pausado"}</Badge></div>
              </div>
            </div>
          )}
        </main>
        {showControls && (
          <aside className="w-96 border-l border-border bg-card/30 backdrop-blur-sm flex flex-col shrink-0">
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {/* Aquí movemos los componentes de análisis */}
              {simulationData ? (
                <>
                  <VariableSelector
                    availableVariables={simulationData.variables}
                    selectedVariables={selectedGraphVariables}
                    onSelectionChange={setSelectedGraphVariables}
                  />
                  <RealTimeChart
                    data={simulationData.objects[0].data.filter((d: any) => d.time <= currentTime)}
                    variables={selectedGraphVariables}
                    currentTime={currentTime}
                  />
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-sm text-muted-foreground p-4">
                    <p>Los gráficos y las variables de la simulación aparecerán aquí una vez que se cargue un archivo.</p>
                  </div>
                </div>
              )}
            
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}