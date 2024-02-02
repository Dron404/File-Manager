import { App } from "./app.js";
import path from "path";

const args = process.argv.slice(2);
let userName = "";
args.forEach((arg) => {
  if (arg.startsWith("--username=")) {
    userName = arg.split("=")[1];
  }
});

const app = new App(userName);

app.start();
