import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { course, student_id } = location.state || {};
  
  if (!course || !student_id) {
    navigate('/home');
    return null;
  }
  
  // Add this function to handle close button click
  const handleClose = () => {
    // You can add a confirmation dialog if needed
    if (window.confirm('Are you sure you want to cancel this payment?')) {
      navigate('/home');  // or navigate back to where the user came from
    }
  };
  
  const handlePayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Process payment
      const paymentResponse = await axios.post('http://localhost:5000/api/payment/process', {
        courseId: course.course_id,
        amount: course.price,
        userId: student_id
      });
      
      if (paymentResponse.data.success) {
        // Enroll student in course
        await axios.post('http://localhost:5000/api/enrollments/enroll', {
          student_id: student_id,
          course_id: course.course_id
        });
        
        alert('Payment successful! You are now enrolled in this course.');
        navigate('/home');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="payment-container">
      {/* Add this header div with title and close button */}
      <div className="payment-header">
        <h2>Complete Your Enrollment</h2>
        <button 
          className="close-button" 
          onClick={handleClose}
          aria-label="Cancel Payment"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      
      <div className="course-summary">
        <h3>{course.title}</h3>
        <p>Instructor: {course.instructor}</p>
        <p className="price">Price: LKR{course.price}</p>
      </div>
      
      <div className="payment-form">
        <h3>Payment Details</h3>
        <div className="form-group">
          <label>Card Number</label>
          <input 
            type="text" 
            placeholder="4242 4242 4242 4242" 
            defaultValue="4242 4242 4242 4242" 
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Expiry Date</label>
            <input 
              type="text" 
              placeholder="MM/YY" 
              defaultValue="12/25" 
            />
          </div>
          <div className="form-group">
            <label>CVV</label>
            <input 
              type="text" 
              placeholder="123" 
              defaultValue="123" 
            />
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          className="btn btn-primary pay-button" 
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? 'Processing...' : `Pay LKR${course.price}`}
        </button>
      </div>
    </div>
  );
};

export default Payment;
