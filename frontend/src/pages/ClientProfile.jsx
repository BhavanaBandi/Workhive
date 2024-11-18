import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext'; 
import { getClientProfile, updateClient, deleteUser} from '../apis'; 
import { FaExclamationCircle,FaPencilAlt, FaTrashAlt } from 'react-icons/fa'; 
import { useNavigate, useParams } from 'react-router-dom';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import JobCard from '../components/JobCard';
import ProjectCard from '../components/ProjectCard';
import ReactLoading from "react-loading";

const ClientProfile = ({id}) => {
    let {cid} = useParams();
    cid= cid || id
    //user logged in
    const { user, login,logout } = useContext(UserContext);
    //user data to display
    const [userData, setUserData] = useState(null);
    // user data to edit
    const [clData, setClData] = useState({
        fname: '',
        lname: '',
        company: '',   
        contact_number: ''
    });
    const [isEditing, setIsEditing] = useState(false); 
    const [error, setError] = useState(null);
    const [openJobs, setOpenJobs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const Navigate=useNavigate()
    
    // fetch profile on load
    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const response = await getClientProfile(cid);
                const data = response.data;
                setUserData(data.user);
                setClData({
                    fname: data.user.fname || '',
                    lname: data.user.lname || '',
                    company: data.user.company || '',
                    contact_number : data.user.contact_number || '',
                });
                setOpenJobs(data.openJobs);
                setProjects(data.projects);
            } catch (error) {
                toast.error(`Could not get profile details`);
                Navigate('/home')
            } finally {
                setLoading(false);
            }
        };
        
        if (cid) {
            fetchProfileData();
        }
    }, [cid]);

    // delete job 
    const handleDeleteJob = (jid) => {
        setOpenJobs((prev) => prev.filter(job => job.jid !== jid));
    }

    // change input data in form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setClData(prevData => ({ ...prevData, [name]: value }));
        if(error){
            setError(null)
        }
    };

    // revert the changes made 
    const cancelEdit=()=>{
        setIsEditing(false); 
        setClData({
            fname:userData.fname,
            lname:userData.lname,
            company:userData.company,
            contact_number:userData.contact_number
        })
        setError(null)
    }

    // update client profile
    const handleSave = async () => {
        try {
            setLoading(true)
            await updateClient(userData.cid, clData);
            const updatedUserData = { ...user, ...clData };
            const essentialUserData = {
                email: updatedUserData.email,
                fname: updatedUserData.fname,
                id: updatedUserData.id,
                lname: updatedUserData.lname,
                token: updatedUserData.token,
                type: 'client',
            };
            setUserData(prev=>({...prev, ...clData}))
            login(essentialUserData);
            setIsEditing(false);
            setError(null)
            toast.success('Updated Profile Details');
        } catch (error) {
            console.error("Error updating profile:", error);
            if(error.response?.data?.error){
                setError(error.response?.data?.error)
            }else{
                toast.error('An error occured')
            }
        }finally{
            setLoading(false)
        }
    };

    // delete profile
    const handleDeleteProfile=async()=>{
        const confirmed = window.confirm("Are you sure you want to delete your profile?");
        if (confirmed) {
            try {
                await deleteUser(user.id,'client'); 
                logout()
                Navigate('/')
                toast.success(`Deleted Successfully! ${user.email}`);
            } catch (error) {
                alert('Failed to delete the profile.');
            }
        }
    }

    if(!userData || loading){
        return(
           <ReactLoading type="spin" color="#fdd586"height={100} width={50} />
        )
    }

    return (
        <div className='profile'>
            {user && user.id==cid && !isEditing &&
                <div className='user-profile'>
                    <h1>My profile</h1>
                    <button onClick={()=>setIsEditing(true)} style={{ cursor: 'pointer' }}><FaPencilAlt/> Edit Profile</button>
                    <button onClick={handleDeleteProfile}> <FaTrashAlt/> Delete Profile</button>
                </div>
            }
            {user && user.type==='client' && user.id===cid && isEditing ? (
                <div className='other-form'>
                    <h3>Edit Profile Details</h3>
                        <form>
                            <label>First Name</label>
                            <input type="text" name="fname" placeholder='First Name' value={clData.fname}onChange={handleInputChange} className="other-input"/>
                            
                            <label >Last Name</label>
                            <input type="text" name="lname" placeholder='Last Name' value={clData.lname} onChange={handleInputChange} className="other-input"/>
                            
                            <label>Contact Number</label>
                            <input type="text" name="contact_number" placeholder='Contact Number' value={clData.contact_number}onChange={handleInputChange} className="other-input"/>
                            
                            <label>Company</label>
                            <input type="text" name="company" placeholder='company' value={clData.company} onChange={handleInputChange} className="other-input"/>
                            
                            {error && <p className='error'><FaExclamationCircle style={{ marginRight: '5px',fontSize:'20px' }} />{error}</p>}
                            <div className='form-buttons'>
                                <button onClick={handleSave}>Save</button>
                                <button onClick={cancelEdit}>Cancel</button>
                            </div>
                    </form>
                </div>
            ) : (
                <div >
                <h4>Client</h4>
                <p>Name: {userData.fname} {userData.lname}</p>
                <p>Company: {userData.company || 'N/A'}</p>
                <p>Email: {userData.email}</p>
                <p>Contact Number: {userData.contact_number || 'N/A'}</p>
                <h3>Jobs Posted (Open)</h3>
                    {openJobs.length > 0 ? (
                        <div className='card-list'>
                            {openJobs.map((job) => (
                                <JobCard key={job.jid} job={job} onDelete={handleDeleteJob} />
                            ))}
                        </div>
                    ) : (
                        <p>No Open jobs posted yet</p>
                    )}
                <h3> Projects </h3>
                    {projects.length > 0 ? (
                        <div className='card-list'>
                            {projects.map((project) => (
                                <ProjectCard key={project.pid} project={project}/>
                            ))}
                        </div>
                    ) : (
                        <p>No Projects yet</p>
                    )}     
                </div>
            )}
        </div>
    );
};

export default ClientProfile;
