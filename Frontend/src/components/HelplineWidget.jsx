import { FaPhoneAlt, FaShieldAlt, FaAmbulance, FaUserShield, FaExclamationCircle } from 'react-icons/fa';

const HELPLINES = [
  { name: 'National Emergency', number: '112', icon: <FaShieldAlt />, color: '#dc2626' },
  { name: 'Women Helpline', number: '1091', icon: <FaUserShield />, color: '#e91e63' },
  { name: 'Domestic Violence', number: '181', icon: <FaExclamationCircle />, color: '#7c3aed' },
  { name: 'Police Control', number: '100', icon: <FaPhoneAlt />, color: '#0284c7' },
  { name: 'Ambulance Emergency', number: '102', icon: <FaAmbulance />, color: '#16a34a' },
  { name: 'Cyber Crime Helpline', number: '1930', icon: <FaShieldAlt />, color: '#d97706' },
];

const HelplineWidget = () => {
  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>
        📞 Emergency Helpline Speed-Dial
      </h3>
      <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
        Direct 24/7 emergency hotline numbers for immediate government & police support.
      </p>

      <div className="helpline-grid">
        {HELPLINES.map((item) => (
          <a
            key={item.number}
            href={`tel:${item.number}`}
            className="helpline-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: item.color, fontSize: '1.2rem', display: 'flex' }}>
                {item.icon}
              </span>
              <div>
                <strong style={{ fontSize: '0.88rem', display: 'block' }}>{item.name}</strong>
                <span className="helpline-number">{item.number}</span>
              </div>
            </div>
            <span className="btn btn-sm btn-primary" style={{ borderRadius: '50px', padding: '4px 10px' }}>
              Call
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default HelplineWidget;
