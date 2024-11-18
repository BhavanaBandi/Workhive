// helper function to query database
const queryDatabase = (query, params) => {
  return new Promise((resolve, reject) => {
    global.con.query(query, params, (err, results) => {
      if (err) {
        console.log(err)
        return reject('Error executing query: ' + err.message);
      }
      resolve(results);
    });
  });
};
  
// get all details related to client profile
const getClientProfile = async (req, res) => {
  const { id } = req.params;
  
  const clientQuery = `SELECT * FROM CLIENT WHERE CID = ?`;
  const jobsQuery = `SELECT j.*, CONCAT(c.fname, ' ', c.lname) as client_name , domain_name
                      FROM JOB j 
                      JOIN CLIENT c ON j.cid = c.cid 
                      JOIN domains d on j.category=d.domain_id
                      WHERE j.CID = ? AND j.STATUS = ?
                      ORDER BY date_posted desc`;
  const projectsQuery = `SELECT p.*, CONCAT(c.fname, ' ', c.lname) as client_name, j.title as job_title 
                          FROM PROJECT p 
                          JOIN JOB j ON j.jid = p.jid 
                          JOIN CLIENT c ON c.cid = j.cid 
                          WHERE j.cid = ?`;
  try {
    // Run queries concurrently
    const [clientData, openJobs, projects] = await Promise.all([
        queryDatabase(clientQuery, [id]),
        queryDatabase(jobsQuery, [id, 'Open']),
        queryDatabase(projectsQuery, [id])
    ]);
  
    // Check if client was found
    if (!clientData || clientData.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
  
    res.status(200).json({
      user: clientData[0],
      openJobs,
      projects,
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

// get all details related to freelancer profile
const getFreelancerProfile = async (req, res) => {
  const { id } = req.params;
  
  const freelancerQuery = `SELECT * FROM freelancer WHERE fid = ?;`;
  const averageRatingQuery = `SELECT GetFreelancerAverageRating(?) AS avgRating`;
  const reviewsQuery = `SELECT r.*, CONCAT(c.fname, ' ', c.lname) as client_name FROM review r join client c on r.cid=c.cid WHERE fid = ? ORDER BY review_time desc;`;
  const projectsQuery = `SELECT p.pid, p.jid, p.details, p.start_date, p.status, p.payment, j.title AS job_title
                          FROM project p
                          LEFT JOIN job j ON p.jid = j.jid
                          WHERE p.fid = ?;`;
  const domainsquery = `SELECT d.domain_id, domain_name from domains d join freelancer_domains fd on d.domain_id=fd.domain_id where fd.fid=?;`
  const colabQuery = `SELECT p.*, j.title as job_title 
                      FROM collaboration_applications ca 
                      JOIN collaboration_requests cr on ca.req_id=cr.req_id
                      JOIN project p on cr.pid=p.pid 
                      LEFT JOIN job j on j.jid=p.jid
                      WHERE ca.applicant_id=? AND ca.status='Accepted';`;
  try {
    const [user, avgRating, reviews, projects, domains, colabProjects] = await Promise.all([
    queryDatabase(freelancerQuery, [id]),
    queryDatabase(averageRatingQuery, [id]),
    queryDatabase(reviewsQuery, [id]),
    queryDatabase(projectsQuery, [id]),
    queryDatabase(domainsquery, [id]),
    queryDatabase(colabQuery, [id])
    ]);

    const freelancer=user[0]
    if (freelancer.portfolio && Buffer.isBuffer(freelancer.portfolio)) {
      freelancer.portfolio = freelancer.portfolio.toString('base64');
      freelancer.portfolioType = 'application/pdf';
    }
    
    res.status(200).json({
      user: freelancer,
      avgRating: avgRating[0].avgRating,
      reviews: reviews,
      projects: projects,
      domains: domains,
      colabProjects: colabProjects
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};  
    
// 
const updateClient = (req, res) => {
  const { id, data } = req.body;

  let {fname, lname, contact_number, company } = data;

  data.fname = fname?.trim() || null;
  data.lname = lname?.trim() || null;
  data.contact_number = contact_number?.trim() || null;
  data.company = company?.trim() || null;

  // Validate required fields
  if (!fname || !lname) {
      return res.status(400).json({ error: 'First name and last name are required.' });
  }
  
  if (fname.length > 15) {
      return res.status(400).json({ error: `First name cannot be longer than 15 characters.` });
  }
  if (lname.length > 15) {
      return res.status(400).json({ error: `Last name cannot be longer than 15 characters.` });
  }
  if (contact_number && contact_number.length > 15) {
      return res.status(400).json({ error: `Contact number cannot be longer than 15 characters.` });
  }
  if (company && company.length > 50) {
      return res.status(400).json({ error: `Company name cannot be longer than 50 characters.` });
  }
    
  // SET clause based on the data object
  const setClause = Object.keys(data)
  .map(field => `${field} = ?`)  
  .join(', ');
  const values = [...Object.values(data), id];
  const query = `UPDATE client SET ${setClause} WHERE cid = ?`;
  
  global.con.query(query, values, (err, result) => {
      if (err) {
          console.error('Error updating profile:', err);
          return res.status(500).json({ error: 'Error updating details' });
      }
      global.con.query(`SELECT * FROM client WHERE cid = ?`, [id], (err, results) => {
          if (err || results.length === 0) {
              console.error('Error retrieving updated profile:', err);
              return res.status(500).json({ error: 'Failed to retrieve updated profile.' });
          }
          res.status(200).json({ user: results[0] });
      });
  });
};

const updateFreelancer = (req, res) => {
  const { id } = req.body;
  const data = JSON.parse(req.body.data);
  const { domains } = data; 
  delete data.domains; // Remove domains from data 

  // Input validation for fields
  const { fname, lname, contact_number, bio, exp_level } = data;
  data.fname = fname?.trim() || null;
  data.lname = lname?.trim() || null;
  data.contact_number = contact_number?.trim() || null;
  data.bio = bio?.trim() || null;
  data.exp_level = exp_level?.trim() || null;
  if (!data.fname || !data.lname || !data.exp_level) {
    return res.status(400).json({ error: 'First name and last name is necessary;' });
  }

  if (data.fname.length > 15) {
    return res.status(400).json({ error: `First name cannot be longer than 15 characters.` });
  }
  if (data.lname.length > 15) {
    return res.status(400).json({ error: `Last name cannot be longer than 15 characters.` });
  }
  if (data.contact_number && data.contact_number.length > 15) {
    return res.status(400).json({ error: 'Contact number cannot be longer than 15 characters.' });
  }
  const VALID_EXP_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
  if (!VALID_EXP_LEVELS.includes(data.exp_level)) {
    return res.status(400).json({ error: 'Invalid experience level. Must be one of: Beginner, Intermediate, Advanced.' });
  }
  if (data.bio && data.bio.length > 255) {
    return res.status(400).json({ error: 'Bio cannot be longer than 255 characters.' });
  }

  // validate file input
  let portfolio = null;
  let portfolioName = null;
  if (req.file) {
    portfolio = req.file.buffer;
    portfolioName = req.file.originalname;
    const allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedFileTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Only PDF, JPEG, and PNG are allowed.' });
    }
    const maxFileSize = 5 * 1024 * 1024; 
    if (req.file.size > maxFileSize) {
      return res.status(400).json({ error: 'File size exceeds the maximum allowed size of 5MB.' });
    }
  }

  // create the SET clause for update query
  const setClause = Object.keys(data)
    .map(field => `${field} = ?`) 
    .join(', ');

  const values = [...Object.values(data)];

  const query = `UPDATE freelancer SET ${setClause} ${portfolio ? ', portfolio = ?, portfolio_name = ?' : ''} WHERE fid = ?`;
  const queryValues = portfolio ? [...values, portfolio, portfolioName, id] : [...values, id];

  global.con.beginTransaction((err) => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ error: 'Internal server error during transaction' });
    }

    // Update freelancer profile
    global.con.query(query, queryValues, (err) => {
      if (err) {
        return global.con.rollback(() => {
          console.error('Error updating profile:', err);
          return res.status(500).json({ error: 'Error updating details' });
        });
      }
      // Delete existing domains
      global.con.query(`DELETE FROM freelancer_domains WHERE fid = ?`, [id], (err) => {
        if (err) {
          return global.con.rollback(() => {
            console.error('Error deleting existing domains:', err);
            return res.status(500).json({ error: 'Error updating domains' });
          });
        }

        // Insert new domains
        if (domains && domains.length > 0) {
          const insertQuery = `INSERT INTO freelancer_domains (fid, domain_id) VALUES ?`;
          const valuesToInsert = domains.map(domain_id => [id, domain_id]);

          global.con.query(insertQuery, [valuesToInsert], (err) => {
            if (err) {
              return global.con.rollback(() => {
                console.error('Error inserting new domains:', err);
                return res.status(500).json({ error: 'Error updating domains' });
              });
            }

            // Commit transaction and respond
            global.con.commit((err) => {
              if (err) {
                return global.con.rollback(() => {
                  console.error('Error committing transaction:', err);
                  return res.status(500).json({ error: 'Error committing the update' });
                });
              }
              global.con.query(`SELECT * FROM freelancer WHERE fid = ?`, [id], (err, results) => {
                if (err || results.length === 0) {
                  return res.status(500).json({ message: 'Failed to retrieve updated profile' });
                }
                res.status(200).json({ user: results[0] });
              });
            });
          });
        } else {
          // If there are no domains, commit the transaction
          global.con.commit((err) => {
            if (err) {
              return global.con.rollback(() => {
                console.error('Error committing transaction:', err);
                return res.status(500).json({ error: 'Error committing the update' });
              });
            }
            global.con.query(`SELECT * FROM freelancer WHERE fid = ?`, [id], (err, results) => {
              if (err || results.length === 0) {
                return res.status(500).json({ message: 'Failed to retrieve updated profile' });
              }
              res.status(200).json({ user: results[0] });
            });
          });
        }
      });
    });
  });
};


module.exports={getClientProfile,getFreelancerProfile,updateFreelancer,updateClient}