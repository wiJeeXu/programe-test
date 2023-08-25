const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("node:worker_threads");
if (isMainThread) {
  const work1 = new Worker(__filename);
  console.log(work1.threadId);
  work1.postMessage("我是线程1");
  const work2 = new Worker(__filename);
  console.log(work2.threadId);
  work2.postMessage("我是线程2");
  work1.on("message", (msg) => {
    console.log(msg);
    work1.terminate();
  });
  work2.on("message", (msg) => {
    console.log(msg);
    work2.terminate();
  });
} else {
  parentPort.on("message", (msg) => {
    console.log(msg);
    parentPort.postMessage(msg + "关闭");
  });
}
