import { Suspense } from "react";
import { SpeakFlowApp } from "@/components/speakflow-app";

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F8FC]" />}>
      <SpeakFlowApp />
    </Suspense>
  );
}
