import { MazeResult, MazeCell } from "../types/activities";

export function generateMaze(width = 15, height = 15): MazeResult {
  // Initialize grid with all 4 walls intact
  const grid: MazeCell[][] = Array.from({ length: height }, (_, r) =>
    Array.from({ length: width }, (_, c) => ({
      r,
      c,
      north: true,
      south: true,
      east: true,
      west: true,
    }))
  );

  const visited: boolean[][] = Array.from({ length: height }, () =>
    Array(width).fill(false)
  );

  // Recursive Backtracker using an explicit stack
  const stack: [number, number][] = [];
  stack.push([0, 0]);
  visited[0][0] = true;

  const directions = [
    { dr: -1, dc: 0, wall: "north", oppWall: "south" },
    { dr: 1, dc: 0, wall: "south", oppWall: "north" },
    { dr: 0, dc: 1, wall: "east", oppWall: "west" },
    { dr: 0, dc: -1, wall: "west", oppWall: "east" },
  ] as const;

  while (stack.length > 0) {
    const [cr, cc] = stack[stack.length - 1];

    // Find unvisited neighbors
    const neighbors: { nr: number; nc: number; dirIdx: number }[] = [];
    directions.forEach((d, idx) => {
      const nr = cr + d.dr;
      const nc = cc + d.dc;
      if (nr >= 0 && nr < height && nc >= 0 && nc < width && !visited[nr][nc]) {
        neighbors.push({ nr, nc, dirIdx: idx });
      }
    });

    if (neighbors.length > 0) {
      // Pick random neighbor
      const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
      const dir = directions[chosen.dirIdx];

      // Knock down walls
      grid[cr][cc][dir.wall] = false;
      grid[chosen.nr][chosen.nc][dir.oppWall] = false;

      visited[chosen.nr][chosen.nc] = true;
      stack.push([chosen.nr, chosen.nc]);
    } else {
      stack.pop();
    }
  }

  // Open start (top of [0,0]) and end (bottom of [height-1, width-1])
  grid[0][0].north = false;
  grid[height - 1][width - 1].south = false;

  // Find solution path with BFS
  const queue: [number, number][] = [[0, 0]];
  const parentMap = new Map<string, [number, number]>();
  const bfsVisited = new Set<string>(["0,0"]);

  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!;
    if (cr === height - 1 && cc === width - 1) break;

    directions.forEach((d) => {
      // Check if wall is open in this direction
      if (!grid[cr][cc][d.wall]) {
        const nr = cr + d.dr;
        const nc = cc + d.dc;
        const key = `${nr},${nc}`;
        if (nr >= 0 && nr < height && nc >= 0 && nc < width && !bfsVisited.has(key)) {
          bfsVisited.add(key);
          parentMap.set(key, [cr, cc]);
          queue.push([nr, nc]);
        }
      }
    });
  }

  // Reconstruct path
  const solutionPath: [number, number][] = [];
  let curr: [number, number] | undefined = [height - 1, width - 1];

  while (curr) {
    solutionPath.unshift(curr);
    if (curr[0] === 0 && curr[1] === 0) break;
    curr = parentMap.get(`${curr[0]},${curr[1]}`);
  }

  return {
    width,
    height,
    grid,
    solutionPath,
  };
}
