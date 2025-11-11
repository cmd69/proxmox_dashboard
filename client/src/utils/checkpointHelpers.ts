/**
 * Checkpoint Helper Functions
 * Following SOLID principles and DRY
 */

import type { Node } from 'reactflow';
import type { DiagramCheckpoint, NodePositions } from '@/services/diagramStorage';

/**
 * Applies checkpoint positions to nodes, handling relative positions for services
 */
export const applyCheckpointPositions = (
  nodes: Node[],
  checkpointPositions: NodePositions
): Node[] => {
  // Build VM position map for calculating service positions
  const vmPositions = new Map<string, { x: number; y: number }>();
  nodes.forEach(node => {
    if (node.type === 'vm' || node.id === 'proxmox') {
      vmPositions.set(node.id, checkpointPositions[node.id] || node.position);
    }
  });

  return nodes.map(newNode => {
    // Handle service nodes with relative positioning
    if (newNode.type === 'service' && newNode.id.includes('-service-')) {
      const vmId = newNode.id.split('-service-')[0];
      const vmPosition = vmPositions.get(vmId);
      
      if (vmPosition) {
        // Try relative offset first (preferred)
        const relativeOffsetKey = `${newNode.id}_relative`;
        const relativeOffset = checkpointPositions[relativeOffsetKey];
        
        if (relativeOffset) {
          return {
            ...newNode,
            position: {
              x: vmPosition.x + relativeOffset.x,
              y: vmPosition.y + relativeOffset.y,
            },
          };
        }
        
        // Fallback to absolute position
        const savedServicePos = checkpointPositions[newNode.id];
        if (savedServicePos) {
          return { ...newNode, position: savedServicePos };
        }
      }
    }
    
    // For other nodes, use saved position directly
    const savedPosition = checkpointPositions[newNode.id];
    if (savedPosition) {
      return { ...newNode, position: savedPosition };
    }
    
    return newNode;
  });
};

/**
 * Loads checkpoint from server
 */
export const loadCheckpointFromServer = async (): Promise<DiagramCheckpoint | null> => {
  try {
    const response = await fetch('/api/storage/diagram-checkpoint');
    if (response.ok) {
      const data = await response.json();
      return data.value as DiagramCheckpoint | null;
    }
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to load checkpoint: ${response.statusText}`);
  } catch (error) {
    console.warn('⚠️ Failed to load checkpoint from API:', error);
    throw error;
  }
};

/**
 * Creates a wrapper that only executes if user is authenticated
 */
export const requireAuth = <T extends (...args: any[]) => Promise<void>>(
  fn: T,
  isAuthenticated: boolean
): T => {
  return (async (...args: Parameters<T>) => {
    if (!isAuthenticated) {
      console.log('🔒 Usuario no autenticado - cambios no se guardan');
      return;
    }
    return fn(...args);
  }) as T;
};

/**
 * Extracts node positions from nodes array
 */
export const extractNodePositions = (nodes: Node[]): NodePositions => {
  const positions: NodePositions = {};
  nodes.forEach(node => {
    positions[node.id] = node.position;
  });
  return positions;
};

/**
 * Calculates relative positions for service nodes
 */
export const calculateServiceRelativePositions = (
  nodes: Node[],
  positions: NodePositions
): NodePositions => {
  const vmPositions = new Map<string, { x: number; y: number }>();
  
  // First pass: collect VM positions
  nodes.forEach(node => {
    if (node.type === 'vm' || node.id === 'proxmox') {
      vmPositions.set(node.id, positions[node.id]);
    }
  });
  
  // Second pass: calculate relative offsets for services
  nodes.forEach(node => {
    if (node.type === 'service' && node.id.includes('-service-')) {
      const vmId = node.id.split('-service-')[0];
      const vmPosition = vmPositions.get(vmId);
      
      if (vmPosition && positions[node.id]) {
        const relativeOffset = {
          x: positions[node.id].x - vmPosition.x,
          y: positions[node.id].y - vmPosition.y,
        };
        positions[`${node.id}_relative`] = relativeOffset;
      }
    }
  });
  
  return positions;
};

