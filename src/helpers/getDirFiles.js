import { stat, readdir } from "fs/promises";

export async function getDirFiles(path) {
  const data = await readdir(path);
  const dir = [];
  const files = [];
  await Promise.all(
    data.map(async (file) => {
      const stats = await stat(`${path}/${file}`);
      if (stats.isDirectory()) {
        dir.push({ Name: file, Type: "directory" });
      } else {
        files.push({ Name: `${file}`, Type: "file" });
      }
    })
  );
  return { files, dir };
}

export async function getStats (path) {

  try {
      const stats = await stat(path);
      if (stats.isDirectory()) {
        return 'dir'
      } else {
        return 'file'
      }
    } catch (e) {
      if (e.code === "ENOENT") {
      return null
      }}
}

