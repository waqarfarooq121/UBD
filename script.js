// Graph Data Structure
const graph = {}; 
const positions = {}; 

// Canvas Setup
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const queueList = document.getElementById('queueList');
const addEdgeForm = document.getElementById('addEdgeForm');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const startNodeInput = document.getElementById('startNode');
const goalNodeInput = document.getElementById('goalNode');
const algorithmSelect = document.getElementById('algorithm');

let steps = [];
let stepIndex = 0;
let interval = null;

// Add Edge to Graph
function addEdge(from, to, cost) {
    if (!graph[from]) graph[from] = [];
    if (!positions[from]) positions[from] = randomPosition();
    if (!positions[to]) positions[to] = randomPosition();

    graph[from].push({ node: to, cost });
    drawGraph();
}

// Generate Random Positions for Nodes
function randomPosition() {
    return { x: Math.random() * 700 + 50, y: Math.random() * 500 + 50 };
}

// Draw Graph on Canvas
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Edges
    for (const from in graph) {
        for (const edge of graph[from]) {
            const { node: to, cost } = edge;
            const start = positions[from];
            const end = positions[to];

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();

            // Draw Edge Cost
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            ctx.fillStyle = 'black';
            ctx.fillText(cost, midX, midY);
        }
    }

    // Draw Nodes
    for (const node in positions) {
        const { x, y } = positions[node];
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = 'black';
        ctx.fillText(node, x - 5, y + 5);
    }
}

// Uniform-Cost Search Implementation
function uniformCostSearch(start, goal) {
    const visited = new Set();
    const queue = [{ node: start, cost: 0, path: [start] }];
    const steps = [];

    while (queue.length > 0) {
        queue.sort((a, b) => a.cost - b.cost);
        const current = queue.shift();
        steps.push(current);

        if (!visited.has(current.node)) {
            visited.add(current.node);

            if (current.node === goal) break;

            for (const neighbor of graph[current.node] || []) {
                queue.push({
                    node: neighbor.node,
                    cost: current.cost + neighbor.cost,
                    path: [...current.path, neighbor.node]
                });
            }
        }

        updateQueueUI(queue);
    }
    return steps;
}

// Breadth-First Search
function breadthFirstSearch(start, goal) {
    const visited = new Set();
    const queue = [{ node: start, path: [start] }];
    const steps = [];

    while (queue.length > 0) {
        const current = queue.shift();
        steps.push(current);

        if (!visited.has(current.node)) {
            visited.add(current.node);

            if (current.node === goal) break;

            for (const neighbor of graph[current.node] || []) {
                queue.push({
                    node: neighbor.node,
                    path: [...current.path, neighbor.node]
                });
            }
        }
        updateQueueUI(queue);
    }
    return steps;
}

// Depth-First Search
function depthFirstSearch(start, goal) {
    const visited = new Set();
    const stack = [{ node: start, path: [start] }];
    const steps = [];

    while (stack.length > 0) {
        const current = stack.pop();
        steps.push(current);

        if (!visited.has(current.node)) {
            visited.add(current.node);

            if (current.node === goal) break;

            for (const neighbor of graph[current.node] || []) {
                stack.push({
                    node: neighbor.node,
                    path: [...current.path, neighbor.node]
                });
            }
        }
        updateQueueUI(stack);
    }
    return steps;
}

// Update Queue/Stack UI
function updateQueueUI(data) {
    queueList.innerHTML = '';
    for (const { node, path, cost } of data) {
        const li = document.createElement('li');
        li.textContent = `${node}: ${path.join(' -> ')}${cost !== undefined ? ` (Cost: ${cost})` : ''}`;
        queueList.appendChild(li);
    }
}

// Visualize Steps
function visualizeStep() {
    if (stepIndex < steps.length) {
        const { node } = steps[stepIndex];
        const { x, y } = positions[node];

        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();

        stepIndex++;
    } else {
        clearInterval(interval);
    }
}

// Reset Graph and UI
function reset() {
    steps = [];
    stepIndex = 0;
    Object.keys(graph).forEach(key => delete graph[key]);
    Object.keys(positions).forEach(key => delete positions[key]);
    queueList.innerHTML = '';
    drawGraph();
}

// Add Edge Form Submission
addEdgeForm.addEventListener('submit', event => {
    event.preventDefault();
    const from = document.getElementById('fromNode').value.toUpperCase();
    const to = document.getElementById('toNode').value.toUpperCase();
    const cost = parseInt(document.getElementById('cost').value, 10);

    if (!from || !to || isNaN(cost) || cost < 1) {
        alert('Please enter valid node names and a positive cost.');
        return;
    }

    addEdge(from, to, cost);
    addEdgeForm.reset();
});

// Start Search Button
startButton.addEventListener('click', () => {
    const startNode = startNodeInput.value.toUpperCase();
    const goalNode = goalNodeInput.value.toUpperCase();
    const algorithm = algorithmSelect.value;

    if (!startNode || !goalNode || !graph[startNode]) {
        alert('Please enter valid start and goal nodes.');
        return;
    }

    if (algorithm === 'UCS') {
        steps = uniformCostSearch(startNode, goalNode);
    } else if (algorithm === 'BFS') {
        steps = breadthFirstSearch(startNode, goalNode);
    } else if (algorithm === 'DFS') {
        steps = depthFirstSearch(startNode, goalNode);
    } else {
        alert('Please select a valid algorithm.');
        return;
    }

    stepIndex = 0;
    interval = setInterval(visualizeStep, 1000);
});

// Reset Button
resetButton.addEventListener('click', reset);

// Initialize Canvas
drawGraph();