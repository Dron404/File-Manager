import { createBrotliCompress, createBrotliDecompress } from "zlib";
import { pipeline } from "stream/promises";
import { createReadStream, createWriteStream } from "fs";
import { resolve, basename } from "path";
import { checkPath } from "../helpers/helpers.js";

export default class FileCompressor {
  constructor(eventEmitter, state) {
    this.state = state;
    this.eventEmitter = eventEmitter;
    this.eventEmitter
      .on("compress", async (path) => await this.compress(path))
      .on("decompress", async (path) => await this.decompress(path));
  }

  async compress(path) {
    const [file, dir] = path;
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
    if (await checkPath(`${pathToDestDir}/${fileName}.br`)) {
      this.eventEmitter.emit(
        "log",
        new Error(
          `Destination directory already have ${fileName}.br file or directory`
        )
      );
      return;
    }

    try {
      await pipeline(
        createReadStream(pathToSourceFile),
        createBrotliCompress(),
        createWriteStream(`${pathToDestDir}/${fileName}.br`)
      );
      this.eventEmitter.emit("log");
      return true;
    } catch (e) {
      this.eventEmitter.emit("log", e);
      return false;
    }
  }

  async decompress(path) {
    const [file, dir] = path;
    const pathToSourceFile = resolve(this.state.currentDir, file);
    const pathToDestDir = resolve(this.state.currentDir, dir);
    const fileName = basename(pathToSourceFile, '.br');
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
        createBrotliDecompress(),
        createWriteStream(`${pathToDestDir}/${fileName}`)
      );
      this.eventEmitter.emit("log");
      return true;
    } catch (e) {
      this.eventEmitter.emit("log", e);
      return false;
    }
  }
}
