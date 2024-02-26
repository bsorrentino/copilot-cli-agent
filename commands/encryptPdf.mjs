import { z } from "zod";
import { CommandTool, runCommand } from "@bsorrentino/copilot-cli-core";
const schema = z.object({
    pdfpath: z.string().describe("full pdf path"),
    password: z.string().describe("password"),
});
class EncryptPdfTool extends CommandTool {
    name = "encrypt_pdf";
    description = "encrypt pdf file with password";
    schema = schema;
    async _call(arg) {
        const command = `qpdf --replace-input --encrypt ${arg.password} ${arg.password} 256 -- '${arg.pdfpath}'`;
        const res = await runCommand(command, this.execContext);
        return this.name + ' completed ' + res;
    }
}
export default new EncryptPdfTool();
