import React from 'react';

const LanguageSelection = ({ onLanguageSelect }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#e0f0ff', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', padding: '30px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#7c3aed' }}>Welcome to LinguaBuddy</h1>
        <p style={{ fontSize: '18px', marginBottom: '20px' }}>Please choose a language to start learning:</p>

        <button
          onClick={() => onLanguageSelect('french')}
          style={{ backgroundColor: '#7c3aed', color: '#fff', padding: '10px 20px', borderRadius: '50px', border: 'none', cursor: 'pointer', marginBottom: '15px' }}
        >
          Learn French
        </button>

        <button
          onClick={() => onLanguageSelect('tamil')}
          style={{ backgroundColor: '#7c3aed', color: '#fff', padding: '10px 20px', borderRadius: '50px', border: 'none', cursor: 'pointer' }}
        >
          Learn Tamil
        </button>
      </div>
    </div>
  );
};

export default LanguageSelection;
