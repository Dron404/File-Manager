import os from "os";

export default class OperatingSystem {
  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter;
    eventEmitter
      .on("EOL", () => this.getElo())
      .on("cpus", () => this.getCpus())
      .on("homedir", () => this.getHomedir())
      .on("username", () => this.getUsername())
      .on("architecture", () => this.getArchitecture());
  }

  getElo() {
    console.log("> Default EOL: " + JSON.stringify(os.EOL));
    this.eventEmitter.emit("log");
  }

  getCpus() {
    const cupsData = os.cpus().map((cpu) => {
      return { model: cpu.model, GHz: (cpu.speed / 1000).toFixed(4) };
    });
    console.table(cupsData);
    this.eventEmitter.emit("log");
  }

  getHomedir() {
    console.log("> " + os.homedir());
    this.eventEmitter.emit("log");
  }

  getUsername() {
    console.log("> " + os.userInfo().username);
    this.eventEmitter.emit("log");
  }

  getArchitecture() {
    console.log("> " + process.arch);
    this.eventEmitter.emit("log");
  }
}
