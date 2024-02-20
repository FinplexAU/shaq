import { readdirSync, statSync, writeFileSync } from "fs";

const generateExclude = (path) => {
  const folder = readdirSync("./dist" + path);
  const exclude = [];
  for (const item of folder) {
    if (item === "build") continue;
    if (item.startsWith("_")) continue;

    const itemPath = path + item;

    const isDir = statSync("./dist" + itemPath).isDirectory();
    if (isDir) {
      exclude.push(...generateExclude(itemPath));
    } else {
      exclude.push(itemPath);
    }
  }
  return exclude;
};

const exclude = ["/build/*", "/assets/*", ...generateExclude("/")];

const data = {
  version: 1,
  include: ["/*"],
  exclude,
};

writeFileSync("./dist/_routes.json", JSON.stringify(data));
