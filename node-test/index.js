const path = require("path");
const Koa = require("koa");
const Router = require("koa-router");
const { koaBody } = require("koa-body");
const fse = require("fs-extra");
const source = require("koa-static");
const cors = require("@koa/cors");

const app = new Koa();
const router = new Router();
app.use(cors());

// 处理静态资源
app.use(source(path.resolve(__dirname, "public")));

// 上传文件的目录地址
const UPLOAD_DIR = path.resolve(__dirname, "public/upload");

// 处理页面请求
app.use(
  koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.resolve(__dirname, "temp"), // 文件存放地址
      keepExtensions: true,
      maxFieldsSize: 2 * 1024 * 1024,
    },
  })
);

// 文件上传
router.post("/upload", async (ctx) => {
  // 文件转移
  // koa-body 在处理完 file 后会绑定在 ctx.request.files
  const file = ctx.request.files.file;
  // // [ name, index, ext ] - 分割文件名
  const fileNameArr = file.originalFilename.split(".");
  // // 存放切片的目录
  const chunkDir = `${UPLOAD_DIR}/${fileNameArr[0]}`;
  if (!fse.existsSync(chunkDir)) {
    //   // 没有目录就创建目录
    //   // 创建大文件的临时目录
    await fse.mkdirs(chunkDir);
  }
  // // 原文件名.index - 每个分片的具体地址和名字
  const dPath = path.join(chunkDir, fileNameArr[1]);

  // // 将分片文件从 temp 中移动到本次上传大文件的临时目录
  await fse.move(file.filepath, dPath, { overwrite: true });
  ctx.body = "文件上传成功";
});

// 合并文件
router.post("/merge", async (ctx) => {
  const { name, chunkNameList } = ctx.request.body;
  const fname = name.split(".")[0];

  const chunkDir = path.join(UPLOAD_DIR, fname);
  chunkNameList.map((chunkPath) => {
    // 合并文件
    fse.appendFileSync(
      path.join(UPLOAD_DIR, name),
      fse.readFileSync(`${chunkDir}/${chunkPath}`)
    );
  });
  // 删除临时文件夹
  fse.removeSync(chunkDir);
  // 返回文件地址
  ctx.body = { msg: "合并成功", url: `http://localhost:3000/upload/${name}` };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => console.log("Server runnint on port 3000"));
