// ProjectCard.jsx
import React from 'react';
import { format } from 'date-fns'
import {  useNavigate } from 'react-router-dom';

const ProjectCard = ({ project }) => {
    const startDate = new Date(project.start_date);
    const navigate=useNavigate()

    // assign classname based on status
    let cname;
    if(project.status==='Ongoing'){
        cname='grey-box'
    }else if(project.status==='Completed'){
        cname='green-box'
    }else{
        cname='red-box'
    }
    
    // view all project details
    const gotoProject=(pid)=>{
        console.log(pid)
       navigate(`/project/${pid}`)
    }
    
    return (
        <div className="card-styling" onClick={()=>gotoProject(project.pid)}>
            <h4>{project.job_title || 'No Title'}</h4> 
            <p>Start Date: {format(startDate, 'MMMM d, yyyy')}</p>
            <span className={`status-box ${cname}`}>
                {project.status}
            </span>
        </div>
    );
};

export default ProjectCard;
