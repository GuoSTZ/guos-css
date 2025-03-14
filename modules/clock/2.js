class Clock2 extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.totalRotation = 0;
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

  // 添加电池状态相关方法
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
        styles += 'background: rgba(255, 255, 255, 0.9);';
        styles += 'height: 6px';
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

  // 在 render 方法中更新 battery-icon 相关样式
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
          background: rgba(200, 200, 200, 0.2);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border-radius: 50%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        
        .time-display {
          font-size: 80px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
          font-family: 'Helvetica Neue', Arial, sans-serif;
          letter-spacing: 2px;
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
          }
          50% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
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
          color: rgba(255, 255, 255, 0.4);
          font-size: 16px;
          font-weight: 500;
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
          color: rgba(255, 255, 255, 0.4);
          font-size: 16px;
          font-weight: 500;
        }

        .hour-mark-label {
          position: absolute;
          top: 32px; 
          width: 1px;
          height: 4px;
          background: rgba(255, 255, 255, 0.4);
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
          color: rgba(255, 255, 255, 0.2);
          font-size: 12px;
        }
        
        .minute-label {
          position: absolute;
          top: 55px;
          font-size: 8px;
          color: rgba(255, 255, 255, 0.4);
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
          color: rgba(255, 255, 255, 0.4);
          font-size: 16px;
          font-weight: 500;
        }

        .minute-mark-label {
          position: absolute;
          top: 70px; 
          width: 1px;
          height: 2px;
          background: rgba(255, 255, 255, 0.4);
        }
        
        .alarm-icon {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          left: 30%;
          top: 50%;
        }
        
        .battery-icon {
          position: absolute;
          width: 30px;
          height: 15px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 3px;
          right: 30%;
          top: 50%;
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
          background: rgba(255, 255, 255, 0.4);
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
          background: rgba(255, 255, 255, 0.4);
          right: -4px;
          top: 3px;
          border-radius: 0 2px 2px 0;
        }
      </style>
      
      <div class="clock-container">
        <div class="clock-face">
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

customElements.define('clock-2', Clock2);