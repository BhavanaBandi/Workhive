import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../apis';
import { UserContext } from '../contexts/UserContext';
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaExclamationCircle, FaEye, FaEyeSlash } from 'react-icons/fa';


const Login = () => {
    // state variables 
    const [formData, setFormData] = useState({
        type: 'freelancer',
        email: '',
        password: '',
    });
    const [loginType, setLoginType] = useState(''); 
    const [error, setError] = useState(null)
    const [passType, setPassType] = useState('password')

    const navigate = useNavigate();
    const { login } = useContext(UserContext);

    // change form data on changing input values
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if(error){
            setError(null)
        }
    };

    // try to login user
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(formData);
            const { token, user } = response.data;
            login({ ...user, token });
            toast.success(`Welcome back ${user.fname} ${user.lname}!`);
            navigate('/home');
        } catch (error) {
            if(error.response?.data?.error ){
                setError(error.response?.data?.error)
            } else{
                toast.error('An error occurred, try again later');
            }
        }
    };

    // toggle between freelancer and client login 
    const handleToggleClass = (logintype) => {
        setLoginType(logintype);
        setFormData({
            type: logintype,
            email: '',
            password: '',
        });
        setPassType('password')
        setError(null)
    };

    const togglePasswordVisibility = () => {
        passType==='password' ? setPassType('text') :  setPassType('password');
    }
     
    return (
        <div className="form-container">
            <div className="left-column">
                {loginType === 'freelancer' ? (
                    <div className='form-elements'>
                        <h2>Login as Freelancer</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="email" placeholder="Email" value={formData.email} onChange={handleChange} id='email' className="form-input"/>
                            <label htmlFor='email' className="form-label">Email</label>

                            <div className="input-container">
                                <input type={passType} name="password" placeholder="Password" value={formData.password} onChange={handleChange} id='password' className="form-input"/>
                                <label htmlFor='password' className="form-label">Password</label>
                                <span className="password-toggle" onClick={togglePasswordVisibility}>
                                    {passType === 'password' ? <FaEye/> : <FaEyeSlash />}
                                </span>
                            </div>

                            {error && <span className='error' ><FaExclamationCircle style={{ marginRight: '5px',fontSize:'20px' }}/> {error}</span>}
                            <button type="submit">Login</button>
                        </form>
                    </div>
                ) : (
                    <div className='form-elements'>
                        <h2>Login as Freelancer</h2>
                        <p>Sign in to view available job postings, submit proposals, and track the progress of your current projects.
                        Enhance your profile and gain more opportunities to work with clients worldwide.</p>
                        <button onClick={() => handleToggleClass('freelancer')}>Go to Login</button>
                    </div>
                )}
            </div>
            <div className="right-column">
                {loginType === 'client' ? (
                    <div className='form-elements'>
                        <h2>Login as Client</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="text" name="email" placeholder='Email' value={formData.email} onChange={handleChange} id='email' className="form-input"/>
                            <label htmlFor='email' className="form-label">Email</label>
                           
                            <div className="input-container">
                                <input type={passType} name="password" placeholder='Password' value={formData.password} onChange={handleChange} id='password' className="form-input"/>
                                <label htmlFor='password' className="form-label">Password</label>

                                <span className="password-toggle" onClick={togglePasswordVisibility}>
                                    {passType === 'password' ? <FaEye/> : <FaEyeSlash />}
                                </span>
                            </div>
                                
                            {error && <span className='error' >  <FaExclamationCircle style={{ marginRight: '5px',fontSize:'20px' }}/> {error}</span>}
                            <button type="submit">Login</button>
                        </form>
                    </div>
                ) : (
                    <div className='form-elements'>
                        <h2>Login as Client</h2>
                        <p>Access your dashboard to post jobs, review freelancer bids, and manage ongoing projects effortlessly. </p>
                        <button onClick={() => handleToggleClass('client')}>Go To Login</button>
                    </div>
                )}
            </div>
        </div>
    );
};




export default Login;
/*
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../apis';
import { UserContext } from '../contexts/UserContext';
//import './Login.css'; // Add your CSS file for styling

const Login = () => {
    const [formData, setFormData] = useState({
        type: 'freelancer', // Default to freelancer
        email: '',
        password: '',
    });
    const Navigate = useNavigate();
    const { login } = useContext(UserContext);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isFreelancer, setIsFreelancer] = useState(null); // State to toggle between forms

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (error) {
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(formData);
            const { token, user } = response.data;
            setSuccessMessage(response.data.message); 
            setError(null); 
            login({ ...user, token });
            Navigate('/home');
        } catch (error) {
            console.log(error);  
            setSuccessMessage(null); 
            setError(error.response?.data?.error || 'An error occurred.');
        }
    };

    return (
        <div className="login-container">
            <div className={`login-side ${isFreelancer === true ? 'active' : ''}`}>
                {isFreelancer === null && (
                    <>
                        <h2>Click to Login as Freelancer</h2>
                        <button onClick={() => setIsFreelancer(true)}>Login as Freelancer</button>
                    </>
                )}
                {isFreelancer === true && (
                    <form onSubmit={handleSubmit}>
                        <input type="hidden" name="type" value="freelancer" />
                        <label>
                            Email:
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </label>
                        <label>
                            Password:
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                        </label>
                        <button type="submit">Login</button>
                    </form>
                )}
            </div>

            <div className={`login-side ${isFreelancer === false ? 'active' : ''}`}>
                {isFreelancer === null && (
                    <>
                        <h2>Click to Login as Client</h2>
                        <button onClick={() => setIsFreelancer(false)}>Login as Client</button>
                    </>
                )}
                {isFreelancer === false && (
                    <form onSubmit={handleSubmit}>
                        <input type="hidden" name="type" value="client" />
                        <label>
                            Email:
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </label>
                        <label>
                            Password:
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                        </label>
                        <button type="submit">Login</button>
                    </form>
                )}
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        </div>
    );
};

export default Login;

*/
