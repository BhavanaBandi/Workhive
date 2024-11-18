import React, { useState,useEffect, useContext } from 'react';
import { getProjectData, updateProject,
         addColabRequest, deleteColabRequest, updateColabRequest,
         addCollaborators, applyForColab, withdrawColab
    } from '../apis';
import { UserContext } from '../contexts/UserContext';
import { format } from 'date-fns'
import { FaPencilAlt,FaTrashAlt,FaExclamationCircle } from 'react-icons/fa'; 
import { useNavigate, useParams } from 'react-router-dom';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactLoading from "react-loading";

const ProjectInfo = () => {
    const { pid } = useParams();
    const {user}=useContext(UserContext)
    const [description, setDescription] = useState('');
    const [project,setProject]=useState(null)
    const [colab,setColab]=useState({
        info:null,
        canCreate:true,
        collaborators:[],
        applicants:[]
    })
    const [creating,setCreating]=useState(false)
    const [editColab,setEditColab]=useState(false)
    const [selecting,setSelecting]=useState(false)
    const [isEditing, setIsEditing] = useState(false);
    const [updatedDetails, setUpdatedDetails] = useState({
        start_date: '',
        details: ''
    });
    const [selectedApplicants, setSelectedApplicants] = useState([]);
    const [error, setError] = useState(null)

    const Navigate=useNavigate();

    // get details of project 
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getProjectData(pid);
                setProject(response.data?.projectDetails || null);
                setColab(response.data.colab);
                setUpdatedDetails({
                    start_date: new Date(response.data.projectDetails.start_date).toLocaleDateString('en-CA'),
                    details: response.data.projectDetails.details
                })
                setDescription(response.data.colab.info?.description || '');
            } catch (error) {
                console.log("couldn't get project details", error);
                toast.error(`couldn't get project details ${error}`);
                Navigate('/home')
            }finally{
                console.log(colab)
            }
        };

        if(pid){
            fetchProjects();
        }
    }, [pid]);
    
    //Update Collaboration request description
    const handleUpdateColabRequest = async (e) => {
        e.preventDefault();
        const body = {
            req_id:colab.info.req_id,
            description
        };
        try {
            await updateColabRequest(body)
            setColab(prev => ({
                    ...prev,
                    info: {
                        ...prev.info,
                        description 
                    }
                }));
            setEditColab(false)
            setError(null)
            toast.success('Updated Collaboration Request Successfully')
        } catch (error) {
            if(error.response?.data?.error){
                setError(error.response?.data?.error || 'An error occured')
            } else {
                toast.error('An error occured while updating')
            }     
        }
    }

    // add or remove selected applicants
    const handleCheckboxChange = (applicantId) => {
        setSelectedApplicants((prevSelected) => {
            if (prevSelected.includes(applicantId)) {
                return prevSelected.filter(id => id !== applicantId);
            } else {
                return [...prevSelected, applicantId];
            }
        });
    };

    // confirm selected applicants as collaborators
    const handleSelectColab=async(e)=>{
        e.preventDefault()
        try{
            await addCollaborators({req_id:colab.info.req_id, applicantIds:selectedApplicants})
            setColab((prevColab) => {
                const updatedApplicants = prevColab.applicants.map(c => {
                    if (selectedApplicants.includes(c.applicant_id)) {
                        return { ...c, status: 'Accepted' }; 
                    }
                    return  { ...c, status: 'Rejected' }; 
                });
                const acceptedCollaborators = prevColab.applicants.filter(c => selectedApplicants.includes(c.applicant_id));
                return {
                    ...prevColab,
                    info: {
                        ...prevColab.info, 
                        status: 'Closed' 
                    }, 
                    applicants: updatedApplicants, 
                    collaborators: [...prevColab.collaborators, ...acceptedCollaborators]
                };
            });
            setSelectedApplicants([]);
            setSelecting(false)
            toast.success('Collaborators added successfully!')
        }catch(error){
            console.log(error)
            toast.error(`Could not add collaborators`);
        }
    }

    // create or delete colab request
    const handleColabRequest = async (e) => {
        e.preventDefault();
        try {
            if(colab.info){
                await deleteColabRequest(colab.info.req_id)
                setColab({info:null,
                        canCreate:true,
                        collaborators:[],
                        applicants:[]})
                setDescription('')
                toast.success("Deleted the colab request!")
            }else{
                const body = {
                    pid: project.pid,
                    fid: project.fid,
                    description,
                };
                const response = await addColabRequest(body)
                setColab(prev => ({ ...prev, info: response.data.info,canCreate:false }));
                setCreating(false)
                toast.success("Created a new colab request!")
                }
        } catch (error) {
            if(colab.info){
                toast.error(`Couldnt delete the request, try again :(`);
            }else{
                setError(error.response?.data?.error)
                toast.error(`Couldnt create the request, try again :(`);
            } 
        }
    };

    // add or delete collaboration application
    const handleColabApplication = async () => {
        const applicantId = user.id; 
        const applicant = colab.applicants.find(applicant => applicant.applicant_id === applicantId);
        const hasApplied = !!applicant; 
        try {
            if (hasApplied) {
                await withdrawColab(applicant.appl_id); 
                setColab((prevColab) => ({
                    ...prevColab,
                    applicants: prevColab.applicants.filter(app => app.appl_id !== applicant.appl_id) 
                }));
                    toast.success('Application Withdrawn')
            } else {
                const data = {
                    req_id: colab.info.req_id,
                    applicant_id: applicantId
                };
                const response = await applyForColab(data);
                setColab((prevColab) => ({
                    ...prevColab,
                    applicants: [...prevColab.applicants, response.data.application] 
                }));    
                toast.success('Applied for the Collaboration!')
            }
        } catch (error) {
            console.error("Error handling application:", error);
            if(hasApplied){
                toast.error('Could not Withdraw Application')
            }else{
                toast.error('Could not Apply for the collaboration')
            }
        }
    };

    // Confirm payment status
    const handlePaymentConfirmation=async()=>{
        const confirmed = window.confirm("Did You recieve the Payment for this project?");
        if(confirmed){
            try{
                const response = await updateProject(pid, { payment: 1 }); 
                setProject(prevProject => ({
                    ...prevProject, 
                    ...response.data.project 
                }));
                if(colab.info){
                    setColab(prev => ({
                        ...prev,
                        info: {
                            ...prev.info,   
                            status: 'Closed' 
                        }
                    }));
                }
                console.log(colab.info)
                toast.success('Payment status updated!')
            }catch(error){
                console.error('Error updating payment status:', error)
                toast.error('Could not update payment status')
            }
        }
    }
        
    // Update project
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();            
        try {
            const response = await updateProject(pid, updatedDetails);
            setProject(prevProject => ({
                ...prevProject, 
                ...response.data.project 
            }));
            setIsEditing(false);
            toast.success('Project Details Updated!')
        } catch (error) {
            console.log(`Error updating project: ${error.message}`);
            if(error.response?.data?.error){
                setError(error.response?.data?.error)
            }else{
                toast.error('Could Not update Project Details')
            }
            
            
        }
    };

    //suspend project
    const handleSuspendProject = async () => {
        const confirmed = window.confirm("Are you sure you want to suspend this project?");
        if(confirmed){
            try {
                const response = await updateProject(pid, { status: 'suspended' });
                setProject(prevProject => ({
                    ...prevProject,
                    ...response.data.project
                }));    
                if(colab.info){
                    setColab(prev => ({
                        ...prev,
                        info: {
                            ...prev.info,   
                            status: 'Closed' 
                        }
                    }));
                }    
            } catch (error) {
                console.error("Error suspending project:", error);            
            }
        }
    };

    const handleInputChange=(e)=>{
        const { name, value } = e.target;
        setUpdatedDetails({ ...updatedDetails, [name]: value });
        if (error) {
            setError(null);
        }
    }

    const cancelEdit=()=>{
        setUpdatedDetails({
            start_date: new Date(project.start_date).toLocaleDateString('en-CA'),
            details: project.details
        })
        setError(null)
        setIsEditing(false)
    }

    const viewClient=()=>{
        if(project && user && user.type=='client' && project.cid==user.id){
            Navigate(`/profile`)
        }else{
            Navigate(`/client/${project.cid}`)
        }
    }

    const viewFreelancer=(fid)=>{
        if(user && user.type=='freelancer' && fid==user.id){
            Navigate(`/profile`)
        }else{
            Navigate(`/freelancer/${fid}`)
        }
    }

    
    
    if(!project){
        return(
            <ReactLoading type="spin" color="#fdd586"height={100} width={50} />
         )
    }

    // assign class name based on status
    let cname='';
    if(project.status==='Ongoing'){
        cname='grey-box';
    }else if(project.status=='Completed'){
        cname='green-box'
    }
    else{
        cname='red-box';
    }

    return (
        <div className='project-page'>
            { isEditing ?(
                <div className='other-form'>
                    <h1>Edit project details</h1>
                    <form onSubmit={handleUpdateSubmit}>
                        <label>Start Date:</label>
                        <input type="date" name='start_date' value={updatedDetails.start_date} onChange={handleInputChange} className='other-input'/>
                        
                        <label>Details:</label>
                        <textarea value={updatedDetails.details} name='details'
                                onChange={handleInputChange}/>
                        {error && <p className='error'><FaExclamationCircle style={{ marginRight: '5px',fontSize:'20px' }} />{error}</p>}
                
                        <div className='form-buttons'>
                            <button type="submit">Update</button>
                            <button type="button" onClick={cancelEdit}>Cancel</button>
                        </div>
                    </form>
                </div>

            ) : (<div className='project-info'>
                    <div className="project-header">
                        <h1>{project.job_title || 'No Title'}</h1> 
                        <p className={cname}>{project.status}</p>
                    </div>
                    {project && project.jid ?
                        <a href={`/jobs/${project.jid}`} className='view-job' >See Job details</a> :
                        <p>Job details not found</p>
                    }
                    
                    <p onClick={viewClient} className='user-name' title="See Profile">Project Owner : {project.client_name || 'Account Deleted'}</p>
                    <p onClick={()=>viewFreelancer(project.fid)} className='user-name' title="See Profile">Assigned to {project.freelancer_name || 'Account Deleted'}</p>
                    <p>Details : {project.details || ''}</p>
                    <p>Start Date : {format(new Date(project.start_date), 'MMMM d, yyyy')}</p>
                    <h3>Collaborators</h3>
                    {colab && colab.collaborators && colab.collaborators.length>0 ? 
                            <ul>
                                {colab.collaborators.map((c) => (
                                        <li key={c.appl_id} onClick={()=>viewFreelancer(c.applicant_id)} className='user-name' title="See Profile">{c.fname} {c.lname}</li>
                                    ))}

                            </ul> :
                        <p>No Collaborators</p>}
                {
                    user && user.type==='client' && project && project.cid===user.id && project.status==='Ongoing' &&
                    <div className='form-buttons'>
                        <button onClick={handleSuspendProject}>Suspend project</button>
                        <button onClick={() => setIsEditing(true)}>Edit Project Details</button>
                    </div>
                }
            
            
                {
                    user && user.type==='freelancer' && project && project.fid==user.id && project.payment===0 && project.status==='Ongoing' &&
                        <button onClick={handlePaymentConfirmation}>Confirm Payment</button>
                }
                </div>
            )

        }
        <div className='project-fl-side'>
            {
                !colab.info && user && user.type==='freelancer' && user.id===project.fid && !creating &&
                <button  onClick={()=>{setCreating(true)}}>create a colab request</button>
            }
            { creating && (
                <div  className='other-form'>
                <form  onSubmit={handleColabRequest}>
                    <label htmlFor="description">Description:</label>
                    <textarea value={description} onChange={(e) => {setDescription(e.target.value);setError(null)}} rows="4"/>
                    {error && <p className='error'><FaExclamationCircle style={{ marginRight: '5px',fontSize:'20px' }} />{error}</p>}
                
                    <div className='form-buttons'>
                        <button type="submit">Create</button>
                        <button onClick={()=>{setCreating(false); setDescription('')}}>Cancel</button>
                    </div>
                </form>
                </div>
            )}

            {editColab && (
                <div className='other-form'>
                <form onSubmit={handleUpdateColabRequest}>
                    <label htmlFor="updatedDescription">Update Description:</label>
                    <textarea value={description} onChange={(e) => {setDescription(e.target.value);setError(null)}} rows="4"/>
                    {error && <p className='error'><FaExclamationCircle style={{ marginRight: '5px',fontSize:'20px' }} />{error}</p>}
                    <div className='form-buttons'>
                        <button type="submit">Update</button>
                        <button type="button" onClick={() => {setEditColab(false);setDescription(colab.info.description);setError(null)}}>Cancel</button>
                    </div>
                </form>
                </div>
            )}

            {colab.info && !editColab && !isEditing &&
                <div>
                    <div className='colab-request'>  
                        <h3>Collaboration Request</h3>
                        <p>{colab.info.description}</p>
                        <p>Status: {colab.info.status}</p>
                        <p className="review-date">posted {formatDistanceToNow(new Date(colab.info.posted),{addSuffix:true})}</p>
                        {colab.info.status==='Open' && user && user.type==='freelancer' && user.id===project.fid && project.status==='Ongoing' &&
                        <div className='form-buttons '>
                            <button onClick={()=>{setEditColab(true);console.log(editColab)}}><FaPencilAlt/> Edit</button>
                            <button onClick={handleColabRequest}><FaTrashAlt/> Delete</button>    
                        </div>}
                    </div>
                    { user && user.type=='freelancer' && project && user.id!=project.fid && colab.info &&  (
                        <div>
                            { colab.info.status==='Open' &&
                                <button onClick={handleColabApplication}>
                                    {colab.applicants.some(applicant => applicant.applicant_id === user.id) ? 'Withdraw Application' : 'Apply'}
                                </button>
                            }
                            {colab.applicants.map(applicant => applicant.applicant_id === user.id && (
                                <div style={{display:'flex', margin:'20px'}} key={applicant.applicant_id}>
                                    <span> Date Applied: {new Date(applicant.sent_at).toLocaleDateString()}</span>
                                    <span className={`applicant-status ${applicant.status === 'Accepted' ? 'green-box' : applicant.status === 'Rejected' ? 'red-box' : 'grey-box'}`}>{applicant.status}</span>
                                </div>
                            ))}
                        </div>) 
                    }
                        
                    {user && user.type==='freelancer' && user.id===project.fid  &&
                        <div>
                            {selecting && colab.collaborators && colab.collaborators.length===0 && project.status==='Ongoing' ? (
                            <div>
                                <h3>Select Collaborators</h3>
                                    {colab.applicants.length > 0 ? (
                                        <div className='checkbox-container ca'>
                                            {colab.applicants.map((c) => (
                                                <label className="checkbox-label" key={c.appl_id}>
                                                    <input type="checkbox" className="checkbox-input"
                                                        checked={selectedApplicants.includes(c.applicant_id)}
                                                        onChange={() => handleCheckboxChange(c.applicant_id)}/>
                                                        <span onClick={()=>viewFreelancer(c.applicant_id)} className='user-name' title="See Profile">{c.fname} {c.lname}</span>  
                                                </label>
                                            ))}
                                        </div>
                                    ) : (<p>No applicants available for selection.</p>)}
                                <div  className='form-buttons'>
                                    <button onClick={handleSelectColab}>Confirm</button>
                                    <button onClick={()=>{setSelectedApplicants([]); setSelecting(false)}}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div> 
                                <button disabled={colab.collaborators.length>0 || colab.applicants.length===0 || colab.info.status==='Closed' } onClick={()=>setSelecting(true)}>Select applicants</button>
                                {colab.applicants.length > 0 ? (
                                <div className='applicants'>
                                    {colab.applicants.map((c) => (
                                        <div key={c.appl_id} className='applicant-item'>
                                            <span onClick={()=>viewFreelancer(c.applicant_id)} className='user-name' title="See Profile">{c.fname} {c.lname}</span> 
                                            <span className={`applicant-status ${c.status === 'Accepted' ? 'green-box' : c.status === 'Rejected' ? 'red-box' : 'grey-box'}`}>{c.status}</span>
                                        </div>             
                                    ))}
                                </div>
                                ) : (<p>No applicants</p>)}
                            </div>
                        )}
                        </div>
                    }     
                </div>
                }
            </div>   
        </div>
    )}

export default ProjectInfo;
