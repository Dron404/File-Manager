import { stdin } from "process";

export default class Cli {
  constructor(eventEmitter, state) {
    this.state = state;
    this.in = stdin;
    this.eventEmitter = eventEmitter;
    this.in.on("data", (data) => {
      this.getCommand(data.toString().trim());
    });
    this.eventEmitter.on("log", (e) => this.getLog(e));
  }

  getCommand(data) {
    if (!this.state.name) {
      if (data) {
        this.state.name = data;
        console.log(`> Welcome to the File Manager, ${this.state.name}!`);
        this.eventEmitter.emit("log");
        return;
      }
      console.log("> Enter your name");
      return;
    }

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
          case data.startsWith("cat"):
            this.eventEmitter.emit("cat", data.substring(3).trim());
            break;
          default:
            console.log(`Invalid input: ${data}`);
        }
    }
  }

  getLog(e) {
    if (e) console.log(`> Operation failed: ${e.message}`);
    console.log("> You are currently in", this.state.currentDir);
  }
}
