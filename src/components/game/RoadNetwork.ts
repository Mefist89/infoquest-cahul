import Phaser from "phaser";

export interface RoadTile {
  id: number;
  type: 'road' | 'sidewalk' | 'building' | 'grass' | 'crosswalk' | 'marking';
  connections?: { up: boolean; down: boolean; left: boolean; right: boolean };
  rotation?: 0 | 90 | 180 | 270;
}

export interface RoadNode {
  id: string;
  x: number;
  y: number;
  tileX: number;
  tileY: number;
  connections: Map<string, RoadNode>;
  intersection: boolean;
}

export interface RoadGraph {
  nodes: Map<string, RoadNode>;
  intersections: RoadNode[];
}

export class RoadNetwork {
  private scene: Phaser.Scene;
  private tileSize = 16;
  private tileSpacing = 1;
  private effectiveTileSize = 17; // 16 + 1 spacing
  
  private tileMap: number[][] = [];
  private roadGraph: RoadGraph = { nodes: new Map(), intersections: [] };
  private tileTypes: Map<number, string> = new Map();
  
  private roadTiles = new Set<number>();
  private intersectionTiles = new Set<number>();
  private sidewalkTiles = new Set<number>();
  private crosswalkTiles = new Set<number>();

  getTileMap(): number[][] {
    return this.tileMap;
  }

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.classifyTiles();
  }

  private classifyTiles() {
    // Kenney RPG Urban Pack tile classification (based on typical tile indices)
    // Road tiles (straight, corners, T-junctions, 4-way)
    this.roadTiles = new Set([
      // Straight roads
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      // Corners
      13, 14, 15, 16, 17, 16, 18, 19, 20,
      // T-junctions
      21, 22, 23, 24,
      // 4-way intersections
      25, 26, 27, 28,
      // Additional road variants
      29, 30, 31, 32, 33, 34, 35, 36,
    ]);

    // Intersection tiles (4-way, T-junctions with markings)
    this.intersectionTiles = new Set([25, 26, 27, 28, 21, 22, 23, 24]);

    // Sidewalk tiles
    this.sidewalkTiles = new Set([
      37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48,
    ]);

    // Crosswalk tiles
    this.crosswalkTiles = new Set([49, 50, 51, 52]);

    // Mark all as road type
    [...this.roadTiles, ...this.intersectionTiles].forEach(id => {
      this.tileTypes.set(id, 'road');
    });
    [...this.sidewalkTiles].forEach(id => this.tileTypes.set(id, 'sidewalk'));
    [...this.crosswalkTiles].forEach(id => this.tileTypes.set(id, 'crosswalk'));
  }

  getTileType(tileId: number): string {
    return this.tileTypes.get(tileId) || 'unknown';
  }

  isRoad(tileId: number): boolean {
    return this.roadTiles.has(tileId) || this.intersectionTiles.has(tileId);
  }

  isIntersection(tileId: number): boolean {
    return this.intersectionTiles.has(tileId);
  }

  isSidewalk(tileId: number): boolean {
    return this.sidewalkTiles.has(tileId);
  }

  isCrosswalk(tileId: number): boolean {
    return this.crosswalkTiles.has(tileId);
  }

  createRoadMap(width: number, height: number, tileMap?: number[][]): number[][] {
    if (tileMap) {
      this.tileMap = tileMap;
    } else {
      // Generate a default city grid
      this.tileMap = this.generateCityGrid(width, height);
    }
    return this.tileMap;
  }

  private generateCityGrid(width: number, height: number): number[][] {
    const grid: number[][] = [];
    
    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        // Create a grid with roads every 4 tiles
        const isMainRoad = (x % 5 === 0) || (y % 5 === 0);
        const isSecondaryRoad = (x % 10 === 2) || (y % 10 === 2);
        
        if (isMainRoad && isMainRoad) {
          // Intersection
          row.push(25); // 4-way intersection
        } else if (isMainRoad) {
          row.push(1); // Horizontal road
        } else if (isSecondaryRoad) {
          row.push(2); // Vertical road (would need rotation)
        } else {
          // Buildings/grass
          row.push(100 + Math.floor(Math.random() * 50));
        }
      }
      grid.push(row);
    }
    
    return grid;
  }

  buildRoadGraph(): RoadGraph {
    const graph: RoadGraph = { nodes: new Map(), intersections: [] };
    const tileMap = this.tileMap;
    const height = tileMap.length;
    const width = tileMap[0]?.length || 0;

    // First pass: create nodes for all road tiles
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tileId = this.tileMap[y][x];
        if (this.isRoad(tileId)) {
          const key = `${x},${y}`;
          const node: RoadNode = {
            id: `${x},${y}`,
            x: x * this.effectiveTileSize + this.tileSize / 2,
            y: y * this.effectiveTileSize + this.tileSize / 2,
            tileX: x,
            tileY: y,
            connections: new Map(),
            intersection: this.isIntersection(tileId),
          };
          graph.nodes.set(key, node);
          
          if (node.intersection) {
            graph.intersections.push(node);
          }
        }
      }
    }

    // Second pass: connect adjacent road nodes
    for (const node of graph.nodes.values()) {
      const { tileX, tileY } = node;
      const directions = [
        { dx: 0, dy: -1, dir: 'up' },
        { dx: 0, dy: 1, dir: 'down' },
        { dx: -1, dy: 0, dir: 'left' },
        { dx: 1, dy: 0, dir: 'right' },
      ];

      for (const { dx, dy, dir } of directions) {
        const nx = tileX + dx;
        const ny = tileY + dy;
        const neighborKey = `${nx},${ny}`;
        const neighbor = graph.nodes.get(neighborKey);
        
        if (neighbor && this.isRoad(this.tileMap[ny]?.[nx] ?? -1)) {
          node.connections.set(dir, neighbor);
        }
      }
    }

    this.roadGraph = graph;
    return graph;
  }

  getRoadGraph(): RoadGraph {
    if (this.roadGraph.nodes.size === 0) {
      this.buildRoadGraph();
    }
    return this.roadGraph;
  }

  findPath(startX: number, startY: number, endX: number, endY: number): { x: number; y: number }[] {
    const graph = this.getRoadGraph();
    
    // Find closest road nodes
    const startNode = this.findClosestNode(graph, startX, startY);
    const endNode = this.findClosestNode(graph, endX, endY);
    
    if (!startNode || !endNode) return [];
    
    // A* pathfinding
    return this.aStar(graph, startNode, endNode);
  }

  private findClosestNode(graph: RoadGraph, x: number, y: number): RoadNode | null {
    let closest: RoadNode | null = null;
    let minDist = Infinity;
    
    for (const node of graph.nodes.values()) {
      const dist = Math.hypot(node.x - x, node.y - y);
      if (dist < minDist) {
        minDist = dist;
        closest = node;
      }
    }
    return closest;
  }

  private aStar(graph: RoadGraph, start: RoadNode, goal: RoadNode): { x: number; y: number }[] {
    const openSet = new Set<RoadNode>([start]);
    const cameFrom = new Map<RoadNode, RoadNode>();
    const gScore = new Map<RoadNode, number>([[start, 0]]);
    const fScore = new Map<RoadNode, number>([[start, this.heuristic(start, goal)]]);

    while (openSet.size > 0) {
      let current: RoadNode | null = null;
      let minF = Infinity;
      
      for (const node of openSet) {
        const f = fScore.get(node) ?? Infinity;
        if (f < minF) {
          minF = f;
          current = node;
        }
      }

      if (!current || current === goal) {
        return this.reconstructPath(cameFrom, goal);
      }

      openSet.delete(current!);

      for (const [, neighbor] of current!.connections) {
        const tentativeG = (gScore.get(current!) ?? Infinity) + 1;
        if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
          cameFrom.set(neighbor, current!);
          gScore.set(neighbor, tentativeG);
          fScore.set(neighbor, tentativeG + this.heuristic(neighbor, goal));
          openSet.add(neighbor);
        }
      }
    }

    return [];
  }

  private heuristic(a: RoadNode, b: RoadNode): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  private reconstructPath(cameFrom: Map<RoadNode, RoadNode>, current: RoadNode): { x: number; y: number }[] {
    const path = [{ x: current.x, y: current.y }];
    let currentNode: RoadNode | null = current;
    while (currentNode) {
      const next: RoadNode | null = this.roadGraph.nodes.get(`${currentNode.tileX},${currentNode.tileY}`) ?? null;
      currentNode = next;
    }
    return path.reverse();
  }

  render(): void {
    const tileMap = this.tileMap;
    const height = tileMap.length;
    const width = tileMap[0]?.length || 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tileId = tileMap[y][x];
        if (tileId <= 0) continue;

        const px = x * this.effectiveTileSize;
        const py = y * this.effectiveTileSize;

        // Render tile (simplified - would use actual texture atlas in production)
        const graphics = this.scene.add.graphics();
        
        if (this.isIntersection(tileId)) {
          graphics.fillStyle(0x333333);
          graphics.fillRect(px, py, this.tileSize, this.tileSize);
          // Draw intersection markings
          graphics.lineStyle(2, 0xffffff, 0.8);
          graphics.strokeRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
        } else if (this.isRoad(tileId)) {
          graphics.fillStyle(0x2a2a2a);
          graphics.fillRect(px, py, this.tileSize, this.tileSize);
        } else if (this.isSidewalk(tileId)) {
          graphics.fillStyle(0x888888);
          graphics.fillRect(px, py, this.tileSize, this.tileSize);
        } else if (this.isCrosswalk(tileId)) {
          graphics.fillStyle(0xffffff);
          graphics.fillRect(px, py, this.tileSize, this.tileSize);
          // Crosswalk stripes
          graphics.fillStyle(0x000000);
          for (let i = 0; i < this.tileSize; i += 4) {
            graphics.fillRect(px, py + i, this.tileSize, 2);
          }
        }
      }
    }
  }

  // Export graph data for vehicle AI
  exportGraphData(): { nodes: RoadNode[]; edges: { from: string; to: string; direction: string }[] } {
    const graph = this.getRoadGraph();
    const nodes: RoadNode[] = [];
    const edges: { from: string; to: string; direction: string }[] = [];

    for (const [key, node] of graph.nodes) {
      nodes.push({
        id: key,
        x: node.x,
        y: node.y,
        tileX: node.tileX,
        tileY: node.tileY,
        connections: node.connections,
        intersection: node.intersection,
      });

      for (const [dir, neighbor] of node.connections) {
        edges.push({
          from: `${node.tileX},${node.tileY}`,
          to: `${neighbor.tileX},${neighbor.tileY}`,
          direction: dir,
        });
      }
    }

    return { nodes, edges };
  }
}

export interface RoadGraph {
  nodes: Map<string, RoadNode>;
  intersections: RoadNode[];
}

export interface RoadNode {
  x: number;
  y: number;
  tileX: number;
  tileY: number;
  connections: Map<string, RoadNode>;
  intersection: boolean;
}

export interface RoadTile {
  id: number;
  type: 'road' | 'sidewalk' | 'building' | 'grass' | 'crosswalk' | 'marking';
  connections?: { up: boolean; down: boolean; left: boolean; right: boolean };
  rotation?: 0 | 90 | 180 | 270;
}