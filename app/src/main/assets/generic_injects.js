window.tv = (function (exports) {
  class KeyDebugger {
    dom = null;
    /**@private */
    domText = null;

    constructor() {

      this.dom = this.createDom();
      this.addEventListener();
      this.dom.style.display = 'none';
    }

    /**
     * @private
     */
    createDom() {
      let div = document.createElement("div");

      let _style = {
        backgroundColor: 'rgba(255, 149, 0, 0.5)',
        borderRadius: '8px',
        border: '2px solid #afafaf',
        position: 'fixed',
        top: '50px',
        right: '10px',
        zIndex: '99999',
        padding: '8px'
      }
      let style = div.style;
      style = Object.assign(style, _style)

      let p = document.createElement("p")
      div.appendChild(p);
      let _style2 = {
        color: 'white',
        fontSize: '16px',
        padding: '0',
        margin: '0'

      }
      Object.assign(p.style, _style2);
      p.innerText = "";
      this.domText = p;

      return div;
    }

    addEventListener() {
      let self = this;
      /**
     * @param {PointerEvent} e 
     */
      function tvClickListener(e) {
        // console.log(`click: pointerType: ${e.pointerType}`);
        self.setKey('单击');
      }
      /**
       * @param {MouseEvent} e 
       */
      function tvDoubleClickListener(e) {
        // console.log(`double click: type:${e.type}, buttons:${e.buttons}`);
        self.setKey('双击');
      }

      /**
       * 
       * @param {KeyboardEvent} e 
       */
      function tvKeyPressListener(e) {
        // console.log(`keypress key:${e.key} code:${e.code}`)
        self.setKey(`键 ${e.code} ${e.keyCode}`);
      }

      let eventWrapper = new EventWrapper(document);
      eventWrapper.onclick = tvClickListener;
      eventWrapper.ondblclick = tvDoubleClickListener;
      eventWrapper.onkeypress = tvKeyPressListener;
    }

    /**
     * @param {string} key
     */
    setKey(key) {
      clearTimeout(this.hideId);
      clearTimeout(this.showId);

      this.dom.style.opacity = 0.6;
      this.showId = setTimeout(() => {
        this.dom.style.opacity = 1;
        this.dom.style.display = "block";
        this.domText.innerText = key;
      }, 50)

      this.hideId = setTimeout(() => {
        this.dom.style.display = "none";
      }, 2000);
    }
    hideId = null;
    showId = null;
  }

  class EventWrapper {
    /** @type {Element} */
    dom = null;

    /**
     * @param {Element} dom 
     */
    constructor(dom) {
      this.dom = dom;

      dom.addEventListener('click', (e) => {
        clearTimeout(this.clickTimer);
        this.clickTimer = setTimeout(this.onclick, 200, e);
      })
      dom.addEventListener('dblclick', (e) => {
        clearTimeout(this.clickTimer);
        this.ondblclick && this.ondblclick(e);
      })
      dom.addEventListener('keypress', (e) => {
        this.onkeypress && this.onkeypress(e);
      })
    }

    onclick;
    ondblclick;
    onkeypress;

  }

  exports.KeyDebugger = KeyDebugger;
  exports.EventWrapper = EventWrapper;
  return exports;
})(window.tv || {})

window.globalState = window.globalState || {
  /** 是否已经初始化 */
  isInitialized: false,
  /** 是否进入全屏 */
  isFullScreen: false,
  /** 当前视频元素 */
  currentVideoEle: null
}

globalState.currentVideoEle = null

if (!globalState.isInitialized) {
  console.log("js inject");

  globalState.isInitialized = true;

  let keyDebugger = new tv.KeyDebugger();
  document.body.appendChild(keyDebugger.dom);


  Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
    get: function () {
      return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
    }
  })

  /**
   * @param {PointerEvent} e 
   */
  function tvClickListener(e) {
    console.log(`click: pointerType: ${e.pointerType}`)

    if (e.target.tagName.toUpperCase() == "A" && e.target.attributes.href.value.toLowerCase().startsWith("blob:")) {
      var fileName = e.target.download;
      var url = e.target.attributes.href.value;
      var xhr = new XMLHttpRequest();
      xhr.open('GET', e.target.attributes.href.value, true);
      xhr.responseType = 'blob';
      xhr.onload = function (e) {
        if (this.status == 200) {
          var blob = this.response;
          var reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = function () {
            base64data = reader.result;
            TVBro.takeBlobDownloadData(base64data, fileName, url, blob.type);
          }
        }
      };
      xhr.send();
      e.stopPropagation();
      e.preventDefault();
    }
  }
  /**
   * @param {MouseEvent} e 
   */
  function tvDoubleClickListener(e) {
    console.log(`double click: tag: ${e.target.tagName}`)

    let tagName = e.target.tagName.toLowerCase();
    if (tagName == "video") {
      if (!globalState.isFullScreen) {
        globalState.isFullScreen = true;
        e.target.requestFullscreen()
      }
      else {
        tvBroTogglePlayback()
      }
    }

  }

  /**
   * 
   * @param {KeyboardEvent} e 
   */
  function tvKeyPressListener(e) {
    console.log(`keypress: key:${e.key}, code:${e.code}`)
  }

  let evtWrapper = new tv.EventWrapper(document);
  evtWrapper.onclick = tvClickListener;
  evtWrapper.ondblclick = tvDoubleClickListener;
  evtWrapper.onkeypress = tvKeyPressListener;

  document.addEventListener("fullscreenchange", function (event) {

    let isFullScreen = !!document.fullscreenElement;
    console.log("fullScreenChange", isFullScreen)

    globalState.isFullScreen = isFullScreen;
    TVBro.onFullscreenChanged(isFullScreen);
  });

}



window.tvBroTogglePlayback = function () {
  var video = document.querySelector('video');
  var audio = document.querySelector('audio');
  if (video) {
    if (video.playing) {
      video.pause();
    } else {
      video.play();
    }
  } else if (audio) {
    if (audio.playing) {
      audio.pause();
    } else {
      audio.play();
    }
  }
}