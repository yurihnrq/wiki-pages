import { Edge, Graph, json } from 'graphlib';
import { WikiGraphOptions } from '../constants/WikiGraphOptions';

export class WikiGraph {
	#graph: Graph;

	constructor() {
		this.#graph = new Graph(WikiGraphOptions);
		this.#graph.setGraph(this.constructor.name);
	}

	addNode(node: string, value: unknown): void {
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
}
