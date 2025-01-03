# Workhive
DBMS COURSE MINI PROJECT 

**WorkHive** is a freelance marketplace platform designed to connect clients and freelancers in various domains such as technology, design, writing, and more. The platform allows clients to post jobs, receive proposals from freelancers, and assign projects to suitable candidates. Freelancers can showcase their portfolios, bid on jobs, and receive ratings and feedback upon project completion.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage) 
- [Database Schema](#database-schema)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## Project Overview
WorkHive serves as a streamlined platform that connects freelancers with potential clients in a secure and organized environment. With a focus on a clean user interface and efficient functionalities, WorkHive simplifies the process of job posting, bidding, project management, and review for both freelancers and clients. This project is particularly beneficial for anyone looking to create a freelance marketplace similar to platforms like Fiverr or Upwork.

## Features
1. **Dashboard**
![WhatsApp Image 2024-11-18 at 11 08 19 PM](https://github.com/user-attachments/assets/3c97a1bd-74a3-4aa5-b28c-7b271853d6b1)

2. **User Registration & Authentication**: Allows users to create accounts and log in securely.
![WhatsApp Image 2024-11-18 at 11 12 12 PM](https://github.com/user-attachments/assets/e378e0e9-eee4-426b-b85b-8824b5cac8d5)

3. **Profile Management**: Enables clients and freelancers to update their profiles and showcase their portfolios.
![WhatsApp Image 2024-11-18 at 11 08 19 PM(1)](https://github.com/user-attachments/assets/83a67ad9-67cd-48d6-852d-568134b7e474)

4. **Job Posting and Browsing**: Clients can post jobs, and freelancers can search and apply for jobs.
![WhatsApp Image 2024-11-18 at 11 08 19 PM(3)](https://github.com/user-attachments/assets/6b3974da-9021-4e96-9f43-03b51bb07bd9)
![WhatsApp Image 2024-11-18 at 11 08 19 PM(2)](https://github.com/user-attachments/assets/6531c00a-f36d-4b53-b926-25f86f9ae0e1)

5. **Bid Submission**: Freelancers can submit proposals on job postings, including details about their approach and pricing.
![WhatsApp Image 2024-11-18 at 11 22 58 PM](https://github.com/user-attachments/assets/f55a9896-97f9-4be0-832e-6ec5495614d4)

6. **Project Assignment & Management**: Clients can assign jobs to freelancers, with status updates (Open, Assigned, Completed).
![WhatsApp Image 2024-11-18 at 11 22 58 PM(1)](https://github.com/user-attachments/assets/1708b661-410e-4573-a0a3-d2b860a05fad)

7. **Portfolio Upload**: Freelancers can upload documents to showcase past work.
![WhatsApp Image 2024-11-18 at 11 22 58 PM(2)](https://github.com/user-attachments/assets/c875c124-7f99-4550-a868-faa4723d4890)

8. **Review & Rating System**: Clients can rate and review freelancers based on their job performance.
![WhatsApp Image 2024-11-18 at 11 08 19 PM(4)](https://github.com/user-attachments/assets/6ab7335c-a4bf-435c-b9ba-daeb2456373e)

9. **Role-Based Access Control**: Ensures different access permissions for clients and freelancers.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Frontend**: React, HTML, CSS
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: AWS S3 or local file system
- **Notifications**: NodeMailer for email notifications

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/BhavanaBandi/WorkHive.git
   cd WorkHive
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database**:
   - Install MySQL and create a database for WorkHive.
   - Import the provided SQL schema file to set up the required tables.
   - Update the database connection settings in the `config.js` file.

4. **Environment Variables**:
   Create a `.env` file and add the following:
   ```plaintext
   DATABASE_URL=<your_mysql_database_url> 
   JWT_SECRET=<your_jwt_secret>
   AWS_ACCESS_KEY_ID=<your_aws_access_key>
   AWS_SECRET_ACCESS_KEY=<your_aws_secret_key>
   EMAIL_USER=<your_email_user>
   EMAIL_PASS=<your_email_password>
   ```

5. **Run the server**:
   ```bash
   npm start
   ```
   This will start the backend server.

6. **Frontend Setup**:
   - Navigate to the `client` folder and install dependencies:
     ```bash
     cd client
     npm install
     ```
   - Start the frontend:
     ```bash
     npm start
     ```
   The frontend will be available at `http://localhost:3000`.

## Usage
1. Register as a client or freelancer.
2. Clients can create job posts and browse freelancers.
3. Freelancers can view job listings, submit bids, and showcase their portfolio.
4. Clients can review received bids, assign jobs, and rate freelancers upon project completion.
5. Freelancers can view job status updates and receive ratings based on completed jobs.

## Database Schema

**Client Table**
- Stores client information (e.g., email, name, contact details).

**Freelancer Table**
- Stores freelancer information including portfolio details.

**Job Table**
- Contains job information like title, description, and status.

**Bid Table**
- Holds information about bids made by freelancers for specific jobs.

**Review Table**
- Stores reviews provided by clients for freelancers.

For a detailed database schema, please refer to the `schema.sql` file in the repository.

## Future Enhancements
- **Real-Time Chat System**: Allow clients and freelancers to communicate directly on the platform.
- **Payment Integration**: Enable secure payment methods for project milestones.
- **Advanced Search Filters**: More robust filtering options for clients to find freelancers based on skill level, ratings, and reviews.
- **Admin Dashboard**: A dashboard for administrators to manage users, job postings, and bids.

## Contributing
We welcome contributions! Please fork the repository and submit a pull request for review. For major changes, please open an issue first to discuss what you would like to change.





