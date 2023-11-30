import { z } from "zod";
import { CommandTool, runCommand } from "copilot-cli-core";
var GrayLevel;
(function (GrayLevel) {
    GrayLevel["Four"] = "4";
    GrayLevel["Eight"] = "8";
    GrayLevel["Sixteen"] = "16";
})(GrayLevel || (GrayLevel = {}));
const schema = z.object({
    imagePath: z.string(),
    grayLevel: z.enum([GrayLevel.Four, GrayLevel.Eight, GrayLevel.Sixteen]).optional().default(GrayLevel.Sixteen),
});
class PlantUMLSpriteGeneratorTool extends CommandTool {
    name = "plantuml_sprite_generator";
    description = "Generate a plantuml sprite from image.";
    schema = schema;
    async _call(arg) {
        await runCommand({
            cmd: `plantuml -encodesprite ${arg.grayLevel} ${arg.imagePath}`,
            out: `${arg.imagePath}.puml`
        }, this.execContext);
        return `plantuml sprite ${arg.imagePath}.puml generated`;
    }
}
export default new PlantUMLSpriteGeneratorTool();
