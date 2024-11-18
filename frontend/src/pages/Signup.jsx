import React, { useState, useContext } from 'react';
import { signupUser } from '../apis';
import { UserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaExclamationCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

const Signup = () => {
    // all state variables
    const [formData, setFormData] = useState({
        type: 'freelancer',
        email: '',
        fname: '',
        lname: '',
        password: '',
    });
    const [signupType, setSignupType] = useState(''); 
    const [passType, setPassType]=useState('password');
    const [error, setError]=useState(null);

    const { login } = useContext(UserContext);
    const navigate = useNavigate();

    // change form data on changing input values
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if(error){
            setError(null);
        }
    };

    // try to sign up user
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await signupUser(formData);
            const { token, user } = response.data;
            login({ ...user, token });
            toast.success(`Welcome to WorkHive, ${user.fname} ${user.lname}!`);
            navigate('/home');
        } catch (error) {
            if(error.response?.data?.error ){
                setError(error.response?.data?.error);
            } else{
                toast.error('An error occurred, try again later');
            }
        }
    };

    // Toggle between freelancer and client signup
    const handleToggleClass = (signupType) => {
        setSignupType(signupType);
        setFormData({
            ...formData,
            type: signupType,
            fname: '',
            lname: '',
            email: '',
            password: '',
        });
        setPassType('password');
        setError(null);
    };

    const togglePasswordVisibility = () => {
        passType==='password' ? setPassType('text') :  setPassType('password');
    }

    return (
        <div className="form-container">
            <div className="left-column">
                {signupType === 'freelancer' ? (
                    <div className='form-elements'>
                        <h2>Sign Up as Freelancer</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name='fname' placeholder='First Name' className="form-input" 
                                value={formData.fname} onChange={handleChange} id='fname' />
                            <label htmlFor='fname' className="form-label">First Name</label>

                            <input type="text" name='lname' placeholder='Last Name' className="form-input"
                                value={formData.lname} onChange={handleChange} id='lname'/>
                            <label htmlFor='lname' className="form-label">Last Name</label>

                            <input type="text" name='email' placeholder='Email' className="form-input"
                                value={formData.email} onChange={handleChange} id='email'/>
                            <label htmlFor='email' className="form-label">Email</label>

                            <div className="input-container">
                                <input type={passType} name='password' placeholder='Password' className="form-input"
                                    value={formData.password} onChange={handleChange} id='password'/>
                                <label htmlFor='password' className="form-label">Password</label>
                                <span className="password-toggle" onClick={togglePasswordVisibility}>
                                    {passType === 'password' ? <FaEye/> : <FaEyeSlash />}
                                </span>
                            </div>

                            {error && <span className='error' ><FaExclamationCircle style={{ marginRight: '5px',fontSize:'20px' }}/> {error}</span>}
                            <button type="submit" >Sign Up</button>
                        </form>
                    </div>
                ) : (
                    <div className='form-elements'>
                       <h2>Sign Up as Freelancer</h2>
                       <p>Sign in to view available job postings, submit proposals, and track the progress of your current projects.
                            Enhance your profile and gain more opportunities to work with clients worldwide.</p>
                        <button onClick={() => handleToggleClass('freelancer')}>Go to Sign Up </button>
                    </div>
                )}
            </div>
            <div className="right-column">
                {signupType === 'client' ? (
                    <div className='form-elements'>
                        <h2>Sign Up as Client</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name='fname' placeholder='First Name' className="form-input"
                                value={formData.fname} onChange={handleChange} id='fname'/>
                            <label htmlFor='fname' className="form-label">First Name</label>

                            <input type="text" name='lname' placeholder='Last Name' className="form-input"
                                value={formData.lname} onChange={handleChange} id='lname' />
                            <label htmlFor='lname' className="form-label">Last Name</label>

                            <input type="text" name='email' placeholder='Email' className="form-input"
                                value={formData.email} onChange={handleChange} id='email'/>
                            <label htmlFor='email' className="form-label">Email</label>

                            <div className="input-container">
                                <input type={passType} name='password' placeholder='Password' className="form-input"
                                    value={formData.password} onChange={handleChange} id='password'/>
                                <label htmlFor='password' className="form-label">Password</label>
                                <span className="password-toggle" onClick={togglePasswordVisibility}>
                                    {passType === 'password' ? <FaEye/> : <FaEyeSlash />}
                                </span>
                            </div>

                            {error && <span className='error' ><FaExclamationCircle style={{ marginRight: '5px',fontSize:'20px' }}/> {error}</span>}
                            <button type="submit">Sign Up</button>
                        </form>
                    </div>
                ) : (
                    <div className='form-elements'>
                        <h2>Sign Up as Client</h2>
                        <p>Access your dashboard to post jobs, review freelancer bids, and manage ongoing projects effortlessly. </p>
                        <button onClick={() => handleToggleClass('client')} className='button-52'>Go to Sign Up</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Signup;

