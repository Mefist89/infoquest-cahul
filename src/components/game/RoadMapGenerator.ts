import { RoadNetwork, RoadNode } from "./RoadNetwork";

export interface CityMapConfig {
  width: number;
  height: number;
  tileSize: number;
  spacing: number;
  blockSize: number;
}

export const DEFAULT_CITY_CONFIG: CityMapConfig = {
  width: 80,
  height: 60,
  tileSize: 16,
  spacing: 1,
  blockSize: 8,
};

export class CityMapGenerator {
  private roadNetwork: RoadNetwork;
  private config: CityMapConfig;
  private tileMap: number[][] = [];

  constructor(roadNetwork: RoadNetwork, config: Partial<CityMapConfig> = {}) {
    this.roadNetwork = roadNetwork;
    this.config = { ...DEFAULT_CITY_CONFIG, ...config };
  }

  generate(): number[][] {
    const { width, height, blockSize } = this.config;
    const grid: number[][] = [];

    // Initialize with grass
    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        row.push(200); // GRASS
      }
      grid.push(row);
    }

    // Horizontal main roads
    for (let ry = 0; ry < height; ry += blockSize + 2) {
      for (let x = 0; x < width; x++) {
        grid[ry][x] = 1; // ROAD_H
        if (ry > 0) grid[ry - 1][x] = 20; // SIDEWALK_H
        if (ry < height - 1) grid[ry + 1][x] = 20; // SIDEWALK_H
      }
    }

    // Vertical main roads
    for (let rx = 0; rx < width; rx += blockSize + 2) {
      for (let y = 0; y < height; y++) {
        const current = grid[y][rx];
        if (current === 1) {
          grid[y][rx] = 11; // ROAD_CROSS
        } else if (current === 20) {
          grid[y][rx] = 11; // CROSSWALK
        } else {
          grid[y][rx] = 2; // ROAD_V
        }
        if (rx > 0) grid[y][rx - 1] = 21; // SIDEWALK_V
        if (rx < width - 1) grid[y][rx + 1] = 21; // SIDEWALK_V
      }
    }

    // Fix intersections
    for (let ry = 0; ry < height; ry += blockSize + 2) {
      for (let rx = 0; rx < width; rx += blockSize + 2) {
        grid[ry][rx] = 11; // ROAD_CROSS
        if (rx > 0) grid[ry][rx - 1] = 30; // CROSSWALK
        if (rx < width - 1) grid[ry][rx + 1] = 30; // CROSSWALK
        if (ry > 0) grid[ry - 1][rx] = 30; // CROSSWALK
        if (ry < height - 1) grid[ry + 1][rx] = 30; // CROSSWALK
      }
    }

    this.placeBuildings(grid);
    this.tileMap = grid;
    return grid;
  }

  private placeBuildings(grid: number[][]): void {
    const { width, height, blockSize } = this.config;

    for (let by = 0; by < height; by += blockSize + 2) {
      for (let bx = 0; bx < width; bx += blockSize + 2) {
        for (let y = by + 2; y < Math.min(by + 8, height - 1); y++) {
          for (let x = bx + 2; x < Math.min(bx + 8, width - 1); x++) {
            if (grid[y][x] === 200) { // Only on grass
              const buildingType = 100 + Math.floor(Math.random() * 4);
              grid[y][x] = buildingType;
            }
          }
        }
      }
    }
  }

  getTileMap(): number[][] {
    return this.tileMap;
  }

  getRoadGraph(): { nodes: RoadNode[]; edges: { from: string; to: string; direction: string }[] } {
    return { nodes: [], edges: [] };
  }
}