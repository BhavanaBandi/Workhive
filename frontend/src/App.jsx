import { useContext } from 'react'
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom'
import { UserContext } from './contexts/UserContext'
import {ToastContainer} from 'react-toastify';
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Main from './pages/Main'
import CreateJob from './pages/CreateJob'
import JobInfo from './pages/JobInfo'
import ClientProfile from './pages/ClientProfile'
import FreelancerProfile from './pages/FreelancerProfile'
import SearchJob from './pages/SearchJob'
import ProjectInfo from './pages/ProjectInfo'
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const {user}=useContext(UserContext);

  return (
    <div className="App">
      <BrowserRouter>
        <ToastContainer position="top-center"  />
        <Navbar/>
          <div className="pages" >
            <Routes>
              <Route path='/' element={<Home />}/>
              <Route path='/home' element={<Main/>}/>
              <Route path='/signup' element={!user ? <Signup /> : <Navigate to="/home"/>}/>
              <Route path='/login' element={!user ? <Login /> : <Navigate to="/home"/>}/>   
              <Route path='/profile' element={user && user.type=='freelancer'?<FreelancerProfile id={user?.id || null}/>:<ClientProfile id={user?.id || null}/>}/>
              <Route path='/createjob' element={<CreateJob/>}/>
              <Route path='/jobs/:jid' element={<JobInfo/>}/>
              <Route path='/client/:cid' element={<ClientProfile/>}/>
              <Route path='/freelancer/:fid' element={<FreelancerProfile/>}/>
              <Route path='/search' element={<SearchJob/>}/>
              <Route path='/project/:pid' element={<ProjectInfo/>}/>
              <Route path='*' element={<NotFoundPage/>}/>
            </Routes>
          </div>
      </BrowserRouter>
    </div>
  )
}

export default App
