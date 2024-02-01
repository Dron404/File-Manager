import Cli from "./modules/cli.js";
import EventEmitter from "events";
import Navigation from "./modules/navigation.js";
import State from "./modules/state.js";
import FileManager from "./modules/file-manager.js";

export class App {
  constructor(name) {
    this.state = new State(name);
    this.eventEmitter = new EventEmitter();
    this.cli = new Cli(this.eventEmitter, this.state);
    this.navigation = new Navigation(this.eventEmitter, this.state);
    this.fileManager = new FileManager(this.eventEmitter, this.state);
  }

  start() {
    if (!this.state.name) {
      console.log("> Enter your name");
      return;
    }
    console.log(`> Welcome to the File Manager, ${this.state.name}!`);
    this.eventEmitter.emit("log");
    process.on("SIGINT", () => {
      console.log(
        `\n> Thank you for using File Manager, ${this.state.name}, goodbye!`
      );
      process.exit(0);
    });
  }
}
