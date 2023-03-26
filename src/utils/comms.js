import { replRawMode, replSend } from "./bluetooth/js/repl";

// send to monocle display
const sendToMonocle = async (replStr) => {
  await replRawMode(true);
  await replSend(replStr);
};

export const execMonocle = (snippet) => {
  // https://github.com/siliconwitchery/web-bluetooth-repl/blob/b13ade8c1aa9754e4a2ad917c2d227705c02ef7f/js/repl.js#L269
  let string = "";
  string = snippet.replaceAll("\r\n", "\r");
  string = string.replaceAll("\n", "\r");

  sendToMonocle(string);
};
