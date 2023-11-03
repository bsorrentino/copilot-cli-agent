import { z } from "zod";
import path from 'node:path';
import fs from 'node:fs/promises';
import pc from 'picocolors';
import { CommandTool, expandTilde, runCommand } from "copilot-cli-core";
/**
 * read tag value `<Version>1.0.0.1</Version>` and  <UniqueName>development</UniqueName> in solution.xml
 *
 * @param {string} solutionPath solution root path or Solution.xml path
 * @Return {SolutionInfo}
 */
export async function readSolutionInfo(solutionPath) {
    const solutionFilePath = path.join(solutionPath, 'Other');
    const solutionFile = path.join(solutionFilePath, 'Solution.xml');
    const file = await fs.readFile(expandTilde(solutionFile));
    const content = file.toString();
    const parseElement = (elementTag, regexp) => {
        const match = content.match(regexp);
        if (match === null || match.length === 0) {
            throw `${elementTag} not found in solution file '${solutionFile}'`;
        }
        const result = regexp.exec(match[0]);
        if (result === null) {
            throw `${elementTag} not found in solution file '${solutionFile}'`;
        }
        return result[1];
    };
    // process name
    const namePattern = '(.+)';
    const versionPattern = '([\\d+].[\\d+](?:.[\\d+])?(?:.[\\d+])?)';
    return {
        uniqueName: parseElement("UniqueName", new RegExp(`<UniqueName>${namePattern}</UniqueName>`, 'ig')),
        currentVersion: parseElement("Version", new RegExp(`<Version>${versionPattern}</Version>`, 'ig'))
    };
}
/**
 * Gets the path to import the given Dataverse solution to.
 *
 * @param {string} solutionPath - The path of the solution.
 * @param {string} packageType - The package type (Unmanaged, Managed, Both).
 * @returns {Promise<string>} The path to import the solution to.
 */
const getImportSolutionPath = async (solutionPath, packageType) => {
    let name = path.basename(solutionPath);
    const outdir = path.dirname(solutionPath);
    try {
        const { currentVersion } = await readSolutionInfo(solutionPath);
        name = `${path.basename(solutionPath)}_${currentVersion}`;
    }
    catch (err) {
        // skip version assignment
        console.warn(pc.magenta('Solution info not found, skipping version in name❗️'), err);
    }
    // console.debug( name );
    switch (packageType.toLowerCase()) {
        case 'unmanaged':
            return path.join(outdir, `${name}.zip`);
        case 'managed':
            return path.join(outdir, `${name}_managed.zip`);
        case 'both':
            return path.join(outdir, `${name}_both.zip`);
    }
    throw `Unknow package type ${packageType}`;
};
/**
 * Schema for the pack solution tool arguments.
 *
 * @typedef {Object} PackSchema
 *
 * @property {string} solution - The local path to the solution folder.
 * @property {('managed'|'unmanaged'|'both')} [type='managed'] - The solution type to pack.
 */
const PackSchema = z.object({
    solution: z.string().describe("the local solution path"),
    type: z.enum(["managed", "unmanaged", "both"])
        .describe("the solution type")
        .optional()
        .default("managed"),
});
/**
 * Tool to pack a Dataverse solution into a ZIP file.
 *
 * @extends {StructuredTool<PackSchema>}
 *
 * Sample prompts:
 *  - pack solution solution_export from WORKSPACES in Home folder  as unmanaged
 */
export class PackSolutionTool extends CommandTool {
    name = "pack_solution";
    description = "pack dataverse solution folder to a zip file";
    schema = PackSchema;
    constructor(execContext) {
        super(execContext);
    }
    async _call(arg, runManager) {
        console.debug("Pack Solution:", arg);
        const { solution, type } = arg;
        try {
            const importSolutionPath = await getImportSolutionPath(solution, type);
            const command = `pac solution pack --zipfile ${importSolutionPath} -f ${solution} -p ${type} -aw`;
            await runCommand(command, this.execContext);
            return `pack executed! ${importSolutionPath}`;
        }
        catch (e) {
            console.error(e);
            return "pack not executed!";
        }
        finally {
        }
    }
}
const createTool = (execContext) => new PackSolutionTool(execContext);
export default createTool;
