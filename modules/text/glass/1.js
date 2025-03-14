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
          width: 400px;  // 添加固定宽度
          height: 400px; // 添加固定高度
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 50%;  // 改为圆形
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          z-index: 1;
          display: flex;     // 添加flex布局
          align-items: center;
          justify-content: center;
        }
        
        .text {
          font-size: 4rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 300;
          letter-spacing: 0.2em;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 2;       // 确保文字在最上层
        }
        
        /* 分钟刻度样式 */
        .minute-marks {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          border-radius: 50%;
        }
        
        .minute-mark {
          position: absolute;
          width: 1px;
          height: 15px;
          background: rgba(255, 255, 255, 0.3);
          left: 50%;
          transform-origin: bottom center;
        }
        
        .minute-mark.hour {
          height: 20px;
          width: 2px;
          background: rgba(255, 255, 255, 0.5);
        }
        
        .minute-label {
          position: absolute;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          transform-origin: center;
          width: 20px;
          height: 20px;
          text-align: center;
          line-height: 20px;
        }
      </style>
      
      <div class="container">
        <div class="background"></div>
        <div class="text-container">
          <div class="text">${text}</div>
          <div class="minute-marks">
            ${this.generateMinuteMarks()}
          </div>
        </div>
      </div>
    `;
  }

  generateMinuteMarks() {
    let marks = '';
    for (let i = 0; i < 60; i++) {
      const angle = i * 6;
      const isHour = i % 5 === 0;

      marks += `
        <div class="minute-mark ${isHour ? 'hour' : ''}" 
             style="transform: rotate(${angle}deg)"></div>
      `;

      if (isHour) {
        const hour = i / 5 || 12;
        const labelAngle = angle - 90; // 调整角度使12点在上方
        const radius = 160; // 标签距离中心的距离
        const x = Math.cos(labelAngle * Math.PI / 180) * radius;
        const y = Math.sin(labelAngle * Math.PI / 180) * radius;

        marks += `
          <div class="minute-label" 
               style="transform: translate(${x}px, ${y}px)">
            ${hour}
          </div>
        `;
      }
    }
    return marks;
  }
}

customElements.define('glass-text-1', GlassText);