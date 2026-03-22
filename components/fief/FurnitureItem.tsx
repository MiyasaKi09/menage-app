'use client'

import { useRef, useState } from 'react'
import { type ThreeEvent } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

interface FurnitureItemProps {
  id: string
  catalogId: string
  position: [number, number, number]
  rotationY: number
  scale: number
  isEditMode: boolean
  isSelected: boolean
  onSelect: (id: string) => void
  onMove: (id: string, pos: [number, number, number]) => void
}

// Fallback primitives for each catalog item (used when no .glb available)
function FallbackModel({ catalogId }: { catalogId: string }) {
  switch (catalogId) {
    case 'bed_default':
      return (
        <group>
          <RoundedBox args={[1.5, 0.35, 2.0]} radius={0.04} position={[0, 0.18, 0]} castShadow>
            <meshStandardMaterial color="#9a7a52" roughness={0.85} />
          </RoundedBox>
          <RoundedBox args={[1.4, 0.15, 1.9]} radius={0.06} position={[0, 0.42, 0]} castShadow>
            <meshStandardMaterial color="#f0e8d8" roughness={0.95} />
          </RoundedBox>
          <RoundedBox args={[1.4, 0.08, 1.3]} radius={0.04} position={[0, 0.5, 0.25]} castShadow>
            <meshStandardMaterial color="#b8c8a0" roughness={0.9} />
          </RoundedBox>
          <RoundedBox args={[0.9, 0.12, 0.3]} radius={0.06} position={[0, 0.55, -0.7]} castShadow>
            <meshStandardMaterial color="#f5efe5" roughness={0.95} />
          </RoundedBox>
          <RoundedBox args={[1.5, 0.9, 0.1]} radius={0.04} position={[0, 0.7, -0.95]} castShadow>
            <meshStandardMaterial color="#7a5a38" roughness={0.85} />
          </RoundedBox>
        </group>
      )

    case 'table_default':
      return (
        <group>
          <RoundedBox args={[0.55, 0.55, 0.45]} radius={0.03} position={[0, 0.28, 0]} castShadow>
            <meshStandardMaterial color="#b89870" roughness={0.85} />
          </RoundedBox>
        </group>
      )

    case 'lamp_default':
      return (
        <group>
          <mesh position={[0, 0.06, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.06, 12]} />
            <meshStandardMaterial color="#d0b890" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.2, 6]} />
            <meshStandardMaterial color="#c0a070" roughness={0.6} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.12, 0.15, 12]} />
            <meshStandardMaterial color="#f5e8d0" roughness={0.9} emissive="#ffddaa" emissiveIntensity={0.3} transparent opacity={0.9} />
          </mesh>
          <pointLight position={[0, 0.35, 0]} color="#ffddaa" intensity={0.8} distance={4} decay={2} />
        </group>
      )

    case 'shelf_default':
      return (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.04, 0.2]} />
            <meshStandardMaterial color="#9a7a52" roughness={0.85} />
          </mesh>
          {[[-0.15, 0.08], [0.0, 0.1], [0.12, 0.07]].map(([z, h], i) => (
            <mesh key={i} position={[0, h / 2 + 0.02, z]} castShadow>
              <boxGeometry args={[0.08, h, 0.12]} />
              <meshStandardMaterial color={['#b85040', '#4878a8', '#d8a840'][i]} roughness={0.85} />
            </mesh>
          ))}
        </group>
      )

    case 'plant_small':
      return (
        <group>
          <mesh position={[0, 0.06, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.05, 0.12, 8]} />
            <meshStandardMaterial color="#d4a878" roughness={0.8} />
          </mesh>
          {[0, 1.2, 2.4, 3.6, 5].map((angle, i) => (
            <mesh key={i} position={[Math.cos(angle) * 0.04, 0.14 + i * 0.01, Math.sin(angle) * 0.04]} rotation={[0.3, angle, 0.2]}>
              <sphereGeometry args={[0.035, 6, 4]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#6a9a58' : '#7aaa68'} roughness={0.9} />
            </mesh>
          ))}
        </group>
      )

    case 'chest':
      return (
        <group>
          <RoundedBox args={[0.7, 0.4, 0.45]} radius={0.03} position={[0, 0.2, 0]} castShadow>
            <meshStandardMaterial color="#6b4e2e" roughness={0.9} />
          </RoundedBox>
          <mesh position={[0, 0.42, 0]} castShadow>
            <boxGeometry args={[0.72, 0.06, 0.47]} />
            <meshStandardMaterial color="#5a3e20" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.25, 0.23]} castShadow>
            <boxGeometry args={[0.08, 0.08, 0.02]} />
            <meshStandardMaterial color="#c8a020" roughness={0.4} metalness={0.5} />
          </mesh>
        </group>
      )

    case 'bookshelf':
      return (
        <group>
          <RoundedBox args={[0.8, 1.8, 0.3]} radius={0.03} position={[0, 0.9, 0]} castShadow>
            <meshStandardMaterial color="#7a5c3a" roughness={0.9} />
          </RoundedBox>
          {[0.4, 0.8, 1.2].map((y, row) => (
            <group key={row} position={[0, y, 0.05]}>
              {[-0.2, -0.05, 0.1, 0.22].map((bx, j) => (
                <mesh key={j} position={[bx, 0, 0]} castShadow>
                  <boxGeometry args={[0.1, 0.25, 0.18]} />
                  <meshStandardMaterial color={['#8b3030', '#2a5a3a', '#3a4a7a', '#7a5a2a'][j]} roughness={0.85} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )

    default:
      return (
        <RoundedBox args={[0.5, 0.5, 0.5]} radius={0.05} castShadow>
          <meshStandardMaterial color="#c0a080" roughness={0.8} />
        </RoundedBox>
      )
  }
}

export function FurnitureItem({
  id,
  catalogId,
  position,
  rotationY,
  scale: itemScale,
  isEditMode,
  isSelected,
  onSelect,
  onMove,
}: FurnitureItemProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const dragOffset = useRef(new THREE.Vector3())

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!isEditMode) return
    e.stopPropagation()
    onSelect(id)

    // Start drag
    const intersect = new THREE.Vector3()
    e.ray.intersectPlane(dragPlane.current, intersect)
    dragOffset.current.set(position[0] - intersect.x, 0, position[2] - intersect.z)
    setIsDragging(true)
    ;(e.target as HTMLElement)?.setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !isEditMode) return
    e.stopPropagation()
    const intersect = new THREE.Vector3()
    e.ray.intersectPlane(dragPlane.current, intersect)
    const newX = Math.round((intersect.x + dragOffset.current.x) * 4) / 4 // snap to 0.25 grid
    const newZ = Math.round((intersect.z + dragOffset.current.z) * 4) / 4
    onMove(id, [newX, position[1], newZ])
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={itemScale}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Selection indicator */}
      {isEditMode && isSelected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color="#ffcc44" transparent opacity={0.4} />
        </mesh>
      )}

      {/* Edit mode hover highlight */}
      {isEditMode && !isSelected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.05} />
        </mesh>
      )}

      <FallbackModel catalogId={catalogId} />
    </group>
  )
}
