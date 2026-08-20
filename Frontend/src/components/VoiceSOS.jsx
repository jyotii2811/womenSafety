import { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const VoiceSOS = ({ onTriggerSOS }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript.toLowerCase();
      }
      setTranscript(currentTranscript);

      const triggerKeywords = ['help', 'save me', 'emergency', 'bachao', 'sos', 'danger'];
      const matched = triggerKeywords.some((word) => currentTranscript.includes(word));

      if (matched) {
        toast.error('🚨 Emergency keyword detected via Voice!', { duration: 4000 });
        onTriggerSOS();
        recognition.stop();
        setIsListening(false);
      }
    };

    recognition.onerror = (err) => {
      console.warn('Voice recognition error:', err.error);
      if (err.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;
  }, [onTriggerSOS, isListening]);

  const toggleListening = () => {
    if (!supported) {
      toast.error('Voice recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      toast('Voice SOS deactivated', { icon: '🎙️' });
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast.success('🎙️ Voice SOS active! Say "Help", "Emergency", or "Bachao" to trigger SOS.');
      } catch (err) {
        console.error('Speech recognition failed to start', err);
      }
    }
  };

  return (
    <div className={`tool-card ${isListening ? 'voice-sos-active' : ''}`}>
      <div>
        <div className="tool-card-header">
          <div className={`mic-pulse-ring ${isListening ? 'listening' : ''}`}>
            {isListening ? <FaMicrophone size={22} /> : <FaMicrophoneSlash size={22} />}
          </div>
          <div>
            <h3>Voice SOS Activation</h3>
            <span className={`badge ${isListening ? 'active' : 'inactive'}`}>
              {isListening ? 'Listening Active' : 'Off'}
            </span>
          </div>
        </div>
        <p>
          Activate hands-free emergency listening. Say keywords like <strong>"Help"</strong>, <strong>"Save Me"</strong>, or <strong>"Bachao"</strong> to trigger instant SOS alert.
        </p>
        {isListening && transcript && (
          <div style={{ background: 'rgba(239,68,68,0.08)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#dc2626', marginBottom: '1rem' }}>
            Speech detected: "{transcript}"
          </div>
        )}
      </div>

      <button
        className={`btn ${isListening ? 'btn-danger' : 'btn-outline'}`}
        onClick={toggleListening}
        style={{ width: '100%' }}
      >
        <FaShieldAlt /> {isListening ? 'Deactivate Voice Guard' : 'Enable Voice Guard'}
      </button>
    </div>
  );
};

export default VoiceSOS;
