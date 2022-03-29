interface PathInfo {
    shortestDistance: number;
    previousVertex: string | undefined;
}

interface Neighbor {
    vertex: string;
    distance: number;
}

class Graph {
    adjacencyList: Record<string, Neighbor[]> = {};

    get allVertices(): Set<string> {
        return new Set(Object.keys(this.adjacencyList));
    }

    getNeighbors(vertex: string): Neighbor[] {
        return this.adjacencyList[vertex];
    }

    addEdge(vertex1: string, vertex2: string, distance: number) {
        this.adjacencyList[vertex1] ??= [];
        this.adjacencyList[vertex2] ??= [];

        this.adjacencyList[vertex1].push({ vertex: vertex2, distance });
        this.adjacencyList[vertex2].push({ vertex: vertex1, distance });
    }
}

function dijkstra(graph: Graph, startVertex: string): Record<string, PathInfo> {
    const unvisited: Set<string> = graph.allVertices;
    const visited: Set<string> = new Set();
    const state: Record<string, PathInfo> = {
        [startVertex]: {
            shortestDistance: 0,
            previousVertex: undefined
        }
    };

    function findNextVertex() {
        let minDistance: number | undefined = undefined;
        let nextVertex: string | undefined = undefined;

        Object.entries(state)
            .filter(([vertex]) => !visited.has(vertex))
            .forEach(([vertex, pathInfo]) => {
                if (minDistance == null) {
                    minDistance = pathInfo.shortestDistance;
                    nextVertex = vertex;
                    return;
                }

                if (pathInfo.shortestDistance < minDistance) {
                    minDistance = pathInfo.shortestDistance;
                    nextVertex = vertex;
                }
            });

        
        nextVertex ??= unvisited.values().next().value;    
        return nextVertex!;
    }


    let currentVertex = startVertex;

    while(unvisited.size > 0) {
        graph.getNeighbors(currentVertex)
            .filter(({ vertex }) => unvisited.has(vertex))
            .forEach((neighbor) => {
                const distance = state[currentVertex]!.shortestDistance + neighbor.distance;
                const neighborPathInfo = state[neighbor.vertex];
        
                if (neighborPathInfo == null || neighborPathInfo.shortestDistance > distance) {
                    state[neighbor.vertex] = {
                        shortestDistance: distance,
                        previousVertex: currentVertex
                    }
                }
            });
    
        visited.add(currentVertex);
        unvisited.delete(currentVertex);
        currentVertex = findNextVertex();
    }
    

    return state;
}