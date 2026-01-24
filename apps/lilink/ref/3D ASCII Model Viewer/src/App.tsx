import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  AsciiRenderer,
  Environment,
  Text3D,
  Center,
} from "@react-three/drei";

function TextModel() {
  return (
    <Center>
      <Text3D
        font="https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"
        size={1}
        height={0.3}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.02}
        bevelSize={0.02}
        bevelOffset={0}
        bevelSegments={5}
        scale={0.5}
        rotation={[0, 0, 0]}
        position={[0, 0, 0]}
      >
        lilink.link
        <meshNormalMaterial />
      </Text3D>
    </Center>
  );
}

// Generate random dots with text-shadow
function generateDots(count: number): string {
  const shadows = [];
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 3;
    const y = (Math.random() - 0.5) * 3;
    const hue = Math.random() * 360;
    shadows.push(
      `${x}em ${y}em 7px hsla(${hue}, 100%, 50%, 0.9)`
    );
  }
  return shadows.join(", ");
}

export default function App() {
  const [dots1] = useState(generateDots(40));
  const [dots2] = useState(generateDots(40));
  const [dots3] = useState(generateDots(40));
  const [dots4] = useState(generateDots(40));

  return (
    <div className="w-full h-screen relative overflow-hidden bg-[#123]">
      <style>{`
        .dot-layer {
          position: fixed;
          top: 50%;
          left: 50%;
          width: 3em;
          height: 3em;
          font-size: 52px;
          color: transparent;
          mix-blend-mode: screen;
        }
        
        .dot-layer::before {
          content: '.';
        }
        
        .dot-layer-1 {
          text-shadow: ${dots1};
          animation: move1 44s -27s infinite ease-in-out alternate;
        }
        
        .dot-layer-2 {
          text-shadow: ${dots2};
          animation: move2 43s -32s infinite ease-in-out alternate;
        }
        
        .dot-layer-3 {
          text-shadow: ${dots3};
          animation: move3 42s -23s infinite ease-in-out alternate;
        }
        
        .dot-layer-4 {
          text-shadow: ${dots4};
          animation: move4 41s -19s infinite ease-in-out alternate;
        }
        
        @keyframes move1 {
          from {
            transform: rotate(0deg) scale(12) translateX(-20px);
          }
          to {
            transform: rotate(360deg) scale(18) translateX(20px);
          }
        }
        
        @keyframes move2 {
          from {
            transform: rotate(0deg) scale(12) translateX(-20px);
          }
          to {
            transform: rotate(360deg) scale(18) translateX(20px);
          }
        }
        
        @keyframes move3 {
          from {
            transform: rotate(0deg) scale(12) translateX(-20px);
          }
          to {
            transform: rotate(360deg) scale(18) translateX(20px);
          }
        }
        
        @keyframes move4 {
          from {
            transform: rotate(0deg) scale(12) translateX(-20px);
          }
          to {
            transform: rotate(360deg) scale(18) translateX(20px);
          }
        }
      `}</style>

      {/* Animated dot layers */}
      <div className="dot-layer dot-layer-1" />
      <div className="dot-layer dot-layer-2" />
      <div className="dot-layer dot-layer-3" />
      <div className="dot-layer dot-layer-4" />

      {/* 3D Canvas - Full Screen */}
      <Canvas
        className="relative z-10"
        camera={{
          position: [0, 0, 6],
          fov: 50,
        }}
        gl={{ preserveDrawingBuffer: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        <Suspense fallback={null}>
          <TextModel />
          <Environment preset="studio" />
        </Suspense>

        <Suspense fallback={null}>
          <AsciiRenderer
            resolution={0.22}
            characters=" .:-=+*#%@"
            fgColor="#ffffff"
            bgColor="transparent"
            invert={false}
          />
        </Suspense>

        <OrbitControls
          autoRotate={true}
          autoRotateSpeed={2}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          touches={{
            ONE: 2, // TOUCH_ROTATE
            TWO: 1, // TOUCH_DOLLY_PAN
          }}
        />
      </Canvas>
    </div>
  );
}