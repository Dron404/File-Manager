import { Cli } from "./modules/cli.js";
import EventEmitter from "events";
import { Navigation } from "./modules/navigation.js";
import State from "./modules/state.js";

export class App {
  constructor(name) {
    this.state = new State(name);
    this.eventEmitter = new EventEmitter();
    this.cli = new Cli(this.eventEmitter);
    this.navigation = new Navigation(this.eventEmitter, this.state);
  }

  start() {
    console.log(`> Welcome to the File Manager, ${this.state.name}!`);
    process.on("SIGINT", () => {
      console.log(
        `\n> Thank you for using File Manager, ${this.state.name}, goodbye!`
      );
      process.exit(0);
    });
  }
}
