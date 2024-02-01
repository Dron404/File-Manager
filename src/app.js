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
    process.on("SIGINT", () => this.cli.exit());
  }

  start() {
    if (!this.state.name) {
      console.log("> Enter your name");
      return;
    }
    this.cli.satHi();
    this.eventEmitter.emit("log");
  }
}
