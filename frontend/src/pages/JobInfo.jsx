import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { useContext, useState, useEffect } from 'react';
import { getJobDetails, submitBid, updateJob } from '../apis'; // Make sure to import updateJob
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import BidCard from '../components/BidCard';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaExclamationCircle } from 'react-icons/fa';
import ReactLoading from "react-loading";

const JobInfo = () => {
    const { jid } = useParams();
    const { user } = useContext(UserContext);
    const [job, setJob] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [create, setCreate] = useState(false);
    const [proposal, setProposal] = useState('');
    const [editing, setEditing] = useState(false);
    const [updatedJob, setUpdatedJob] = useState({ title: '', description: '' });
    const navigate = useNavigate()

    

    // get job on load
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const response = await getJobDetails(jid);
                setJob(response.data?.job || null);
                setBids(response.data?.bids || null);
                setUpdatedJob({
                    title: response.data.job.title,
                    description: response.data.job.description
                });
            } catch (error) {
                console.log("Couldn't get job details", error);
                toast.error(`${error.response.data.error || 'Could not get job details'}`);
                navigate('/home')
            } finally {
                setLoading(false);
            }
        };

        if (jid) {
            fetchJobs();
        }
    }, []);

    // post a bid
    const handleSubmitBid = async (e) => {
        setLoading(true);
        e.preventDefault();
        try {
            const response = await submitBid({ fid: user.id, jid: job.jid, proposal });
            const newBid = response.data.bid;
            setBids((prevBids) => (prevBids ? [...prevBids, newBid] : [newBid]));
            setProposal('');
            setCreate(false);
            toast.success('Bid posted!')
        } catch (error) {
            if(error.response?.data?.error){
                setError(error.response?.data?.error);
            }
            else{
                toast.error('An error occurred')
            }
        } finally {
            setLoading(false);
        }
    };

    //remove the deleted bid
    const handleDeleteBid = (bid_id) => {
        setBids((prevBids) => prevBids.filter(bid => bid.bid_id !== bid_id));
    }

    // approve a bid and reject all others
    const handleUpdateBid=(acceptedBidId)=>{
        setBids((prevBids) => 
            prevBids.map(bid => {
                if (bid.bid_id === acceptedBidId) {
                    return { ...bid, status: 'Accepted' }; 
                } else if (bid.jid === prevBids.find(b => b.bid_id === acceptedBidId).jid) {
                    return { ...bid, status: 'Rejected' }; 
                }
                return bid;
            })
        );
        setJob(prev=>({...prev,status:'Assigned'}))
    }

    // update fields of job
    const handleUpdateJob = async (e) => {
        e.preventDefault();
        try {
            await updateJob(jid, updatedJob); 
            setJob(prev=>({...prev, title: updatedJob.title, description: updatedJob.description})); 
            setEditing(false);
            setError(null)
            toast.success('Job details updated!')
        } catch (error) {
            console.error("Error updating job:", error);
            if(error.response?.data?.error){
                setError(error.response?.data?.error);
            }
            else{
                toast.error('An error occurred')
            }
        }
    };

    // navigate to profile
    const goToClientProfile=()=>{
        if(job && user && user.type=='client' && job.cid==user.id){
            navigate(`/profile`)
        }else{
            navigate(`/client/${job.cid}`)
        }
    }

    // update input fields on changing input
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name,value)
        setUpdatedJob({ ...updatedJob, [name]: value });
        if (error) {
            setError(null)
        }
    };

    // revert all changes
    const cancelEdit=()=>{
        setUpdatedJob({
            title: job.title,
            description:job.description
        });
        setError(null)
        setEditing(false);
    }

    if(loading){
        return(
           <ReactLoading type="spin" color="#fdd586"height={100} width={50} />
        )
    }

    return (
        <div>
            {job && !editing &&(
                <div className='job-info'>
                    <h2>{job.title}</h2>
                    <span className={`status-box ${job.status==='Open'? 'green-box': 'red-box'}`}>
                        {job.status}
                    </span>
                    <span className="domain-badge">{job.domain_name}</span>
                    <p onClick={goToClientProfile}>Posted by : {job.client_name}</p>
                    <p><strong>Posted:</strong> {formatDistanceToNow(new Date(job.date_posted), { addSuffix: true })}</p>
                    <p style={{marginBottom:'30px'}}>{job.description}</p>
                    
                    {user && user.type === 'client' && job && user.id===job.cid && job.status==='Open' && 
                        <button onClick={() => setEditing(!editing)}>
                            Edit Job
                        </button>
                    }
                    {user && user.type === 'freelancer' && job && job.status === 'Open' && (
                        <div>
                            {!create && <button onClick={() => { setCreate(true); }}>Submit a bid</button>}
                            {create && (
                                <div className='other-form'>
                                    <h3>Enter your proposal</h3>
                                    <form>
                                        <textarea name="proposal" value={proposal} placeholder='Enter your proposal (limit: 255 characters)'
                                            onChange={(e) => { setProposal(e.target.value); setError(null)}} />
                                        {error && <p className='error'><FaExclamationCircle style={{ marginRight: '5px',fontSize:'20px' }} />{error}</p>}
                                        <div className='form-buttons'>
                                            <button onClick={handleSubmitBid}>Submit</button>
                                            <button onClick={() => { setCreate(false); setError(null);setProposal('')}}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                    <h3>{bids.length} Bids</h3>
                    <div className='card-list'>
                    {bids && bids.length > 0 && bids.map((bid) => (
                        <BidCard key={bid.bid_id} bid={bid} onDelete={handleDeleteBid} cid={job.cid} onUpdate={handleUpdateBid} jobStatus={job.status} />
                    ))}
                    </div>
                </div>
            )}       
                {editing && (
                    <div className='other-form'>
                        <h1>Edit Job Details</h1>
                        <form onSubmit={handleUpdateJob}>
                            <label>Title </label>
                            <input type="text" value={updatedJob.title} onChange={handleChange} name='title' className="other-input"/>
                        
                            <label>Description </label>
                            <textarea value={updatedJob.description} name='description' onChange={handleChange}/>
                       
                            {error && <p className='error'><FaExclamationCircle style={{ marginRight: '5px',fontSize:'20px' }} />{error}</p>}
                
                            <div className='form-buttons'>
                                <button onClick={cancelEdit}>Cancel</button>
                                <button type="submit">Save</button>
                            </div>
                        </form>
                    </div>
                )}
        </div>   
    )
};

export default JobInfo;
