import { stat, readdir } from "fs/promises";
import { resolve } from "path";

export async function getDirFiles(path) {
  const data = await readdir(path, { withFileTypes: true });
  const dir = [];
  const files = [];

  data.map((file) => {
    if (file.isDirectory()) {
      dir.push({ Name: file.name, Type: "directory" });
    } else {
      files.push({ Name: `${file.name}`, Type: "file" });
    }
  });

  return { files, dir };
}

export async function checkPath(path) {
  try {
    const stats = await stat(path);
    if (stats.isDirectory()) {
      return "directory";
    } else {
      return "file";
    }
  } catch (e) {
    if (e.code === "ENOENT") {
      return null;
    }
  }
}
