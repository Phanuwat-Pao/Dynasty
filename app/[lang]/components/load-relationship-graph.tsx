"use client";
import { api } from "@/convex/_generated/api";
import { Dictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { getRandomColor } from "@/lib/draw";
import { getFullName } from "@/lib/utils";
import {
  useLoadGraph,
  useRegisterEvents,
  useSetSettings,
  useSigma,
} from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import {
  DEFAULT_EDGE_CURVATURE,
  indexParallelEdgesIndex,
} from "@sigma/edge-curve";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { DirectedGraph } from "graphology";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export type NodeType = {
  x: number;
  y: number;
  label: string;
  size: number;
  color: string;
  highlighted?: boolean;
  image?: string;
  labelColor?: string;
  theme?: string;
};
export type EdgeType = {
  type?: string;
  label?: string;
  size?: number;
  curvature?: number;
  parallelIndex?: number;
  parallelMaxIndex?: number;
};

// Component that load the graph
export default function LoadRelationshipGraph({
  locale,
  preloadPeople,
  preloadRelationships,
  relationshipTypes,
  disableHoverEffect,
}: {
  locale: Locale;
  preloadPeople: Preloaded<typeof api.people.listPeople>;
  preloadRelationships: Preloaded<typeof api.relationships.listRelationships>;
  relationshipTypes: Dictionary["relationshipTypes"];
  disableHoverEffect?: boolean;
}) {
  const { resolvedTheme } = useTheme();

  const people = usePreloadedQuery(preloadPeople);
  const relationships = usePreloadedQuery(preloadRelationships);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const loadGraph = useLoadGraph<NodeType, EdgeType>();
  const setSettings = useSetSettings<NodeType, EdgeType>();
  const registerEvents = useRegisterEvents<NodeType, EdgeType>();
  const sigma = useSigma();

  useEffect(() => {
    const graph = new DirectedGraph<NodeType, EdgeType>();
    for (const person of people) {
      const fullname = getFullName(locale, person);

      graph.addNode(person._id, {
        x: Math.random(),
        y: Math.random(),
        size: 30,
        label: fullname,
        color: getRandomColor(resolvedTheme),
        image: person.portraitUrl || undefined,
        labelColor: resolvedTheme === "dark" ? "white" : "black",
        theme: resolvedTheme,
      });
    }
    for (const relationship of relationships) {
      graph.addEdge(relationship.person1Id, relationship.person2Id, {
        label: `${relationshipTypes[relationship.relationshipType]}`,
        size: 5,
      });
    }
    // Use dedicated helper to identify parallel edges:
    indexParallelEdgesIndex(graph, {
      edgeIndexAttribute: "parallelIndex",
      edgeMaxIndexAttribute: "parallelMaxIndex",
    });

    // Adapt types and curvature of parallel edges for rendering:
    graph.forEachEdge((edge, { parallelIndex, parallelMaxIndex }) => {
      if (typeof parallelIndex === "number") {
        graph.mergeEdgeAttributes(edge, {
          type: "curved",
          curvature:
            DEFAULT_EDGE_CURVATURE +
            (3 * DEFAULT_EDGE_CURVATURE * parallelIndex) /
              (parallelMaxIndex || 1),
        });
      } else {
        graph.setEdgeAttribute(edge, "type", "straight");
      }
    });

    loadGraph(graph);
    registerEvents({
      enterNode: (event) => setHoveredNode(event.node),
      leaveNode: () => setHoveredNode(null),
    });
  }, [
    loadGraph,
    locale,
    people,
    relationships,
    relationshipTypes,
    resolvedTheme,
    registerEvents,
  ]);

  useEffect(() => {
    setSettings({
      nodeReducer: (node, data) => {
        const graph = sigma.getGraph();
        const newData = { ...data, highlighted: data.highlighted || false };

        if (!disableHoverEffect && hoveredNode) {
          if (
            node === hoveredNode ||
            graph.neighbors(hoveredNode).includes(node)
          ) {
            newData.labelColor = data.theme === "dark" ? "black" : "white";
            newData.highlighted = true;
          } else {
            newData.labelColor = data.theme === "dark" ? "white" : "black";
            newData.color = "#E2E2E2";
            newData.highlighted = false;
          }
        }
        return newData;
      },
      edgeReducer: (edge, data) => {
        const graph = sigma.getGraph();
        const newData = { ...data, hidden: false };

        if (
          !disableHoverEffect &&
          hoveredNode &&
          !graph.extremities(edge).includes(hoveredNode)
        ) {
          newData.hidden = true;
        }
        return newData;
      },
    });
  }, [hoveredNode, setSettings, sigma, disableHoverEffect]);

  return null;
}
