import React, { useState, useEffect, useRef } from 'react';

// Levenshtein Distance Function
const levenshtein = (a, b) => {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
};

const App = () => {
  const [sentences, setSentences] = useState([]);
  const [current, setCurrent] = useState(0);
  const [recording, setRecording] = useState(false);
  const [userText, setUserText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [userProgress, setUserProgress] = useState({
    completedWords: 0,
    completedSentences: 0,
    totalSentences: 0
  });
  const [level, setLevel] = useState(1);  // Track current level
  const [mistakes, setMistakes] = useState('');  // Track mistakes
  const recognitionRef = useRef(null);

  // Fetching sentence data
  useEffect(() => {
    const wordsLevel = [
      { english: 'Hello', french: 'Bonjour' },
      { english: 'How are you?', french: 'Comment ça va ?' },
      { english: 'What is your name?', french: 'Comment tu t\'appelles ?' },
      { english: 'I am fine', french: 'Je vais bien' },
      { english: 'Good morning', french: 'Bonjour' },
      { english: 'Where is the bathroom?', french: 'Où est la salle de bain ?' },
      { english: 'Can you help me?', french: 'Pouvez-vous m\'aider ?' }
    ];

    const phrasesLevel = [
      { english: 'I am going to the market', french: 'Je vais au marché' },
      { english: 'She is studying French', french: 'Elle étudie le français' },
      { english: 'Can you show me the way?', french: 'Pouvez-vous me montrer le chemin ?' },
      { english: 'I need a taxi', french: 'J\'ai besoin d\'un taxi' },
      { english: 'I will call you later', french: 'Je vous appellerai plus tard' }
    ];

    setSentences(wordsLevel);
    setUserProgress({
      score: 0,
      completedWords: 0,
      completedSentences: 0,
      totalSentences: wordsLevel.length
    });
  }, []);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setRecording(true);
    recognition.start();

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript.trim();
      setUserText(speechResult);

      const target = sentences[current].french.toLowerCase().replace(/[^\wÀ-ÿ]+/g, '');
      const spoken = speechResult.toLowerCase().replace(/[^\wÀ-ÿ]+/g, '');

      const distance = levenshtein(spoken, target);
      const maxLen = Math.max(spoken.length, target.length);
      const similarity = Math.round((1 - distance / maxLen) * 100);

      setScore(similarity);
      setFeedback(similarity > 80 ? 'Great job!' : similarity > 50 ? 'Almost there!' : 'Keep practicing!');

      // Provide feedback on mistakes
      const targetWords = target.split(' ');
      const spokenWords = spoken.split(' ');
      const mistakesList = targetWords.map((word, index) => {
        if (spokenWords[index] !== word) {
          return `Mistake in the word: "${word}" (Expected: "${word}", but said: "${spokenWords[index]}")`;
        }
        return null;
      }).filter(Boolean);
      setMistakes(mistakesList.join(', '));

      // Track word progress
      setUserProgress(prevProgress => ({
        ...prevProgress,
        completedWords: prevProgress.completedWords + spoken.split(' ').length,
        completedSentences: prevProgress.completedSentences + 1
      }));

      // Move to the next level after 5 words
      if (userProgress.completedWords >= 5) {
        setLevel(2);  // Switch to phrases level
        setSentences([
          { english: 'I am going to the market', french: 'Je vais au marché' },
          { english: 'She is studying French', french: 'Elle étudie le français' },
          { english: 'Can you show me the way?', french: 'Pouvez-vous me montrer le chemin ?' },
          { english: 'I need a taxi', french: 'J\'ai besoin d\'un taxi' },
          { english: 'I will call you later', french: 'Je vous appellerai plus tard' }
        ]);
      }

      setRecording(false);
    };

    recognition.onerror = () => {
      setFeedback('Could not understand. Try again.');
      setRecording(false);
    };
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
      setRecording(false);
    }
  };

  const nextPrompt = () => {
    if (score > 80) {
      stopRecording(); // Stop recognition before next prompt
      if (current + 1 < sentences.length) {
        setCurrent(current + 1); // Go to the next sentence
        setUserText('');
        setFeedback('');
        setScore(0);
      } else {
        // Reset or show a message that all sentences are completed
        alert('All sentences completed!');
        setCurrent(0); // Reset to first sentence or handle accordingly
        setUserProgress({
          completedWords: 0,
          completedSentences: 0,
          score: 0,
          totalSentences: sentences.length
        });
      }
    } else {
      setFeedback('Your score is below 80. Please try again.');
    }
  };

  const prompt = sentences[current];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(to bottom right, #e0f0ff, #f0e1ff)', padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', padding: '30px', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#7c3aed' }}>🗣️ LinguaBuddy</h1>

        {/* Level Display */}
        <div style={{ marginBottom: '20px' }}>
          <h3>Level: {level === 1 ? 'Words' : 'Phrases'}</h3>
          <h3>Score: {score}/100</h3>
          <p>{userProgress.completedSentences}/{userProgress.totalSentences} Completed</p>
        </div>

        {sentences.length > 0 && (
          <>
            <p style={{ fontSize: '18px' }}>Translate and pronounce:</p>
            <div style={{ fontSize: '20px', fontWeight: '600', marginTop: '10px' }}>{prompt.english}</div>
            <div style={{ color: '#888', marginBottom: '20px' }}>Expected: {prompt.french}</div>

            <button
              onClick={startRecording}
              disabled={recording}
              style={{ backgroundColor: '#7c3aed', color: '#fff', padding: '10px 20px', borderRadius: '50px', border: 'none', cursor: 'pointer', marginBottom: '15px' }}
            >
              {recording ? '🎙️ Listening...' : '🎤 Speak Now'}
            </button>

            {userText && (
              <div style={{ marginTop: '15px', textAlign: 'left' }}>
                <p><strong>You said:</strong> {userText}</p>
                <p><strong>Feedback:</strong> {feedback}</p>
                <p><strong>Mistakes:</strong> {mistakes}</p>
              </div>
            )}

            <button
              onClick={nextPrompt}
              style={{ marginTop: '20px', backgroundColor: '#ddd', color: '#333', padding: '10px 20px', borderRadius: '50px', border: 'none', cursor: 'pointer' }}
            >
              Next
            </button>
          </>
        )}

        {sentences.length === 0 && <p style={{ color: '#888' }}>Loading sentences...</p>}
      </div>
    </div>
  );
};

export default App;
