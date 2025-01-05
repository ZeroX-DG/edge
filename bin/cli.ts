import { Edge, EdgeConfig } from '../lib/api.ts';
import { parseArgs, ParseOptions } from '@std/cli/parse-args';
import { DOMParser } from "jsr:@b-fuze/deno-dom";
import { open } from 'https://deno.land/x/open/index.ts';

async function main() {
    const args = parseArguments(Deno.args);
    const path = args._[0];

    if (!path) {
        console.error('ERROR: No path supplied for analysis.');
        return Deno.exit(1);
    }

    const config: EdgeConfig = {};

    // Extensions arg is a comma-separated string like: js,tsx,jsx
    if (args.extensions) {
        config.madge = {
            fileExtensions: args.extensions.split(',')
        }
    }

    const edge = new Edge(path.toString(), config);
    const report = await edge.analyze();

    const encoder = new TextEncoder();

    if (args.json) {
        Deno.writeFileSync('edge_analysis.json', encoder.encode(JSON.stringify(report)));
    }

    if (args.html) {
        const html = Deno.readTextFileSync('view-report.html');
        const document = new DOMParser().parseFromString(html, 'text/html');
        const firstScript = document.querySelector('script')!;

        const dataTag = document.createElement('script');
        dataTag.innerText = `window.report = ${JSON.stringify(report)};`

        firstScript.parentElement!.insertBefore(dataTag, firstScript);

        Deno.writeFileSync('edge_analysis.html', encoder.encode(document.documentElement!.innerHTML));
    }

    if (args.open) {
        await open('edge_analysis.html');
    }
}

function parseArguments(args: string[]) {
    const options: ParseOptions = {
        boolean: ['html', 'json', 'open'],
        string: ['extensions']
    };
    return parseArgs(args, options);
}

main();
