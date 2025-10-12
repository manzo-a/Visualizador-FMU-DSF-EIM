import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ===============================================================
// CAMBIO #1: Actualizamos el "contrato" de las Props
// ===============================================================
type DamperProps = {
  startPoint: THREE.Vector3;
  endPointRef: React.RefObject<THREE.Vector3>; // <-- Espera un Ref
};

// ===============================================================
// CAMBIO #2: Actualizamos la firma de la función para recibir la nueva prop
// ===============================================================
export function Damper({ startPoint, endPointRef }: DamperProps) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    // ===============================================================
    // CAMBIO #3: Leemos el valor .current del Ref en cada frame
    // ===============================================================
    if (!ref.current || !endPointRef.current) return;
    
    const endPoint = endPointRef.current; // Obtenemos el valor "vivo"

    const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
    const length = direction.length();
    
    ref.current.scale.y = length;
    ref.current.position.copy(startPoint).add(direction.multiplyScalar(0.5));
    ref.current.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize()
    );
  });

  return (
    <mesh ref={ref} castShadow>
      <cylinderGeometry args={[0.08, 0.08, 1, 16]} />
      <meshStandardMaterial color="#444" metalness={0.2} roughness={0.8} />
    </mesh>
  );
}