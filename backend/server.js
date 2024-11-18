const express = require("express");
const mysql = require("mysql2"); 
const multer = require('multer');
const cors = require('cors')
const { register, login, deleteUser } = require('./user');
const { getClientProfile, getFreelancerProfile, updateFreelancer, updateClient } = require("./userprofiles");
const { insertJob, getJobDetails, deleteJob, searchJobs, updateJobDetails } = require('./job')
const { getJobsWithMostBids, getTopFreelancersByDomain } = require('./Main')
const { insertBid, deleteBid, updateBid } = require("./Bid");
const { projectDetails, updateProjectDetails } = require("./Project");
const { insertColabRequest, deleteColabRequest, updateCollabRequest, 
        acceptCollaborators, addColabApplication, deleteColabApplication  } = require("./collaboration");
const { insertReview, deleteReview, updateReview } = require("./review");
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log('Request Method:', req.method);
    console.log('Request URL:', req.originalUrl);
    console.log('------------------------'); 
    next(); 
});

//storage for portfolio
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
  });

// MySQL configuration
const config = {
    host: process.env.HOST,
    user: process.env.DB_USER, 
    password: process.env.PASSWORD, 
    database: process.env.DATABASE
};

// Create a MySQL connection globally and connect
global.con = mysql.createConnection(config); 
global.con.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
    } else {
        console.log("Connection Successful!");
    }
});

// user routes
app.post('/api/user/signup', register);
app.post('/api/user/login', login);
app.delete('/api/user/deleteProfile/:id/:type', deleteUser);
app.get('/api/client/get-profile/:id', getClientProfile)
app.get('/api/freelancer/get-profile/:id', getFreelancerProfile)
app.patch('/api/freelancer/update-profile', upload.single('portfolio'), updateFreelancer);
app.patch('/api/client/update-profile', updateClient)

// job routes
app.post('/api/job/create', insertJob)
app.get('/api/job/get-jobs/:fid', getJobsWithMostBids)
app.get('/api/job/get-details/:jid', getJobDetails)
app.delete('/api/job/delete/:jid', deleteJob)
app.get('/api/job/search', searchJobs)
app.patch('/api/job/update/:jid', updateJobDetails)

// bid routes
app.post('/api/bid/submit', insertBid)
app.delete('/api/bid/delete/:bid_id', deleteBid)
app.patch('/api/bid/update/:bid_id', updateBid)

// review
app.post('/api/review/submit', insertReview)
app.delete('/api/review/delete', deleteReview)
app.patch('/api/review/update/:rid', updateReview);

// collaborations 
app.post('/api/collaborations/create-request', insertColabRequest)
app.delete('/api/collaborations/delete-request/:req_id', deleteColabRequest)
app.patch('/api/collaborations/update-request', updateCollabRequest)
app.post('/api/collaborations/apply', addColabApplication)
app.delete('/api/collaborations/withdraw/:appl_id', deleteColabApplication)
app.patch('/api/collaborations/accept-collaborators', acceptCollaborators)

// project
app.get('/api/project/get-details/:pid', projectDetails)
app.patch('/api/project/update/:pid', updateProjectDetails)

// other
app.get('/api/main/get-top-freelancers',getTopFreelancersByDomain)


// Start the server on port 3000
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});
