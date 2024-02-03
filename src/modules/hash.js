import { resolve } from "path";
import { createHash } from "crypto";
import { readFile } from "fs/promises";
import { checkPath } from "../helpers/helpers.js";

export default class Hash {
  constructor(eventEmitter, state) {
    this.eventEmitter = eventEmitter;
    this.state = state;
    this.eventEmitter.on("hash", (path) => {
      this.getHash(path);
    });
  }
  async getHash(path) {
    const targetFilePath = resolve(this.state.currentDir, path);
    const checkFile = await checkPath(targetFilePath);
    let e;
    if (checkFile == "file") {
      const file = await readFile(targetFilePath);
      const hash = createHash("sha256");
      console.log(hash.update(file).digest("hex"));
    } else {
      e = new Error(
        checkFile ? "Illegal operation on a directory" : "No such file"
      );
    }
    this.eventEmitter.emit("log", e);
  }
}
