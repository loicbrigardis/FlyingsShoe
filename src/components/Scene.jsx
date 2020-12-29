import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from 'react-three-fiber'
import { useGLTF, OrbitControls, ContactShadows, Environment } from '@react-three/drei'

import { proxy, useProxy } from 'valtio'
import { HexColorPicker } from "react-colorful"
import "react-colorful/dist/index.css"
import { cursor } from "./pickerColorIcon"

import shoeDraco from '../assets/models/shoeDraco.glb'

const state = proxy({
  current: null,
  wireframe: false,
  items: {
    laces: "#4d0000",
    mesh: "#251513",
    caps: "#ffffff",
    inner: "#666666",
    sole: "#4d4d4d",
    stripes: "#4d0000",
    band: "#ffffff",
    patch: "#4d0000",
  }, 
  responsive: {
    xs: window.matchMedia("(max-width: 640px)").matches
  }
})

function Model(props) {
  const shoeRef = useRef()
  const snap = useProxy(state)
  const { nodes, materials } = useGLTF(shoeDraco)
  const [hovered, set] = useState(null)

  useEffect(() => {
    if(hovered) {
      document.body.style.cursor = `url("data:image/svg+xml;base64,${btoa(cursor(snap.items[hovered], hovered))}") 10 48,auto`
    } else {
      document.body.style.cursor = 'grab';
    }
    
  }, [hovered, snap.items])

    useFrame( () => {
      shoeRef.current.rotation.y += 0.003;
    } )

  return (
    <group ref={shoeRef} {...props} dispose={null}
      onPointerOver = { e => { 
        e.stopPropagation(); 
        set(e.object.material.name)
        if(snap.wireframe === true) {
          e.object.material.wireframe = true;
        }
        } }
      onPointerOut = { e => { 
        e.intersections.length === 0 && set(null) 
        e.object.material.wireframe = false;
        } }
      onPointerDown = { e => { e.stopPropagation(); state.current = e.object.material.name } }
      onPointerMissed = { e => { state.current = null } }
    >
      <mesh material={materials.mesh} material-color={snap.items.mesh} geometry={nodes.shoe.geometry} />
      <mesh material={materials.sole} material-color={snap.items.sole} geometry={nodes.shoe_1.geometry} />
      <mesh material={materials.stripes} material-color={snap.items.stripes} geometry={nodes.shoe_2.geometry} />
      <mesh material={materials.band} material-color={snap.items.band} geometry={nodes.shoe_3.geometry} />
      <mesh material={materials.caps} material-color={snap.items.caps} geometry={nodes.shoe_4.geometry} />
      <mesh material={materials.patch} material-color={snap.items.patch} geometry={nodes.shoe_5.geometry} />
      <mesh material={materials.inner} material-color={snap.items.inner} geometry={nodes.shoe_6.geometry} />
      <mesh material={materials.laces} material-color={snap.items.laces} geometry={nodes.shoe_7.geometry} />
    </group>
  )
}

function Picker() {
  const snap = useProxy(state)
  return (
    <div className="panel">
      <div className="color-panel" style={{ display: snap.current ? "block" : "none" }}>
        <HexColorPicker 
          className="picker" 
          color={snap.items[snap.current]}
          onChange={ color => ( state.items[snap.current] = color ) }
        />
        <p className="wireframe">
          <input type="checkbox" id="chkwireframe" onClick={ (e) => state.wireframe = e.target.checked } />
          <label htmlFor="chkwireframe">Wireframe</label>
        </p>
        <h1>{snap.current}</h1>
      </div>
    </div>
  )
}

function Box() {
  const boxRef = useRef()

  useFrame(() => {
    if(boxRef) {
      boxRef.current.rotation.x += 0.01
      boxRef.current.rotation.y += 0.01
    }
  } )
  return (
    <mesh ref={boxRef}>
      <boxBufferGeometry attach="geometry" args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial attach="material" transparent opacity={0.5} />
    </mesh>
  )
}

export default function Scene() {
    const snap = useProxy(state)

    return (
        <>
          <Picker />
          <Canvas concurrent pixelRatio={[1, 1.5]} camera={{ position: [0, 0, 1.8] }}>
              <ambientLight />
              <spotLight intensity={0.3} angle={0.1} penumbra={1} position={[5, 25, 20]} />
              <Suspense fallback={<Box />}>
                <Model position={[0, snap.responsive.xs ? 0 : 0.2,0]} />
                <Environment files="royal.hdr" />
                <ContactShadows rotation-x={Math.PI / 2} position={[0, -0.5, 0]} opacity={0.25} width={10} height={10} blur={2} far={1} />
              </Suspense>
              <OrbitControls minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} enableZoom={false} enablePan={false} />
          </Canvas>
        </>
    )
}