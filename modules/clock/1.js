class Clock1 extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.totalRotation = 0; // 添加总旋转角度追踪
    this.batteryLevel = null; // 添加电池电量状态
    this.isCharging = false; // 添加充电状态
  }

  connectedCallback() {
    this.render();
    this.startClock();
    this.getBatteryStatus(); // 获取电池状态
  }

  disconnectedCallback() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // 更新时间显示
    const timeDisplayHour = this.shadowRoot.querySelector('.time-display-hour');
    const timeDisplayMinute = this.shadowRoot.querySelector('.time-display-minute');
    const minuteNumbers = this.shadowRoot.querySelector('.minute-numbers');
    const minuteLabels = this.shadowRoot.querySelectorAll('.minute-label');

    if (timeDisplayHour) {
      timeDisplayHour.textContent = `${hours.toString().padStart(2, '0')}`;
    }
    if (timeDisplayMinute) {
      timeDisplayMinute.textContent = `${minutes.toString().padStart(2, '0')}`;
    }
    if (minuteNumbers) {
      // 计算新的旋转角度
      const currentSecond = seconds * 6;
      if (currentSecond < this.totalRotation % 360) {
        // 当秒针回到起点时，增加一圈
        this.totalRotation += (360 - (this.totalRotation % 360)) + currentSecond;
      } else {
        this.totalRotation = Math.floor(this.totalRotation / 360) * 360 + currentSecond;
      }
      minuteNumbers.style.transform = `rotate(${this.totalRotation}deg)`;
      minuteLabels.forEach((label, index) => {
        label.style.transform = `rotate(-${this.totalRotation % 360 + index * 30}deg)`;
      });
    }
  }

  startClock() {
    // 立即更新一次时间
    this.updateTime();

    // 使用setInterval每秒更新一次
    this.timerInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  generateHourNumber() {
    let numbers = '';
    for (let i = 1; i <= 12; i++) {
      const angle = (i * 30); // 每小时30度，从12点开始

      numbers += `
        <div class="hour-number" style="transform: rotate(${angle}deg)">
          <span style="position: absolute; top: 10px; transform: rotate(${-angle}deg)">${i}</span>
        </div>
      `;
    }
    return numbers;
  }

  generateHourMark() {
    let marks = '';
    for (let i = 1; i <= 60; i++) {
      const angle = (i * 6);

      let styles = '';
      if (angle % 30 === 0) {
        styles += 'background: rgba(61, 180, 255, 0.9);';
        styles += 'height: 6px; box-shadow: 0 0 5px rgba(61, 180, 255, 1);';
      }

      marks += `
        <div class="hour-mark" style="transform: rotate(${angle}deg)">
          <span class="hour-mark-label" style="${styles}"></span>
        </div>
      `;
    }
    return marks;
  }

  generateMinuteNumber() {
    let numbers = '';
    for (let i = 0; i < 60; i += 5) {
      const angle = i * 6; // 每分钟6度

      numbers += `
        <div class="minute-number" style="transform: rotate(${angle}deg)">
          <span class="minute-label" style="">${(60 - i) % 60}</span>
        </div>
      `;
    }
    return numbers;
  }

  generateMinuteMark() {
    let marks = '';
    for (let i = 1; i <= 60; i++) {
      const angle = (i * 6);

      let styles = '';
      if (angle % 30 === 0) {
        styles += 'background: rgba(255, 255, 255, 0.9);';
        styles += 'height: 4px';
      }

      marks += `
        <div class="minute-mark" style="transform: rotate(${angle}deg)">
          <span class="minute-mark-label" style="${styles}"></span>
        </div>
      `;
    }
    return marks;
  }

  // 添加获取电池状态的方法
  async getBatteryStatus() {
    try {
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();

        // 更新初始电量
        this.updateBatteryStatus(battery);

        // 监听电池状态变化
        battery.addEventListener('levelchange', () => {
          this.updateBatteryStatus(battery);
        });

        battery.addEventListener('chargingchange', () => {
          this.updateBatteryStatus(battery);
        });
      } else {
        console.log('Battery Status API 不可用');
      }
    } catch (error) {
      console.error('获取电池状态失败:', error);
    }
  }

  // 更新电池状态显示
  updateBatteryStatus(battery) {
    this.batteryLevel = battery.level;
    this.isCharging = battery.charging;

    const batteryIcon = this.shadowRoot.querySelector('.battery-icon');
    const batteryLevel = this.shadowRoot.querySelector('.battery-level');

    if (batteryIcon && batteryLevel) {
      // 更新电量显示
      batteryLevel.style.width = `${this.batteryLevel * 100}%`;

      // 更新充电状态
      if (this.isCharging) {
        batteryIcon.classList.add('charging');
      } else {
        batteryIcon.classList.remove('charging');
      }
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .clock-container {
          width: 300px;
          height: 300px;
          position: relative;
          margin: 0 auto;
        }
        
        .clock-face {
          width: 100%;
          height: 100%;
          background: rgba(10, 20, 35, 0.4);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border-radius: 50%;
          box-shadow: 
            0 10px 40px rgba(0, 0, 0, 0.3),
            inset 0 0 30px rgba(61, 180, 255, 0.2),
            0 0 15px rgba(61, 180, 255, 0.15);
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          border: none;
        }
        
        /* 添加双层边框效果 */
        .clock-face::after {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(61, 180, 255, 0.8) 0%, rgba(61, 180, 255, 0.1) 50%, rgba(61, 180, 255, 0) 100%);
          z-index: -1;
          opacity: 0.6;
          animation: rotate-border 10s linear infinite;
        }
        
        /* 添加旋转边框动画 */
        @keyframes rotate-border {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        /* 添加外部装饰环 */
        .clock-container::before {
          content: '';
          position: absolute;
          width: 110%;
          height: 110%;
          top: -5%;
          left: -5%;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            rgba(61, 180, 255, 0),
            rgba(61, 180, 255, 0.2),
            rgba(61, 180, 255, 0.4),
            rgba(61, 180, 255, 0.2),
            rgba(61, 180, 255, 0)
          );
          z-index: -1;
          animation: rotate-outer 20s linear infinite;
        }
        
        @keyframes rotate-outer {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(-360deg);
          }
        }
        
        /* 添加脉冲效果 */
        .clock-container::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          box-shadow: 0 0 30px rgba(61, 180, 255, 0.3);
          animation: pulse 4s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0% {
            opacity: 0.3;
            transform: scale(0.97);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.02);
          }
          100% {
            opacity: 0.3;
            transform: scale(0.97);
          }
        }
        
        .clock-container {
          width: 300px;
          height: 300px;
          position: relative;
          margin: 0 auto;
        }
        
        .clock-face::before {
          content: '';
          position: absolute;
          width: 110%;
          height: 110%;
          background: radial-gradient(circle at center, transparent 60%, rgba(61, 180, 255, 0.1) 100%);
          pointer-events: none;
        }
        
        .time-display {
          font-size: 80px;
          font-weight: 500;
          color: rgba(210, 230, 255, 0.9);
          text-shadow: 0 0 15px rgba(61, 180, 255, 0.8);
          font-family: 'Helvetica Neue', Arial, sans-serif;
          letter-spacing: 2px;
          position: relative;
          z-index: 2;
        }

        .time-display > div {
          height: 50px;
          line-height: 50px;
        }

        .time-display-minute {
          animation: breathe 3s ease-in-out infinite;
        }

        @keyframes breathe {
          0% {
            transform: scale(1);
            text-shadow: 0 0 15px rgba(61, 180, 255, 0.8);
          }
          50% {
            transform: scale(1.08);
            text-shadow: 0 0 20px rgba(61, 180, 255, 1);
          }
          100% {
            transform: scale(1);
            text-shadow: 0 0 15px rgba(61, 180, 255, 0.8);
          }
        }
        
        .hour-numbers {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        
        .hour-number {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          color: rgba(210, 230, 255, 0.7);
          font-size: 16px;
          font-weight: 500;
          text-shadow: 0 0 5px rgba(61, 180, 255, 0.5);
        }

        .hour-marks {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        
        .hour-mark {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
        }

        .hour-mark-label {
          position: absolute;
          top: 32px; 
          width: 1px;
          height: 4px;
          background: rgba(61, 180, 255, 0.4);
          box-shadow: 0 0 3px rgba(61, 180, 255, 0.8);
        }
        
        .minute-numbers {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .minute-number {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          color: rgba(210, 230, 255, 0.4);
          font-size: 12px;
        }
        
        .minute-label {
          position: absolute;
          top: 55px;
          font-size: 8px;
          color: rgba(210, 230, 255, 0.6);
          text-shadow: 0 0 3px rgba(61, 180, 255, 0.5);
        }

        .minute-marks {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          transition: transform 0.2s linear;
        }
        
        .minute-mark {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
        }

        .minute-mark-label {
          position: absolute;
          top: 70px; 
          width: 1px;
          height: 2px;
          background: rgba(61, 180, 255, 0.4);
          box-shadow: 0 0 2px rgba(61, 180, 255, 0.6);
        }
        
        .alarm-icon {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 1px solid rgba(61, 180, 255, 0.6);
          border-radius: 50%;
          left: 30%;
          top: 50%;
          box-shadow: 0 0 5px rgba(61, 180, 255, 0.4);
        }
        
        .battery-icon {
          position: absolute;
          width: 30px;
          height: 15px;
          border: 1px solid rgba(61, 180, 255, 0.6);
          border-radius: 3px;
          right: 30%;
          top: 50%;
          box-shadow: 0 0 5px rgba(61, 180, 255, 0.4);
        }

        .battery-icon::after {
          content: '';
          position: absolute;
          width: 3px;
          height: 8px;
          background: rgba(255, 255, 255, 0.4);
          right: -4px;
          top: 3px;
          border-radius: 0 2px 2px 0;
        }
        
        .battery-level {
          position: absolute;
          height: 100%;
          left: 0;
          top: 0;
          background: rgba(61, 180, 255, 0.6);
          transition: width 0.3s ease;
        }
        
        .battery-icon.charging .battery-level {
          background: rgba(0, 255, 128, 0.6);
          box-shadow: 0 0 8px rgba(0, 255, 128, 0.8);
          animation: charging-pulse 1.5s infinite;
        }
        
        @keyframes charging-pulse {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.6;
          }
        }
        
        .battery-icon::after {
          content: '';
          position: absolute;
          width: 3px;
          height: 8px;
          background: rgba(61, 180, 255, 0.6);
          right: -4px;
          top: 3px;
          border-radius: 0 2px 2px 0;
        }

         /* 添加装饰点样式 */
        .tech-dots {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .tech-dots::before, .tech-dots::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          background: rgba(61, 180, 255, 0.8);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(61, 180, 255, 1);
        }
        
        .tech-dots::before {
          top: 15%;
          left: 15%;
          animation: blink 2s infinite alternate;
        }
        
        .tech-dots::after {
          bottom: 15%;
          right: 15%;
          animation: blink 2s infinite alternate-reverse;
        }
        
        @keyframes blink {
          0% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        /* 添加扫描线效果 */
        .scan-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(to right, transparent, rgba(61, 180, 255, 0.5), transparent);
          top: 50%;
          animation: scan 3s linear infinite;
          opacity: 0.5;
        }
        
        @keyframes scan {
          0% {
            transform: translateY(-50px);
            opacity: 0;
          }
          20% {
            opacity: 0.5;
          }
          80% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(50px);
            opacity: 0;
          }
        }
        
        /* 添加圆形光晕 */
        .glow-circle {
          position: absolute;
          width: 90%;
          height: 90%;
          border-radius: 50%;
          border: 1px solid rgba(61, 180, 255, 0.2);
          box-shadow: 0 0 15px rgba(61, 180, 255, 0.1);
          pointer-events: none;
        }
      </style>
      
      <div class="clock-container">
        <div class="clock-face">
          <div class="scan-line"></div>
          <div class="glow-circle"></div>
          
          <!-- 添加装饰点 -->
          <div class="tech-dots"></div>
          
          <div class="hour-numbers">
            ${this.generateHourNumber()}
          </div>
          
          <div class="hour-marks">
            ${this.generateHourMark()}
          </div>
          <div class="minute-numbers">
            ${this.generateMinuteNumber()}
          </div>
          <div class="minute-marks">
            ${this.generateMinuteMark()}
          </div>
          <div class="time-display">
            <div class="time-display-hour">00</div>
            <div class="time-display-minute">00</div>
          </div>
          <div class="alarm-icon"></div>
          <div class="battery-icon">
            <div class="battery-level" style="width: 0%"></div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('clock-1', Clock1);

