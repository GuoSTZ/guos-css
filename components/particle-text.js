class ParticleText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.particles = [];
    this.currentText = null;
    this.animationFrame = null;
  }

  static get observedAttributes() {
    return ['text'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'text' && oldValue !== newValue && this.ctx) {
      this.updateText(newValue);
    }
  }

  connectedCallback() {
    this.render();
    this.setupCanvas();
    this.startAnimation();
    
    // 初始化文本
    const text = this.getAttribute('text');
    if (text) {
      this.updateText(text);
    } else {
      // 如果没有设置text属性，则显示时间
      this.updateText(new Date().toTimeString().substring(0, 8));
      this.timeInterval = setInterval(() => {
        this.updateText(new Date().toTimeString().substring(0, 8));
      }, 1000);
    }
  }

  disconnectedCallback() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }
        canvas {
          width: 100%;
          height: 100%;
        }
      </style>
      <canvas></canvas>
    `;
  }

  setupCanvas() {
    this.canvas = this.shadowRoot.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d', {
      willReadFrequently: true,
    });
    
    // 设置canvas尺寸
    const rect = this.getBoundingClientRect();
    this.canvas.width = rect.width * devicePixelRatio;
    this.canvas.height = rect.height * devicePixelRatio;
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      const rect = this.getBoundingClientRect();
      this.canvas.width = rect.width * devicePixelRatio;
      this.canvas.height = rect.height * devicePixelRatio;
      if (this.currentText) {
        this.updateText(this.currentText);
      }
    });
  }

  getRandom(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  updateText(newText) {
    if (newText === this.currentText) return;
    
    this.clear();
    this.currentText = newText;
    
    // 画文本
    const { width, height } = this.canvas;
    this.ctx.fillStyle = '#000';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = `${Math.min(width, height) * 0.2}px 'DS-Digital', sans-serif`;
    this.ctx.fillText(newText, (width - this.ctx.measureText(newText).width) / 2, height / 2);
    
    const points = this.getPoints();
    this.clear();
    
    for (let i = 0; i < points.length; i++) {
      let p = this.particles[i];
      if (!p) {
        p = new Particle(this);
        this.particles.push(p);
      }
      const [x, y] = points[i];
      p.moveTo(x, y);
    }
    
    if (points.length < this.particles.length) {
      this.particles.splice(points.length);
    }
  }

  startAnimation() {
    const animate = () => {
      this.clear();
      this.particles.forEach(p => p.draw(this.ctx));
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  getPoints() {
    const { width, height, data } = this.ctx.getImageData(
      0, 0, this.canvas.width, this.canvas.height
    );
    const points = [];
    const gap = Math.max(2, Math.floor(width / 300) * devicePixelRatio);
    
    for (let i = 0; i < width; i += gap) {
      for (let j = 0; j < height; j += gap) {
        const index = (i + j * width) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];
        if (r === 0 && g === 0 && b === 0 && a === 255) {
          points.push([i, j]);
        }
      }
    }
    return points;
  }
}

class Particle {
  constructor(component) {
    this.component = component;
    const canvas = component.canvas;
    const r = Math.min(canvas.width, canvas.height) / 2;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const rad = (component.getRandom(0, 360) * Math.PI) / 180;
    this.x = cx + r * Math.cos(rad);
    this.y = cy + r * Math.sin(rad);
    this.size = component.getRandom(2 * devicePixelRatio, 7 * devicePixelRatio);
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = '#5445544d';
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  }

  moveTo(tx, ty) {
    const duration = 500; // 500ms的运动时间
    const sx = this.x, sy = this.y;
    const xSpeed = (tx - sx) / duration;
    const ySpeed = (ty - sy) / duration;
    const startTime = Date.now();
    
    const _move = () => {
      const t = Date.now() - startTime;
      const x = sx + xSpeed * t;
      const y = sy + ySpeed * t;
      this.x = x;
      this.y = y;
      if (t >= duration) {
        this.x = tx;
        this.y = ty;
        return;
      }
      requestAnimationFrame(_move);
    };
    _move();
  }
}

customElements.define('particle-text', ParticleText);