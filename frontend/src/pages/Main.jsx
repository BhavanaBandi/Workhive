import { useContext, useState, useEffect } from "react";
import { UserContext } from "../contexts/UserContext";
import { getJobs, getTopFreelancers } from "../apis";
import JobCard from "../components/JobCard";
import { useNavigate } from "react-router-dom";
import CircularRating from '../components/CircularRating'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactLoading from "react-loading";

const Main = () => {
    const { user } =  useContext(UserContext);
    const [jobs, setJobs] = useState(null);
    const [colab,setColab]=useState(null)
    const [topFreelancers, setTopFreelancers] = useState([]);
    const Navigate=useNavigate();

    const fetchJobs = async () => {
        try {
            const response = await getJobs(user.id);
            setJobs(response.data?.jobs || null);
            setColab(response.data?.collaborations ||  null)
        } catch (error) {
            console.error("couldn't get jobs", error);
            toast.error('An error occured while getting jobs');
        }
    };

    // get top freelancers
    const fetchFreelancers = async () => {
        try {
            const response = await getTopFreelancers();
            console.log(response.data)
            setTopFreelancers(response.data || []);
        } catch (error) {
            toast.error('Could not get Top freelancers');
        }
    };

    // get top jobs or freelancers based on user type 
    useEffect(() => {
        if(user && user.type=='freelancer'){
            fetchJobs();
        }
        if (user && user.type === 'client') {
            fetchFreelancers();
        }
        console.log(topFreelancers)
    }, [user]); 

    // view project details
    const gotoProject=(pid)=>{
        console.log(pid)
       Navigate(`/project/${pid}`)
    }

    // view freelancer profile
    const goToFreelancer=(fid)=>{
        console.log(fid)
        Navigate(`/freelancer/${fid}`)
    }

    if((!jobs && !colab) && !topFreelancers){
        return(
            <ReactLoading type="spin" color="#fdd586"height={100} width={50} />
         )
    }

    return (
        <div>
            {user && user.type === 'freelancer' && (
                <div className='top-jobs'>
                    <h2>Open Jobs</h2>
                    <div className='card-list'>
                    {jobs && jobs.length > 0 ? jobs.map((job) => (
                        <JobCard key={job.jid} job={job} />
                    )): <p>No available jobs yet</p>}
                    </div>

                    <h2>Top Collaboration Requests </h2>
                    <div className="card-list">
                        {colab && colab.length > 0 ? (
                            colab.map((c) => (
                                <div key={c.req_id} className="card-styling" onClick={()=>{gotoProject(c.pid)}}>
                                    <p><strong>{c.freelancer_name}</strong></p>
                                    <p className='review-date'>posted {formatDistanceToNow(new Date(c.posted),{addSuffix:true})}</p>
                                    <p>{c.description}</p>
                                </div>
                            ))
                        ) : (
                            <p>No collaboration requests available yet</p>
                        )}
                    </div>
                </div>
            )}
            {user && user.type === 'client' && (
                <div className='top-freelancers'>
                    <h2>Top Freelancers by Domain</h2>
                    {Object.keys(topFreelancers).length > 0 ? (
                        Object.entries(topFreelancers).map(([domain, freelancers]) => (
                            <div key={domain} className='domain-list'>
                                <h3>{domain}</h3>
                                <div className="freelancer-list">
                                    {Array.isArray(freelancers) && freelancers.length > 0 ? (
                                        freelancers.map((freelancer) => (
                                            <div key={freelancer.fid} className="freelancer-card" onClick={()=>{goToFreelancer(freelancer.fid)}}>
                                                <div className="freelancer-details">
                                                    <h4 title="See Profile" className="user-name">{freelancer.name}</h4>
                                                    <p>Review Count: {freelancer.review_count}</p>
                                                </div>
                                                <div className="freelancer-rating">
                                                    <CircularRating rating={parseFloat(freelancer.avg_rating).toFixed(2)} />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No freelancers available for this domain</p> 
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No top freelancers available</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Main;
