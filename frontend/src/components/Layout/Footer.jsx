/**
 * Footer component.
 */
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Restaurant Ordering System
        </p>
      </div>
    </footer>
  );
};

export default Footer;
