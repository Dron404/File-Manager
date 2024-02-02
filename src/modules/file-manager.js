import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "node:stream/promises";
import { stat, rename } from "fs/promises";
import path, { resolve, basename } from "path";
import { stdout } from "process";
import { checkPath } from "../helpers/getDirFiles.js";

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
    let hasData = false;
    createReadStream(filePath)
      .on("data", (data) => {
        hasData = true;
        stdout.write(data.toString() + "\n");
        this.eventEmitter.emit("log");
      })
      .on("end", () => {
        if (!hasData) {
          console.log("File is empty");
          this.eventEmitter.emit("log");
        }
      })
      .on("error", (e) => {
        this.eventEmitter.emit("log", e);
      });
  }

  async createFile(path) {
    const fileStat = await checkPath(`${this.state.currentDir}/${path}`);
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

  async copyFile(data) {
    const [file, dir] = data.split(/\s+/);
    const pathToSourceFile = resolve(this.state.currentDir, file);
    const pathToDestDir = resolve(this.state.currentDir, dir);
    const fileName = basename(pathToSourceFile);
    if ((await checkPath(pathToSourceFile)) !== "file") {
      this.eventEmitter.emit("log", new Error("Scourge file - No such file"));
      return;
    }
    if ((await checkPath(pathToDestDir)) !== "directory") {
      this.eventEmitter.emit(
        "log",
        new Error(`Destination directory - No such directory`)
      );
      return;
    }
    if (await checkPath(`${pathToDestDir}/${fileName}`)) {
      this.eventEmitter.emit(
        "log",
        new Error(
          `Destination directory already have ${fileName} file or directory`
        )
      );
      return;
    }
    try {
      await pipeline(
        createReadStream(pathToSourceFile),
        createWriteStream(`${pathToDestDir}/${fileName}`)
      );
      this.eventEmitter.emit("log");
    } catch (e) {
      this.eventEmitter.emit("log", e);
    }
  }

  async moveFile(data) {}

  async deleteFile(data) {}
}
