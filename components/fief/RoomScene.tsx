'use client'

import { Suspense, useEffect, useRef, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
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
          // Lighten all materials 35% toward warm beige — softbox look
          if (mat.color) {
            mat.color.lerp(new THREE.Color('#f0e8d8'), 0.35)
          }
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

function WindowGlow({ position, rotation = [0, 0, 0], size = [0.3, 0.5] }: {
  position: [number, number, number]
  rotation?: [number, number, number]
  size?: [number, number]
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={size} />
        <meshStandardMaterial
          color="#fff5e0"
          emissive="#ffffff"
          emissiveIntensity={4.0}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight color="#ffe8c0" intensity={1.0} distance={5} decay={2} />
    </group>
  )
}

// Subtle dust motes in light beams — additive blended points
function DustMotes({ count = 200 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 2.5
      arr[i * 3 + 1] = Math.random() * 1.6 + 0.05
      arr[i * 3 + 2] = (Math.random() - 0.5) * 2.5
    }
    return arr
  }, [count])

  const basePositions = useRef(positions.slice())

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const t = clock.elapsedTime
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = posAttr.array as Float32Array
    const base = basePositions.current

    for (let i = 0; i < count; i++) {
      const d = i * 0.13
      arr[i * 3] = base[i * 3] + Math.sin(t * 0.06 + d) * 0.03
      arr[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.04 + d * 0.7) * 0.02
      arr[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.05 + d * 0.5) * 0.03
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#fff8d8"
        size={0.012}
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Camera — orthographic isometric
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
      {/* ====== AMBIENT — strong warm, no area truly dark ====== */}
      <ambientLight intensity={0.9} color="#ede0c0" />

      {/* ====== KEY LIGHT — warm white from upper-left-back, ~45° ====== */}
      <directionalLight
        position={[-3, 5, -2]}
        intensity={1.0}
        color="#fff0d0"
        castShadow
        shadow-mapSize={2048}
        shadow-bias={-0.0004}
        shadow-radius={8}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />

      {/* ====== FILL — subtle cool from front-right ====== */}
      <directionalLight position={[4, 3, 4]} intensity={0.5} color="#f0e4d0" />

      {/* ====== HEMISPHERE — warm sky / warm ground ====== */}
      <hemisphereLight args={['#f5e6c8', '#c0a880', 0.6]} />

      {/* ====== WINDOW GLOWS — exact R3F raycasted positions, pushed behind walls ====== */}
      {/* Left wall window — push -0.2 in X (behind wall) */}
      <WindowGlow position={[-1.55, 0.962, -0.337]} rotation={[0, Math.PI / 2, 0]} size={[0.3, 0.5]} />
      {/* Back wall windows — push -0.2 in Z (behind wall) */}
      <WindowGlow position={[-0.333, 0.972, -1.55]} rotation={[0, 0, 0]} size={[0.3, 0.5]} />
      <WindowGlow position={[0.505, 0.985, -1.43]} rotation={[0, 0, 0]} size={[0.3, 0.5]} />

      {/* ====== CAMERA + ORBIT ====== */}
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

      {/* ====== ROOM MODEL ====== */}
      <Suspense fallback={null}>
        <RoomModel />
      </Suspense>

      {/* ====== DUST MOTES ====== */}
      <DustMotes count={180} />

      {/* ====== POST-PROCESSING — clean and bright ====== */}
      <EffectComposer>
        <Bloom
          intensity={0.15}
          luminanceThreshold={0.9}
          radius={0.3}
          blendFunction={BlendFunction.SCREEN}
        />
        <Vignette offset={0.35} darkness={0.1} />
      </EffectComposer>
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
          toneMappingExposure: 1.8,
        }}
        style={{
          background: 'linear-gradient(180deg, #f5e6c8 0%, #ede0c0 100%)',
        }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0.5, 0)
        }}
      >
        <SceneContent isEditMode={isEditMode} />
      </Canvas>

      {isEditMode && (
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-yellow/[0.2] border border-yellow/30 backdrop-blur-sm z-10">
          <span className="font-sans text-[10px] text-yellow/70">Mode edition</span>
        </div>
      )}

      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-green/[0.15] border border-green/20 backdrop-blur-sm z-10">
        <span className="font-sans text-[10px] text-green/60">Propre</span>
      </div>
    </div>
  )
}
