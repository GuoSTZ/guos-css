class GlassText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const text = this.textContent || 'Hi,CSS';
    
    this.shadowRoot.innerHTML = `
      <style>
        .container {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(180deg, #87CEEB, #FFA07A);
          overflow: hidden;
        }
        
        .text-container {
          position: relative;
          padding: 2rem 4rem;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          z-index: 1;
        }
        
        .text {
          font-size: 4rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 300;
          letter-spacing: 0.2em;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('path/to/your/background.jpg');
          background-size: cover;
          background-position: center;
          filter: brightness(1.1);
          z-index: 0;
        }
      </style>
      
      <div class="container">
        <div class="background"></div>
        <div class="text-container">
          <div class="text">${text}</div>
        </div>
      </div>
    `;
  }
}

customElements.define('glass-text-1', GlassText);