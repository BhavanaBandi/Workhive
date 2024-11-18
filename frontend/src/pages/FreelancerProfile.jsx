import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { FaExclamationCircle, FaPencilAlt, FaTrashAlt, FaUpload } from 'react-icons/fa';
import { getFreelancerProfile, submitReview, deleteUser, updateFreelancer } from '../apis';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactLoading from "react-loading";
import Modal from '../components/Modal'
import ReviewCard from '../components/ReviewCard';
import ProjectCard from '../components/ProjectCard';
import CircularRating from '../components/CircularRating';

const FreelancerProfile = ({id}) => {
    let {fid} = useParams(); 
    fid = fid || id; 
    const navigate=useNavigate();
    const { user, login ,logout} = useContext(UserContext); //user logged in
    
    const [userData, setUserData] = useState(null); //data to be set for user
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [portfolioUrl, setPortfolioUrl] = useState(null)
    const [isPortfolioVisible, setIsPortfolioVisible] = useState(false);
    const [reviews, setReviews] = useState([])
    const [avgRating, setAvgRating] = useState(0)
    const [projects, setProjects] = useState([])
    const [domains, setDomains] = useState([]);
    const [colabs, setColabs] = useState([])
    const [create, setCreate] = useState(false) // create new review
    const [newReview,setNewReview] = useState({ rating:'', comment:'' })
    // data to edit
    const [flData, setFlData] = useState({
        fname: '',
        lname: '',
        exp_level: '',
        portfolio: '', 
        bio: '',
        domains: [],
        portfolio_name: '',
        contact_number: ''
    });
    const [isEditing, setIsEditing] = useState(false); //editing user profile
    const availableDomains = [
        { id: 1, name: 'Technology' },
        { id: 2, name: 'Design' },
        { id: 3, name: 'Writing' },
        { id: 4, name: 'Marketing' },
        { id: 5, name: 'Finance' },
        { id: 6, name: 'Legal' },
        { id: 7, name: 'Support' },
        { id: 8, name: 'Education' },
        { id: 9, name: 'Health' },
        { id: 10, name: 'Engineering' }
    ];
    
    // fetch profile on mounting
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const response = await getFreelancerProfile(fid);
                const data = response.data.user;
                setUserData(data);
                setFlData({
                    fname: data.fname || '',
                    lname: data.lname || '',
                    exp_level: data.exp_level || '',
                    portfolio: data.portfolio || null,
                    bio: data.bio || '',
                    domains: response.data.domains || [],
                    portfolio_name:data.portfolio_name ||'',
                    contact_number:data.contact_number || ''
                });
                setAvgRating(response.data.avgRating)
                setReviews(response.data.reviews)
                setProjects(response.data.projects)
                setDomains(response.data.domains)
                setColabs(response.data.colabProjects)
                if (data.portfolio) {
                    const byteCharacters = atob(data.portfolio);
                    const byteNumbers = new Uint8Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const blob = new Blob([byteNumbers], { type: data.portfolioType });
                    setPortfolioUrl(URL.createObjectURL(blob));
                }
            } catch (error) {
                console.error('Could not load profile',error)
                toast.error(`An Error occured when loading profile`);
                navigate('/home')
            } finally {
                setLoading(false);
            }
        };
        if (fid) {
            fetchProfileData();
        }
    }, [fid]);
    
    // update edit fields on input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFlData((prevData) => ({ ...prevData, [name]: value }));
        if(error){
            setError(null)
        }
    };

    // update file related fields on potfolio change
    const handleFileChange = (e) => {
        const file = e.target.files[0]; 
        if (file) {
            setFlData(prevData => ({
                ...prevData,         
                portfolio: file,
                portfolio_name: file.name
            }));
            const blobUrl = URL.createObjectURL(file);
            setPortfolioUrl(blobUrl);
        }
    };

    // update domains on selecting/ removing domains 
    const handleDomainChange = (domainId) => {
        const isSelected = flData.domains.some(domain => domain.domain_id === domainId); // check if it was selected previously
        if (isSelected) {
            setFlData(prev => ({
                ...prev,
                domains: prev.domains.filter(domain => domain.domain_id !== domainId)
            }));
        } else {
            setFlData(prev => ({
                ...prev,
                domains: [...prev.domains, { domain_id: domainId, domain_name: availableDomains.find(d => d.id === domainId).name }]
            }));
        }
    };
    
    // try to update profile details
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const formData = new FormData();
            if (flData.portfolio && flData.portfolio !== userData.portfolio) {
                formData.append('portfolio', flData.portfolio);
            }
            formData.append('id', userData.fid);
            formData.append('data', JSON.stringify({
                fname: flData.fname,
                lname: flData.lname,
                exp_level: flData.exp_level,
                bio: flData.bio,
                domains: flData.domains.map(domain => domain.domain_id),
                contact_number:flData.contact_number
            }));

            await updateFreelancer(formData); // api call to update data in backend

            // update the frontend updated data
            const updatedUserData = { ...user, ...flData, fid };
            const essentialUserData = {
                fname: updatedUserData.fname,
                lname: updatedUserData.lname,
                email: updatedUserData.email,
                id: updatedUserData.id,
                token: updatedUserData.token,
                type: 'freelancer'
            };
            login(essentialUserData);
            setDomains(flData.domains)
            setIsEditing(false);
            setError(null);
            setUserData(updatedUserData)
            toast.success('Updated Profile details!')
        } catch (error) {
            console.error('Error updating profile:', error);
            if(error.response?.data?.error){
                setError(error.response?.data?.error);
            }else{
                toast.error('Failed to save data, An error occured')
            }
        } finally {
            setLoading(false);
        }
    };
   
    // update review fields on input change
    const handleNewReviewChange=(e)=>{
        const { name, value } = e.target;
        setNewReview((prevData) => ({ ...prevData, [name]: value }));
        if(error){
            setError(null)
        }
    }

    // submit a review
    const handleSubmitReview=async(e)=>{
        e.preventDefault()
        if(!user){
            setError('Please Login to post a review');
            return;
        }
        try {
            const body={
                rating:newReview.rating,
                comment:newReview.comment,
                fid,
                cid:user.id
            }
            setLoading(true);
            const response=await submitReview(body);
            setReviews([...reviews,response.data.review])
            setAvgRating(response.data.newAverageRating)
            setCreate(false);
            setError(null);
            toast.success('Review posted!')
            cancelReview()
        } catch (error) {
            console.error('Error submitting review', error);
            if(error.response?.data?.error){
                setError(error.response?.data?.error);
            } else{
                toast.error('An error occured');
            }
        } finally {
            setLoading(false);
        }
    }

    // remove the deleted review and update the average rating
    const handleDeleteReview=(rid,newRating)=>{
        setReviews((prev) => prev.filter(rev => rev.rid !== rid));
        setAvgRating(newRating)
    }

    // update the review and average rating
    const handleUpdateReview=(rid,updatedReview,newRating)=>{
        setReviews((prev) => prev.map((rev) => (rev.rid === rid ? { ...rev, ...updatedReview } : rev)));
        setAvgRating(newRating)
    }

    // delete profile the freelancer account
    const handleDeleteProfile=async()=>{
        const confirmed = window.confirm("Are you sure you want to delete your profile?");
        if (confirmed) {
            try {
                await deleteUser(user.id,'freelancer'); // api call to delete user account
                logout()
                toast.success(`Successfully deleted profile ${user.email}`);
                navigate('/')
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('could not delete account, An error occured');
            }
        }
    }

    // set fields to the previous state on canceling edit
    const cancelEdit=()=>{
        setFlData({
            fname: userData.fname || '',
            lname: userData.lname || '',
            exp_level: userData.exp_level || '',
            portfolio: userData.portfolio || null,
            bio: userData.bio || '',
            domains: domains || [],
            portfolio_name:userData.portfolio_name ||'',
            contact_number: userData.contact_number || ''
        })
        if (userData.portfolio) {
            const byteCharacters = atob(userData.portfolio);
            const byteNumbers = new Uint8Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const blob = new Blob([byteNumbers], { type: data.portfolioType });
            setPortfolioUrl(URL.createObjectURL(blob));
        }else{
            setPortfolioUrl(null)
        }
        setError(null)
        setIsEditing(false)
    }

    // set fields as empty on cancel new review
    const cancelReview=() => { 
        setCreate(false);setNewReview({ rating:'', comment:'' }) 
        setError(null)
    }
    
    if(!userData || loading){
        return(
           <ReactLoading type="spin" color="#fdd586"height={100} width={50} />
        )
    }

    return (
        <div className='profile'>
            {user && user.type=='freelancer' && user.id==fid && !isEditing &&
                <div className='user-profile'>
                    <h1>My profile</h1>
                    <button onClick={()=>{setIsEditing(true)}}><FaPencilAlt/> Edit Profile</button>
                    <button onClick={handleDeleteProfile}><FaTrashAlt/> Delete Profile</button>
                </div>
            }

            <div>  
            {user && user.type=='freelancer' && user.id==fid && isEditing ? (
                <div className='other-form'>
                    <h1>Edit Profile Details</h1>
                    <form>
                        <label>First Name</label>
                        <input type="text" name="fname" placeholder='First Name' value={flData.fname} onChange={handleInputChange}  className='other-input' />
                    
                        <label>Last Name</label>
                        <input type="text" name="lname" value={flData.lname} onChange={handleInputChange} placeholder="Last Name" className='other-input'/>
                    
                        <label >Contact Number</label>
                        <input type="text" name="contact_number" value={flData.contact_number} onChange={handleInputChange} placeholder="Contact Number"  className="other-input"/>
                    
                        <label>Experience Level</label>
                        <select name="exp_level" value={flData.exp_level} onChange={(e) => handleInputChange(e, 'freelancer')}>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    
                        <label>Portfolio</label>
                        {flData.portfolio ? (
                                <p >Uploaded File: {flData.portfolio_name}</p>
                                    ) : (
                                <p >No file selected and uploaded previously</p>
                        )} 
                        <div className='file-upload-container'>
                            <input type="file" name="portfolio" accept=".pdf" id="portfolio-upload" className="file-upload-input" onChange={handleFileChange}/>
                            <label htmlFor="portfolio-upload" className="file-upload-label"> <FaUpload/>  Upload PDF</label>  
                        </div>

                        <label style={{marginTop:'20px',marginBottom:'0px'}}>Bio</label>
                        <textarea name="bio" value={flData.bio} onChange={handleInputChange} placeholder="Short Bio"/>
                        <label style={{marginTop:'20px',marginBottom:'0px'}}>Domains</label>
                        <div className="checkbox-columns">
                            <div className="checkbox-column">
                                {availableDomains.slice(0, 5).map(domain => (
                                    <label key={domain.id} className="checkbox-label">
                                        <input type="checkbox" className="checkbox-input" onChange={() => handleDomainChange(domain.id)}
                                            checked={flData.domains.some(selectedDomain => selectedDomain.domain_id === domain.id)} />
                                        {domain.name}
                                    </label>
                                ))}
                            </div>
                            <div className="checkbox-column">
                                {availableDomains.slice(5).map(domain => (
                                    <label key={domain.id} className="checkbox-label">
                                        <input type="checkbox" className="checkbox-input" onChange={() => handleDomainChange(domain.id)}
                                            checked={flData.domains.some(selectedDomain => selectedDomain.domain_id === domain.id)}/>
                                        {domain.name}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {error && <p className='error'><FaExclamationCircle style={{ marginRight: '5px',fontSize:'20px' }} />{error}</p>}
                        <div className='form-buttons'>
                            <button onClick={cancelEdit}>Cancel</button>
                            <button onClick={handleSave}>Save</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="profile-container">
                    <div >
                        <h4>Freelancer</h4>
                        <p>Name: {userData.fname} {userData.lname}</p>
                        <p>Experience Level: {userData.exp_level}</p>
                        <p>Bio: {userData.bio || 'N/A'}</p>
                        <p>Email: {userData.email}</p>
                        <p>Contact Number: {userData.contact_number || 'N/A'}</p>
                        <p>Domains: {domains && domains.length===0 && "No domains selected"}</p>
                        <ul>
                            {domains && domains.map(domain => (
                                <li key={domain.domain_id} className="domain-badge">{domain.domain_name}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="portfolio-rating">
                        {portfolioUrl ? (
                            <>
                                <button onClick={()=>setIsPortfolioVisible(true)}>View Portfolio</button>
                                {isPortfolioVisible && (
                                    <Modal onClose={()=> setIsPortfolioVisible(false)}>
                                        <iframe
                                            src={portfolioUrl}
                                            title="Portfolio Preview"
                                        ></iframe>
                                    </Modal>
                                )}
                            </>
                        ) : (
                            <p>No portfolio uploaded.</p>
                        )}
                        <label>Average Rating</label>
                        <CircularRating rating={avgRating} />
                    </div>
                    <hr></hr>
                </div>

            )}
            {!isEditing &&(
                <div>
                    {user && user.type==='client' && create && (
                        <div className='other-form'>
                            <h3>Post a New Review</h3>
                            <form>
                                <label>Rating</label>
                                <input name="rating" value={newReview.rating} onChange={handleNewReviewChange} className='other-input'/>
                            
                                <label>Comment</label>
                                <textarea name="comment" value={newReview.comment} onChange={handleNewReviewChange} className='fixed-size-textarea'
                                    placeholder='Enter your review'/>
                            
                                {error && <p className='error'><FaExclamationCircle style={{ marginRight: '5px',fontSize:'20px' }} />{error}</p>}
                                <div className='form-buttons'>
                                    <button onClick={handleSubmitReview}>Submit</button>
                                    <button onClick={cancelReview}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}
                    <div className='review-line'>
                        <h3>{reviews.length} Reviews</h3>
                        {user && user.type === 'client' && (
                            <div className='review-controls'>
                                {!create && <button onClick={() => { setCreate(true) }}>Post a review</button>}
                            </div>
                        )}
                    </div>
                <div className='card-list'>
                    {reviews.length > 0 ? reviews.map((review) => (
                            <ReviewCard key={review.rid} review={review} onDelete={handleDeleteReview} onUpdate={handleUpdateReview} />
                        )) : <p>No reviews posted yet</p>}
                </div>

                <h3>Projects</h3>
                <div className='card-list'>
                    {projects && projects.length>0 ? projects.map(project => (
                        <ProjectCard key={project.pid} project={project} />
                    )) :<p>No projects</p>}
                </div>

                <h3>Collaborations</h3>
                <div className='card-list'>
                    {colabs && colabs.length>0 ? colabs.map(c => (
                        <ProjectCard key={c.pid} project={c} />
                    )) :<p>No projects</p>}
                </div>
            </div>       
            )}
            </div>
        </div>
    );
};

export default FreelancerProfile;
