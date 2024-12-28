// @deno-types="npm:@types/madge"
import { MadgeConfig } from 'npm:madge';
import { EdgeReport } from "./report.ts";
import madge from "npm:madge";

export interface EdgeConfig {
    madge?: MadgeConfig;
    includeCycles?: boolean;
}

const defaultConfig: EdgeConfig = {
    madge: {
        fileExtensions: ['tsx', 'js', 'jsx', 'ts']
    },
    includeCycles: true
};

export class Edge {
    private readonly config: EdgeConfig;

    constructor(private path: string, config: EdgeConfig) {
        this.config = { ...defaultConfig, ...config };
    }

    async analyze(): Promise<EdgeReport> {
        const madgeResult = await madge(this.path, this.config.madge);

        const graph = madgeResult.obj();

        const report: EdgeReport = {
            graph,
            orphans: madgeResult.orphans(),
        };

        if (this.config.includeCycles) {
            report.cycles = this.detectCycles(graph);
        }

        return report;
    }

    private detectCycles(graph: EdgeReport['graph']): string[][] {
        const adjacencyList = graph;

        const visited = new Set();
        const stack = new Set();
        const cycles: string[][] = [];

        function dfs(node: string, path: string[] = []) {
            if (stack.has(node)) {
                // Found a cycle
                const cycleStartIndex = path.indexOf(node);
                const cycle = path.slice(cycleStartIndex);
                cycles.push(cycle);
                return;
            }

            if (visited.has(node)) return;

            visited.add(node);
            stack.add(node);
            path.push(node);

            (adjacencyList[node] || []).forEach((neighbor) => {
                dfs(neighbor, path);
            });

            stack.delete(node);
            path.pop();
        }

        Object.keys(graph).forEach((node) => {
            if (!visited.has(node)) {
                dfs(node);
            }
        });
        
        return cycles;
    }
}
