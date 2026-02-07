import { isRouteErrorResponse } from "react-router";
import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import {
  AsciiRenderer,
  Center,
  Environment,
  OrbitControls,
  Text3D,
} from "@react-three/drei";
import type { Route } from "./+types/index";
import { UserPage } from "~/components/templates/UserPage";
import { NotFoundView } from "~/components/templates/NotFoundView";
import { getPageBySlug } from "~/data/profiles";

const DOMAIN_SUFFIX = ".lilink.link";

const getSlugFromHost = (hostname: string) => {
  if (hostname.endsWith(DOMAIN_SUFFIX)) {
    const slug = hostname.slice(0, -DOMAIN_SUFFIX.length);
    return slug.length > 0 ? slug : null;
  }
  return null;
};

const getHostnameFromRequest = (request: Request) => {
  return (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("cf-connecting-host") ??
    new URL(request.url).hostname
  );
};

export const loader: Route.LoaderFunction = async ({ request }) => {
  const hostname = getHostnameFromRequest(request);
  const slug = getSlugFromHost(hostname);

  if (!slug) {
    return { page: null };
  }

  const page = await getPageBySlug(slug);
  if (!page) {
    throw new Response("プロフィールが見つかりません。", { status: 404 });
  }

  return { page };
};

export default function IndexRoute({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;
  if (!page) {
    return <AsciiLandingPage />;
  }
  return <UserPage page={page} />;
}

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

function generateDots(count: number): string {
  const shadows = [];
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 3;
    const y = (Math.random() - 0.5) * 3;
    const hue = Math.random() * 360;
    shadows.push(`${x}em ${y}em 7px hsla(${hue}, 100%, 50%, 0.9)`);
  }
  return shadows.join(", ");
}

function AsciiLandingPage() {
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

      <div className="dot-layer dot-layer-1" />
      <div className="dot-layer dot-layer-2" />
      <div className="dot-layer dot-layer-3" />
      <div className="dot-layer dot-layer-4" />

      <Canvas
        className="relative z-10"
        style={{ touchAction: "none" }}
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
            fgColor="#f4f7ff"
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
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
        />
      </Canvas>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundView />;
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid grid-cols-12 gap-6 text-center">
          <div className="col-span-12 md:col-start-3 md:col-span-8">
            <div className="grid grid-cols-12 gap-4">
              <p className="col-span-12 text-xs tracking-[0.5em] text-lilink-muted">
                エラー
              </p>
              <h1 className="col-span-12 text-2xl font-semibold">
                表示に失敗しました
              </h1>
              <p className="col-span-12 text-sm text-lilink-muted">
                お手数ですが、時間をおいてもう一度お試しください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
