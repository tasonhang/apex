"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface DotSphereProps {
  state: "idle" | "listening" | "speaking"
}

function DotSphere({ state }: DotSphereProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.PointsMaterial>(null)
  
  const pointCount = 2000
  
  const positions = useMemo(() => {
    const pos = new Float32Array(pointCount * 3)
    for (let i = 0; i < pointCount; i++) {
      // Fibonacci sphere distribution for even spacing
      const phi = Math.acos(1 - 2 * (i + 0.5) / pointCount)
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5)
      
      const radius = 2
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = radius * Math.cos(phi)
    }
    return pos
  }, [])
  
  useFrame((frameState, delta) => {
    if (!pointsRef.current || !materialRef.current) return
    
    // Base rotation
    const rotationSpeed = state === "idle" ? 0.1 : state === "listening" ? 0.3 : 0.5
    pointsRef.current.rotation.y += delta * rotationSpeed
    pointsRef.current.rotation.x += delta * rotationSpeed * 0.3
    
    // Pulse effect for listening/speaking
    if (state !== "idle") {
      const pulse = Math.sin(frameState.clock.elapsedTime * (state === "listening" ? 3 : 5)) * 0.5 + 0.5
      const baseScale = state === "listening" ? 1 + pulse * 0.1 : 1 + pulse * 0.15
      pointsRef.current.scale.setScalar(baseScale)
      
      // Glow intensity
      materialRef.current.opacity = 0.7 + pulse * 0.3
    } else {
      pointsRef.current.scale.setScalar(1)
      materialRef.current.opacity = 0.8
    }
  })
  
  const color = state === "idle" ? "#3b82f6" : state === "listening" ? "#22c55e" : "#f59e0b"
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={pointCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        color={color}
        size={0.03}
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

interface ApexSphereProps {
  state?: "idle" | "listening" | "speaking"
  className?: string
}

export function ApexSphere({ state = "idle", className }: ApexSphereProps) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <DotSphere state={state} />
      </Canvas>
    </div>
  )
}
