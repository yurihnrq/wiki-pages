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

	bfs(src: string, trg: string): string[] {
		const queue: string[] = [];
		const visited: string[] = [];
		const parent: [string, string][] = [];

		queue.push(src);
		visited.push(src);

		while (queue.length > 0) {
			const node = queue.shift() as string;

			const edges = this.outEdges(node);

			if (edges) {
				for (const edge of edges) {
					const dest = edge.w;

					if (!visited.includes(dest)) {
						visited.push(dest);
						parent.push([dest, node]);

						queue.push(dest);
					}
				}
			}
		}

		if (!visited.includes(trg)) return [];

		let current = trg;
		const path: string[] = [];
		while (current !== src) {
			const [dest, src] = parent.find(([dest]) => dest === current) as [
				string,
				string
			];

			path.push(dest);

			current = src;
		}
		path.push(src);

		const correctedPath = path.reverse();

		return correctedPath;
	}

	/** Returns number of disjoint paths between src and trg. */
	findDisjointPaths(src: string, trg: string): number {
		let count = 0;
		let pathExists = true;

		// Copy graph to avoid mutating original graph
		const graph = new WikiGraph();
		graph.setNodes(this.#graph.nodes());
		graph.setEdges(this.#graph.edges());

		while (pathExists) {
			const path = graph.bfs(src, trg);
			if (path.length === 0) {
				pathExists = false;
				continue;
			}

			count++;

			for (let i = 0; i < path.length - 1; i++) {
				const src = path[i];
				const dest = path[i + 1];
				graph.removeEdge(src, dest);
			}
		}

		return count;
	}
}
