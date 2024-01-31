import os from "os";
import { stat, readdir } from "fs/promises";
import { resolve } from "path";

export class Navigation {
  constructor(eventEmitter, state) {
    this.eventEmitter = eventEmitter;
    this.state = state;
    this.eventEmitter.on("up", () => this.goUpper());
    this.eventEmitter.on("ls", async () => await this.getList());
    this.eventEmitter.on("cd", (args) => this.openDit(args));
  }

  goUpper() {
    if (this.state.currentDir !== os.homedir()) {
      this.state.currentDir = this.state.currentDir
        .split("/")
        .slice(0, -1)
        .join("/");
    }
    this.getLog();
  }

  async getList() {
    const dir = [];
    const files = [];
    try {
      const data = await readdir(this.state.currentDir);
      console.log(data);
      const x = await Promise.all(
        data.map(async (file) => {
          const stats = await stat(`${this.state.currentDir}/${file}`);
          stats.isDirectory()
            ? dir.push({ Name: file, Type: "directory" })
            : files.push({ Name: file, Type: "file" });
        })
      );
      dir.sort((a, b) => a.Name - b.Name);
      files.sort((a, b) => a.Name - b.Name);
      console.table([...dir, ...files]);
      this.getLog();
    } catch (e) {
      console.log(e);
      this.getErrorLog();
    }
  }

  openDit(path) {}

  getLog() {
    console.log("> You are currently in", this.state.currentDir);
  }
  getErrorLog() {
    console.log("> Operation failed");
  }
}
