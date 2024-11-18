import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="home-container">
            <div className='wh-info'>
                <section className="about-section">
                    <h2>About WorkHive</h2>
                    <p>WorkHive is a dynamic platform that bridges the gap between clients and freelancers. Clients can post jobs, browse freelancer profiles, and hire the best talent for their projects, while freelancers can bid on jobs, showcase their portfolios, and connect with potential clients for collaborative opportunities.</p>
                </section>

                <section >
                    <h2>Why Choose WorkHive?</h2>
                    <div className="features-section">
                    <div className="feature">
                        <h3>For Clients</h3>
                        <ul>
                            <li>Post jobs and attract bids from talented freelancers.</li>
                            <li>Browse and hire from a pool of verified freelancers.</li>
                            <li>Leave a review for freelancers based on their work.</li>
                        </ul>
                    </div>
                    <div className="feature">
                        <h3>For Freelancers</h3>
                        <ul>
                            <li>Showcase your portfolio and attract high-quality clients.</li>
                            <li>Bid on projects that match your skills and expertise.</li>
                            <li>Collaborate with other freelancers and clients</li>
                        </ul>
                    </div>
                    </div>
                </section>
                <h3>Ready to get started?</h3>
                <p>Join WorkHive today and take the first step towards achieving your project goals.</p>
                <Link to="/signup" >Sign Up</Link>
            </div>
        </div>
    );
};

export default Home;
