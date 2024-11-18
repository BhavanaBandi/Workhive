// get the jobs with most bids and collaboration applications with most applicants
const getJobsWithMostBids = async (req, res) => {
    const { fid } = req.params;

    if (!fid) {
        return res.status(400).json({ error: 'Invalid Freelancer logged in' });
    }

    const query1 = `
        SELECT j.*, COUNT(b.bid_id) AS bid_count, d.*
        FROM job j
        LEFT JOIN bid b ON j.jid = b.jid
        JOIN domains d ON j.category = d.domain_id
        WHERE j.status = 'open'
        AND domain_id IN (
            (SELECT domain_id FROM freelancer_domains WHERE fid = ?)
            UNION
            (SELECT domain_id FROM domains WHERE NOT EXISTS (SELECT 1 FROM freelancer_domains WHERE fid = ?))
        )
        GROUP BY j.jid
        ORDER BY bid_count DESC
        LIMIT 12;
    `;

    // Query to get collaboration requests with the most applicants
    const query2 = `
        SELECT cr.*, COUNT(ca.appl_id) applicant_count, CONCAT(f.fname, ' ', f.lname) freelancer_name
        FROM collaboration_requests cr
        LEFT JOIN collaboration_applications ca ON cr.req_id = ca.req_id
        LEFT JOIN freelancer f ON cr.fid = f.fid
        WHERE cr.status = 'Open' AND cr.fid <> ?
        GROUP BY cr.req_id
        ORDER BY applicant_count, cr.posted DESC
        LIMIT 12;
    `;

    try {
        const [jobs, collaborations] = await Promise.all([
            new Promise((resolve, reject) => {
                global.con.query(query1, [fid, fid], (err, results) => {
                    if (err) {
                        console.error('Error fetching jobs with most bids:', err);
                        return reject('Error fetching jobs with most bids');
                    }
                    resolve(results);
                });
            }),
            new Promise((resolve, reject) => {
                global.con.query(query2, [fid], (err, results) => {
                    if (err) {
                        console.error('Error fetching collaboration requests with most applicants:', err);
                        return reject('Error fetching collaboration requests with most applicants');
                    }
                    resolve(results);
                });
            })
        ]);
        res.status(200).json({ jobs, collaborations });
    } catch (error) {
        console.error('Error occurred while fetching data:', error);
        res.status(500).json({ message: 'Failed to retrieve data', error: error.message });
    }
};

// get the top 3 freelancers in each domain
const getTopFreelancersByDomain = (req, res) => {
    const query= `SELECT fd.fid, CONCAT(f.fname, ' ', f.lname) AS freelancer_name, d.domain_name,
                  GetFreelancerAverageRating(fd.fid) AS avg_rating, COUNT(r.rating) AS review_count
                  FROM domains d
                  LEFT JOIN freelancer_domains fd ON d.domain_id = fd.domain_id
                  LEFT JOIN freelancer f ON fd.fid = f.fid
                  LEFT JOIN review r ON fd.fid = r.fid
                  WHERE (SELECT COUNT(*) 
                            FROM freelancer_domains fd2 WHERE fd2.domain_id = fd.domain_id
                            AND (GetFreelancerAverageRating(fd2.fid) > GetFreelancerAverageRating(fd.fid) 
                            OR (GetFreelancerAverageRating(fd2.fid) = GetFreelancerAverageRating(fd.fid) AND fd2.fid < fd.fid))) < 3
                  GROUP BY d.domain_id, fd.fid, f.fname, f.lname
                  HAVING (avg_rating >= 3 AND COUNT(r.rating) > 0) OR fd.fid IS NULL
                  ORDER BY d.domain_id, avg_rating DESC;`
    
    global.con.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching top freelancers:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const freelancersByDomain = {};
        results.forEach(row => {
            const { domain_name, fid, avg_rating, review_count, freelancer_name } = row;
            if (!freelancersByDomain[domain_name]) {
                freelancersByDomain[domain_name] = [];
            }
            if (fid) { 
                freelancersByDomain[domain_name].push({
                    name: freelancer_name,
                    fid: fid,
                    avg_rating: avg_rating,
                    review_count: review_count, 
                });
            }
        });

        for (const domain in freelancersByDomain) {
            if (freelancersByDomain[domain].length === 0) {
                freelancersByDomain[domain] = []; 
            }
        }
        res.status(200).json(freelancersByDomain);
    });
};

module.exports={getJobsWithMostBids, getTopFreelancersByDomain}