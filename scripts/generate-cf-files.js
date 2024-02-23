import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";

const generateExclude = (path) => {
  const folder = readdirSync("./dist" + path);
  const exclude = [];
  for (const item of folder) {
    if (item === "build") continue;
    if (item === "assets") continue;
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

const generatedExcludes = generateExclude("/");

const exclude = ["/build/*", "/assets/*", ...generatedExcludes];

const data = {
  version: 1,
  include: ["/*"],
  exclude,
};

writeFileSync("./dist/_routes.json", JSON.stringify(data));

const headers = readFileSync("./dist/_headers").toString().split("\n");

for (const exclude of generatedExcludes) {
  headers.push(exclude);
  headers.push(
    "  Cache-Control: public, max-age=3600, s-maxage=3600, stale-while-revalidate=604800",
  );

  headers.push("");
}
writeFileSync("./dist/_headers", headers.join("\n"));
