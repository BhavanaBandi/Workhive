import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p className="message">Oops! The page you're looking for doesn't exist.</p>
      <p className="message">It seems like you've followed a broken link or typed in the wrong URL.</p>
      <Link to="/home" className="link">Go to Homepage</Link>
    </div>
  );
};

export default NotFoundPage;