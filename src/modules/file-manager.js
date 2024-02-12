import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "node:stream/promises";
import { stat, rename, unlink } from "fs/promises";
import path, { resolve, basename } from "path";
import { stdout } from "process";
import { checkPath } from "../helpers/helpers.js";

export default class FileManager {
  constructor(eventEmitter, state) {
    this.state = state;
    this.eventEmitter = eventEmitter;
    this.eventEmitter
      .on("cat", async (path) => await this.readFile(path))
      .on("add", async (path) => await this.createFile(path))
      .on("rn", async (data) => await this.renameFile(data))
      .on("cp", async (data) => await this.copyFile(data, true))
      .on("rm", async (path) => {
        await this.deleteFile(path);
      })
      .on("mv", async (data) => await this.moveFile(data));
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
    try {
      const [filePath, newName] = data;
      const targetFilePath = resolve(this.state.currentDir, filePath);
      const directory = path.dirname(targetFilePath);
      const newFilePath = path.join(directory, newName);
      const stats = await stat(targetFilePath);

      if (path.dirname(newFilePath) !== directory) {
        this.eventEmitter.emit(
          "log",
          new Error("Paths are not in the same directory")
        );
        return;
      }

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

  async copyFile(data, log) {
    const [file, dir] = data;
    const pathToSourceFile = resolve(this.state.currentDir, file);
    const pathToDestDir = resolve(this.state.currentDir, dir);
    const fileName = basename(pathToSourceFile);
    if ((await checkPath(pathToSourceFile)) !== "file") {
      this.eventEmitter.emit("log", new Error("Scourge file - No such file"));
      return false;
    }
    if ((await checkPath(pathToDestDir)) !== "directory") {
      this.eventEmitter.emit(
        "log",
        new Error(`Destination directory - No such directory`)
      );
      return false;
    }
    if (await checkPath(`${pathToDestDir}/${fileName}`)) {
      this.eventEmitter.emit(
        "log",
        new Error(
          `Destination directory already have ${fileName} file or directory`
        )
      );
      return false;
    }
    try {
      await pipeline(
        createReadStream(pathToSourceFile),
        createWriteStream(`${pathToDestDir}/${fileName}`)
      );
      if (log) this.eventEmitter.emit("log");
      return true;
    } catch (e) {
      this.eventEmitter.emit("log", e);
      return false;
    }
  }

  async moveFile(data) {
    const [file] = data;
    const isCopy = await this.copyFile(data); //!<---- copyFile using Readable and Writable streams :)
    if (isCopy) {
      await this.deleteFile(file);
    }
  }

  async deleteFile(path) {
    const targetFilePath = resolve(this.state.currentDir, path);
    const stat = await checkPath(targetFilePath);
    if (stat == "file") {
      await unlink(targetFilePath);
      this.eventEmitter.emit("log");
      return;
    }
    this.eventEmitter.emit(
      "log",
      new Error(`${stat ? "Illegal operation on a directory" : "No such file"}`)
    );
  }
}
