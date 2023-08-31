console.log("start");

setTimeout(() => {
  console.log("setTimeout");
}, 0);

Promise.resolve()
  .then(function () {
    console.log("promise1");
    Promise.resolve().then(function () {
      console.log("promise2");
    });
    console.log("123");
  })
  .then(function () {
    console.log("promise3");
  });

console.log("end");
