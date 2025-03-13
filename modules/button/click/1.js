class ClickButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.addClickEffect();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.clickHandler);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.render();
  }

  static get observedAttributes() {
    return ['type'];
  }

  // 获取按钮类型对应的颜色
  getColorByType() {
    const typeColorMap = {
      'primary': '#1976D2',
      'success': '#4CAF50',
      'warning': '#FF9800',
      'error': '#F44336',
      'default': '#17C3B2'
    };
    
    const type = this.getAttribute('type') || 'default';
    return typeColorMap[type] || typeColorMap.default;
  }

  // 添加点击效果
  addClickEffect() {
    this.clickHandler = (e) => {
      const button = this.shadowRoot.querySelector('button');
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      button.appendChild(ripple);

      // 动画结束后移除ripple元素
      ripple.addEventListener('animationend', () => {
        ripple.remove();
      });
    };

    this.shadowRoot.querySelector('button').addEventListener('click', this.clickHandler);
  }

  render() {
    const buttonText = this.textContent || 'Click me';
    const buttonColor = this.getColorByType();
    const darkerColor = this.adjustColor(buttonColor, -20); // 暗化颜色用于hover效果
    
    this.shadowRoot.innerHTML = `
      <style>
        button {
          position: relative;
          width: 100px;
          padding: 12px;
          font-size: 16px;
          background-color: ${buttonColor};
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          overflow: hidden;
          transition: background-color 0.3s;
        }

        button:hover {
          background-color: ${darkerColor};
        }

        .ripple {
          position: absolute;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          pointer-events: none;
          width: 10px;
          height: 10px;
          animation: ripple-effect 0.6s linear;
          transform: translate(-50%, -50%);
        }

        @keyframes ripple-effect {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(20);
            opacity: 0;
          }
        }

        button:active {
          transform: scale(0.98);
        }
      </style>
      <button>${buttonText}</button>
    `;
  }

  // 辅助函数：调整颜色明度
  adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    
    r = Math.clamp(r, 0, 255);
    g = Math.clamp(g, 0, 255);
    b = Math.clamp(b, 0, 255);
    
    return '#' + (b | (g << 8) | (r << 16)).toString(16).padStart(6, '0');
  }
}

// 添加Math.clamp辅助函数
Math.clamp = (num, min, max) => Math.min(Math.max(num, min), max);

customElements.define('click-button-1', ClickButton);
