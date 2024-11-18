import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { deleteBid, updateBid } from '../apis';
import { FaTrashAlt } from 'react-icons/fa';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 


const BidCard=({bid,onDelete,cid,onUpdate,jobStatus})=>{
    const {user} = useContext(UserContext)
    const Navigate=useNavigate()

    // assign css class based on the stsus
    let cname;
    if(bid.status==='Submitted'){
        cname='grey-box'
    }else if(bid.status==='Accepted'){
        cname='green-box'
    }else{
        cname='red-box'
    }

    // go to freelancer profile
    const viewProfile=()=>{ 
        if(bid && user && user.type=='freelancer' && bid.fid==user.id){
            Navigate(`/profile`)
        }else{
            Navigate(`/freelancer/${bid.fid}`)
        }
    }

    // delete an existing bid
    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this bid?");
        if(confirmed){
            try {
                await deleteBid(bid.bid_id); 
                onDelete(bid.bid_id); 
                toast.success('Bid deleted successfully!')
            } catch (error) {
                console.error('Error deleting bid:', error);
                toast.error('Bid could not be deleted')
            }
        }  
    };

    // approve a bid and reject other bids 
    const approveBid=async()=>{
        const confirmed = window.confirm("Are you sure you want to approve this bid?");
        if (confirmed) {
            try {
                await updateBid(bid.bid_id)
                onUpdate(bid.bid_id)
                jobStatus='Assigned'
                toast.success('Bid Approved!')
            } catch (error) {
                console.error('Error approving bid:', error);
                toast.error('Failed to approve the bid')
            }
        }
    }

    return(
        <div className='card-styling'>
            <h3 onClick={viewProfile}>{bid.freelancer_name}</h3>
            <span className={`status-box ${cname}`}>
                {bid.status}
            </span>
            <p className='review-date'>posted : {formatDistanceToNow(new Date(bid.date_submitted),{addSuffix:true})}</p>
            <p>{bid.proposal}</p>
            {user && user.type=='freelancer' && user.id==bid.fid && bid.status==='Submitted' && <button className="delete-button" onClick={handleDelete}><FaTrashAlt/></button>}
            {jobStatus==='Open' && user && user.type=='client' && user.id==cid && <button onClick={approveBid} className='approve-bid'>Approve Bid</button>}
        </div>
    )
}

export default BidCard;