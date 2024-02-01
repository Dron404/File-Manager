import os from "os";
import { stat } from "fs/promises";
import { resolve } from "path";
import { getDirFiles } from "../helpers/getDirFiles.js";

export default class Navigation {
  constructor(eventEmitter, state) {
    this.eventEmitter = eventEmitter;
    this.state = state;
    this.eventEmitter.on("up", () => this.goUpper());
    this.eventEmitter.on("ls", async () => await this.getList());
    this.eventEmitter.on(
      "cd",
      async (args) => await this.changeDirectory(args)
    );
  }

  goUpper() {
    if (this.state.currentDir !== os.homedir()) {
      this.state.currentDir = this.state.currentDir
        .split("/")
        .slice(0, -1)
        .join("/");
      this.eventEmitter.emit("log");
    } else {
      this.eventEmitter.emit("log", new Error("You are in the root directory"));
    }
  }

  async getList() {
    try {
      const { dir, files } = await getDirFiles(this.state.currentDir);
      dir.sort((a, b) => a.Name - b.Name);
      files.sort((a, b) => a.Name - b.Name);
      console.table([...dir, ...files]);
      this.eventEmitter.emit("log");
    } catch (e) {
      this.eventEmitter.emit("log", e);
    }
  }

  async changeDirectory(path) {
    const checkDirPath = resolve(this.state.currentDir, path);
    try {
      const stats = await stat(checkDirPath);
      if (stats.isDirectory()) {
        this.state.currentDir = checkDirPath;
        this.eventEmitter.emit("log");
        return;
      }
      throw new Error();
    } catch (e) {
      this.eventEmitter.emit("log", e);
    }
  }
}
