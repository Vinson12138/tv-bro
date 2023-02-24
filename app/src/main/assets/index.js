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
            console.log(`click: pointerType: ${e.pointerType}`, e);
            self.setKey('单击');
        }
        /**
         * @param {MouseEvent} e 
         */
        function tvDoubleClickListener(e) {
            console.log(`double click: type:${e.type}, buttons:${e.buttons}`, e);
            self.setKey('双击');
        }

        /**
         * 
         * @param {KeyboardEvent} e 
         */
        function tvKeyPressListener(e) {
            console.log(`keypress key:${e.key} code:${e.code}`, e)
            self.setKey(`键 ${e.code}`);
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
let keyDebugger = new KeyDebugger();
document.body.appendChild(keyDebugger.dom);
