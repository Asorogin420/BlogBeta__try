import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer>
      <ul className="footer_categories">
        <li><Link to="/posts/categories/Digital Marketing Strategies in Pharma">Digital Marketing</Link></li>
        <li><Link to="/posts/categories/Patient Education and Engagement">Education and Engagement</Link></li>
        <li><Link to="/posts/categories/Healthcare Professional (HCP) Outreach">HCP</Link></li>
        <li><Link to="/posts/categories/Market Access and Reimbursement">Market Access</Link></li>
        <li><Link to="/posts/categories/Brand Management and Positioning">Management</Link></li>
        <li><Link to="/posts/categories/Regulatory Compliance in Pharma Marketing">Regulatory Compliance</Link></li>
        <li><Link to="/posts/categories/Pharma Analytics and Market Research">Analytics</Link></li>
        <li><Link to="/posts/categories/Collaborations and Partnerships">Collaborations</Link></li>
        <li><Link to="/posts/categories/Content Marketing and Storytelling">Storytelling</Link></li>
        <li><Link to="/posts/categories/Crisis Communication and Reputation Management">Communication</Link></li>
        <li><Link to="/posts/categories/:Weather">Weather</Link></li>
      </ul>
      <div className="footer_copyright">
        <small>All Rights Reserved &copy; Copyright, Alon Sorogin.</small>
      </div>
    </footer>
  )
}

export default Footer
 // "Digital Marketing Strategies in Pharma", 
            // "Patient Education and Engagement",
            // "Healthcare Professional (HCP) Outreach", 
            // "Market Access and Reimbursement",
            // "Brand Management and Positioning", 
            // "Regulatory Compliance in Pharma Marketing",
            // "Pharma Analytics and Market Research", 
            // "Collaborations and Partnerships",
            // "Content Marketing and Storytelling",
            // "Crisis Communication and Reputation Management"