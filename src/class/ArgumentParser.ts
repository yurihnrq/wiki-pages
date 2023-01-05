export class ArgumentParser {
	#args: string[] = [];

	constructor(args: string[]) {
		this.args = args;
	}

	set args(arg: string[]) {
		this.#args = arg;
	}

	hasArgument(arg: string): boolean {
		return this.#args.includes(arg);
	}
}
