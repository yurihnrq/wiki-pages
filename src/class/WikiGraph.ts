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

	addEdge(src: string, dest: string): void {
		this.#graph.setEdge(src, dest);
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

		const path: string[] = [];

		let current = trg;

		while (current !== src) {
			const [dest, src] = parent.find(([dest]) => dest === current) as [
				string,
				string
			];

			path.push(dest);

			current = src;
		}

		return path.reverse();
	}
}
