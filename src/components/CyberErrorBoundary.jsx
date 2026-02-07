import React from 'react';
import './CyberErrorBoundary.css';

class CyberErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[SYSTEM CRASH]', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="cyber-crash" role="alert">
          <div className="cyber-crash__crt" />
          <div className="cyber-crash__content">
            <pre className="cyber-crash__skull">{`
    ████████
  ██        ██
 █  ██  ██    █
 █            █
 █   ▄▄▄▄▄   █
  █  █ █ █  █
   ██████████
            `}</pre>
            <h1 className="cyber-crash__title">SYSTEM CRASH</h1>
            <p className="cyber-crash__code">
              ERR::RUNTIME_EXCEPTION
            </p>
            <p className="cyber-crash__msg">
              {this.state.error?.message || 'Unknown fatal error'}
            </p>
            <div className="cyber-crash__bar" />
            <button className="cyber-crash__btn" onClick={this.handleReload}>
              ▸ REBOOT SYSTEM
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default CyberErrorBoundary;
