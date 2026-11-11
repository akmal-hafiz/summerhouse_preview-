"use client";

import { Environment, Float, OrbitControls } from "@react-three/drei";
import { JournalBook } from "./JournalBook";

interface ExperienceProps {
  page: number;
  pages: Array<{ front: string; back: string }>;
  setPage: (n: number) => void;
}

export const JournalExperience = ({ page, pages, setPage }: ExperienceProps) => {
  return (
    <>
      <Float
        rotation-x={-Math.PI / 4}
        floatIntensity={1}
        speed={1}
        rotationIntensity={0.6}
      >
        <JournalBook
          page={page}
          pages={pages}
          setPage={setPage}
          position-y={0.5}
        />
      </Float>
      <OrbitControls
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        enablePan={false}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
      />
      <Environment preset="studio" />
      <directionalLight
        position={[2, 5, 2]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
    </>
  );
};
