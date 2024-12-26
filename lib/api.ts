// @deno-types="npm:@types/madge"
import { MadgeConfig } from 'npm:madge';
import { EdgeReport } from "./report.ts";
import madge from "npm:madge";

export interface EdgeConfig {
    madge?: MadgeConfig
}

const defaultConfig: EdgeConfig = {
    madge: {}
};

export class Edge {
    private readonly config: EdgeConfig;

    constructor(private path: string, config: EdgeConfig) {
        this.config = { ...defaultConfig, ...config };
    }

    async analyze(): Promise<EdgeReport> {
        const madgeResult = await madge(this.path, this.config.madge);

        return {
            graph: madgeResult.obj(),
            orphans: madgeResult.orphans()
        }
    }
}
