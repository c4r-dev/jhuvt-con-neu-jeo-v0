/**
 * ActivityFlowViewer Component
 * 
 * Features:
 * - Renders ReactFlow with saved flow data
 * - Manages node state for interactive elements
 * - Supports highlighting steps when hovering over concerns
 * - Allows node selection by clicking
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomNode from '../../designer/components/CustomNode';

// Wrapper component for CustomNode with highlighting
const HighlightableNode = (props) => {
  const isHighlighted = props.data.highlighted || false;
  const isSelected = props.data.selected || false;
  const [isHovered, setIsHovered] = useState(false);
  
  const borderStyle = isSelected
    ? '4px solid #4287f5'
    : isHovered
    ? '2px solid #7aacff' // Subtle hover border
    : isHighlighted
    ? '4px solid #ff6b6b'
    : 'none';
  
  const boxShadowStyle = isSelected
    ? '0 0 15px rgba(66, 135, 245, 0.8)'
    : isHovered
    ? '0 0 8px rgba(122, 170, 255, 0.5)' // Subtle hover shadow
    : isHighlighted
    ? '0 0 15px rgba(255, 107, 107, 0.8)'
    : 'none';
  
  return (
    <div
      style={{
        border: borderStyle,
        borderRadius: '6px',
        boxShadow: boxShadowStyle,
        transform: (isHighlighted || isSelected || isHovered) ? 'scale(1.03)' : 'scale(1)',
        transition: 'all 0.2s ease-in-out',
        zIndex: (isHighlighted || isSelected || isHovered) ? 1000 : 'auto',
        position: 'relative'
      }}
      onMouseEnter={() => {
        if (!isSelected) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      <CustomNode {...props} />
      {isHighlighted && !isSelected && !isHovered && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#ff6b6b',
          border: '2px solid white',
          boxShadow: '0 0 5px rgba(0,0,0,0.3)',
          zIndex: 1001
        }} />
      )}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: '#4287f5',
          border: '2px solid white',
          boxShadow: '0 0 5px rgba(0,0,0,0.3)',
          zIndex: 1001
        }} />
      )}
    </div>
  );
};

const ActivityFlowViewerInner = ({ 
  flowData, 
  flowName, 
  highlightedNodes = [], 
  selectedNodes = [],
  onNodeSelect 
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [initialViewportSet, setInitialViewportSet] = useState(false);
  const nodesInitialized = useRef(false);
  const flowInitialized = useRef(false);
  const { fitView, getViewport, setViewport } = useReactFlow();

  // Reset state when flow changes
  useEffect(() => {
    setNodes([]);
    setEdges([]);
    nodesInitialized.current = false;
    flowInitialized.current = false;
    setInitialViewportSet(false);
  }, [flowName]);

  // Initialize flow from saved data
  useEffect(() => {
    if (flowData && flowData.nodes && flowData.edges && !flowInitialized.current) {
      // Process nodes to add updateNode function
      const processedNodes = flowData.nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          // Ensure interactive elements have proper event handling
          interactiveMode: true,
          // Add initial highlighted state
          highlighted: false,
          // Add initial selected state
          selected: false
        },
        // Use the custom node type for all nodes
        type: 'highlightableNode'
      }));
      
      setNodes(processedNodes);
      setEdges(flowData.edges);
      nodesInitialized.current = true;
      flowInitialized.current = true;
    }
    
    // Clean up function
    return () => {
      nodesInitialized.current = false;
      flowInitialized.current = false;
    };
  }, [flowData, flowName]);

  // Set initial viewport to focus on top half of diagram
  useEffect(() => {
    if (nodes.length > 0 && !initialViewportSet) {
      // Wait a short time for nodes to render
      const timer = setTimeout(() => {
        // Find the bounds of all nodes
        const nodeBounds = nodes.reduce((bounds, node) => {
          const nodeX = node.position.x;
          const nodeY = node.position.y;
          const nodeWidth = node.width || 200; // default width
          const nodeHeight = node.height || 100; // default height
          
          return {
            minX: Math.min(bounds.minX, nodeX),
            maxX: Math.max(bounds.maxX, nodeX + nodeWidth),
            minY: Math.min(bounds.minY, nodeY),
            maxY: Math.max(bounds.maxY, nodeY + nodeHeight)
          };
        }, { 
          minX: Infinity, 
          maxX: -Infinity, 
          minY: Infinity, 
          maxY: -Infinity 
        });

        // Calculate viewport to show top 60% of the diagram
        const diagramHeight = nodeBounds.maxY - nodeBounds.minY;
        const topSectionHeight = diagramHeight * 0.6;
        const centerX = (nodeBounds.minX + nodeBounds.maxX) / 2;
        
        // Focus on the top portion of the diagram, starting from the very top
        const topY = nodeBounds.minY;

        // Set smaller zoom to make diagram smaller and more content visible
        const zoom = Math.min(0.9, Math.max(0.6, 600 / Math.max(nodeBounds.maxX - nodeBounds.minX, topSectionHeight)));
        
        // Calculate position to show the top of the diagram
        const x = -centerX * zoom + window.innerWidth / 4; // Offset for left panel
        const y = -topY * zoom + 50; // Small margin from top

        setViewport({ x, y, zoom }, { duration: 800 });
        setInitialViewportSet(true);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [nodes, initialViewportSet, setViewport]);

  // Apply highlighting to nodes when highlightedNodes changes
  useEffect(() => {
    if (nodes.length > 0) {
      setNodes(nds => 
        nds.map(node => ({
          ...node,
          data: {
            ...node.data,
            // Add highlighted flag to node data
            highlighted: highlightedNodes.includes(node.id),
            // Preserve selected state
            selected: node.data.selected
          }
        }))
      );
    }
  }, [highlightedNodes]);

  // Apply selection to nodes when selectedNodes changes
  useEffect(() => {
    if (nodes.length > 0) {
      setNodes(nds => 
        nds.map(node => ({
          ...node,
          data: {
            ...node.data,
            // Update selected flag based on selectedNodes prop
            selected: selectedNodes.includes(node.id),
            // Preserve highlighted state
            highlighted: node.data.highlighted
          }
        }))
      );
    }
  }, [selectedNodes]);

  // Update node data when interacting with toggles, dropdowns, etc.
  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes(nds =>
      nds.map(node => {
        if (node.id === nodeId) {
          // Preserve highlighted and selected state when updating node data
          return {
            ...node,
            data: { 
              ...newData,
              highlighted: node.data.highlighted,
              selected: node.data.selected
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Handle node click to toggle selection
  const onNodeClick = useCallback((e, node) => {
    e.stopPropagation();
    if (onNodeSelect) {
      onNodeSelect(node.id, node.data.elements?.label?.text || `Node ${node.id}`);
    }
    return false;
  }, [onNodeSelect]);

  // Define custom node types
  const memoizedNodeTypes = useMemo(() => ({
    highlightableNode: (props) => <HighlightableNode {...props} updateNode={updateNodeData} />
  }), [updateNodeData]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={memoizedNodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={true}
        minZoom={0.35}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <MiniMap 
          style={{
            height: 90,
            width: 150,
          }}
          className="custom-minimap"
        />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

// Wrapper component with ReactFlowProvider
const ActivityFlowViewer = (props) => {
  return (
    <ReactFlowProvider>
      <ActivityFlowViewerInner {...props} />
    </ReactFlowProvider>
  );
};

export default ActivityFlowViewer; 