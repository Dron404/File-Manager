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

    this.osOptions = {
      "--EOL": "EOL",
      "--cpus": "cpus",
      "--homedir": "homedir",
      "--username": "username",
      "--architecture": "architecture",
    };
  }

  getCommand(data) {
    // if you try run the app by npm run start, code will force you to enter a name. After which the application will work : )
    if (!this.state.name) {
      switch (true) {
        case data.trim() != "":
          this.state.name = data;
          console.log(`> Welcome to the File Manager, ${this.state.name}!`);
          this.eventEmitter.emit("log");
          return;
        default:
          console.log("> Enter your name");
      }
      return;
    }

    switch (data) {
      case "":
        break;
      case ".exit":
      case "up":
      case "ls":
        this.eventEmitter.emit(data);
        break;
      default:
        const match = data.match(/^(rm|hash|cd|cat|add|rn|cp|mv)\s+(.+)/u);
        switch (true) {
          case match !== null:
            const [, command, argument] = match;
            this.eventEmitter.emit(command, argument);
            break;
          case data.startsWith("os"):
            const option = data.substring(2).trim();
            this.osOptions[option]
              ? this.eventEmitter.emit(this.osOptions[option])
              : console.log(`Invalid input: ${data}`);
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

  satHi() {
    console.log(`> Welcome to the File Manager, ${this.state.name}!`);
  }
}
