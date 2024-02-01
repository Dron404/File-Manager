import { createReadStream, createWriteStream } from "fs";
import { stat } from "fs/promises";
import { resolve } from "path";
import { stdout } from "process";

export default class FileManager {
  constructor(eventEmitter, state) {
    this.state = state;
    this.eventEmitter = eventEmitter;
    this.eventEmitter
      .on("cat", async (path) => await this.readFile(path))
      .on("add", async (path) => await this.createFile(path));
  }

  async readFile(path) {
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

  async createFile(path) {
    const filePath = resolve(this.state.currentDir, path);
    try {
      const stats = await stat(filePath);
      if (stats.isDirectory()) {
        this.eventEmitter.emit(
          "log",
          new Error("Illegal operation on a directory, open ")
        );
      } else {
        this.eventEmitter.emit("log", new Error("File already exist"));
      }
    } catch (e) {
      if (e.code === "ENOENT") {
        createWriteStream(filePath, "");
        this.eventEmitter.emit("log");
        return;
      }
      this.eventEmitter.emit("log", e);
    }
  }
}
