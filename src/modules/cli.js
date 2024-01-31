import { stdin } from "process";

export class Cli {
  constructor(eventEmitter) {
    this.in = stdin;
    this.eventEmitter = eventEmitter;
    this.in.on("data", (data) => {
      this.getCommand(data.toString().trim());
    });
  }

  getCommand(data) {
    switch (data) {
      case ".exit":
        process.emit("SIGINT");
        break;
      case "up":
        this.eventEmitter.emit("up");
        break;
      case "ls":
        this.eventEmitter.emit("ls");
        break;
      default:
        console.log(`Invalid input: ${data}`);
    }
  }
}
