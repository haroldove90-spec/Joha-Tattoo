
import React from 'react';
import Section from './Section';

const Contact: React.FC = () => {
  return (
    <Section
        id="contact"
        title="Get Inked"
        subtitle="Ready to start your tattoo journey? Fill out the form below to book a consultation."
        className="bg-gray-900/40"
    >
      <div className="max-w-2xl mx-auto text-left">
        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input type="text" name="name" id="name" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition" placeholder="Your Name" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input type="email" name="email" id="email" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Tattoo Idea</label>
            <textarea name="message" id="message" rows={5} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition resize-none" placeholder="Describe your tattoo concept, placement, and size..."></textarea>
          </div>
          <div className="text-center">
            <button type="submit" className="bg-rose-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-rose-700 transition duration-300 w-full sm:w-auto">
              Send Inquiry
            </button>
          </div>
        </form>
      </div>
    </Section>
  );
};

export default Contact;
