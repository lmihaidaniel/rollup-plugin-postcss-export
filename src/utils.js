export let noOp = () => {};
export let log = {
  success(msg, title) {
    let date = new Date();
    let time = date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getSeconds();
    console.log(
      "[" + time + "]",
      title || "POSTCSS",
      "'" + "\x1b[32m" + msg + "\x1b[0m" + "'"
    );
  },
  error(msg, title) {
    let date = new Date();
    let time = date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getSeconds();
    console.log("[" + time + "]", title || "POSTCSS", "\x1b[31m", msg, "\x1b[0m");
  }
};
export let getSize = bytes => {
  return bytes < 10000
    ? bytes.toFixed(0) + " B"
    : bytes < 1024000
        ? (bytes / 1024).toPrecision(3) + " kB"
        : (bytes / 1024 / 1024).toPrecision(4) + " MB";
};
