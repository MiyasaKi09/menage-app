'use client'

import { Suspense, useEffect, useRef, useMemo, useState } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { EffectComposer, GodRays, Bloom, N8AO, Vignette } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
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

// Sun source mesh for GodRays — positioned behind window
function SunSource({ sunRef }: { sunRef: React.RefObject<THREE.Mesh | null> }) {
  return (
    <mesh ref={sunRef} position={[2.5, 2.2, -2.5]}>
      <sphereGeometry args={[0.25, 16, 16]} />
      <meshBasicMaterial color="#fff4d0" transparent opacity={0.85} />
    </mesh>
  )
}

// Floating dust particles concentrated in light beams
function DustParticles({ count = 80 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      // Concentrate near center/window area
      x: (Math.random() - 0.3) * 2.0,
      y: Math.random() * 1.6 + 0.1,
      z: (Math.random() - 0.3) * 2.0,
      speed: 0.015 + Math.random() * 0.03,
      drift: Math.random() * Math.PI * 2,
      size: 0.005 + Math.random() * 0.01,
    }))
  }, [count])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime
    const dummy = new THREE.Object3D()

    particles.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(t * p.speed + p.drift) * 0.25,
        p.y + Math.sin(t * p.speed * 0.6 + p.drift) * 0.12,
        p.z + Math.cos(t * p.speed * 0.4 + p.drift) * 0.25,
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
      <meshBasicMaterial color="#fffae0" transparent opacity={0.6} />
    </instancedMesh>
  )
}

// Camera setup
function CameraSetup() {
  const { camera } = useThree()

  useEffect(() => {
    // Perspective camera — position further back with low FOV for iso look
    camera.position.set(8, 6, 8)
    camera.lookAt(0, 0.5, 0)
  }, [camera])

  return null
}

// Post-processing pipeline
function PostProcessing({ sunRef }: { sunRef: React.RefObject<THREE.Mesh | null> }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Wait for ref to be populated
    if (sunRef.current) setReady(true)
  })

  if (!ready || !sunRef.current) return null

  return (
    <EffectComposer>
      <GodRays
        sun={sunRef.current}
        samples={80}
        density={0.97}
        decay={0.95}
        weight={0.5}
        exposure={0.35}
        clampMax={1}
        blur
        kernelSize={KernelSize.SMALL}
        blendFunction={BlendFunction.SCREEN}
      />
      <Bloom
        intensity={0.25}
        luminanceThreshold={0.75}
        luminanceSmoothing={0.9}
        kernelSize={KernelSize.LARGE}
      />
      <N8AO
        aoRadius={0.4}
        intensity={1.2}
        distanceFalloff={0.5}
      />
      <Vignette offset={0.25} darkness={0.35} />
    </EffectComposer>
  )
}

function SceneContent({ isEditMode }: Pick<RoomSceneProps, 'isEditMode'>) {
  const sunRef = useRef<THREE.Mesh>(null)

  return (
    <>
      {/* Ambient — lower for more contrast, warm tone */}
      <ambientLight intensity={0.35} color="#e8ddd0" />

      {/* Key light — strong warm sun entering through windows */}
      <directionalLight
        position={[3, 5, 2]}
        intensity={2.5}
        color="#ffe0a0"
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

      {/* Cool fill — subtle, opposite side */}
      <directionalLight position={[-3, 3, -2]} intensity={0.15} color="#b8c0d8" />

      {/* Hemisphere — warm sky / dark floor bounce */}
      <hemisphereLight args={['#ffecd2', '#3a2818', 0.3]} />

      {/* Interior warm glow */}
      <pointLight position={[0, 1.2, 0]} color="#ffddaa" intensity={0.3} distance={4} decay={2} />

      <CameraSetup />

      <OrbitControls
        target={[0, 0.5, 0]}
        enablePan={false}
        enableZoom={true}
        minDistance={8}
        maxDistance={16}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 3}
        minAzimuthAngle={-Math.PI / 6 + (30 * Math.PI / 180)}
        maxAzimuthAngle={Math.PI / 3 + (30 * Math.PI / 180)}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.3}
        enabled={!isEditMode}
      />

      {/* Sun source for god rays */}
      <SunSource sunRef={sunRef} />

      <Suspense fallback={null}>
        <RoomModel />
      </Suspense>

      {/* Dust particles in light beams */}
      <DustParticles count={70} />

      {/* Post-processing: god rays + bloom + AO + vignette */}
      <PostProcessing sunRef={sunRef} />
    </>
  )
}

export function RoomScene({ isEditMode }: RoomSceneProps) {
  return (
    <div className="relative aspect-square w-full rounded-[28px] overflow-hidden">
      <Canvas
        shadows
        camera={{
          fov: 25,
          position: [8, 6, 8],
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        style={{ background: '#f0ebe4' }}
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
