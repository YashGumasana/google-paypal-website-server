import dotenv from 'dotenv'
dotenv.config()
import * as bodyParser from 'body-parser'
import express, { Request, Response } from 'express'
import http from 'http'
import cors from 'cors'
import { mongooseConnection } from './database/connection'
import * as packageInfo from '../package.json'
import cron from 'node-cron'
import axios from 'axios'


import { router } from './Routes'
import { basicModel } from './database/models/basic'
import { influencerModel } from './database/models/influencer'
import { vipModel } from './database/models/vip'
import { vvipModel } from './database/models/vvip'
import { planstorageModel } from './database/models/planstorage'

const app = express();
app.use(cors())
app.use(mongooseConnection)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


const health = (req: Request, res: Response) => {
    return res.status(200).json({
        message: "grubgrams Server is Running, Server health is green",
        app: packageInfo.name,
        version: packageInfo.version,
        description: packageInfo.description,
        author: packageInfo.author,
        license: packageInfo.license
    })
}

const bad_gateway = (req: Request, res: Response) => {
    return res.status(502).json({ status: 502, message: "grubgrams Backend API Bad Gateway" })
}

app.get('/', health);
app.get('/health', health);
app.get('/isServerUp', (req: Request, res: Response) => {
    res.send('Server is running');
})
app.use(router)
app.use('*', bad_gateway)

// cron.schedule('* * * * *', async () => {
//     try {
//         // const response: any = await axios.get('http://localhost:5000/user/analyze_user_youtube');
//         const response: any = await axios.get('https://youtube-analyze.onrender.com/user/analyze_user_youtube');
//         console.log('runnign api', response.data.message);
//     } catch (error) {
//         console.error('Error calling API:', error.message);
//     }
// });

// cron.schedule('* * * * *', async () => {
//     try {

//         const currentDate = new Date();


//         //  do isActive : false
//         const filter = {
//             expiryDate: { $lt: currentDate }
//         };
//         const update = {
//             $set: { isActive: false }
//         };
//         await basicModel.updateMany(filter, update);
//         await influencerModel.updateMany(filter, update);
//         await vipModel.updateMany(filter, update);
//         await vvipModel.updateMany(filter, update);
//         await planstorageModel.updateMany(filter, update);



//         // Delete data where expiry date is before the current date
//         await basicModel.deleteMany({ dataExpiryDate: { $lt: currentDate } });
//         await influencerModel.deleteMany({ dataExpiryDate: { $lt: currentDate } });
//         await vipModel.deleteMany({ dataExpiryDate: { $lt: currentDate } });
//         await vvipModel.deleteMany({ dataExpiryDate: { $lt: currentDate } });
//         await planstorageModel.deleteMany({ dataExpiryDate: { $lt: currentDate } });

//         console.log('Expired data deleted.');

//     } catch (error) {
//         console.error('Error Is Detected In Expired data delete:', error.message);

//     }
// });


let server = new http.Server(app);

//socket
import WebSocket from 'ws'
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws: any) => {
    ws.on('message', (message: any) => {
        console.log(`Received message: ${message}`);
    });
});

export default server