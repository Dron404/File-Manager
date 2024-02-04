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
        const onePathCommand = data.match(/^(rm|hash|cd|cat|add)\s+(.+)/u);
        const twoPathCommand = data.match(
          /^(rn|cp|mv|compress|decompress)\s+(.+)/u
        );
        let command, args;
        switch (true) {
          case onePathCommand !== null:
            [, command, args] = onePathCommand;
            const path = this.getPaths(args);
            if (path.length > 1) {
              console.log(
                `Invalid input: to access files with spaces in the name you need to use " " --> ${command} "${path.join(
                  " "
                )}"`
              );
              break;
            }
            this.eventEmitter.emit(command, path[0]);
            break;
          case twoPathCommand !== null:
            [, command, args] = twoPathCommand;
            const paths = this.getPaths(args);
            if (paths.length != 2) {
              console.log(
                `Invalid input: ${
                  paths.length > 2
                    ? `to access files with spaces in the name you need to use " " --> ${command} path_one "path two"`
                    : "expected 2 arguments"
                }`
              );
              break;
            }
            this.eventEmitter.emit(command, this.getPaths(args));
            break;
          case data.startsWith("os"):
            const option = data.substring(2).trim();
            this.osOptions[option]
              ? this.eventEmitter.emit(this.osOptions[option])
              : console.log(`Invalid input: ${data}`);
            break;
          default:
            console.log(`Invalid input: ${data}`);
            this.eventEmitter.emit("log");
        }
    }
  }

  getLog(e) {
    if (e) console.log(`> Operation failed: ${e.message}`);
    console.log("> You are currently in", this.state.currentDir);
  }

  sayHi() {
    console.log(`> Welcome to the File Manager, ${this.state.name}!`);
  }

  getPaths(data) {
    const paths = [];
    const regex = /"([^"]+)"|'([^']+)'|(\S+)/g;
    let match;

    while ((match = regex.exec(data)) !== null) {
      const path = match[1] || match[2] || match[3];
      paths.push(path);
    }
    return paths;
  }
}
