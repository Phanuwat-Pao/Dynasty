import { useWorkerLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import { useEffect } from "react";

export default function ForceAtlas2Layout() {
  const { start, kill } = useWorkerLayoutForceAtlas2({
    settings: { slowDown: 10 },
  });
  useEffect(() => {
    // start FA2
    start();

    // Kill FA2 on unmount
    return () => {
      kill();
    };
  }, [start, kill]);
  return null;
}
