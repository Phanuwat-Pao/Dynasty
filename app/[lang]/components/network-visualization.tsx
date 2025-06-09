"use client";
import dynamic from "next/dynamic";
import { NetworkVisualizationProps } from "./network-visualization-inner";
const NetworkVisualizationInner = dynamic(
  () => import("./network-visualization-inner"),
  { ssr: false },
);

export default function NetworkVisualization(props: NetworkVisualizationProps) {
  return <NetworkVisualizationInner {...props} />;
}
