import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

//user routes
export const signupUser = (data) => API.post('/api/user/signup', data);

export const loginUser = (data) => API.post('/api/user/login', data);

export const deleteUser=(id,type)=>API.delete(`/api/user/deleteProfile/${id}/${type}`)

export const getClientProfile = (id) => API.get(`/api/client/get-profile/${id}`);

export const getFreelancerProfile = (id) => API.get(`/api/freelancer/get-profile/${id}`)

export const updateFreelancer = async (data) => {
  const response = await axios.patch('http://localhost:3000/api/freelancer/update-profile', data, {
      headers: {
          'Content-Type': 'multipart/form-data'
      }
  });
  return response;
};

export const updateClient = (id,data) => API.patch('/api/client/update-profile', { id, data });


//job routes
export const createjob = (data) => API.post('/api/job/create',data);

export const getJobs = (fid) => API.get(`/api/job/get-jobs/${fid}`);

export const getJobDetails = (jid) => API.get(`/api/job/get-details/${jid}`);

export const deleteJob = (jid) => API.delete(`/api/job/delete/${jid}`);

export const searchJobs = (domain,searchQuery) => API.get(`/api/job/search?domain=${domain}&searchTerm=${searchQuery}`)

export const updateJob = (jid,data) =>API.patch(`/api/job/update/${jid}`,data)


// bid routes
export const submitBid = (data) => API.post('/api/bid/submit',data);

export const deleteBid = (bid_id) => API.delete(`/api/bid/delete/${bid_id}`)

export const updateBid = (bid_id) => API.patch(`/api/bid/update/${bid_id}`)

// review routes
export const submitReview = (data) => API.post('/api/review/submit',data);

export const deleteReview = (data) => API.delete(`/api/review/delete`,{data})

export const updateReview = (rid,data)=>API.patch(`/api/review/update/${rid}`,data)

// collaboration routes
export const addColabRequest = (data) => API.post('/api/collaborations/create-request',data)

export const deleteColabRequest = (req_id) => API.delete(`/api/collaborations/delete-request/${req_id}`)

export const updateColabRequest = (data) => API.patch('/api/collaborations/update-request',data)

export const applyForColab =(data)=> API.post('/api/collaborations/apply',data)

export const withdrawColab=(appl_id)=>API.delete(`/api/collaborations/withdraw/${appl_id}`)

export const addCollaborators =(data)=> API.patch('/api/collaborations/accept-collaborators',data)


// project routes
export const getProjectData = (pid) => API.get(`/api/project/get-details/${pid}`)


export const updateProject = (pid,data)=> API.patch(`/api/project/update/${pid}`,data)


//main
export const getTopFreelancers=()=>API.get(`/api/main/get-top-freelancers`)
