import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    consent: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.consent) {
      alert('Please provide consent to submit the form.');
      return;
    }
    console.log('Form submitted:', formData);
    alert('Your message has been submitted!');
  };

  return (
    <div className="flex flex-wrap p-8 gap-8 bg-white">
      <div className="flex-1 min-w-[300px]">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Get in touch</h1>
        <p className="text-lg mb-4">We're here to help you!</p>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="mb-1" htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Dr.P.Dhanalakshmi"
            className="p-2 border rounded"
          />

          <label className="mt-4 mb-1" htmlFor="email">Email address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="email@website.com"
            className="p-2 border rounded"
          />

          <label className="mt-4 mb-1" htmlFor="phone">Phone number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="555-555-5555"
            className="p-2 border rounded"
          />

          <label className="mt-4 mb-1" htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="4"
            className="p-2 border rounded"
          />

          <div className="flex items-start mt-4">
            <input
              type="checkbox"
              id="consent"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
              className="mr-2 mt-1"
              required
            />
            <label htmlFor="consent">I allow this website to store my submission so they can respond to my inquiry. *</label>
          </div>

          <button
            type="submit"
            className="mt-6 p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            SUBMIT
          </button>
        </form>
      </div>

      <div className="flex-1 min-w-[300px]">
        <div>
          <h3 className="text-xl font-semibold mb-1">📧 Email</h3>
          <p className="mb-4">
            <a className="underline text-blue-600" href="mailto:luffyboasanji1999@gmail.com">
              luffyboasanji1999@gmail.com
            </a>
          </p>

          <h3 className="text-xl font-semibold mb-1">📍 Location</h3>
          <p className="mb-4">Chennai, TN, India</p>

          <h3 className="text-xl font-semibold mb-1">🕘 Hours</h3>
          <p>Monday – Sunday<br />9:00am – 10:00pm</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
