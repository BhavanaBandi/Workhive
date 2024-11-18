// insert a new bid
const insertBid = async (req, res) => {
    let { fid, jid, proposal} = req.body;
    proposal = proposal?.trim() || null;

    if (!fid || !jid) {
        return res.status(400).json({ error: "Freelancer ID and Job ID are required" });
    }
    if (!proposal) {
        return res.status(400).json({ error: "Proposal cannot be empty" });
    }
    if(proposal.length > 255){
        return res.status(400).json({ error: "Proposal should be less than 255 characters" });
    }

    const query = `INSERT INTO bid (fid, jid, proposal) VALUES (?, ?, ?);`;

    global.con.query(query,[fid, jid, proposal],(err,result)=>{
        if(err){
            if (err.code==='ER_NO_REFERENCED_ROW_2'){
                return res.status(400).json({error:"Invalid Freelancer or Job"})
            } else {
                console.log(err)
                return res.status(500).json({ error: 'Error Posting the bid' });
            }
        }

        const bid_id=result.insertId
        const select_query= `SELECT b.*, CONCAT(f.fname, ' ', f.lname) freelancer_name 
                             FROM bid b JOIN freelancer f ON b.fid = f.fid WHERE  b.bid_id = ?;`;
        global.con.query(select_query,[bid_id],(err,result)=>{
            if (err || result.length === 0) {
                return res.status(404).json({ error: "An error occured after bid submission" });
            }
            return res.status(201).json({
                message: "Bid posted successfully", 
                bid : result[0]
            })
        })
    })
  }; 

// delete a bid
const deleteBid = (req, res) => {
    const { bid_id } = req.params;
    const query = `DELETE FROM bid WHERE bid_id=?;`
    global.con.query(query,[bid_id],(err,result)=>{
        if(err){
            return res.status(500).json({ error:'could not delete bid' })
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Bid not found' });
        }
        res.status(200).json({ message: 'Bid deleted successfully' });
    })
}

//approve a bid and reject other bids
const updateBid = (req, res) => {
    const { bid_id } = req.params;
    const updateQuery = "CALL AcceptAndRejectBids(?);"; 
    global.con.query(updateQuery, [bid_id], (err, result) => {
        if (err) {
            console.log("Error approving bid:", err);
            return res.status(500).json({ error: "Could not approve bid" });
        }
        return res.status(200).json({ message: 'Bid approved and rejected cother bids' });
    });
};

module.exports = { insertBid, deleteBid, updateBid }


  