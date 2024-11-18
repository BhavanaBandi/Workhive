create database workhive1;
use workhive1;

create table freelancer(
    fid int primary key auto_increment,
    email varchar(50) unique not null,
    password varchar(100) not null,
    fname varchar(15) not null,
    lname varchar(15) not null,
    contact_number varchar(15),
    bio TINYTEXT,
    portfolio LONGBLOB,
    portfolio_name varchar(100),
    exp_level Enum('Beginner', 'Intermediate', 'Advanced') not null default 'Beginner'
);

create table client(
cid int primary key auto_increment,
email varchar(50) unique not null,
password varchar(100) not null,
fname varchar(15) not null,
lname varchar(15) not null,
company varchar(50),
contact_number varchar(15)
);

CREATE TABLE domains (
  domain_id int NOT NULL Primary key AUTO_INCREMENT,
  domain_name varchar(50) NOT NULL unique
);

CREATE TABLE freelancer_domains (
  fid int NOT NULL,
  domain_id int NOT NULL,
  PRIMARY KEY (fid,domain_id),
  FOREIGN KEY (fid) REFERENCES freelancer (fid) ON DELETE CASCADE,
  FOREIGN KEY (domain_id) REFERENCES domains (domain_id) ON DELETE CASCADE
);

create table job(
    jid int primary key auto_increment,
    cid int not null,
    title varchar(50) not null,
    description tinytext not null,
    status Enum('Open', 'Assigned') not null default 'Open',
    category int default 1,
    date_posted datetime not null default current_timestamp,
    FOREIGN KEY (cid) REFERENCES client(cid) on delete cascade,
    FOREIGN KEY (category) REFERENCES domains(domain_id) on delete set null
);

CREATE TABLE bid (
    bid_id INT AUTO_INCREMENT,
    fid INT,
    jid INT,
    proposal TINYTEXT NOT NULL,
    status ENUM('Submitted', 'Accepted', 'Rejected') default 'Submitted' NOT NULL,
    date_submitted timestamp default current_timestamp not null,
    FOREIGN KEY (fid) REFERENCES freelancer(fid) on delete cascade,
    FOREIGN KEY (jid) REFERENCES job(jid) ON DELETE CASCADE,
    PRIMARY KEY (bid_id,jid, fid)         
);

create table project(
    pid int primary key auto_increment,
    jid int ,
    fid int ,
    details TINYTEXT NOT NULL ,
    start_date date  not null default (current_date),
    status enum('Ongoing', 'Completed', 'Suspended') not null  default 'Ongoing',
    payment boolean not null default 0,
    FOREIGN KEY (jid) REFERENCES job(jid) on delete set null, 
    FOREIGN KEY (fid) REFERENCES freelancer(fid) on delete set null
);

create table review(
    rid int primary key auto_increment,
    rating INT CHECK (rating BETWEEN 1 AND 10) Not null,
    comment TINYTEXT not null,
    review_time timestamp not null default current_timestamp,
    cid int not null,
    fid int not null,
    FOREIGN KEY (cid) REFERENCES client(cid) on delete cascade,
    FOREIGN KEY (fid) REFERENCES freelancer(fid)on delete cascade
);

CREATE TABLE collaboration_requests (
    req_id INT PRIMARY KEY AUTO_INCREMENT,
    pid INT NOT NULL,
    fid INT NOT NULL,
    description TINYTEXT NOT NULL,
    status ENUM('Open', 'Closed') not null default 'Open',
    posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP not null,
    FOREIGN KEY (pid) REFERENCES project(pid) on delete cascade, 
    FOREIGN KEY (fid) REFERENCES freelancer(fid) on delete cascade
);

CREATE TABLE collaboration_applications (
    appl_id INT PRIMARY KEY AUTO_INCREMENT,
    req_id INT NOT NULL,
    applicant_id INT NOT NULL,
    status ENUM('Pending', 'Accepted', 'Rejected') not null default 'Pending',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP not null,
    FOREIGN KEY (req_id) REFERENCES collaboration_requests(req_id) on delete cascade, 
    FOREIGN KEY (applicant_id) REFERENCES freelancer(fid) on delete cascade,
    UNIQUE (req_id, applicant_id)  
);



DELIMITER //
-- suspend projects before deleting freelancer
CREATE TRIGGER before_delete_freelancer
BEFORE DELETE ON freelancer
FOR EACH ROW
BEGIN
    UPDATE project SET status = 'Suspended' WHERE fid = OLD.fid and status='Ongoing';
    
    UPDATE job SET status = 'Open' WHERE jid IN (SELECT jid FROM project WHERE fid = OLD.fid);

    UPDATE bid set Status='Submitted' where jid in (SELECT jid FROM project WHERE fid = OLD.fid);
END //

CREATE TRIGGER before_delete_client
BEFORE DELETE ON client
FOR EACH ROW
BEGIN
    UPDATE project SET status = 'Suspended' WHERE jid IN (SELECT jid FROM job WHERE cid = OLD.cid and status='Ongoing');
END //

CREATE TRIGGER after_confirm_payment
AFTER UPDATE ON project
FOR EACH ROW
BEGIN
    IF NEW.status = 'Completed' or NEW.status='Suspended' THEN
        UPDATE collaboration_requests SET STATUS='Closed' where pid=NEW.pid;
    END IF;
END // 

-- procedure to add collaborators
CREATE PROCEDURE AcceptCollaborators(
    IN request_id INT, 
    IN applicantIds TEXT
)
BEGIN
    UPDATE collaboration_requests SET STATUS='Closed' where req_id=request_id;

    UPDATE collaboration_applications  SET status = 'Accepted' WHERE req_id = request_id AND FIND_IN_SET(applicant_id, applicantIds) > 0;

    UPDATE collaboration_applications SET status = 'Rejected' WHERE req_id = request_id AND FIND_IN_SET(applicant_id, applicantIds) = 0;
END //

-- procedure to accept a bid and reject others
CREATE PROCEDURE AcceptAndRejectBids(IN accepted_bid_id INT)
BEGIN
    DECLARE job_id INT;
    DECLARE job_description VARCHAR(100);

    SELECT jid, description INTO job_id, job_description
    FROM job WHERE jid = (SELECT jid FROM bid WHERE bid_id = accepted_bid_id);

    UPDATE bid SET status = 'Accepted' WHERE bid_id = accepted_bid_id;

    UPDATE bid SET status = 'Rejected' WHERE jid = job_id AND bid_id <> accepted_bid_id;

    UPDATE job SET STATUS = 'Assigned' WHERE jid = job_id;

    INSERT INTO project (jid, fid, details)
    VALUES (job_id, (SELECT fid FROM bid WHERE bid_id = accepted_bid_id), job_description);
END //

-- function to get average rating of freelancers
CREATE FUNCTION GetFreelancerAverageRating(freelancerid INT)
    RETURNS DECIMAL(4, 2)
    DETERMINISTIC
        BEGIN
             DECLARE avgRating DECIMAL(4, 2) DEFAULT 0; 
             SELECT IFNULL(AVG(rating), 0) INTO avgRating
             FROM review
             WHERE fid = freelancerId;
             RETURN avgRating;
        END//

DELIMITER ;


