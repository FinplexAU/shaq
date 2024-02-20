import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:2013/graphql",
  documents: "src/**/*.{tsx,ts,graphql}",
  generates: {
    "src/__generated__/": {
      preset: "client",
      config: {
        enumsAsTypes: true,
      },
    },
  },
};

export default config;
