import os from "os";

export default class State {
  constructor(name) {
    this.currentDir = os.homedir();
    this.name = name;
  }
}
