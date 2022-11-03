var fs = require("fs");
const copier = require("./controllers/copier");
const CronJob = require("cron").CronJob;

exports.listenForNewEntries = async () => {
  const logger = require("./controllers/logger");
  const { sftp } = require(".");

  const cronFunc = async () => {
    try {
      //get new files
      let fileList = await sftp.list("/");
      const fileListNames = fileList.map((el) => el.name);
      const currentFiles = fs.readdirSync(process.env.ARCHIVE_LOCATION);
      const oldFiles = currentFiles.filter((el) => !fileListNames.includes(el));
      const newFiles = fileListNames.filter((el) => !currentFiles.includes(el));
      //check new file existence
      if (newFiles && newFiles.length > 0) {
        logger("info", "new files added to remote server");

        //download new files
        const remotePaths = newFiles.map((el) => `/${el}`);
        for (el of remotePaths) {
          const fd = fs.openSync(`./temp/${el.split("/")[1]}`, "w");

          await sftp.fastGet(el, `./temp/${el.split("data/")[1]}`);
          console.log("file saved: ", el.split("/")[1]);
          fs.close(fd);
        }
        logger("info", `${remotePaths.length} files downloaded to temp folder`);

        //copy files to archive_location
        for (el of newFiles) {
          //fileName
          copier(el);
        }
      }
      logger("info", "cron Func executed, next job in 15 days");
    } catch (err) {
      logger("error", err);
    }
  };
  //“At minute 0 past every 360th hour.” (every 15 days)
  const cronJob = new CronJob("0 */360 * * *", async function () {
    await cronFunc();
  });

  cronFunc();
  cronJob.start();
};
