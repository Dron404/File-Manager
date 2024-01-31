import { stat, readdir } from "fs/promises";
import { createReadStream } from "fs";
import { resolve } from "path";
import { stdout } from "process";

export default class FileManager {
  constructor(eventEmitter, state) {
    this.state = state;
    this.eventEmitter = eventEmitter;
    this.eventEmitter.on("cat", async (path) => await this.readFile(path));
  }

  readFile(path) {
    const filePath = resolve(this.state.currentDir, path);
    createReadStream(filePath)
      .on("data", (data) => {
        stdout.write(data.toString() + "\n");
        this.eventEmitter.emit("log");
      })
      .on("error", (e) => {
        this.eventEmitter.emit("log", e);
      });
  }
}
