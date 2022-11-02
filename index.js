const Client = require("ssh2-sftp-client");
const { listenForNewEntries } = require("./app");
const dotenv = require("dotenv");
const logger = require("./controllers/logger");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
console.log("d: ", process.env.NODE_ENV);
require("./server");

const sftp = new Client("moenco-client");

const config = {
  host: process.env.SERVER_HOST,
  username: process.env.SERVER_USERNAME,
  password: process.env.SERVER_PASSWORD,
  port: process.env.SERVER_PORT,
};
const func = async () => {
  try {
    const dir = await sftp.connect(config);
    await sftp.cwd();
    sftp.on("error", (err) => {
      console.log(err);
      logger("error", err);
    });
    logger("info", `connected to remote SFTP server`);
    module.exports = { sftp };

    listenForNewEntries();
    // .then(() => sftp.end());
    // return
  } catch (err) {
    console.log(err);
    //TODO: log to file
    logger("error", err.message);
    //retry connection
    func();
  }
};
func();
