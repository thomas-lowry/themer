import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import html from "rollup-plugin-html-bundle";
import postcss from "rollup-plugin-postcss";
import cssnano from "cssnano";

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require("child_process").spawn(
        "npm",
        ["run", "start", "--", "--dev"],
        {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        }
      );

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    },
  };
}

export default [
  {
    input: "src/figma.ts",
    output: {
      file: "public/figma.js",
      format: "iife",
      name: "figma",
    },
    plugins: [
      svelte({
        preprocess: sveltePreprocess({ sourceMap: !production }),
        compilerOptions: { dev: !production },
      }),
      resolve({
        browser: true,
        dedupe: ["svelte"],
      }),
      typescript(),
      commonjs(),
      production && terser(),
    ],
  },
  {
    input: "src/app.ts",
    output: {
      format: "iife",
      name: "app",
      file: "public/app.js",
    },
    plugins: [
      svelte({
        preprocess: sveltePreprocess({ sourceMap: !production }),
        compilerOptions: { dev: !production },
      }),
      resolve({
        browser: true,
        dedupe: ["svelte"],
      }),
      commonjs(),
      typescript({
        sourceMap: !production,
        inlineSources: !production,
      }),
      postcss({
        plugins: [cssnano()],
      }),
      html({
        template: "src/ui.html",
        target: "public/ui.html",
        inline: true,
      }),
      !production && serve(),
      !production && livereload("public"),
      production && terser(),
    ],
  },
];
