import { writeJsonFile } from 'ismi-node-tools';
import { copyFileSync, writeFileSync } from 'node:fs';
import initData from '../initData';

/** 组件库名称 */
let name: string;

/** 组件库表目录 */
let library: string;

/** 添加组件库表  */
export default () => {
  name = initData.name;
  library = `${name}/library`;

  // vite config
  createViteConfig();
  // ts config file 文件
  createTsconfig();
  copyFileSync(`${name}/LICENSE.md`, `${library}/LICENSE.md`);
  copyFileSync(`${name}/README.md`, `${library}/README.md`);
  copyFileSync(`${name}/CHANGELOG.md`, `${library}/CHANGELOG.md`);
  createPackage();
  // 新增 index.ts
  createIndex();
  createBuildSh();
  writeFileSync(`${library}/src/index.ts`, '');
};

function createViteConfig() {
  writeFileSync(
    `${library}/vite.config.ts`,
    `import { defineConfig } from "vite";
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import terser from "@rollup/plugin-terser";


export default defineConfig({
    build: {
        outDir: "out",
        minify: true,
        cssMinify: true,
        cssCodeSplit: true,
        // cssTarget: "",
        rollupOptions: {
            // 打包不引入不引入的依赖
            external: ["vue", "@lmssee/tools", 'vite'],
            // modules: true,
            output: [{
                format: 'es',
                entryFileNames: "[name].mjs",
                preserveModules: true,
                exports: "named",
                dir: 'out'
            }, {
                format: 'cjs',
                entryFileNames: '[name].cjs',
                preserveModules: true,
                exports: "named",
                dir: 'out'
            }],
            plugins: [terser()],
        },
        lib: {
            entry: "./index.ts",
            name: "${name}"
        }
    },
    plugins: [
        vue(),
        vueJsx(),
    ],
});`,
  );
}

/** 创建 ts config 文件 */
function createTsconfig() {
  writeFileSync(
    `${library}/tsconfig.json`,
    `{
    "compilerOptions": {
        // 打包类型声明
        "emitDeclarationOnly": true,
        "declaration": true,
        "declarationDir": "types/",
        "strict": false,
        "jsx": "preserve",
        "importHelpers": true,
        "skipLibCheck": true,
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "baseUrl": "."
        // "types": ["vue/v3"]
        // "paths": { "*": ["module_modules/*", ""] }
    },
    "include": [
        "./**/*.d.ts",
        "./tools/**/*.ts",
        "./src/**/*.ts",
        "./src/**/**/*.vue",
        "src/button/LmButton.tsx"
    ],
    "exclude": ["./node__modules", "./types", "./out"]
    }`,
  );
}

/** 添加 package.json 文件 */
function createPackage() {
  writeJsonFile(`${library}/package.json`, {
    name: name,
    version: '0.0.1',
    type: 'module',
    private: 'true',
    author: '',
    license: 'ISC',
    description: '',
    main: 'out/index.cjs',
    module: 'out/index.mjs',
    typings: 'types/index.d.ts',
    scripts: {
      build:
        'npm run clear  && vite build  && npm run management  && tsc -p  tsconfig.json',
      clear: 'rm -rf  out && rm  -rf  types',
      management: 'sh  ./tools/build.sh',
      removeDependent: 'rm -rf node_modules out  package-lock.json ',
      clean:
        'npm run  removeDependent   &&  npm  install && npm run clear && npm  run  build',
    },
    files: ['out', 'types'],
    repository: {
      type: 'git',
      url: 'git+https://github.com/...',
    },
    keywords: [name],
    homepage: 'https://....github.io/',
    bugs: {
      url: 'https://github.com/.../.../issues',
      email: '...@....com',
    },
    publishConfig: {
      access: 'public',
      registry: 'https://registry.npmjs.org/',
    },
    dependencies: {
      '@lmssee/tools': initData.dependencies['ismi-js-tools'],
    },
    devDependencies: {
      sass: '^1.75.0',
    },
  });
}

/** 新增 index 文件 */
function createIndex() {
  writeFileSync(
    `${library}/index.ts`,
    `import * as components from './src/index';
export * from './src/index';
import type { App } from 'vue';

/** 
 *  也可以将其他模块， type 在这里进行导出
 */
export const install = function (app: App) {
    for (let key in components) {
        const element: any = (components as any)[key];
        if (element.install)
            app.use(element);
    }

    return app;
}

export default {
    install
}`,
  );
}

/** 新建构建工具 */
function createBuildSh() {
  writeFileSync(
    `${library}/tools/build.sh`,
    ` #!/bin/bash

# 替换 rollup 打包后文本
fn_search_files() {
    for file in "$1"/*; do
        if [ -d "$file" ]; then
            # 查找文件
            local css=$(find "$file" -name **.css)
            # 判断该文件是否为文件类型
            if [ -f "$css" ]; then
                local cssFileName=$(basename "$css")
                local baseFileName=$(basename $css .css)
                local esModuleName="$file/\${baseFileName}.mjs"
                local commandModuleName="$file/\${baseFileName}.cjs"
                if [ -f "$esModuleName" ]; then
                    local new_string=";import \\"./\${cssFileName}\\";"
                    sed -i "" "s#[\/][\*][ ]*empty[ ]*css[ ]*[\*][\/]#\${new_string}#g" "$esModuleName"
                fi
                if [ -f "$commandModuleName" ]; then
                    local new_string=";require(\\"./\${cssFileName}\\");"
                    sed -i "" "s#[\/][\*][ ]*empty[ ]*css[ ]*[\*][\/]#\${new_string}#g" "$commandModuleName"
                fi
            fi
            fn_search_files "$file"
        fi
    done
}

dirName=$(pwd)

fn_search_files $dirName
`,
  );
}
