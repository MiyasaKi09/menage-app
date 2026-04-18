'use client'

import { Suspense, useEffect, useRef, useMemo, useState } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, SpotLight } from '@react-three/drei'
import { EffectComposer, Bloom, N8AO, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { VolumetricLightEffectImpl } from './VolumetricLightEffect'

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

// 3D Room model — lighten materials to match ref
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
          // Warm tint: lerp 20% toward beige (less bleaching than before)
          if (mat.color) {
            mat.color.lerp(new THREE.Color('#f0e8d8'), 0.2)
          }
          // Clamp emissive — prevents GLB window glass from burning white
          if (mat.emissive && mat.emissiveIntensity > 0) {
            mat.emissiveIntensity = Math.min(mat.emissiveIntensity, 0.12)
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

// Volumetric window beam using drei SpotLight — the beam IS the light, derived from its physics
function WindowBeam({ position, targetPos }: {
  position: [number, number, number]
  targetPos: [number, number, number]
}) {
  const target = useMemo(() => {
    const obj = new THREE.Object3D()
    obj.position.set(...targetPos)
    return obj
  }, []) // eslint-disable-line

  return (
    <>
      <primitive object={target} />
      <SpotLight
        position={position}
        target={target}
        angle={Math.PI / 10}
        penumbra={0.4}
        distance={4.5}
        intensity={60}
        color="#ffe8b0"
        attenuation={4.5}
        anglePower={5}
        castShadow={false}
      />
    </>
  )
}

// Subtle dust motes — additive blended
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
        size={0.015}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Scene setup — warm environment map + fog + camera
function SceneSetup() {
  const { scene, camera, gl } = useThree()

  useEffect(() => {
    // Build a warm environment map from a solid color sphere — simulates GI
    const pmrem = new THREE.PMREMGenerator(gl)
    const envScene = new THREE.Scene()
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(50),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xf0e0c8),
        side: THREE.BackSide,
      })
    )
    envScene.add(sphere)
    const envRT = pmrem.fromScene(envScene)
    scene.environment = envRT.texture
    pmrem.dispose()

    // Subtle atmospheric fog
    scene.fog = new THREE.FogExp2(0xede0c8, 0.05)

    // Camera — at center of orbit freedom (azimuth 0 = position on +Z axis)
    camera.position.set(0, 4, 7.07)
    camera.lookAt(0, 0.8, 0)
    if ((camera as THREE.OrthographicCamera).zoom !== undefined) {
      (camera as THREE.OrthographicCamera).zoom = 180
      camera.updateProjectionMatrix()
    }

    return () => {
      envRT.dispose()
      sphere.geometry.dispose()
      ;(sphere.material as THREE.Material).dispose()
    }
  }, [scene, camera, gl])

  return null
}

// Bias matrix: NDC [-1,1] → UV [0,1]
const BIAS_MATRIX = new THREE.Matrix4().set(
  0.5, 0.0, 0.0, 0.5,
  0.0, 0.5, 0.0, 0.5,
  0.0, 0.0, 0.5, 0.5,
  0.0, 0.0, 0.0, 1.0,
)

function SceneContent({ isEditMode }: Pick<RoomSceneProps, 'isEditMode'>) {
  const { camera, scene, gl } = useThree()
  const keyLightRef = useRef<THREE.DirectionalLight>(null)
  const [volumetric, setVolumetric] = useState<VolumetricLightEffectImpl | null>(null)

  // Custom light depth render target + camera (independent of Three.js shadow map)
  const lightDepthRef = useRef<{
    rt: THREE.WebGLRenderTarget
    camera: THREE.OrthographicCamera
    overrideMat: THREE.MeshBasicMaterial
    shadowMatrix: THREE.Matrix4
    lightDir: THREE.Vector3
  } | null>(null)

  useEffect(() => {
    // Build depth render target with DepthTexture attached
    const rt = new THREE.WebGLRenderTarget(1024, 1024, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    })
    rt.depthTexture = new THREE.DepthTexture(1024, 1024)
    rt.depthTexture.type = THREE.UnsignedIntType
    rt.depthTexture.format = THREE.DepthFormat

    const lightCam = new THREE.OrthographicCamera(-8, 8, 8, -8, 0.1, 30)

    lightDepthRef.current = {
      rt,
      camera: lightCam,
      overrideMat: new THREE.MeshBasicMaterial(),
      shadowMatrix: new THREE.Matrix4(),
      lightDir: new THREE.Vector3(),
    }

    return () => {
      rt.dispose()
      rt.depthTexture?.dispose()
    }
  }, [])

  // Create volumetric effect
  useEffect(() => {
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|Android/i.test(navigator.userAgent)
    const fx = new VolumetricLightEffectImpl(camera, {
      density: 0.08,
      scattering: 0.7,
      maxDistance: 12.0,
      steps: isMobile ? 32 : 64,
      phaseG: 0.75,
      lightColor: [1.0, 0.91, 0.68],
      debugMode: 0,
    })
    setVolumetric(fx)
    if (typeof window !== 'undefined') {
      (window as any).volumetric = fx
    }
    return () => {
      fx.dispose?.()
      if (typeof window !== 'undefined') delete (window as any).volumetric
    }
  }, [camera])

  // Each frame BEFORE the composer: render scene depth from light's POV
  useFrame(() => {
    const light = keyLightRef.current
    const ld = lightDepthRef.current
    if (!light || !ld || !volumetric) return

    // Position the light camera at the light's world position, looking at origin
    const lightWorldPos = new THREE.Vector3()
    light.getWorldPosition(lightWorldPos)
    ld.camera.position.copy(lightWorldPos)
    ld.camera.lookAt(0, 0, 0)
    ld.camera.updateMatrixWorld(true)
    ld.camera.updateProjectionMatrix()

    // Render scene depth from light POV
    const prevRT = gl.getRenderTarget()
    const prevOverride = scene.overrideMaterial

    scene.overrideMaterial = ld.overrideMat
    gl.setRenderTarget(ld.rt)
    gl.clear()
    gl.render(scene, ld.camera)

    scene.overrideMaterial = prevOverride
    gl.setRenderTarget(prevRT)

    // Build shadow matrix: world → light clip → UV [0,1]
    ld.shadowMatrix
      .copy(BIAS_MATRIX)
      .multiply(ld.camera.projectionMatrix)
      .multiply(ld.camera.matrixWorldInverse)

    // Light direction (from origin toward light)
    ld.lightDir.copy(lightWorldPos).normalize()

    // Feed to effect
    if (ld.rt.depthTexture) {
      volumetric.setShadowData(ld.rt.depthTexture, ld.shadowMatrix, ld.lightDir)
    }
  }, -1) // priority -1 → runs BEFORE the auto-render (priority > 0 would take over)

  return (
    <>
      {/* ====== GI-SIMULATED LIGHTING ====== */}

      {/* 1. Key directional — warm sun, soft shadows (source of volumetric rays) */}
      <directionalLight
        ref={keyLightRef}
        position={[-5, 8, -3]}
        intensity={2.8}
        color="#ffe8b0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-radius={16}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />

      {/* 2. Weak camera fill — just enough to see back walls */}
      <directionalLight position={[5, 5, 5]} intensity={0.25} color="#f0e0c0" />

      {/* 3. Side bounce — very subtle */}
      <directionalLight position={[4, 3, -2]} intensity={0.15} color="#e8d8c0" />

      {/* 4. Back fill — barely there */}
      <directionalLight position={[0, 2, -5]} intensity={0.08} color="#d0c0a0" />

      {/* 5. Ground bounce — warm floor reflection */}
      <pointLight position={[0, -0.5, 0]} intensity={0.15} color="#d4c4a0" distance={5} decay={1} />

      {/* 6. Hemisphere — very low, mainly for sky color tint */}
      <hemisphereLight args={['#f0e0c8', '#b0a080', 0.15]} />

      {/* 7. Ambient — minimum so shadows aren't pitch black */}
      <ambientLight intensity={0.06} color="#c8b898" />

      {/* ====== WINDOW BEAMS — drei SpotLight, beam IS the light ====== */}
      {/* Left window: spotlight outside wall → floor */}
      <WindowBeam position={[-2.1, 1.6, -0.1]} targetPos={[-0.5, 0, 0.3]} />
      {/* Center window */}
      <WindowBeam position={[-0.2, 1.6, -2.2]} targetPos={[0.3, 0, -0.9]} />
      {/* Right window */}
      <WindowBeam position={[0.7, 1.6, -2.1]} targetPos={[1.0, 0, -0.7]} />

      {/* ====== CAMERA + ORBIT ====== */}
      <SceneSetup />
      <OrbitControls
        makeDefault
        target={[0, 0.8, 0]}
        enablePan={false}
        enableZoom={true}
        minZoom={120}
        maxZoom={260}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 3}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
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
      <DustMotes count={350} />


      {/* ====== POST-PROCESSING ====== */}
      <EffectComposer key={volumetric ? 'with-vol' : 'no-vol'}>
        {/* SSAO — contact shadows in stone joints and corners */}
        <N8AO
          aoRadius={1.2}
          intensity={4.0}
          distanceFalloff={0.5}
          color={new THREE.Color('#7a6a50')}
        />
        {/* Volumetric light rays — ray-marched through shadow map */}
        {volumetric ? <primitive object={volumetric} dispose={null} /> : <></>}
        {/* Bloom — window glow + ray highlights */}
        <Bloom
          intensity={0.35}
          luminanceThreshold={0.75}
          radius={0.9}
          blendFunction={BlendFunction.SCREEN}
        />
        {/* Vignette — Ghibli cinematic frame */}
        <Vignette offset={0.35} darkness={0.3} />
      </EffectComposer>
    </>
  )
}

export function RoomScene({ isEditMode }: RoomSceneProps) {
  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        orthographic
        camera={{
          position: [0, 4, 7.07],
          zoom: 180,
          near: 0.1,
          far: 50,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
        }}
        style={{ background: 'transparent' }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0.8, 0)
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
