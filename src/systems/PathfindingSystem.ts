import EasyStar from 'easystarjs';
import Phaser from 'phaser';

export interface PathNode {
  tileX: number;
  tileY: number;
}

export interface TilePoint {
  tileX: number;
  tileY: number;
}

export class PathfindingSystem {
  private easystar = new EasyStar.js();
  private grid: number[][] = [];
  private tileSize = 32;
  private temporaryBlocked = new Set<string>();

  initializeFromLayer(layer: Phaser.Tilemaps.TilemapLayer): void {
    const width = layer.layer.width;
    const height = layer.layer.height;
    this.tileSize = layer.tilemap.tileWidth;

    this.grid = [];

    for (let y = 0; y < height; y += 1) {
      const row: number[] = [];
      for (let x = 0; x < width; x += 1) {
        const tile = layer.getTileAt(x, y);
        const blocked = Boolean(tile && (tile.collides || tile.properties.blocked));
        row.push(blocked ? 1 : 0);
      }
      this.grid.push(row);
    }

    this.easystar = new EasyStar.js();
    this.easystar.setGrid(this.applyTemporaryBlockedToGrid());
    this.easystar.setAcceptableTiles([0]);
    this.easystar.disableDiagonals();
  }

  private applyTemporaryBlockedToGrid(): number[][] {
    return this.grid.map((row, y) =>
      row.map((value, x) => (this.temporaryBlocked.has(`${x},${y}`) ? 1 : value)),
    );
  }

  setTemporaryBlockedTiles(blocked: TilePoint[]): void {
    this.temporaryBlocked.clear();
    for (const point of blocked) {
      this.temporaryBlocked.add(`${point.tileX},${point.tileY}`);
    }

    this.easystar.setGrid(this.applyTemporaryBlockedToGrid());
  }

  findPath(startTileX: number, startTileY: number, targetTileX: number, targetTileY: number): Promise<PathNode[] | null> {
    return new Promise((resolve) => {
      if (!this.grid.length) {
        resolve(null);
        return;
      }

      this.easystar.findPath(startTileX, startTileY, targetTileX, targetTileY, (path) => {
        if (!path) {
          resolve(null);
          return;
        }

        resolve(
          path.map((node) => ({
            tileX: node.x,
            tileY: node.y,
          })),
        );
      });
      this.easystar.calculate();
    });
  }

  worldToTile(x: number, y: number): TilePoint {
    return {
      tileX: Math.floor(x / this.tileSize),
      tileY: Math.floor(y / this.tileSize),
    };
  }

  tileToWorld(tileX: number, tileY: number): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(tileX * this.tileSize + this.tileSize / 2, tileY * this.tileSize + this.tileSize / 2);
  }
}
