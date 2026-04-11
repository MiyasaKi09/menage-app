'use client'

import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
// import { EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'
// import { Diorama } from './DioramaEffect'

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

// 3D Room model loaded from GLB
function RoomModel() {
  const { scene } = useGLTF('/models/chambre-web.glb')
  const { gl } = useThree()

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        const mesh = child as THREE.Mesh
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        mats.forEach((mat: any) => {
          // Force proper color space on all texture maps
          if (mat.map) {
            mat.map.colorSpace = THREE.SRGBColorSpace
            mat.map.needsUpdate = true
          }
          if (mat.normalMap) mat.normalMap.needsUpdate = true
          if (mat.roughnessMap) mat.roughnessMap.needsUpdate = true
          if (mat.metalnessMap) mat.metalnessMap.needsUpdate = true
          if (mat.aoMap) mat.aoMap.needsUpdate = true
          mat.needsUpdate = true
        })
      }
    })
    gl.render(gl.domElement as any, scene as any) // force re-render
  }, [scene, gl])

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

// Fit camera to model on mount
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

// Post-processing disabled temporarily to debug textures
// function DioramaFilter() {
//   return (
//     <EffectComposer><Diorama /></EffectComposer>
//   )
// }

function SceneContent({ isEditMode }: Pick<RoomSceneProps, 'isEditMode'>) {
  return (
    <>
      {/* Lighting — clean diorama: bright key + soft fill + bounce */}
      <ambientLight intensity={0.8} color="#faf5ef" />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.5}
        color="#fff8f0"
        castShadow
        shadow-mapSize={2048}
        shadow-bias={-0.0005}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-3, 4, -2]} intensity={0.4} color="#e0e4f0" />
      <hemisphereLight args={['#ffffff', '#d8cfc4', 0.5]} />

      <CameraSetup />

      {/* Orbit — very constrained, just subtle rotation */}
      <OrbitControls
        target={[0, 0.5, 0]}
        enablePan={false}
        enableZoom={true}
        minZoom={80}
        maxZoom={170}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 3}
        minAzimuthAngle={-Math.PI / 6 + (70 * Math.PI / 180)}
        maxAzimuthAngle={Math.PI / 3 + (70 * Math.PI / 180)}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.3}
        enabled={!isEditMode}
      />

      <Suspense fallback={null}>
        <RoomModel />
      </Suspense>

      {/* <DioramaFilter /> */}
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
        style={{ background: '#f8f5f0' }}
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
