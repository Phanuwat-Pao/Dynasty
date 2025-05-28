"use client";
import { api } from "@/convex/_generated/api";
import { Dictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import "@react-sigma/core/lib/style.css";
import type { GraphSearchOption } from "@react-sigma/graph-search";
import "@react-sigma/graph-search/lib/style.css";
import type { Preloaded } from "convex/react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
const ForceAtlas2Layout = dynamic(() => import("./force-atlas-2-layout"), {
  ssr: false,
});

const LoadRelationshipGraph = dynamic(
  () => import("./load-relationship-graph"),
  { ssr: false },
);

const SigmaContainer = dynamic(
  () => import("@react-sigma/core").then((mod) => mod.SigmaContainer),
  { ssr: false },
);

const ControlsContainer = dynamic(
  () => import("@react-sigma/core").then((mod) => mod.ControlsContainer),
  { ssr: false },
);

const ZoomControl = dynamic(
  () => import("@react-sigma/core").then((mod) => mod.ZoomControl),
  { ssr: false },
);

const FullScreenControl = dynamic(
  () => import("@react-sigma/core").then((mod) => mod.FullScreenControl),
  { ssr: false },
);

const FocusOnNode = dynamic(() => import("./focus-on-node"), { ssr: false });

const GraphSearch = dynamic(
  () => import("@react-sigma/graph-search").then((mod) => mod.GraphSearch),
  { ssr: false },
);

// Component that display the graph
export default function NetworkVisualization({
  locale,
  preloadPeople,
  preloadRelationships,
  relationshipTypes,
}: {
  locale: Locale;
  preloadPeople: Preloaded<typeof api.people.listPeople>;
  preloadRelationships: Preloaded<typeof api.relationships.listRelationships>;
  relationshipTypes: Dictionary["relationshipTypes"];
}) {
  const [isClient, setIsClient] = useState(false);
  const { theme } = useTheme();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [focusNode, setFocusNode] = useState<string | null>(null);
  useEffect(() => {
    setIsClient(true);
  }, []);
  const onFocus = useCallback((value: GraphSearchOption | null) => {
    if (value === null) setFocusNode(null);
    else if (value.type === "nodes") setFocusNode(value.id);
  }, []);

  const onChange = useCallback((value: GraphSearchOption | null) => {
    if (value === null) setSelectedNode(null);
    else if (value.type === "nodes") setSelectedNode(value.id);
  }, []);

  const postSearchResult = useCallback(
    (options: GraphSearchOption[]): GraphSearchOption[] => {
      return options.length <= 10
        ? options
        : [
            ...options.slice(0, 10),
            {
              type: "message",
              message: (
                <span className="text-center text-muted">
                  And {options.length - 10} others
                </span>
              ),
            },
          ];
    },
    [],
  );
  return (
    <div className="h-full w-full">
      {isClient ? (
        <SigmaContainer
          className="h-full w-full"
          style={{
            backgroundColor: "var(--background)",
          }}
          settings={{
            allowInvalidContainer: true,
            renderEdgeLabels: true,
            labelColor: {
              color: theme === "dark" ? "white" : "black",
            },
          }}
        >
          <LoadRelationshipGraph
            locale={locale}
            preloadPeople={preloadPeople}
            preloadRelationships={preloadRelationships}
            relationshipTypes={relationshipTypes}
          />
          <ForceAtlas2Layout />
          <FocusOnNode
            node={focusNode ?? selectedNode}
            move={focusNode ? false : true}
          />
          <ControlsContainer position={"bottom-right"}>
            <ZoomControl />
            <FullScreenControl />
          </ControlsContainer>
          <ControlsContainer position={"top-right"}>
            <GraphSearch
              type="nodes"
              value={selectedNode ? { type: "nodes", id: selectedNode } : null}
              onFocus={onFocus}
              onChange={onChange}
              postSearchResult={postSearchResult}
            />
          </ControlsContainer>
        </SigmaContainer>
      ) : (
        <div>NOT AVAILABLE</div>
      )}
    </div>
  );
}
