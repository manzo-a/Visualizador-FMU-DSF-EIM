import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Spring } from './Spring'; // Importamos nuestros nuevos componentes
import { HelicalSpring } from './HelicalSpring';
import { Damper } from './Damper';

// --- (Las definiciones de Tipos se mantienen igual) ---
type DataPoint = {
  time: number;
  [key: string]: number;
};
type SimulationObject = {
  id: string;
  type: string;
  data: DataPoint[];
};
type SimulationSceneProps = {
  data: { objects: SimulationObject[] } | null;
  currentTime: number;
  onObjectSelect: (id: string | null) => void;
};


export function SimulationScene({ data, currentTime, onObjectSelect }: SimulationSceneProps) {
  const massRef = useRef<THREE.Mesh>(null!);

  // Definimos los puntos de anclaje. Deben coincidir con la posición de tu soporte.
  const anchorPointSpring = new THREE.Vector3(0.3, 3.75, 0);
  const anchorPointDamper = new THREE.Vector3(0.6, 3.75, 0); // Un poco al lado

  // El punto final de ambos será la posición de la masa, que actualizaremos en cada frame.
  //const massPosition = useRef(new THREE.Vector3(0.3, -0.2, 0)).current;
  const massPositionRef = useRef(new THREE.Vector3(0.3, -0.2, 0));

  useFrame(() => {
    if (!data || !data.objects || data.objects.length === 0 || !massRef.current) {
      return;
    }
    
    const trajectory = data.objects[0].data;
    const currentPoint = trajectory.find(point => point.time >= currentTime) || trajectory[trajectory.length - 1];
    
    if (!currentPoint) return;

    const x = currentPoint['body1.r_0[1]'];
    const y = currentPoint['body1.r_0[2]'];
    const z = currentPoint['body1.r_0[3]'];

    if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
      // Actualizamos tanto la posición del mesh como nuestra variable de posición
      massRef.current.position.set(x, y, z);
      massPositionRef.current.set(x, y, z);
    }
  });

  return (
    <>
      {/* --- ILUMINACIÓN Y SOMBRAS --- */}
      <directionalLight
        position={[10, 15, 5]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <ambientLight intensity={0.5} />

      {/* --- EL ESCENARIO --- */}
      <mesh receiveShadow position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#c2b2a4" roughness={0.9} />
      </mesh>
      
      {/* El soporte fijo */}
      <mesh position={[0.3, 4, 0]}>
        <boxGeometry args={[2, 0.5, 2]} />
        <meshStandardMaterial color="gray" />
      </mesh>

      {/* --- LOS COMPONENTES DE LA SIMULACIÓN --- */}
      {/* La masa (esfera) */}
      <mesh
        ref={massRef}
        onClick={() => onObjectSelect('mass1')}
        castShadow // MUY IMPORTANTE: Le decimos a la masa que proyecte sombras.
      >
        <sphereGeometry args={[1]} />
        {/* Un material más metálico y realista */}
        <meshStandardMaterial color="blue" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* El Resorte y el Amortiguador Dinámicos */}
      {/* Los renderizamos solo si tenemos datos para evitar errores */}
      {data && (
        <>
          <HelicalSpring startPoint={anchorPointSpring} endPointRef={massPositionRef} />
          <Damper startPoint={anchorPointDamper} endPointRef={massPositionRef} />
        </>
      )}
    </>
  );
}