'use client'

import { Suspense, useEffect, useRef, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, N8AO, Vignette, HueSaturation, BrightnessContrast } from '@react-three/postprocessing'
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

// Bright blown-out area light behind each window opening
// Simulates overexposed exterior sky flooding in
function WindowLight({ position, size = [0.5, 0.8] }: { position: [number, number, number]; size?: [number, number] }) {
  return (
    <group position={position}>
      {/* Emissive plane — the "blown out sky" visible through the window */}
      <mesh>
        <planeGeometry args={size} />
        <meshBasicMaterial color="#fff8e8" transparent opacity={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Strong point light pushing light into the room */}
      <pointLight color="#fff0d0" intensity={1.5} distance={4} decay={1.5} />
    </group>
  )
}

// Floating dust particles — subtle, small, golden
function DustParticles({ count = 60 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 2.2,
      y: Math.random() * 1.5 + 0.15,
      z: (Math.random() - 0.5) * 2.2,
      speed: 0.01 + Math.random() * 0.025,
      drift: Math.random() * Math.PI * 2,
      size: 0.004 + Math.random() * 0.008,
    }))
  }, [count])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime
    const dummy = new THREE.Object3D()

    particles.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(t * p.speed + p.drift) * 0.2,
        p.y + Math.sin(t * p.speed * 0.5 + p.drift) * 0.1,
        p.z + Math.cos(t * p.speed * 0.3 + p.drift) * 0.2,
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
      <meshBasicMaterial color="#fff8d0" transparent opacity={0.5} />
    </instancedMesh>
  )
}

// Camera setup
function CameraSetup() {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(8, 6, 8)
    camera.lookAt(0, 0.5, 0)
  }, [camera])

  return null
}

function SceneContent({ isEditMode }: Pick<RoomSceneProps, 'isEditMode'>) {
  return (
    <>
      {/* ============================================ */}
      {/* LIGHTING — matching the diorama reference    */}
      {/* ============================================ */}

      {/* Ambient — generous, no deep blacks anywhere.
          Warm tone so darkest shadow stays brown-medium */}
      <ambientLight intensity={0.6} color="#e8d8c4" />

      {/* Key light — warm ~4500K directional from top-left-back,
          45-50° elevation. Creates soft shadows on floor + gradient on right wall */}
      <directionalLight
        position={[-3, 5, -2]}
        intensity={1.8}
        color="#f5deb3"
        castShadow
        shadow-mapSize={2048}
        shadow-bias={-0.0005}
        shadow-radius={8}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />

      {/* Secondary fill — very soft, from the front-right to lift shadows */}
      <directionalLight position={[4, 3, 4]} intensity={0.4} color="#f0e4d0" />

      {/* Hemisphere — warm sky bounce / warm ground bounce
          No cold tones — everything stays in beige-brown palette */}
      <hemisphereLight args={['#f5e8d0', '#8b7355', 0.5]} />

      {/* ============================================ */}
      {/* WINDOW LIGHTS — the key visual effect        */}
      {/* Strong blown-out white-warm light from behind */}
      {/* each window, like overexposed exterior sky    */}
      {/* ============================================ */}

      {/* These positions need to match the window openings in the GLB model.
          Adjust after seeing the result. The model is rotated 0.25π. */}
      <WindowLight position={[-0.8, 1.2, -1.3]} size={[0.4, 0.7]} />
      <WindowLight position={[0.5, 1.2, -1.3]} size={[0.4, 0.7]} />
      <WindowLight position={[1.2, 1.2, -0.5]} size={[0.4, 0.7]} />

      {/* ============================================ */}
      {/* CAMERA + CONTROLS                            */}
      {/* ============================================ */}

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

      {/* ============================================ */}
      {/* SCENE                                        */}
      {/* ============================================ */}

      <Suspense fallback={null}>
        <RoomModel />
      </Suspense>

      <DustParticles count={60} />

      {/* ============================================ */}
      {/* POST-PROCESSING                              */}
      {/* Bloom for blown-out windows, AO for stone    */}
      {/* joints, vignette, warm color grade            */}
      {/* ============================================ */}

      <EffectComposer>
        {/* Bloom — makes the window lights glow and bleed,
            creating the overexposed/blown-out look */}
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
          kernelSize={KernelSize.LARGE}
          blendFunction={BlendFunction.SCREEN}
        />
        {/* AO — subtle, reinforces stone joints and base shadows */}
        <N8AO
          aoRadius={0.3}
          intensity={1.0}
          distanceFalloff={0.3}
        />
        {/* Color grade — push everything toward sand/ochre palette */}
        <HueSaturation
          hue={0.05}
          saturation={-0.15}
        />
        <BrightnessContrast
          brightness={0.02}
          contrast={-0.05}
        />
        {/* Vignette — subtle edge darkening */}
        <Vignette offset={0.3} darkness={0.3} />
      </EffectComposer>
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
          toneMappingExposure: 1.15,
        }}
        style={{
          background: 'linear-gradient(180deg, #f2e8d4 0%, #e8dcc4 50%, #ddd0b8 100%)',
        }}
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
