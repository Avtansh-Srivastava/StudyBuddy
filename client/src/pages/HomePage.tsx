import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-600 mb-4">
            Welcome to StudyBuddy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your all-in-one AI-powered study companion for smarter learning
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Study Assistant Card */}
          <Link 
            to="/study-assistant"
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
          >
            <div className="text-blue-500 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-3">Study Assistant</h2>
            <p className="text-gray-600">
              Get instant answers to your academic questions from our AI tutor
            </p>
          </Link>

          {/* PDF Summary Card */}
          <Link 
            to="/pdf-summary"
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
          >
            <div className="text-blue-500 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-3">PDF Summary</h2>
            <p className="text-gray-600">
              Upload your textbooks and get concise AI-generated summaries
            </p>
          </Link>

          {/* Flashcards Card */}
          <Link 
            to="/flashcards"
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
          >
            <div className="text-blue-500 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-3">Flashcards</h2>
            <p className="text-gray-600">
              Create and study with smart flashcards that help you remember better
            </p>
          </Link>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-xl shadow-md p-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-600">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose a Feature</h3>
              <p className="text-gray-600">Select from Study Assistant, PDF Summary, or Flashcards</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ask or Upload</h3>
              <p className="text-gray-600">Type your question or upload your study materials</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Results</h3>
              <p className="text-gray-600">Receive instant AI-powered assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;