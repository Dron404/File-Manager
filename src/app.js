import Cli from "./modules/cli.js";
import EventEmitter from "events";
import Navigation from "./modules/navigation.js";
import State from "./modules/state.js";
import FileManager from "./modules/file-manager.js";
import OperatingSystem from "./modules/operatingSystem.js";
import Hash from "./modules/hash.js";
import FileCompressor from "./modules/compressor.js";

export class App {
  constructor(name) {
    this.state = new State(name);
    this.eventEmitter = new EventEmitter();
    this.cli = new Cli(this.eventEmitter, this.state);
    this.navigation = new Navigation(this.eventEmitter, this.state);
    this.fileManager = new FileManager(this.eventEmitter, this.state);
    this.os = new OperatingSystem(this.eventEmitter, this.state);
    this.Hash = new Hash(this.eventEmitter, this.state);
    this.fileCompressor = new FileCompressor(this.eventEmitter, this.state);
    process.on("SIGINT", () => this.exit());
    this.eventEmitter.on(".exit", () => this.exit());
  }

  start() {
    if (!this.state.name) {
      console.log("> Enter your name");
      return;
    }
    this.cli.sayHi();
    this.eventEmitter.emit("log");
  }
  exit() {
    console.log(
      `\n> Thank you for using File Manager, ${this.state.name}, goodbye!`
    );
    process.exit(0);
  }
}
