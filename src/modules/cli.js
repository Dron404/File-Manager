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
      case "":
        break;
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
        switch (true) {
          case data.startsWith("cd"):
            this.eventEmitter.emit("cd", data.substring(2).trim());
            break;
          default:
            console.log(`Invalid input: ${data}`);
        }
    }
  }
}
