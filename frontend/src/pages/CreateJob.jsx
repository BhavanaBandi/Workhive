import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { createjob } from '../apis';
import { FaExclamationCircle } from 'react-icons/fa';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const CreateJob=()=>{
    const {user}=useContext(UserContext)
    const [formData, setFormData] = useState({
        title: '',
        description : '',
        category: 1,
        cid : user?.id || 0
    });
    const [error, setError] = useState(null);
    const Navigate=useNavigate();

    // submit the details to post job
    const postJob=async(e)=>{
        e.preventDefault();
        if(!user){
            setError('Please Login to post a job');
            return;
        }
        setFormData({ ...formData, cid: user.id });
        try {
            await createjob(formData); 
            setError(null);
            Navigate('/profile');
            toast.success('Successfully posted the job!');
        } catch (error) {
            console.error('Error posting the job', error)
            if(error.response?.data?.error){
                setError(error.response?.data?.error);
            } else{
                toast.error('Could not post job, An error occured')
            }    
        }
    }

    // update fields on input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (error) setError(null);
    };

    return (
        <div className='other-form'>
            <h1>Post a job</h1>
            <form onSubmit={postJob}>
                <label>Title</label>
                <input type="text" name="title" placeholder='Enter Title' value={formData.title} onChange={handleChange} className='other-input'></input>
                
                <label htmlFor='title'> Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                        <option value={1}>Technology</option>
                        <option value={2}>Design</option>
                        <option value={3}>Writing</option>
                        <option value={4}>Marketing</option>
                        <option value={5}>Finance</option>
                        <option value={6}>Legal</option>
                        <option value={7}>Support</option>
                        <option value={8}>Education</option>
                        <option value={9}>Health</option>
                        <option value={10}>Engineering</option>
                </select>
                
                <label>Description</label>
                <textarea rows="5" cols="30" name="description" value={formData.description} onChange={handleChange} placeholder='Enter job description'/>
                    
                {error && <p className='error'><FaExclamationCircle style={{ marginRight: '5px',fontSize:'20px' }} />{error}</p>}
                <button type="submit">Post job</button>
            </form>
        </div>
    )
}

export default CreateJob;