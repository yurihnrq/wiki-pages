import { Edge, Graph, json } from 'graphlib';
import fs from 'node:fs';

import { WikiGraphOptions } from '../constants/WikiGraphOptions';

export class WikiGraph {
	#graph: Graph;

	constructor() {
		this.#graph = new Graph(WikiGraphOptions);
		this.#graph.setGraph(this.constructor.name);
	}

	addNode(node: string, value?: unknown): void {
		this.#graph.setNode(node, value);
	}

	getNodes(): string[] {
		return this.#graph.nodes();
	}

	setNodes(nodes: string[]): void {
		this.#graph.setNodes(nodes);
	}

	addEdge(src: string, dest: string): void {
		this.#graph.setEdge(src, dest);
	}

	removeEdge(src: string, dest: string): void {
		this.#graph.removeEdge(src, dest);
	}

	setEdges(edges: Edge[]): void {
		edges.forEach(edge => {
			this.#graph.setEdge(edge.v, edge.w);
		});
	}

	hasNode(node: string): boolean {
		return this.#graph.hasNode(node);
	}

	outEdges(node: string): Edge[] | void {
		return this.#graph.outEdges(node);
	}

	serialize(): Record<string, unknown> {
		return json.write(this.#graph) as Record<string, unknown>;
	}

	deserialize(serializedGraph: Record<string, unknown>): void {
		this.#graph = json.read(serializedGraph);
	}

	writeToFile(path: string): void {
		fs.writeFileSync(path, JSON.stringify(this.serialize(), null, 2));
	}
	readFromFile(path: string): void {
		const json = fs.readFileSync(path)
		this.deserialize(JSON.parse(json.toString()))
	}

	/**
	 * Returns the shortest path between src and trg, found using BFS.
	 */
	bfs(src: string, trg: string): string[] {
		/** Queue of nodes to visit. */
		const queue: string[] = [];
		/** Visited nodes list. */
		const visited: string[] = [];
		/**
		 * List of parents of each node.
		 *
		 * Each element is a tuple [child, parent].
		 */
		const parents: [string, string][] = [];

		// Add src to the queue and mark it as visited.
		queue.push(src);
		visited.push(src);

		// While there are nodes to visit.
		while (queue.length > 0) {
			// Get the first node in the queue.
			const node = queue.shift() as string;

			// Get all edges from the node.
			const edges = this.outEdges(node);

			if (edges) {
				for (const edge of edges) {
					// Get the destination node.
					const dest = edge.w;

					// If the node has not been visited.
					if (!visited.includes(dest)) {
						// Mark node as visited.
						visited.push(dest);
						// Save parent of node.
						parents.push([dest, node]);

						// Add node to queue.
						queue.push(dest);
					}
				}
			}
		}

		// If the target node has not been visited, there is no path.
		if (!visited.includes(trg)) return [];

		// Reconstruct path from parents.

		let current = trg;
		/** Path from src to trg. */
		const path: string[] = [];
		// While current node is not src.
		while (current !== src) {
			// Get parent of current node.
			const [child, parent] = parents.find(([child]) => child === current) as [
				string,
				string
			];

			// Add child to path.
			path.push(child);

			// Set current node to parent.
			current = parent;
		}
		// Add src to path.
		path.push(src);

		// Reverse path to get correct order.
		const correctedPath = path.reverse();

		return correctedPath;
	}

	/** Returns number of disjoint paths between src and trg. */
	findDisjointPaths(src: string, trg: string): [number, number] {
		let count = 0;
		let pathExists = true;
		let disjointPathSize = Infinity;

		// Copy graph to avoid mutating original graph
		const graph = new WikiGraph();
		graph.setNodes(this.#graph.nodes());
		graph.setEdges(this.#graph.edges());

		// While there is a path between src and trg.
		while (pathExists) {
			// Find path between src and trg.
			const path = graph.bfs(src, trg);

			// If there is no path, break.
			if (path.length === 0) {
				pathExists = false;
				continue;
			}

			// Update to shortest path
			if (path.length < disjointPathSize) {
				disjointPathSize = path.length;
			}

			count++;

			// Remove edges from path.
			for (let i = 0; i < path.length - 1; i++) {
				const src = path[i];
				const dest = path[i + 1];
				graph.removeEdge(src, dest);
			}
		}

		return [count, disjointPathSize];
	}
}
