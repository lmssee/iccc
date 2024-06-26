import { copyFileSync, mkdirSync, writeFileSync } from 'fs';
import createReadMe from 'src/tools/createReadMe';
import createLibrary from './createLibrary';
import createStatic from './createStatic';
import {
  runOtherCode,
  writeJsonFile,
  getCallerFilename,
  initializeFile,
  pathJoin,
  Color,
} from 'ismi-node-tools';

import initData from '../initData';

const [__filename, __dirname] = initializeFile();
/** 项目名称 */
let name: string;
// const { name } = initData;

/** 初始化 vue 项目  */
export default async () => {
  name = initData.name;
  // 添加配置文件
  createReadMe(name);
  // 生成  package.json
  createPackage();
  createDir();
  const nowDir = getCallerFilename(__filename);
  copyFileSync(
    pathJoin(nowDir, '../../../assets/temporary.ico').replace(/(.*:)/, ''),
    `./${name}/static/public/temporary.ico`,
  );
  // 增加项目的文件
  createLibrary();
  // 新增项目的测试文件
  createStatic();
  await runOtherCode({ code: 'npx lmssee -c vue test-button', cwd: `${name}` });
  console.log(Color.cyan('构建完毕，您可以使用以下命令进行下一步操作：'));
  console.log(Color.darkMagenta(`cd ${name}`));
  console.log(Color.darkGreen('npm install'));
  console.log('启动测试服务  '.concat(Color.green('npm run dev')));
};

// 添加 vue 的项目目录文件及静态文件的文件夹
function createDir() {
  const projectDir = `${name}/library`;
  mkdirSync(projectDir);
  mkdirSync(projectDir + '/src');
  mkdirSync(projectDir + '/tools');
  const staticDir = `${name}/static`;
  mkdirSync(staticDir);
  mkdirSync(staticDir + '/src');
  mkdirSync(staticDir + `/public`);
}

/*** 生成 package.json 文件 */
function createPackage() {
  const data: any = {
    name: name.concat('_project'),
    version: '0.0.1',
    type: 'module',
    scripts: {
      clean: 'rm -rf node_modules package-lock.json && npm install',
      create: 'npx lmssee create vue',
      dev: 'npm run build &&  npx lmhot',
      build: `cd  library  && npm run build && cd  ../`,
      up: `cd  library  && npm run up && cd  ../`,
    },
    license: 'ISC',
    devDependencies: {
      '@rollup/plugin-commonjs': '^25.0.7',
      '@rollup/plugin-json': '^6.1.0',
      '@rollup/plugin-node-resolve': '^15.2.3',
      '@rollup/plugin-terser': '^0.4.4',
      '@rollup/plugin-typescript': '^11.1.6',
      '@types/node': '^20.12.10',
      '@vitejs/plugin-vue': '^5.0.4',
      '@vitejs/plugin-vue-jsx': '^3.1.0',
      axios: '^1.7.1',
      lmhot: '0.0.12',
      'rollup-plugin-cleanup': '^3.2.1',
      'rollup-plugin-postcss': '^4.0.2',
      tslib: '^2.6.2',
      typescript: '^5.4.5',
      vite: '^5.2.10',
      'vite-plugin-dts': '^3.9.0',
      vue: '^3.4.24',
      'vue-tsc': '^2.0.19',
    },
    dependencies: {
      '@lmssee/tools': initData.dependencies['ismi-js-tools'],
      sass: '^1.77.2',
    },
  };
  data.devDependencies[`${name}`] = `./library`;

  writeJsonFile(`${name}/package.json`, data);
}
