import { CronJob } from "cron";
import { updateMySQL } from "./updateMySQLJob"

const job = CronJob.from({
	cronTime: '0 8,18 * * *',
	onTick: async function () {
    try {
      console.log('Update MySQL job start')
      const response = await updateMySQL()
      console.log('Update MySQL job run correctly')
    }catch(err) {
      console.log('Update MySQL job faild')
      console.log(err)
    }
	},
	start: true,
	timeZone: 'America/Los_Angeles'
});
