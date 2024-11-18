// create a new collaboration request
const insertColabRequest = (req, res) => {
    let { pid, fid, description } = req.body;
    description = description?.trim() || null;
    
    if (!fid || !pid) {
        return res.status(400).json({ error: "Freelancer ID and Project ID are required" });
    }
    if (!description) {
        return res.status(400).json({ error: "Description cannot be empty" });
    }
    if(description.length > 255){
        return res.status(400).json({ error: "Description should be less than 255 characters" });
    }
    
    const insertQuery = `INSERT INTO collaboration_requests (pid, fid, description) VALUES (?, ?, ?);`;

    global.con.query(insertQuery, [pid, fid, description], (err, results) => {
        if (err) {
            console.error('Error creating collaboration request:', err);
            return res.status(500).json({ message: 'Error creating collaboration request' });  
        }

        const reqId = results.insertId;
        const selectQuery = `SELECT * FROM collaboration_requests WHERE req_id = ?;`;
        global.con.query(selectQuery, [reqId], (err, results) => {
            if (err || results.length === 0) {
                return res.status(404).json({ error: 'Collaboration request not found after inserting' });
            }
            res.status(201).json({
                message: 'Collaboration request created successfully',
                info: results[0] 
            });
        });
    });
};

// add multiple collaborators for a project
const acceptCollaborators = async (req, res) => {
    const { req_id, applicantIds } = req.body;
    console.log(req_id, applicantIds);

    if (!req_id || !Array.isArray(applicantIds) || applicantIds.length === 0) {
        return res.status(400).json({ message: 'Request ID and applicant Ids are required' });
    }

    const applicantIdsStr = applicantIds.join(',');
    const procedureCall = `CALL AcceptCollaborators(?, ?);`;

    global.con.query(procedureCall, [req_id, applicantIdsStr], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Could not approve bid' });
        }

        const updatedRows = results[0]?.affectedRows || 0;
        return res.json({
            message: 'Applicants updated successfully',
            affectedRows: updatedRows
        });
    });
};


// submit a collaboration application 
const addColabApplication = async(req,res) => {
    const { req_id, applicant_id } = req.body;
    
    if (!req_id || !applicant_id) {
        return res.status(400).json({ error: 'req_id and applicant id are required' });
    }
    
    const insertQuery = ` INSERT INTO collaboration_applications (req_id, applicant_id) VALUES (?, ?)`;
    
    global.con.query(insertQuery, [req_id, applicant_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Could not insert application' });
            }

            const appl_id=result.insertId;
            const sel_query='SELECT * FROM collaboration_applications where appl_id=?;'
            global.con.query(sel_query,[appl_id],(err,result)=>{
                if(err){
                    return res.status(500).json( {error:'Application not found after inserting'} )
                }
                return res.status(201).json({ message: 'Application submitted successfully', application: result[0] });
            })      
        });       
};

// withdraw a collaboration application
const deleteColabApplication = async (req, res) => {
    const { appl_id } = req.params;
    
    if (!appl_id) {
        return res.status(400).json({ error: 'appl_id is required' });
    }
    
    const deleteQuery = `DELETE FROM collaboration_applications WHERE appl_id = ?;`;
    
    global.con.query(deleteQuery, [appl_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Could not delete application' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        return res.status(200).json({ message: 'Application withdrawn successfully' });
    });
};

// delete a collaboratin request
const deleteColabRequest = async (req, res) => {
     const { req_id } = req.params; 
       
    if (!req_id) {
        return res.status(400).json({ message: 'Request ID is required.' });
    }
    
    const query = 'DELETE FROM collaboration_requests WHERE req_id = ?'; 
    
    global.con.query(query, [req_id], (err, results) => {
        if (err) {     
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Collaboration request not found.' });
        }
        res.status(200).json({ message: 'Collaboration request deleted successfully.' });
    });
};

// update the description of a collaboration request
const updateCollabRequest = async (req, res) => {
    let { req_id, description } = req.body; 

    description=description?.trim() || null
    if (!req_id) {
        return res.status(400).json({ error: "Request ID is required" });
    }
    if (!description) {
        return res.status(400).json({ error: "Description cannot be empty" });
    }
    if(description.length > 255){
        return res.status(400).json({ error: "Description should be less than 255 characters" });
    }

    const query = `UPDATE collaboration_requests SET description=? WHERE req_id = ?`;
    global.con.query(query, [description,req_id], (err, results) => {
        if (err) {
            console.error('Error updating collaboration request:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Collaboration request not found' });
        }
        res.status(200).json({ message:"updated sucessfully" });
    });
};
    
module.exports = { insertColabRequest,deleteColabRequest, updateCollabRequest, acceptCollaborators, addColabApplication, deleteColabApplication};
