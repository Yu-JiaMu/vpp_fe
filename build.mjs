#!/usr/bin/env zx
// ssh-copy-id your_username@your_server_address
// 导入 zx 的工具函数
import { $, cd, echo, path, fs } from 'zx'
import archiver from 'archiver'
// 定义参数和路径
const CLI_PATH = 'cli.exe' // CLI 可执行文件的路径
const BUILD_DIR = './dist/' // 要打包的文件夹
const ZIP_DIR = './dist-zip' // 要打包的文件夹
const ZIP_NAME = 'iot.zip' // 压缩包名称
const SERVER_USER = 'root' // 远程服务器用户名
const SERVER_HOST = '122.9.136.216' // 远程服务器地址
const SERVER_PATH = '/usr/local/nginx/html/zwvpp-iot/dist' // 远程服务器存储路径

// 获取参数（第一个参数用来控制执行流程）
const args = process.argv.slice(2) // 获取命令行参数（去掉前两个：node 和脚本路径）
const action = args[1] || 'dev' // 默认为 "dev"，可以是 "build" 或 "dev"
const zipFilePath = `${ZIP_DIR}/${ZIP_NAME}`

// 主流程
try {
  if (action === 'build') {
    await build()
  } else if (action === 'dev') {
    await build()
    await deploy()
  } else {
    echo("未知命令！请使用 'build' 或 'dev' 作为参数。")
    process.exit(1)
  }
} catch (error) {}

async function build() {
  await gitPullBeforeBuild()

  await clearDirectory(BUILD_DIR) // 清空打包目录
  await deleteFile(`${zipFilePath}`) // 删除旧的 zip 文件
  // 执行打包命令
  echo('开始执行 CLI 打包...')
  action === 'build' ? await $`pnpm build` : await $`pnpm build:test`

  // 开始压缩文件
  echo('开始压缩文件...')
  const output = fs.createWriteStream(zipFilePath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  const archivePromise = new Promise((resolve, reject) => {
    output.on('close', () => {
      echo(`压缩完成！总共压缩了 ${archive.pointer()} 字节。`)
      resolve()
    })

    archive.on('error', (err) => {
      reject(err)
    })

    archive.pipe(output)
    archive.directory(BUILD_DIR, false)
    archive.finalize()
  })

  await archivePromise
  echo('压缩文件完成！')

  // 自动提交 git
  await autoGitCommit()
}

async function gitPullBeforeBuild() {
  echo('开始拉取最新代码...')

  try {
    await $`git pull`
    echo('Git 拉取完成 ✅')
  } catch (err) {
    echo('Git pull 失败，请先处理冲突 ❌')
    process.exit(1)
  }
}

async function autoGitCommit() {
  const status = await $`git status --porcelain`
  if (!status.stdout.trim()) {
    echo('Git 无变更，跳过提交')
    return
  }

  echo('开始自动提交 Git...')
  await $`git add .`
  await $`git commit -m 打包自动提交`
  echo('开始推送到远程仓库...')
  await $`git push`
  echo('Git 自动提交并推送完成 ✅')
}

async function deploy() {
  echo('开始上传并解压文件到服务器...')
  await $`scp ${zipFilePath} ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH} && ssh ${SERVER_USER}@${SERVER_HOST} "cd ${SERVER_PATH} && unzip -o ${ZIP_NAME}"`
  echo('文件已成功上传并解压到服务器！')
}

// 清空目录
async function clearDirectory(directory) {
  try {
    if (await fs.stat(directory).catch(() => false)) {
      const files = await fs.readdir(directory)
      for (const file of files) {
        const filePath = path.join(directory, file)
        const stat = await fs.stat(filePath)
        if (stat.isDirectory()) {
          await clearDirectory(filePath) // 递归删除子目录
          await fs.rmdir(filePath)
        } else {
          await fs.unlink(filePath) // 删除文件
        }
      }
    } else {
      console.log(`目录 ${directory} 不存在，无需清理`)
    }
    // console.log(`已清空目录: ${directory}`);
  } catch (error) {
    console.error(`清空目录 ${directory} 时出错:`, error)
  }
}

// 删除文件
async function deleteFile(filePath) {
  try {
    if (await fs.stat(filePath).catch(() => false)) {
      await fs.unlink(filePath)
      console.log(`已删除文件: ${filePath}`)
    } else {
      console.log(`文件 ${filePath} 不存在，无需删除`)
    }
  } catch (error) {
    console.error(`删除文件 ${filePath} 时出错:`, error)
  }
}

// 修改配置
async function addConfigLine(apiUrl) {
  if (!apiUrl) {
    process.exit(0)
  }
  const configPath = './utils/config.js'

  try {
    let content = await fs.readFile(configPath, 'utf-8')
    const exportLine = 'export default axiosApi'
    const newLine = `axiosApi.ApiUrl2 = "${apiUrl}";`
    const index = content.indexOf(exportLine)

    if (index !== -1) {
      content = content.substring(0, index + exportLine.length) + `\n${newLine}\n`
      await fs.writeFile(configPath, content, 'utf-8')
      console.log('配置文件已成功修改。')
    } else {
      console.log('未找到 "export default axiosApi" 行。')
    }
  } catch (err) {
    console.error('修改配置文件时出错:', err)
  }
}

// 复原配置
async function removeConfigLine() {
  const configPath = './utils/config.js'

  try {
    let content = await fs.readFile(configPath, 'utf-8')
    const exportLine = 'export default axiosApi'
    const index = content.indexOf(exportLine)

    if (index !== -1) {
      content = content.substring(0, index + exportLine.length) + '\n'
      await fs.writeFile(configPath, content, 'utf-8')
      console.log('配置文件中的新增内容已成功删除。')
    } else {
      console.log('未找到 "export default axiosApi" 行。')
    }
  } catch (err) {
    console.error('删除配置文件行时出错:', err)
  }
}
