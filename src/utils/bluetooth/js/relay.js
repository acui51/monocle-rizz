// export const relay = (msg) => {
//   console.log('relay', msg);
// }

export const relay = {
  msg: (msg, callback) => {
    callback(msg)
  }
};
