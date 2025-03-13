class HoverButton extends HTMLElement {
  constructor() {
    super();
    // 创建 shadow root
    this.attachShadow({ mode: 'open' });
  }

  // 当元素被连接到文档时调用
  connectedCallback() {
    this.render();
  }

  // 当元素从文档中断开连接时调用
  disconnectedCallback() {
    // 需要时进行清理
  }

  // 当属性发生变化时调用
  attributeChangedCallback(name, oldValue, newValue) {
    this.render();
  }

  // 定义需要观察的属性
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
      'default': '#d9d9d9'
    };
    
    const type = this.getAttribute('type') || 'default';
    return typeColorMap[type] || typeColorMap.default;
  }

  // 渲染方法
  render() {
    const buttonColor = this.getColorByType();
    const buttonText = this.textContent || 'Hover me';
    
    this.shadowRoot.innerHTML = `
      <style>
        button {
          position: relative;
          width: 100px;
          height: 50px;
          padding: 12px;
          border: 1px solid ${buttonColor};
          color: ${buttonColor};
          background: transparent;
          font-size: 16px;
          cursor: pointer;
          overflow: hidden;
          z-index: 1;
          transition: .2s;
        }
        button::after {
          content: ' ';
          position: absolute;
          display: block;
          width: 0;
          height: 200px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          background: ${buttonColor};
          transition: .5s ease;
          z-index: -1;
        }
        button:hover::after {
          width: 105%;
        }
        button:hover {
          color: #111;
        }
      </style>
      <button>${buttonText}</button>
    `;
  }
}

// 注册自定义元素
customElements.define('hover-button-1', HoverButton);
