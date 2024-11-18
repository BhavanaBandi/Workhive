// insert a new job
const insertJob = async (req, res) => {
    let { title, description, category, cid } = req.body;

    title = title?.trim() || null;
    description = description?.trim() || null;
    category = category || null;
    cid = cid || null;

    if (!title || !description || !category || !cid) {
        return res.status(400).json({ error: 'All fields are necessary' });
    }
    
    
    if (category<1 || category>10) {
        return res.status(400).json({ error: 'Invalid category' });
    }

   
    if (title.length > 50) {
        return res.status(400).json({ error: 'Title cannot exceed 50 characters' });
    }
    if (description.length > 255) {
        return res.status(400).json({ error: 'Description cannot exceed 255 characters' });
    }

    const query = `INSERT INTO JOB (title, description, category, cid) VALUES (?, ?, ?, ?)`;

    global.con.query(query, [title, description, category, cid], (err, result) => {
        if (err) {
            console.error('Error posting job:', err);
            return res.status(500).json({ error: 'Error posting the job' });
        }

        return res.status(201).json({
            message: 'Job posted successfully',
            job: {
                id: result.insertId,
                title,
                description,
                category,
                status: 'Open',
                },
        });
    });
};

// get the details of a job along with its bids
const getJobDetails = async (req, res) => {
    const { jid } = req.params;

    const jobquery = `
        SELECT j.*, CONCAT(c.fname, ' ', c.lname) AS client_name, domain_name 
        FROM job j
        JOIN client c ON j.cid = c.cid
        JOIN domains d on j.category=d.domain_id
        WHERE jid = ?;
    `;
    
    const bidquery = `
        SELECT b.*, CONCAT(f.fname, ' ', f.lname) AS freelancer_name
        FROM BID b
        JOIN FREELANCER f ON b.fid = f.fid
        WHERE b.jid = ?;
    `;

    try {
        const [jobResults, bidResults] = await Promise.all([
            new Promise((resolve, reject) => {
                global.con.query(jobquery, [jid], (err, results) => {
                    if (err) {
                        return reject('Error executing job query: ' + err);
                    }
                    if (results.length === 0) {
                        return reject('Job not found');
                    }
                    resolve(results[0]); 
                });
            }),

            new Promise((resolve, reject) => {
                global.con.query(bidquery, [jid], (err, results) => {
                    if (err) {
                        return reject('Error executing bids query: ' + err);
                    }
                    resolve(results); 
                });
            })
        ]);

        res.status(200).json({
            job: jobResults,
            bids: bidResults
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error
        });
    }
};

// delete a job 
const deleteJob = (req, res) => {
    const { jid } = req.params;

    const q = `DELETE FROM JOB WHERE JID = ?;`;

    global.con.query(q, [jid], (err, result) => {
        if (err) {
            console.error("Error deleting job:", err);
            return res.status(500).json({ error: 'Could not delete job' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.status(200).json({ message: 'Job deleted successfully' });
    });
};


// search for a job based on tile / description and domain
const searchJobs = (req, res) => {
    let { domain, searchTerm } = req.query;
    if (domain && (domain<1 || domain>10) && domain !== 'all') {
        return res.status(400).json({ error: 'Invalid domain' });
    }

    let query = `SELECT j.*, CONCAT(c.fname, ' ', c.lname) AS client_name, domain_name
             FROM job j
             JOIN client c ON j.cid = c.cid
             JOIN domains d on j.category=d.domain_id
             WHERE status = 'Open'`;

    let queryParams = [];

    if (domain !== 'all') {
        query += ' AND j.category = ?';
        queryParams.push(domain);
    } 

    if (searchTerm) {
        query += ' AND (j.title LIKE ? OR j.description LIKE ?)';
        queryParams.push('%' + searchTerm + '%', '%' + searchTerm + '%');
    }

    query += ' ORDER BY j.date_posted DESC;';
    
    global.con.query(query, queryParams, (err, results) => {
        console.log(query)
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ message: 'Internal server error' });
            }
        res.status(200).json({ jobs: results });
    });
};

// update the job details
const updateJobDetails = (req, res) => {
    const { jid } = req.params; 
    let { title, description } = req.body; 

    title = title?.trim() || null;
    description = description?.trim() || null;
    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }
    if (title.length > 50) {
        return res.status(400).json({ error: 'Title cannot exceed 50 characters' });
    }
    if (description.length > 255) {
        return res.status(400).json({ error: 'Description cannot exceed 255 characters' });
    }

    const query = `UPDATE job SET title = ?, description = ? WHERE jid = ?`;
    global.con.query(query, [title, description, jid], (err, results) => {
        if (err) {
            console.error('Error updating job:', err);
            return res.status(500).json({ error: 'An error occurred while updating the job' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Job not found' });
        }
        const jobQuery = `SELECT j.*, CONCAT(c.fname, ' ', c.lname) AS client_name 
                          FROM job j 
                          JOIN client c ON j.cid = c.cid 
                          WHERE jid = ?`;

        
        global.con.query(jobQuery, [jid], (err, updatedJob) => {
            if (err) {
                console.error('Error retrieving updated job:', err);
                return res.status(500).json({ message: 'Failed to retrieve updated job' });
            }
            res.status(200).json({ job: updatedJob[0] });
        });
    });
};

module.exports =  {insertJob,getJobDetails,deleteJob,searchJobs,updateJobDetails}