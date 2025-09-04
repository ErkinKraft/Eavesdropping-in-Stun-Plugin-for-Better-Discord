/**
 * @name Eavesdropping in stun
 * @author ErkinKraft
 * @description allows you to hear in stun mode
 * @version 1.0.0
 */

module.exports = class EavesdroppingPlugin {
  constructor(meta) {
    this.meta = meta;
    this.isActive = false;
    this.originalWebSocketSend = null;
    this.callButton = null;
    this.statusIndicator = null;
  }

  start() {
    BdApi.UI.alert("Successfully!", "Restart the plugin if the button does not appear on the main screen");
    
 
    this.createCallButton();
    

    this.createStatusIndicator();
    

    BdApi.UI.showNotice(
      "Everything is ready to eavesdrop!",
      {
        type: "info",
        buttons: [
          {
            label: "Activate Eavesdropping!",
            onClick: () => {
              this.toggleEavesdropping();
            }
          }
        ]
      }
    );
  }

  stop() {

    if (this.isActive) {
      this.disableEavesdropping();
    }
    

    if (this.callButton) {
      this.callButton.remove();
    }
    if (this.statusIndicator) {
      this.statusIndicator.remove();
    }
  }

  createCallButton() {

    const observer = new MutationObserver(() => {
      const callControls = document.querySelector('[class*="callControls"]') || 
                          document.querySelector('[class*="call-controls"]') ||
                          document.querySelector('[class*="callControlsContainer"]');
      
      if (callControls && !this.callButton) {
        this.callButton = document.createElement('button');
        this.callButton.className = 'eavesdropping-button';
        this.callButton.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4V6.24C15.83 7.16 17 8.98 17 11V16L21 20H3L7 16V11C7 8.98 8.17 7.16 10 6.24V4C10 2.9 10.9 2 12 2M12 20C13.1 20 14 19.1 14 18H10C10 19.1 10.9 20 12 20Z"/>
          </svg>
          <span>Подслушка</span>
        `;
        
        this.callButton.style.cssText = `
          background: ${this.isActive ? '#43b581' : '#f04747'};
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          margin: 0 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
        `;
        
        this.callButton.addEventListener('click', () => {
          this.toggleEavesdropping();
        });
        

        callControls.appendChild(this.callButton);
        

        observer.disconnect();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }

  createStatusIndicator() {

    this.statusIndicator = document.createElement('div');
    this.statusIndicator.className = 'eavesdropping-status';
    this.statusIndicator.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div class="status-dot" style="
          width: 8px; 
          height: 8px; 
          border-radius: 50%; 
          background: ${this.isActive ? '#43b581' : '#f04747'};
          transition: background 0.2s ease;
        "></div>
        <span style="color: ${this.isActive ? '#43b581' : '#f04747'}; font-size: 12px; font-weight: 500;">
          Подслушка: ${this.isActive ? 'АКТИВНА' : 'НЕАКТИВНА'}
        </span>
      </div>
    `;
    
    this.statusIndicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      z-index: 9999;
      font-family: 'Discord Font', sans-serif;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    document.body.appendChild(this.statusIndicator);
  }

  updateUI() {
    if (this.callButton) {
      this.callButton.style.background = this.isActive ? '#43b581' : '#f04747';
      this.callButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C13.1 2 14 2.9 14 4V6.24C15.83 7.16 17 8.98 17 11V16L21 20H3L7 16V11C7 8.98 8.17 7.16 10 6.24V4C10 2.9 10.9 2 12 2M12 20C13.1 20 14 19.1 14 18H10C10 19.1 10.9 20 12 20Z"/>
        </svg>
        <span>${this.isActive ? 'Отключить' : 'Подслушка'}</span>
      `;
    }
    
    if (this.statusIndicator) {
      const statusDot = this.statusIndicator.querySelector('.status-dot');
      const statusText = this.statusIndicator.querySelector('span');
      
      if (statusDot) {
        statusDot.style.background = this.isActive ? '#43b581' : '#f04747';
      }
      
      if (statusText) {
        statusText.style.color = this.isActive ? '#43b581' : '#f04747';
        statusText.textContent = `Подслушка: ${this.isActive ? 'АКТИВНА' : 'НЕАКТИВНА'}`;
      }
    }
  }

  toggleEavesdropping() {
    if (this.isActive) {
      this.disableEavesdropping();
    } else {
      this.enableEavesdropping();
    }
  }

  enableEavesdropping() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.originalWebSocketSend = WebSocket.prototype.send;
    
    WebSocket.prototype.send = (data) => {
      if (Object.prototype.toString.call(data) === "[object ArrayBuffer]") {
        const text = new TextDecoder("utf-8");
        const decodedData = text.decode(data);
        
        if (decodedData.includes("self_deaf") || decodedData.includes("self_mute")) {
          console.log("[Eavesdropping] Found mute/deafen packet");
          
      
          let modifiedData = decodedData;
          modifiedData = modifiedData.replace('"self_mute":true', '"self_mute":false');
          modifiedData = modifiedData.replace('"self_deaf":true', '"self_deaf":false');
          
     
          const encoder = new TextEncoder();
          const modifiedArrayBuffer = encoder.encode(modifiedData).buffer;
          
          console.log("[Eavesdropping] Modified packet by ErkinKraft");
          
  
          this.originalWebSocketSend.call(this, modifiedArrayBuffer);
          return;
        }
      }
      
   
      this.originalWebSocketSend.call(this, data);
    };
    
    this.updateUI();
    BdApi.UI.showToast("Подслушка активирована!", { type: "success" });
    console.log("[Eavesdropping] Function activated successfully");
  }

  disableEavesdropping() {
    if (!this.isActive) return;
    
    this.isActive = false;
    

    if (this.originalWebSocketSend) {
      WebSocket.prototype.send = this.originalWebSocketSend;
      this.originalWebSocketSend = null;
    }
    
    this.updateUI();
    BdApi.UI.showToast("Подслушка отключена!", { type: "info" });
    console.log("[Eavesdropping] Function deactivated successfully");
  }


  forceDisable() {
    this.disableEavesdropping();
  }
};
