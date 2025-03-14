class ParticleClock extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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
          display: block;
        }
      </style>
      <canvas></canvas>
    `;
    
    this.canvas = this.shadowRoot.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d', {
      willReadFrequently: true,
    });
    
    this.partciles = [];
    this.text = null;
    
    // 绑定方法到实例
    this.initCanvasSize = this.initCanvasSize.bind(this);
    this.draw = this.draw.bind(this);
    
    this.initCanvasSize();
    this.draw();
  }
  
  connectedCallback() {
    window.addEventListener('resize', this.initCanvasSize.bind(this));
  }
  
  disconnectedCallback() {
    window.removeEventListener('resize', this.initCanvasSize.bind(this));
  }

  initCanvasSize() {
    this.canvas.width = window.innerWidth * devicePixelRatio;
    this.canvas.height = window.innerHeight * devicePixelRatio;
  }

  /**
   * 获取 [min, max] 范围内的随机整数
   */
  getRandom(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getText() {
    return new Date().toTimeString().substring(0, 8);
  }

  getPoints() {
    const { width, height, data } = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    const points = [];
    const gap = 6;
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

  update() {
    const newText = this.getText();
    if (newText === this.text) {
      return;
    }
    this.clear();
    this.text = newText;
    // 画文本
    const { width, height } = this.canvas;
    this.ctx.fillStyle = '#000';
    this.ctx.textBaseline = 'middle';
    // 使用通用字体，不依赖特殊字体
    this.ctx.font = `${140 * devicePixelRatio}px monospace`;
    this.ctx.fillText(this.text, (width - this.ctx.measureText(this.text).width) / 2, height / 2);
    const points = this.getPoints();
    this.clear();
    for (let i = 0; i < points.length; i++) {
      let p = this.partciles[i];
      if (!p) {
        p = new Particle(this.canvas, this.getRandom.bind(this));
        this.partciles.push(p);
      }
      const [x, y] = points[i];
      p.moveTo(x, y);
    }
    if (points.length < this.partciles.length) {
      this.partciles.splice(points.length);
    }
  }

  draw() {
    this.clear();
    this.update();
    this.partciles.forEach((p) => p.draw());
    requestAnimationFrame(this.draw.bind(this));
  }
}

class Particle {
  constructor(canvas, getRandomFn) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });
    this.getRandom = getRandomFn; // 使用传入的随机函数
    
    const r = Math.min(canvas.width, canvas.height) / 2;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const rad = (this.getRandom(0, 360) * Math.PI) / 180;
    this.x = cx + r * Math.cos(rad);
    this.y = cy + r * Math.sin(rad);
    this.size = this.getRandom(2 * devicePixelRatio, 7 * devicePixelRatio);
  }

  // 移除 getRandom 方法，使用传入的函数

  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = '#5445544d';
    this.ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  moveTo(tx, ty) {
    const duration = 500; // 500ms的运动时间
    const sx = this.x,
      sy = this.y;
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
      // x，y改动一点
      requestAnimationFrame(_move);
    };
    _move();
  }
}

// 注册自定义元素
customElements.define('particle-clock', ParticleClock);