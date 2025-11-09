/**
 * Diagram Storage Service
 * DRY abstraction for diagram-specific storage operations
 */

import { storageService } from './storageService';
import { Node, Edge } from 'reactflow';

const STORAGE_KEYS = {
  NODE_POSITIONS: 'diagram-node-positions',
  CUSTOM_EDGES: 'diagram-custom-edges',
  HIDDEN_EDGES: 'diagram-hidden-edges',
  EDGE_LABELS: 'diagram-edge-labels',
} as const;

export interface NodePositions {
  [nodeId: string]: { x: number; y: number };
}

export class DiagramStorageService {
  /**
   * Load saved node positions
   */
  async loadNodePositions(): Promise<NodePositions> {
    return storageService.get<NodePositions>(STORAGE_KEYS.NODE_POSITIONS, {});
  }

  /**
   * Save node positions
   */
  async saveNodePositions(positions: NodePositions): Promise<void> {
    console.log('💾 Saving node positions to storage...', Object.keys(positions).length, 'positions');
    await storageService.set(STORAGE_KEYS.NODE_POSITIONS, positions);
    console.log('✅ Node positions saved successfully');
  }

  /**
   * Load custom edges
   */
  async loadCustomEdges(): Promise<Edge[]> {
    return storageService.get<Edge[]>(STORAGE_KEYS.CUSTOM_EDGES, []);
  }

  /**
   * Save custom edges
   */
  async saveCustomEdges(edges: Edge[]): Promise<void> {
    console.log('💾 Saving custom edges to storage...', edges.length, 'edges');
    await storageService.set(STORAGE_KEYS.CUSTOM_EDGES, edges);
    console.log('✅ Custom edges saved successfully');
  }

  /**
   * Load hidden edges set
   */
  async loadHiddenEdges(): Promise<Set<string>> {
    const hiddenArray = await storageService.get<string[]>(STORAGE_KEYS.HIDDEN_EDGES, []);
    return new Set(hiddenArray);
  }

  /**
   * Save hidden edges set
   */
  async saveHiddenEdges(hidden: Set<string>): Promise<void> {
    console.log('💾 Saving hidden edges to storage...', hidden.size, 'hidden edges');
    await storageService.set(STORAGE_KEYS.HIDDEN_EDGES, Array.from(hidden));
    console.log('✅ Hidden edges saved successfully');
  }

  /**
   * Load edge labels
   */
  async loadEdgeLabels(): Promise<Record<string, string>> {
    return storageService.get<Record<string, string>>(STORAGE_KEYS.EDGE_LABELS, {});
  }

  /**
   * Save edge labels
   */
  async saveEdgeLabels(labels: Record<string, string>): Promise<void> {
    console.log('💾 Saving edge labels to storage...', Object.keys(labels).length, 'labels');
    await storageService.set(STORAGE_KEYS.EDGE_LABELS, labels);
    console.log('✅ Edge labels saved successfully');
  }

  /**
   * Clear all diagram storage
   */
  async clearAll(): Promise<void> {
    await Promise.all([
      storageService.remove(STORAGE_KEYS.NODE_POSITIONS),
      storageService.remove(STORAGE_KEYS.CUSTOM_EDGES),
      storageService.remove(STORAGE_KEYS.HIDDEN_EDGES),
      storageService.remove(STORAGE_KEYS.EDGE_LABELS),
    ]);
  }
}

// Export singleton instance
export const diagramStorage = new DiagramStorageService();

