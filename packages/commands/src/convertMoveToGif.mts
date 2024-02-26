import { z } from "zod";
import { CommandTool, expandTilde, runCommand } from "@bsorrentino/copilot-cli-core";
import path from "node:path"

const replaceExt = (filePath:string, newExtension:string) => {
  const parsedPath = path.parse(filePath);

  parsedPath.base = `${parsedPath.name}${newExtension}`;

  return path.format( parsedPath );
}

const schema = z.object({
  videoPath: z.string().describe("the video path"),
  fps: z.number().default(10).describe("frames per second"),
  scale: z.number().default(2048).describe("scale"),
});

class ConvertMoveToGifTool extends CommandTool<typeof schema> {
  name = "convert_move_to_gif";
  description = "convert video in mov format to animated gif";
  schema = schema;

  async _call(arg: z.output<typeof schema>) {

    const outputPath = replaceExt( arg.videoPath  , ".gif" );
    const command = `ffmpeg -loglevel error -i ${arg.videoPath} -vf "fps=${arg.fps},scale=${arg.scale}:-1:flags=lanczos" -c:v gif ${outputPath} -y`;
    
    this.execContext?.history.push(command);
    
    const res = await runCommand(command);
    
    this.execContext?.log(command);
    
    return this.name + ' completed ' + res;
  }
}

export default new ConvertMoveToGifTool();
