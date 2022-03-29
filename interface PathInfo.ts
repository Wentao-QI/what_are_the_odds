interface PathInfo {
    distance: number;
    previousVertex: string | undefined;
}

interface VertexDirection {
    bestPath: PathInfo,
    paths: PathInfo[]
}

interface Neighbor {
    vertex: string;
    distance: number;
}

interface BountyHunterSchedule {
    vertex: string;
    day: number;
}

interface MissionResults {
    daysTravelled: number;
    bountyHunterEncounter: number;
}

class Graph {
    adjacencyList: Record<string, Neighbor[]> = {};

    get allVertices(): Set<string> {
        return new Set(Object.keys(this.adjacencyList));
    }

    getNeighbors(vertex: string): Neighbor[] {
        return this.adjacencyList[vertex];
    }

    getDistance(vertex1: string, vertex2: string): number | undefined {
        return this.adjacencyList[vertex1].find(neighbor => neighbor.vertex === vertex2)?.distance;
    }

    addEdge(vertex1: string, vertex2: string, distance: number) {
        this.adjacencyList[vertex1] ??= [];
        this.adjacencyList[vertex2] ??= [];

        this.adjacencyList[vertex1].push({ vertex: vertex2, distance });
        this.adjacencyList[vertex2].push({ vertex: vertex1, distance });
    }
}

function dijkstra(graph: Graph, startVertex: string): Record<string, VertexDirection> {
    const unvisited: Set<string> = graph.allVertices;
    const visited: Set<string> = new Set();
    const state: Record<string, VertexDirection> = {
        [startVertex]: {
            bestPath: {
                distance: 0,
                previousVertex: undefined
            },
            paths: []
        }
    };

    function findNextVertex() {
        let minDistance: number | undefined = undefined;
        let nextVertex: string | undefined = undefined;

        Object.entries(state)
            .filter(([vertex]) => !visited.has(vertex))
            .forEach(([vertex, vertexDirection]) => {
                if (minDistance == null) {
                    minDistance = vertexDirection.bestPath.distance;
                    nextVertex = vertex;
                    return;
                }

                if (vertexDirection.bestPath.distance < minDistance) {
                    minDistance = vertexDirection.bestPath.distance;
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
                const neighborPathInfo = state[neighbor.vertex];

                state[currentVertex]?.paths.forEach((path) => {
                    const distance = path.distance + neighbor.distance;
                    const pathInfo: PathInfo = {
                        distance,
                        previousVertex: currentVertex
                    }

                    if (neighborPathInfo == null) {
                        state[neighbor.vertex] = {
                            bestPath: pathInfo,
                            paths: [pathInfo]
                        }
                        return
                    }

                    if (neighborPathInfo.bestPath.distance > distance) {
                        neighborPathInfo.bestPath = pathInfo;
                    }

                    neighborPathInfo.paths.push(pathInfo);
                });

                // const distance = state[currentVertex]!.shortestDistance + neighbor.distance;
                // const neighborPathInfo = state[neighbor.vertex];
        
                // if (neighborPathInfo == null || neighborPathInfo.shortestDistance > distance) {
                //     state[neighbor.vertex] = {
                //         shortestDistance: distance,
                //         previousVertex: currentVertex
                //     }
                // }
            });
    
        visited.add(currentVertex);
        unvisited.delete(currentVertex);
        currentVertex = findNextVertex();
    }
    

    return state;
}

function parseBountyHunterSchedule(raw: string[]): BountyHunterSchedule[] {
    return raw.map((it) => it.split(":"))
        .map(([vertex, day]) => ({ 
            vertex,
            day: parseInt(day)
        }));
}

function calculateCaptureProbability(k: number): number {
    if (k <= 0) {
        return 0;
    }

    let probability = 1/10;
    for (let i = 2; i <= k; i++) {
        const numerator = 9 ** (i - 1);
        const denominator = 10 ** i;
        probability += (numerator / denominator);
    }

    return probability
}

function simulateMission(dijkstraTable: Record<string, VertexDirection>, graph: Graph, autonomy: number, countdown: number, bountyHunterSchedules: BountyHunterSchedule[]): MissionResults[] {
    if (dijkstraTable.Endor.bestPath.distance > countdown) {
        throw new Error("Impossible due to not having enough time");
    }

    const missionResults: MissionResults[] = [];

    return dijkstraTable.Endor.paths.map((path) => {
        const vertexPath: string[] = [];
        let currentVertex = "Endor";
        
        while (currentVertex != null) {
            vertexPath.unshift(currentVertex);
            currentVertex = dijkstraTable[currentVertex].bestPath.previousVertex!;
        }

        let daysTravelled = 0;
        let currentAutonomy = autonomy;
        let bountyHunterEncounter = 0;

        for (let i = 0; i < vertexPath.length; i++) {
            const currentVertex = vertexPath[i];
            
            if (currentVertex === "Endor") {
                break;
            }

            const nextVertex = vertexPath[i + 1];
            const neighborDistance = graph.getDistance(currentVertex, nextVertex)!;
            
            if (neighborDistance > currentAutonomy) {
                currentAutonomy = autonomy; // reset
                daysTravelled += 1;

                const hasBountryHunter = bountyHunterSchedules.find(({ vertex, day }) => vertex === currentVertex && day === daysTravelled) != null;
                if (hasBountryHunter) {
                    bountyHunterEncounter++;
                }
            }
            
            daysTravelled += neighborDistance;
            currentAutonomy -= neighborDistance;

            const hasBountryHunter = bountyHunterSchedules.find(({ vertex, day }) => vertex === nextVertex && day === daysTravelled) != null;
            if (hasBountryHunter) {
                bountyHunterEncounter++;
            }

            if (daysTravelled > countdown) {
                console.error(`Cannot reach Endor on time: countown ${countdown}, days travelled: ${daysTravelled}`);
                return null;
            }
        }


        return {
            daysTravelled,
            bountyHunterEncounter 
        };
    })
        .filter((it) => it != null);    
}


function makeGraph(routes: string[], autonomy: number): Graph {
    const g = new Graph();
    routes
        .map((route) => route.replace(":", "-").split("-"))
        .map(([vertex1, vertex2, distance]): [string, string, number] => [vertex1, vertex2, parseInt(distance)])
        // Pretend as if distances longer than autonomy don't exist
        .filter(([,,distance]) => distance <= autonomy)
        .forEach(([vertex1, vertex2, distance]) => {
            g.addEdge(vertex1, vertex2, distance);
        });

    return g;
}

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

function readInput2() {
    const autonomy: number = 6;
    const routes: string[] = "Tatooine-Dagobah:6, Dagobah-Endor:4, Dagobah-Hoth:1, Hoth-Endor:1, Tatooine-Hoth:6".split(", ");
    const countdown: number = 9;
    const bountyhunters: string[] = "Hoth:6, Hoth:7, Hoth:8".split(", ");
    
    return { autonomy, routes, countdown, bountyhunters };
}

 function readInput() {
    const autonomy: number = Number.parseInt(readline());
    const routes: string[] = readline().split(", ");
    const countdown: number = Number.parseInt(readline());
    const bountyhunters: string[] = readline().split(", ");
    
    return { autonomy, routes, countdown, bountyhunters };
} 


function main() {
    try {
        const { autonomy, routes, countdown, bountyhunters } = readInput2();
        const graph = makeGraph(routes, autonomy);
        const dijkstraTable = dijkstra(graph, "Tatooine");
        const bountyHunterSchedules = parseBountyHunterSchedule(bountyhunters);
        const simulationResults = simulateMission(dijkstraTable, graph, autonomy, countdown, bountyHunterSchedules);
        const probabilities = simulationResults.map(({ bountyHunterEncounter }) => {
            if (bountyHunterEncounter === 0) {
                return 100;
            }

            const captureProbability = calculateCaptureProbability(bountyHunterEncounter);
            const percentage = (100 - (captureProbability * 100));
            return Math.round(percentage);
        }).sort((a, b) => b - a); // descending

        console.error({probabilities, simulationResults})
        console.log(probabilities[0]);
    } catch (e) {
        //console.error(e);
        console.log("0");
        process.exit(0);
    }    
}


main();