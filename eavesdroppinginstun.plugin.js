/**
 * @name Eavesdropping in stun
 * @author ErkinKraft
 * @description allows you to hear in stun mode
 * @version 0.0.1
 */

module.exports = class MyPlugin {
  constructor(meta) {
    // Do stuff in here before starting
  }
  

  
  
  
  
  
  
  start() {
	  BdApi.UI.alert("Successfully!", "Restart the plugin if the button does not appear on the main screen");
    // Do stuff when enabled
	BdApi.UI.showNotice(
    "Everything is ready to eavesdrop!",
    {
        type: "error",
        buttons: [
            {
                label: "Eavesdropping!",
                onClick: () => {
                    this.fakemute()
                    BdApi.UI.showToast("Подслушка активирована!", {type: "success"});
}
                
                 
            }
        ]
    }
);
	
  }

  stop() {
    // Cleanup when disabled
  }
  
  
  fakemute(){
      var text = new TextDecoder("utf-8");

      WebSocket.prototype.original = WebSocket.prototype.send;
      WebSocket.prototype.send = function(data) {
        if (Object.prototype.toString.call(data) === "[object ArrayBuffer]") {
            if (text.decode(data).includes("self_deaf")) {
                console.log("found mute/deafen");
                data = data.replace('"self_mute":false', 'NiceOneDiscord');
                console.log("Craeted by ErkinKraft");
        }
    }
        WebSocket.prototype.original.apply(this, [data]);
  };
  }
  
  
  unfakemute(){
      var text = new TextDecoder("utf-8");

      WebSocket.prototype.original = WebSocket.prototype.send;
      WebSocket.prototype.send = function(data) {
        if (Object.prototype.toString.call(data) === "[object ArrayBuffer]") {
          if (text.decode(data).includes("self_deaf") || text.decode(data).includes("self_mute")) {
            console.log("found mute/deafen");
            data = data.replace('"self_mute":false', 'NiceOneDiscord');
            data = data.replace('"self_deaf":true', 'NiceOneDiscord');
            console.log("Changed back by ErkinKraft");
    }
  }
       WebSocket.prototype.original.apply(this, [data]);
};
  }
  
  

  
};