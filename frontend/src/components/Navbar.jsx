import {useContext, useRef} from "react";
import {FaBars,FaTimes} from "react-icons/fa"
import {NavLink} from 'react-router-dom'
import { UserContext } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Navbar=()=>{
    const navRef=useRef(null);
    const {user,logout}=useContext(UserContext)
    const Navigate=useNavigate();

    // toggle between responsive nav and non responsive
    const toggleNavbar =()=>{
        if (navRef.current) {
            navRef.current.classList.toggle("responsive_nav");
        }
    }

    // logout a user
    const handleLogout=()=>{
        logout();
        toast.success(`Logged out ${user.email}`)
        Navigate('/')
    }
    
    return(
        <header>  
            { !user &&
                <nav ref={navRef}>
                    <h1 onClick={()=>Navigate('/')}>WorkHive</h1>
                    <NavLink to='/login' onClick={toggleNavbar}>Login</NavLink>
                    <NavLink to='/signup' onClick={toggleNavbar}>Sign Up</NavLink>
                    <button className="nav-btn nav-close-btn" onClick={toggleNavbar}>
                        <FaTimes/>
                    </button>
                </nav>
            }
            {user && user.type=='client' &&
                <nav ref={navRef}>
                    <h1 onClick={()=>Navigate('/')}>WorkHive</h1>
                    <NavLink to='/home' onClick={toggleNavbar}>Home</NavLink>
                    <NavLink to='/profile' onClick={toggleNavbar}>My profile</NavLink>
                    <NavLink to='/createjob' onClick={toggleNavbar}>Post a Job</NavLink>
                    <button className="nav-btn nav-close-btn" onClick={toggleNavbar}>
                        <FaTimes/>
                    </button>
                </nav>   
            } 
            {user && user.type=='freelancer' &&
                <nav ref={navRef}>
                    <h1 onClick={()=>Navigate('/')}>WorkHive</h1>
                    <NavLink to='/home' onClick={toggleNavbar}>Home</NavLink>
                    <NavLink to='/profile'onClick={toggleNavbar} >My profile</NavLink>
                    <NavLink to='/search' onClick={toggleNavbar}>Search Jobs</NavLink>
                    <button className="nav-btn nav-close-btn" onClick={toggleNavbar}>
                        <FaTimes/>
                    </button>
                </nav>   
            } 
            <button className="nav-btn" onClick={toggleNavbar}>
                    <FaBars/>
            </button>         
            {user &&
                <div className="user-info-nav" align='right'>
                    <span>{user.email}</span>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            }
        </header>
    )
}

export default Navbar;

