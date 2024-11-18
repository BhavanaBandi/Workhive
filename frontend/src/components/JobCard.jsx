import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { useNavigate } from 'react-router-dom'
import { deleteJob } from '../apis';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { FaTrashAlt } from 'react-icons/fa';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const JobCard=({job,onDelete})=>{
    const navigate=useNavigate();
    const {user}= useContext(UserContext)

    // go to job details
    const viewJob=()=>{
        navigate(`/jobs/${job.jid}`)
    }

    // delete the job
    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this job?");
        if (confirmed) {
            try {
                await deleteJob(job.jid); 
                onDelete(job.jid)
                toast.success('Job deleted successfully!')
            } catch (error) {
                console.error('Error deleting job:', error);
                toast.error('Failed to delete job')
            }
        }
    };

    // show only the first 50 characters of the job description
    const truncateDescription = (description) => {
        if (description.length > 50) {
            return description.substring(0, 50) + "...";
        }
        return description;
    };


    return (
        <div className='card-styling' >
            <div onClick={viewJob}>
                <h4>{job.title}</h4>
                <p>{job.client_name}</p>
                <p className="category-tag">{job.domain_name}</p>
                <p>{truncateDescription(job.description)}</p>
                <p className='review-date'>posted {formatDistanceToNow(new Date(job.date_posted),{addSuffix:true})}</p>
                <span className={`status-box ${job.status==='Open'?'green-box':'red-box'}`}>
                    {job.status}
                </span>
            </div>
            {user && user.type=='client' && user.id==job.cid && job.status==='Open' && 
                <button className='delete-button' onClick={handleDelete}><FaTrashAlt/></button>
            }
        </div>
    )
}

export default JobCard;

