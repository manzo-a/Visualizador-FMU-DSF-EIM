import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// --- (Parámetros se mantienen igual) ---
const RADIUS = 0.3;
const NUM_COILS = 20;
const TUBE_RADIUS = 0.03;
const SEGMENTS = 200; // Segmentos de la curva
const TUBE_SEGMENTS = 8; // Segmentos del tubo

// --- (La clase HelicalCurve se mantiene igual) ---
class HelicalCurve extends THREE.Curve<THREE.Vector3> {
    length: number;
    constructor(length = 1) { super(); this.length = length; }
    getPoint(t: number): THREE.Vector3 {
        const angle = 2 * Math.PI * NUM_COILS * t;
        const x = RADIUS * Math.cos(angle);
        const y = this.length * t;
        const z = RADIUS * Math.sin(angle);
        return new THREE.Vector3(x, y, z);
    }
}

type HelicalSpringProps = {
  startPoint: THREE.Vector3;
  endPointRef: React.RefObject<THREE.Vector3>;
};

export function HelicalSpring({ startPoint, endPointRef }: HelicalSpringProps) {
  // Ahora la referencia es a un <group> que contendrá nuestro tubo.
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (!groupRef.current || !meshRef.current || !endPointRef.current) return;
    
    const endPoint = endPointRef.current;
    const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
    const length = direction.length();

    // ===============================================================
    // LÓGICA DE ACTUALIZACIÓN IMPERATIVA
    // ===============================================================
    // 1. Creamos una NUEVA curva con la longitud actualizada
    const newCurve = new HelicalCurve(length);

    // 2. Creamos una NUEVA geometría de tubo a partir de la nueva curva
    const newGeometry = new THREE.TubeGeometry(newCurve, SEGMENTS, TUBE_RADIUS, TUBE_SEGMENTS, false);

    // 3. Reemplazamos la geometría antigua del mesh con la nueva
    //    Primero, es importante liberar la memoria de la geometría anterior.
    meshRef.current.geometry.dispose();
    meshRef.current.geometry = newGeometry;

    // 4. Orientamos el grupo contenedor (no el mesh directamente)
    groupRef.current.position.copy(startPoint);
    groupRef.current.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize()
    );
  });

  return (
    // Usamos un grupo para manejar la posición/rotación
    <group ref={groupRef}>
      {/* El mesh del tubo ahora vive dentro del grupo y no se mueve por sí mismo */}
      <mesh ref={meshRef} castShadow>
        {/* Le damos una geometría inicial para que no crashee en el primer render */}
        <tubeGeometry args={[new HelicalCurve(1), SEGMENTS, TUBE_RADIUS, TUBE_SEGMENTS, false]} />
        <meshStandardMaterial color="silver" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}