// insert a new review 
const insertReview = async (req, res) => {
    let { cid, fid, rating, comment } = req.body;
    cid = cid || null;
    fid = fid || null;
    rating = rating || null;
    comment = comment?.trim() || null;

    if (!fid || !cid) {
        return res.status(400).json({ error: "Freelancer and Client ID are required" });
    }

    if (!rating || !comment) {
        return res.status(400).json({ error: "Rating and comment are required" });
    }
    if (isNaN(rating) || rating < 1 || rating > 10) {
        return res.status(400).json({ error: "Rating should be a number between 1 and 10" });
    }
    
    const insertQuery = `INSERT INTO Review(rating, comment, cid, fid) VALUES (?, ?, ?, ?);`;
    global.con.query(insertQuery, [rating, comment, cid, fid], (err, result) => {
        if (err) {
            console.log('Error Posting the review', err);
            return res.status(500).json({ error: 'Error Posting the review' });
        }
        
        // get the new average rating after insertion
        const avgQuery = `SELECT GetFreelancerAverageRating(?) AS avgRating;`;
        
        global.con.query(avgQuery, [fid], (err, avgResult) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Review submitted but couldn't retrieve average rating" });
            }
        
            const newAverageRating = avgResult[0]?.avgRating || 0; 
            
            //get the details of newly inserted review
            const selectQuery = `SELECT r.*, CONCAT(c.fname, ' ', c.lname) AS client_name 
                                 FROM review r
                                 JOIN client c ON r.cid = c.cid 
                                 WHERE r.rid = ?;`;
            
            global.con.query(selectQuery, [result.insertId], (err, reviewResult) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: "Review submitted but couldn't retrieve details" });
                }
                
                if (reviewResult.length === 0) {
                    return res.status(404).json({ error: "Review details not found after submission" });
                }
                
                return res.status(201).json({
                    message: "Review posted successfully", 
                    review: reviewResult[0],
                    newAverageRating 
                });
            });
        });
    });
};

// update the rating and comment field of review
const updateReview = async (req, res) => {
    const { rid } = req.params;
    let { rating, comment, fid } = req.body;
    
    rating=rating || null
    comment=comment?.trim() || null

    if (!rid) {
        return res.status(400).json({ error: "Review ID is required" });
    }
    if (!rating || !comment) {
        return res.status(400).json({ error: "Rating and comment cannot be empty" });
    }
    if (isNaN(rating) || rating < 1 || rating > 10) {
        return res.status(400).json({ error: "Rating should be a number between 1 and 10" });
    }
    
    const query = `UPDATE review SET rating=?,comment=? WHERE rid = ?`;
    
    global.con.query(query, [rating,comment,rid], (err, results) => {
        if (err) {
            console.log('Error Updating the review',err);
            return res.status(500).json({ error: 'Error Updating the review' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }
    
        // Get the updated average rating for the freelancer
        global.con.query('SELECT GetFreelancerAverageRating(?) AS avgRating;', [fid], (err, newRating) => {
            if (err) {
                console.error('Error retrieving updated average rating:', err);
                return res.status(500).json({ message: 'Failed to retrieve updated average rating' });
            }
            res.status(200).json({ newRating: newRating[0].avgRating }); 
        });
    });
};
    
// delete an existing review
const deleteReview = async (req, res) => {
    const { rid,fid } = req.body;
   
    const deletequery=`DELETE FROM REVIEW WHERE RID=?;`
    const rating_q=`SELECT GetFreelancerAverageRating(?) AS avgRating;`
    global.con.query(deletequery,[rid],(err,result)=>{
        if(err){
            return res.status(500).json({error:'could not delete review'})
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'review not found' });
        }
        // get updated average rating
        global.con.query(rating_q, [fid], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'rating could not be calculated' });
            }
            res.status(200).json({ message: 'review deleted successfully',avgRating: results[0].avgRating });
        });  
    })
};

module.exports={ insertReview, deleteReview, updateReview }