export interface EdgeReport {
    graph: { [path: string]: string[] };
    orphans: string[];
}