import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { useNavigate } from 'react-router-dom'
import { deleteReview,updateReview } from '../apis';
import { useContext, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { FaExclamationCircle, FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const ReviewCard=({review,onDelete,onUpdate})=>{
    const navigate=useNavigate();
    const {user}= useContext(UserContext)
    const [editing, setEditing] = useState(false);
    const [updatedComment, setUpdatedComment] = useState(review.comment);
    const [updatedRating, setUpdatedRating] = useState(review.rating);
    const [error, setError] = useState(null);

    // go to client profile
    const viewClient=()=>{
        navigate(`/client/${review.cid}`)
    }

    // delete an exisiting review
    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this review?");
        if (confirmed) {
            try {
                const response=await deleteReview({rid:review.rid,fid:review.fid}); 
                onDelete(review.rid,response.data.avgRating)
                toast.success('Review Deleted successfully!')
            } catch (error) {
                console.error('Error deleting review:', error);
                toast.error('Failed to delete review')
            }
        }
    };

    // update the rating and comment of review
    const handleUpdate = async (e) => {
        e.preventDefault(); 
        console.log(updatedRating,updatedComment)
        try {
            const response = await updateReview(review.rid,{rating:updatedRating, comment: updatedComment,fid:review.fid })
            onUpdate(review.rid,{rating:updatedRating, comment: updatedComment },response.data.newRating); // Update the review in the parent component
            setEditing(false); 
            toast.success('Review updated!')
        } catch (error) {
            console.error('Error updating review:', error);
            if(error.response && error.response.data && error.response.data.error){
                setError(error.response.data.error);
            }else{
                setError(null)
                toast.error('Couldnt update review')
            } 
        }
    };

    return (
        <div className='card-styling'>
            {editing ?(
                <form onSubmit={handleUpdate} className='review-form'>
                <label>Comment</label>
                <textarea value={updatedComment} onChange={(e) => {setUpdatedComment(e.target.value);setError(null)}} />

                <label>Rating</label>
                <input name="updatedRating" value={updatedRating} className='other-input'
                    onChange={(e) => {setUpdatedRating(e.target.value);setError(null)}} />

                {error && <p className='error'><FaExclamationCircle style={{ marginRight: '5px',fontSize:'20px' }} />{error}</p>}
                <div className='form-buttons'>
                    <button type="submit" >Save</button>
                    <button type="button" onClick={() => setEditing(false)}>Cancel</button>
                </div>
            </form>
        ):(
            <div className='review-header'>
                <div className='review-info'>
                    <h4 onClick={viewClient} className='user-name' title="See Profile">{review.client_name}</h4>
                    <p className='review-date'>Posted {formatDistanceToNow(new Date(review.review_time), { addSuffix: true })}</p>
                    <div className='review-content'>
                        <p className='review-rating'>Rating: {review.rating}</p>
                        <p className='review-comment'>{review.comment}</p> 
                    </div>
                </div>
                {user && user.type === 'client' && user.id === review.cid && (
                    <div className='action-buttons'>
                        <button onClick={handleDelete} className='delete-button'><FaTrashAlt/></button>
                        <button onClick={() => setEditing(!editing)} className='update-button'><FaPencilAlt/></button>
                    </div>
                )}
            </div>
            )}
        </div>
    )
}

export default ReviewCard;

