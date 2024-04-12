import { timeUpdateRequestLimit } from "./blockchain/config";
import { StartWatchingTimer, UpdateLastTime, UpdateSingleStar, UpdateStars, actualStarList, lastUpdateRequqstTime } from "./blockchain/Stars/watcher";
import { InitGameIoServer } from "./game";
import { AdminDataRequest, AdminSaveData, AdminUpdateUserData, CreateBox, GetAdminUserData, GetAllStars, GetLinksByOwnerResponse, GetOwnerDataResponse, GetProjectData, ReferralApiDefault, UpdateAllStars, UpdateOneStar, WithdrawRewardAction } from "./connections";
const dEnv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

dEnv.config();

const port = process.argv[2] ? process.argv[2] : process.env.DEFAULT_PORT

//Boxes:
app.post('/api/boxes/create', CreateBox)

// End boxes

app.use(express.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', (req, res) => {
  res.status(200).send('API homepage');
})

   /*
   res.setHeader("Access-Control-Allow-Origin", "*" );
   res.setHeader('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE");
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
   res.setHeader('Access-Control-Allow-Credentials', 'true');
   */

app.get('/api/getlinksbyowner/:id', GetLinksByOwnerResponse)

app.get('/api/getownerdata/:id', GetOwnerDataResponse)

app.get('/api/public/:project', GetProjectData)

app.get('/api/getstarlist', GetAllStars)

app.post('/api/updatestars', UpdateAllStars)

app.post('/api/updateonestar/:id', UpdateOneStar)

app.post('/api/admin/requestdata', AdminDataRequest)

app.post('/api/admin/savedata', AdminSaveData)

app.post('/api/admin/getusers', GetAdminUserData)

app.post('/api/admin/updateusers', AdminUpdateUserData)

app.post('/api/withdraw', WithdrawRewardAction)



app.post('/api', ReferralApiDefault)

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

// InitGameIoServer()
StartWatchingTimer();

