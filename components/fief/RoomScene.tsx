'use client'

import { Suspense, useEffect, useRef, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

export interface RoomFurnitureData {
  id: string
  catalog_id: string
  position_x: number
  position_y: number
  position_z: number
  rotation_y: number
  scale: number
}

interface RoomSceneProps {
  furniture: RoomFurnitureData[]
  isEditMode: boolean
  selectedId: string | null
  onSelect: (id: string) => void
  onMove: (id: string, pos: [number, number, number]) => void
}

// 3D Room model
function RoomModel() {
  const { scene } = useGLTF('/models/chambre-web.glb')

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        const mesh = child as THREE.Mesh
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        mats.forEach((mat: any) => {
          if (mat.map) {
            mat.map.colorSpace = THREE.SRGBColorSpace
            mat.map.needsUpdate = true
          }
          if (mat.normalMap) mat.normalMap.needsUpdate = true
          if (mat.roughnessMap) mat.roughnessMap.needsUpdate = true
          mat.needsUpdate = true
        })
      }
    })
  }, [scene])

  return (
    <primitive
      object={scene}
      scale={0.55}
      position={[0, 0, 0]}
      rotation={[0, Math.PI * 0.25, 0]}
    />
  )
}

useGLTF.preload('/models/chambre-web.glb')

// Floating dust particles in sunbeams
function DustParticles({ count = 60 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 2.5,
      y: Math.random() * 1.8 + 0.2,
      z: (Math.random() - 0.5) * 2.5,
      speed: 0.02 + Math.random() * 0.04,
      drift: Math.random() * Math.PI * 2,
      size: 0.008 + Math.random() * 0.015,
    }))
  }, [count])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime
    const dummy = new THREE.Object3D()

    particles.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(t * p.speed + p.drift) * 0.3,
        p.y + Math.sin(t * p.speed * 0.7 + p.drift) * 0.15,
        p.z + Math.cos(t * p.speed * 0.5 + p.drift) * 0.3,
      )
      dummy.scale.setScalar(p.size)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 4]} />
      <meshBasicMaterial color="#fff8e0" transparent opacity={0.4} />
    </instancedMesh>
  )
}

// Volumetric light cone simulating sunbeam through window
function SunBeam() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime
    const mat = meshRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.06 + Math.sin(t * 0.3) * 0.015
  })

  return (
    <mesh ref={meshRef} position={[0.5, 0.9, -0.6]} rotation={[0.3, 0.5, 0.1]}>
      <coneGeometry args={[0.8, 2.2, 16, 1, true]} />
      <meshBasicMaterial
        color="#ffe8a0"
        transparent
        opacity={0.07}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// Second sunbeam at different angle
function SunBeam2() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime
    const mat = meshRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.04 + Math.sin(t * 0.2 + 1) * 0.01
  })

  return (
    <mesh ref={meshRef} position={[-0.3, 0.9, -0.4]} rotation={[-0.2, -0.3, 0.15]}>
      <coneGeometry args={[0.6, 2, 12, 1, true]} />
      <meshBasicMaterial
        color="#fff0c0"
        transparent
        opacity={0.05}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// Camera setup
function CameraSetup() {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(5, 4, 5)
    camera.lookAt(0, 0.5, 0)
    if ((camera as THREE.OrthographicCamera).zoom !== undefined) {
      (camera as THREE.OrthographicCamera).zoom = 115
      camera.updateProjectionMatrix()
    }
  }, [camera])

  return null
}

function SceneContent({ isEditMode }: Pick<RoomSceneProps, 'isEditMode'>) {
  return (
    <>
      {/* Ambient — warm, soft base */}
      <ambientLight intensity={0.5} color="#f5e8d8" />

      {/* Key light — warm sun through windows, strong shadows */}
      <directionalLight
        position={[3, 5, 2]}
        intensity={2.0}
        color="#ffe4b0"
        castShadow
        shadow-mapSize={2048}
        shadow-bias={-0.0003}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />

      {/* Cool fill from opposite side */}
      <directionalLight position={[-3, 3, -2]} intensity={0.25} color="#c8d0e8" />

      {/* Bounce light from floor */}
      <hemisphereLight args={['#ffecd2', '#4a3520', 0.35]} />

      {/* Warm point light inside — like candlelight */}
      <pointLight position={[0, 1.2, 0]} color="#ffddaa" intensity={0.4} distance={4} decay={2} />

      <CameraSetup />

      <OrbitControls
        target={[0, 0.5, 0]}
        enablePan={false}
        enableZoom={true}
        minZoom={80}
        maxZoom={170}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 3}
        minAzimuthAngle={-Math.PI / 6 + (30 * Math.PI / 180)}
        maxAzimuthAngle={Math.PI / 3 + (30 * Math.PI / 180)}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.3}
        enabled={!isEditMode}
      />

      <Suspense fallback={null}>
        <RoomModel />
      </Suspense>

      {/* Volumetric sunbeams through windows */}
      <SunBeam />
      <SunBeam2 />

      {/* Floating dust in light */}
      <DustParticles count={50} />
    </>
  )
}

export function RoomScene({ isEditMode }: RoomSceneProps) {
  return (
    <div className="relative aspect-square w-full rounded-[28px] overflow-hidden">
      <Canvas
        shadows
        orthographic
        camera={{
          position: [5, 4, 5],
          zoom: 115,
          near: 0.1,
          far: 50,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        style={{ background: '#f5f0ea' }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0.5, 0)
        }}
      >
        <SceneContent isEditMode={isEditMode} />
      </Canvas>

      {/* Edit mode indicator */}
      {isEditMode && (
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-yellow/[0.2] border border-yellow/30 backdrop-blur-sm z-10">
          <span className="font-sans text-[10px] text-yellow/70">Mode edition</span>
        </div>
      )}

      {/* Room state */}
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-green/[0.15] border border-green/20 backdrop-blur-sm z-10">
        <span className="font-sans text-[10px] text-green/60">Propre</span>
      </div>
    </div>
  )
}
