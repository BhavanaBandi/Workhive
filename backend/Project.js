
/*
const projectDetails= async (req, res) => {
    const {pid} = req.params;
    console.log(pid)
    // SQL query to find collaboration requests for the given project ID
    const requestQuery = `
        SELECT * 
        FROM collaboration_requests 
        WHERE pid = ? 
        `;
    
    global.con.query(requestQuery, [pid], async (err, requests) => {
        if (err) {
            console.error('Error fetching collaboration requests:', err);
            return res.status(500).json({ info: null });
        }

        // If no requests found, return default response
        if (requests.length === 0) {
            console.log('requests',requests)
            return res.json({
                info: null,
                canCreate: true,
                collaborators: [],
                applicants: [],
            });
        }

        const reqId = requests[0].req_id;
        console.log(reqId)
        // Define the SQL queries for applicants and collaborators
        const applicantsQuery = `
            SELECT ca.* ,f.fname,f.lname 
            FROM collaboration_applications ca join freelancer f on applicant_id=fid
            WHERE req_id = ? AND status = 'pending'`;

        const collaboratorsQuery = `
            SELECT ca.* ,f.fname,f.lname 
            FROM collaboration_applications ca join freelancer f on applicant_id=fid
            WHERE req_id = ? AND status = 'accepted'`;

        // Create promises for each query
        const applicantsPromise = new Promise((resolve, reject) => {
            global.con.query(applicantsQuery, [reqId], (err, results) => {
                if (err) return reject('Error executing applicants query: ' + err);
                //console.log('applicants')
                resolve(results);
            });
        });

        const collaboratorsPromise = new Promise((resolve, reject) => {
            global.con.query(collaboratorsQuery, [reqId], (err, results) => {
                if (err) return reject('Error executing collaborators query: ' + err);
                resolve(results);
            });
        });

        // Run both queries in parallel using Promise.all
        try {
            const [applicants, collaborators] = await Promise.all([
                applicantsPromise,
                collaboratorsPromise,
            ]);

            // Prepare the response
            const response = {
                colab:{
                info: requests[0], 
                canCreate: false,
                collaborators, 
                applicants,
            }};

            return res.json(response);
        } catch (error) {
            console.error('Error fetching applicants or collaborators:', error);
            return res.status(500).json({ info: null });
        }
    });
};*/

const projectDetails = async (req, res) => {
    const { pid } = req.params;

    // SQL query to get project details for the given project ID
    const projectQuery = `
        SELECT p.* ,j.title as job_title, CONCAT(f.fname, ' ', f.lname) AS freelancer_name,
        c.cid, CONCAT(c.fname, ' ', c.lname) AS client_name
        FROM project p left join job j on p.jid=j.jid 
        left join client c on j.cid=c.cid 
        left join freelancer f on p.fid=f.fid
        WHERE pid = ? 
    `;

    global.con.query(projectQuery, [pid], async (err, projectResult) => {
        if (err) {
            console.error('Error fetching project details:', err);
            return res.status(500).json({ info: null });
        }

        // Check if project exists
        if (projectResult.length === 0) {
            return res.status(404).json({ info: null, message: 'Project not found' });
        }

        // Get the project details
        const projectDetails = projectResult[0];
        console.log(projectResult[0])

        // Now, fetch collaboration requests for this project
        const requestQuery = `
            SELECT * 
            FROM collaboration_requests 
            WHERE pid = ? 
        `;

        global.con.query(requestQuery, [pid], async (err, requests) => {
            if (err) {
                console.error('Error fetching collaboration requests:', err);
                return res.status(500).json({ info: null });
            }

            // If no requests found, return default response
            if (requests.length === 0) {
                return res.json({
                    projectDetails,
                    colab: {
                        info: null,
                        canCreate: true,
                        collaborators :[],
                        applicants:[],
            }});
            }

            const reqId = requests[0].req_id;

            // Define the SQL queries for applicants and collaborators
            const applicantsQuery = `
                SELECT ca.*, f.fname, f.lname 
                FROM collaboration_applications ca 
                JOIN freelancer f ON applicant_id = fid
                WHERE req_id = ?;`;

            const collaboratorsQuery = `
                SELECT ca.*, f.fname, f.lname 
                FROM collaboration_applications ca 
                JOIN freelancer f ON applicant_id = fid
                WHERE req_id = ? AND status = 'accepted'`;

            // Create promises for each query
            const applicantsPromise = new Promise((resolve, reject) => {
                global.con.query(applicantsQuery, [reqId], (err, results) => {
                    if (err) return reject('Error executing applicants query: ' + err);
                    resolve(results);
                });
            });

            const collaboratorsPromise = new Promise((resolve, reject) => {
                global.con.query(collaboratorsQuery, [reqId], (err, results) => {
                    if (err) return reject('Error executing collaborators query: ' + err);
                    resolve(results);
                });
            });

            // Run both queries in parallel using Promise.all
            try {
                const [applicants, collaborators] = await Promise.all([
                    applicantsPromise,
                    collaboratorsPromise,
                ]);

                // Prepare the response
                const response = {
                    projectDetails,
                    colab: {
                        info: requests[0],
                        canCreate: false,
                        collaborators,
                        applicants,
                    }
                };
                //console.log()
                return res.status(200).json(response);
            } catch (error) {
                console.error('Error fetching applicants or collaborators:', error);
                return res.status(500).json({ info: null });
            }
        });
    });
};

/*
const updateProjectDetails = (req, res) => {
    const { pid } = req.params; // Project ID from URL params
    const { start_date, status, payment, details } = req.body; // Fields to update
  
      if (!start_date && !status && payment === undefined && !details) {
      return res.status(400).json({ message: 'No fields provided for update.' });
    }
  
    const fieldsToUpdate = [];
    const values = [];
  
    if (start_date) {
      fieldsToUpdate.push('start_date = ?');
      values.push(start_date);
    }
  
    if (status) {
      fieldsToUpdate.push('status = ?');
      values.push(status);
    }
  
    if (payment !== undefined) {
      fieldsToUpdate.push('payment = ?');
      values.push(payment);
    }
  
    if (details) {
      fieldsToUpdate.push('details = ?');
      values.push(details);
    }
  
    values.push(pid); // Add project ID for the WHERE clause
  
    const query = `UPDATE project SET ${fieldsToUpdate.join(', ')} WHERE pid = ?`;
  
    global.con.query(query, values, (err, results) => {
      if (err) {
        console.error('Error updating project:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }
  
          global.con.query('SELECT * FROM project WHERE pid = ?', [pid], (err, updatedProject) => {
        if (err) {
          console.error('Error retrieving updated project:', err);
          return res.status(500).json({ message: 'Failed to retrieve updated project' });
        }
  
        res.status(200).json({ project: updatedProject[0] });
      });
    });
  };*/

  /*const updateProjectDetails = (req, res) => {
    const { pid } = req.params; // Project ID from URL params
    const { start_date, status, payment, details } = req.body; // Fields to update

    // Check if no fields are provided
    if (!start_date && !status && payment === undefined && !details) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }

    const fieldsToUpdate = [];
    const values = [];

    // Update start_date if provided
    if (start_date) {
        fieldsToUpdate.push('start_date = ?');
        values.push(start_date);
    }

    // Update status if provided, but also check payment
    if (payment !== undefined) {
        fieldsToUpdate.push('payment = ?');
        values.push(payment);

        // Set status to 'completed' if payment is being set to 1
        if (payment === 1) {
            fieldsToUpdate.push('status = ?');
            values.push('completed'); // Set status to 'completed'
        }
    }

    // Update status if provided
    if (status) {
        fieldsToUpdate.push('status = ?');
        values.push(status);
    }

    // Update details if provided
    if (details) {
        fieldsToUpdate.push('details = ?');
        values.push(details);
    }

    values.push(pid); // Add project ID for the WHERE clause

    const query = `UPDATE project SET ${fieldsToUpdate.join(', ')} WHERE pid = ?`;

    global.con.query(query, values, (err, results) => {
        if (err) {
            console.error('Error updating project:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Retrieve the updated project details
        global.con.query('SELECT * FROM project WHERE pid = ?', [pid], (err, updatedProject) => {
            if (err) {
                console.error('Error retrieving updated project:', err);
                return res.status(500).json({ message: 'Failed to retrieve updated project' });
            }

            res.status(200).json({ project: updatedProject[0] });
        });
    });
};*/

const updateProjectDetails = (req, res) => {
    const { pid } = req.params; // Project ID from URL params
    let { start_date, status, payment, details } = req.body; // Fields to update
    console.log(req.body);

    // Ensure start_date is not null and is a valid date >= current date
    if (start_date) {
        start_date = new Date(start_date);
        const currentDate = new Date();

        // Check if start_date is valid and is not in the past
        if (isNaN(start_date) || start_date < currentDate) {
            return res.status(400).json({ error: 'start_date must be a valid date and not in the past' });
        }
    } else {
        start_date = null; // If no start_date provided, set to null
    }

    details = details?.trim() || null; // Remove any leading/trailing whitespace from details
    status = status || null;


    // Ensure required fields are provided
    if ((!start_date || !details) && payment === undefined && !status) {
        return res.status(400).json({ error: 'Fields cannot be empty' });
    }

    if(details && details.length>255){
        return res.status(400).json({ error: 'Details cannot exceed 255 characters' });
    }

    const fieldsToUpdate = [];
    const values = [];

    // Update start_date if provided
    if (start_date || details) {
        fieldsToUpdate.push('start_date = ?, details = ?');
        values.push(start_date);
        values.push(details);
    } 
    else if (payment !== undefined) {
        fieldsToUpdate.push('payment = ?');
        values.push(payment);

        // Set status to 'completed' if payment is being set to 1
        if (payment === 1) {
            fieldsToUpdate.push('status = ?');
            values.push('Completed'); // Set status to 'completed'
        }
    }else{
        fieldsToUpdate.push('status = ?');
        values.push(status);
    }

    values.push(pid); // Add project ID for the WHERE clause

    const query = `UPDATE project SET ${fieldsToUpdate.join(', ')} WHERE pid = ?`;

    global.con.query(query, values, (err, results) => {
        if (err) {
            console.error('Error updating project:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Retrieve the updated project details
        global.con.query('SELECT * FROM project WHERE pid = ?', [pid], (err, updatedProject) => {
            if (err) {
                console.error('Error retrieving updated project:', err);
                return res.status(500).json({ message: 'Failed to retrieve updated project' });
            }

            res.status(200).json({ project: updatedProject[0] });
        });
    });
};



module.exports={projectDetails,updateProjectDetails}
