import { stdin } from "process";

export default class Cli {
  constructor(eventEmitter, state) {
    this.state = state;
    this.in = stdin;
    this.eventEmitter = eventEmitter;
    this.in.on("data", (data) => {
      this.getCommand(data.toString().trim());
    });
    this.eventEmitter
      .on("log", (e) => this.getLog(e))
      .on("exit", () => this.exit());
  }

  getCommand(data) {
    if (!this.state.name) {
      if (data.trim()) {
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
        this.eventEmitter.emit("exit");
        break;
      case "up":
        this.eventEmitter.emit("up");
        break;
      case "ls":
        this.eventEmitter.emit("ls");
        break;
      default:
        switch (true) {
          case data.match(/^rm\s+[\p{L}\d]+/iu) !== null:
            this.eventEmitter.emit("rm", data.substring(2).trim());
            break;
          case data.match(/^cd\s+[\p{L}\d]+/iu) !== null:
            this.eventEmitter.emit("cd", data.substring(2).trim());
            break;
          case data.match(/^cat\s+[\p{L}\d]+/iu) !== null:
            this.eventEmitter.emit("cat", data.substring(3).trim());
            break;
          case data.match(/^add\s+[\p{L}\d]+/iu) !== null:
            this.eventEmitter.emit("add", data.substring(3).trim());
            break;
          case data.match(/^rn\s+[\p{L}\d]+/iu) !== null &&
            data.substring(2).trim().split(/\s+/).length == 2:
            this.eventEmitter.emit("rn", data.substring(2).trim());
            break;
          case data.match(/^cp\s+[\p{L}\d]+/iu) !== null &&
            data.substring(2).trim().split(/\s+/).length == 2:
            this.eventEmitter.emit("cp", data.substring(2).trim());
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

  exit() {
    console.log(
      `\n> Thank you for using File Manager, ${this.state.name}, goodbye!`
    );
    process.exit(0);
  }

  satHi() {
    console.log(`> Welcome to the File Manager, ${this.state.name}!`);
  }
}
