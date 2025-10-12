import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type SpringProps = {
  startPoint: THREE.Vector3;
  endPoint: THREE.Vector3;
};

export function Spring({ startPoint, endPoint }: SpringProps) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (!ref.current) return;

    // Calculamos el vector que va del punto de inicio al de fin
    const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
    // La longitud del resorte es la magnitud de ese vector
    const length = direction.length();
    
    // El resorte se escala en el eje Y para que coincida con la longitud
    ref.current.scale.y = length;
    // Lo posicionamos justo en el medio del punto de inicio y fin
    ref.current.position.copy(startPoint).add(direction.multiplyScalar(0.5));
    // Hacemos que el cilindro "mire" hacia el punto final (la masa)
    ref.current.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0), // El eje Y por defecto del cilindro
      direction.normalize() // La dirección normalizada a la que debe apuntar
    );
  });

  return (
    <mesh ref={ref} castShadow>
      {/* Un cilindro muy delgado para representar el resorte */}
      <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
      <meshStandardMaterial color="silver" metalness={0.8} roughness={0.3} />
    </mesh>
  );
}