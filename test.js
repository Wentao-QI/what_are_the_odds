var Graph = /** @class */ (function () {
    function Graph() {
        this.adjacencyList = {};
    }
    Object.defineProperty(Graph.prototype, "allVertices", {
        get: function () {
            return new Set(Object.keys(this.adjacencyList));
        },
        enumerable: false,
        configurable: true
    });
    Graph.prototype.getNeighbors = function (vertex) {
        return this.adjacencyList[vertex];
    };
    Graph.prototype.addEdge = function (vertex1, vertex2, distance) {
        var _a, _b;
        var _c, _d;
        (_a = (_c = this.adjacencyList)[vertex1]) !== null && _a !== void 0 ? _a : (_c[vertex1] = []);
        (_b = (_d = this.adjacencyList)[vertex2]) !== null && _b !== void 0 ? _b : (_d[vertex2] = []);
        this.adjacencyList[vertex1].push({ vertex: vertex2, distance: distance });
        this.adjacencyList[vertex2].push({ vertex: vertex1, distance: distance });
    };
    return Graph;
}());
function dijkstra(graph, startVertex, endVertex) {
    var _a;
    var univisited = graph.allVertices;
    var visited = new Set();
    var state = (_a = {},
        _a[startVertex] = {
            shortestDistance: 0,
            previousVertex: undefined
        },
        _a);
    function findNextVertex() {
        var minDistance = undefined;
        var nextVertex = undefined;
        Object.entries(state)
            .filter(function (_a) {
            var vertex = _a[0];
            return !visited.has(vertex);
        })
            .forEach(function (_a) {
            var vertex = _a[0], pathInfo = _a[1];
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
        return nextVertex;
    }
    var currentVertex = startVertex;
    while (univisited.size > 0) {
        var neighborsToVisit = graph.getNeighbors(startVertex).filter(function (_a) {
            var vertex = _a.vertex;
            return univisited.has(vertex);
        });
        neighborsToVisit.forEach(function (neighbor) {
            var distance = state[currentVertex].shortestDistance + neighbor.distance;
            var neighborPathInfo = state[neighbor.vertex];
            if (neighborPathInfo == null || neighborPathInfo.shortestDistance > distance) {
                state[neighbor.vertex] = {
                    shortestDistance: distance,
                    previousVertex: currentVertex
                };
            }
        });
        visited.add(currentVertex);
        univisited["delete"](currentVertex);
        currentVertex = findNextVertex();
    }
    return state;
}
var g = new Graph();
g.addEdge("T", "D", 6);
g.addEdge("T", "H", 6);
g.addEdge("D", "H", 1);
g.addEdge("D", "E", 4);
g.addEdge("E", "H", 1);
var res = dijkstra(g, "T", "E");
console.log({ res: res });
