import os from "os";
import { stat, readdir } from "fs/promises";
import { resolve } from "path";

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
    }
    this.eventEmitter.emit("log");
  }

  async getList() {
    const dir = [];
    const files = [];
    try {
      const data = await readdir(this.state.currentDir);
      await Promise.all(
        data.map(async (file) => {
          const stats = await stat(`${this.state.currentDir}/${file}`);
          if (stats.isDirectory()) {
            dir.push({ Name: file, Type: "directory" });
          } else {
            files.push({ Name: `${file}`, Type: "file" });
          }
        })
      );
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
