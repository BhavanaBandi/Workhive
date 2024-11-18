import React, { useState } from 'react';
import { searchJobs } from '../apis'; 
import JobCard from '../components/JobCard';



const SearchJob = () => {
    const [jobs, setJobs] = useState([]);
    const [domain, setDomain] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [searched,setSearched]=useState(false)
   
    // get the jobs based on domain and search query
    const handleSearch = async(e) => {
        e.preventDefault();
        try {
            console.log(searchTerm,domain)
            const response = await searchJobs(domain, searchTerm);
            console.log(response)
            setJobs(response.data.jobs); 
            setError(null);
            setSearched(true)
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError('Failed to fetch jobs. Please try again later.');
        }
    };

    // clear search results
    const clearSearch=()=>{
        setSearchTerm('')
        setDomain('all')
        setJobs([])
        setSearched(false)
    }

    return (
        <div className='searchpage'>
            <h2 className="search-title">Search for Jobs</h2>
            <form  className='search-form' onSubmit={handleSearch}>
                <input type="text" placeholder="Search by job title or description" name='searchTerm' autoFocus
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='search-input' />

                <select name="domain" value={domain} onChange={(e)=>{setDomain(e.target.value);}}>
                    <option value="all">All Domains</option>
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
                
                <button type="submit">Search</button>
                {searched && <button onClick={clearSearch}>Clear</button>}
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            { searched &&(
                <div>
                    <h2 style={{margin:'20px'}}>Job Listings</h2>
                    <div className='card-list'>
                    {jobs && jobs.length > 0 && jobs.map((job) => (
                                <JobCard key={job.jid} job={job} />
                            ))}
                    {jobs && jobs.length === 0 && <p>No jobs yet</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchJob;