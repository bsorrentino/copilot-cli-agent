import { z } from "zod";
import { CommandTool, expandTilde, runCommand } from "copilot-cli-core";

enum GrayLevel {
  Four = '4',
  Eight = '8',
  Sixteen = '16'
}

const schema = z.object({
  imagePath: z.string(),
  grayLevel: z.enum([GrayLevel.Four, GrayLevel.Eight, GrayLevel.Sixteen]).optional().default(GrayLevel.Sixteen),
});

class PlantUMLSpriteGeneratorTool extends CommandTool<typeof schema> {
    name = "plantuml_sprite_generator";
    description = "Generate a plantuml sprite from image.";
    schema = schema;
    
    async _call(arg: z.output<typeof schema>) {

      await runCommand({
        cmd: `plantuml -encodesprite ${arg.grayLevel} ${arg.imagePath}`,
        out: `${arg.imagePath}.puml`
      }, this.execContext);

      return `plantuml sprite ${arg.imagePath}.puml generated`;

    }
}

export default new PlantUMLSpriteGeneratorTool();
