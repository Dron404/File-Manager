import { createReadStream, createWriteStream } from "fs";
import { stat, rename } from "fs/promises";
import path, { resolve } from "path";
import { stdout } from "process";
import { getStats } from "../helpers/getDirFiles.js";

export default class FileManager {
  constructor(eventEmitter, state) {
    this.state = state;
    this.eventEmitter = eventEmitter;
    this.eventEmitter
      .on("cat", async (path) => await this.readFile(path))
      .on("add", async (path) => await this.createFile(path))
      .on("rn", async (data) => await this.renameFile(data))
      .on("cp", async (data) => await this.copyFile(data));
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
    const fileStat = await getStats(`${this.state.currentDir}/${path}`);
    if (fileStat == null) {
      createWriteStream(`${this.state.currentDir}/${path}`, "");
      this.eventEmitter.emit("log");
      return;
    }
    this.eventEmitter.emit(
      "log",
      new Error(
        fileStat == "file"
          ? "File already exist"
          : "Illegal operation on a directory"
      )
    );
  }
  async renameFile(data) {
    const [filePath, newName] = data.split(/\s+/);
    const targetFilePath = resolve(this.state.currentDir, filePath);
    const directory = path.dirname(targetFilePath);
    const newFilePath = path.join(directory, newName);

    try {
      const stats = await stat(targetFilePath);
      if (stats.isDirectory()) {
        this.eventEmitter.emit(
          "log",
          new Error("Illegal operation on a directory")
        );
        return;
      }
      await rename(targetFilePath, newFilePath);
      this.eventEmitter.emit("log");
    } catch (e) {
      this.eventEmitter.emit("log", e);
    }
  }

  async copyFile(data) {}

  async moveFile(data) {}

  async deleteFile(data) {}
}
