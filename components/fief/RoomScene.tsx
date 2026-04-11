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

// Blown-out emissive window + point light pushing into the room
function WindowGlow({ position, rotation = [0, 0, 0], size = [0.35, 0.6] }: {
  position: [number, number, number]
  rotation?: [number, number, number]
  size?: [number, number]
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Bright emissive plane — the "overexposed sky" behind the window */}
      <mesh>
        <planeGeometry args={size} />
        <meshStandardMaterial
          color="#fff5e0"
          emissive="#fff5e0"
          emissiveIntensity={3.0}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Point light casting warm light into the room */}
      <pointLight
        color="#ffe8c0"
        intensity={0.8}
        distance={5}
        decay={2}
      />
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

// DEBUG: click on windows to get exact coordinates
function DebugClickHandler() {
  const { camera, scene, raycaster } = useThree()

  useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      )
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(scene.children, true)
      if (hits[0]) {
        const p = hits[0].point
        const n = hits[0].face?.normal
        console.log(
          `CLICK pos=[${p.x.toFixed(3)}, ${p.y.toFixed(3)}, ${p.z.toFixed(3)}]`,
          n ? `normal=[${n.x.toFixed(2)}, ${n.y.toFixed(2)}, ${n.z.toFixed(2)}]` : ''
        )
      }
    }

    canvas.addEventListener('click', handleClick)
    return () => canvas.removeEventListener('click', handleClick)
  }, [camera, scene, raycaster])

  return null
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
      <ambientLight intensity={0.6} color="#e8d8c0" />

      {/* ====== KEY LIGHT — warm white from upper-left-back, ~45° ====== */}
      <directionalLight
        position={[-3, 5, -2]}
        intensity={1.3}
        color="#ffeac0"
        castShadow
        shadow-mapSize={2048}
        shadow-bias={-0.0004}
        shadow-radius={4}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />

      {/* ====== FILL — subtle cool from front-right ====== */}
      <directionalLight position={[4, 3, 4]} intensity={0.25} color="#c0d0e0" />

      {/* ====== HEMISPHERE — warm sky / warm ground ====== */}
      <hemisphereLight args={['#f5e6c8', '#a09070', 0.4]} />

      {/* ====== DEBUG: click to find window positions ====== */}
      <DebugClickHandler />

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
        <Vignette offset={0.35} darkness={0.2} />
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
          toneMappingExposure: 1.2,
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
