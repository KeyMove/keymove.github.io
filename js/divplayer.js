var DragDiv = (function () {
    var instance;
    var DragList;
    var MaxRect;

    function init() {
        console.log("这段代码只会运行一次");
        DragList = [];
        MaxRect = null;
        let style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(`
    .rs-ct{
        --sc:1.0;
        box-shadow: 2px 2px 3px black;
        position: absolute;
        left: 50%;
        top: 50%;
        
        border-radius: 5px;
        overflow: hidden;
        background-color: transparent;
        border: 2px solid black;
        transform-origin: center center; /* 设置缩放的基点为中心 */
        transition: transform 0.3s; /* 添加缩放动画 */
        font-weight: bold;
        transform: scale(var(--sc));
        z-index: 999;
    }

    .rs-ct.scal{
        transform: scale(calc(var(--sc) + 0.05));
        box-shadow: 2px 2px 15px black;
    }
    .rs-ct.drag{
        border: 2px dashed #000;
    }
    .rs-rb{
        position: absolute;
        bottom: -7px;
        right: -7px;
        width: 20px;
        height: 20px; 
        cursor:nwse-resize;
        touch-action: none;
    }
    .rs-del{
        position: absolute;
        top: 5px;
        right: 8px;
        width: 12px;
        height: 12px; 
        background-color: red;
        border-radius: 50%;
    }
    .rs-mv{
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 25px;
        background-color: rgb(180, 180, 180);
        user-select: none;
        touch-action: none;
    }
    .rs-mv::after{
        content: var(--sn);
    }
    .rs-c{
        position: absolute;
        width: 100%;
        height: calc(100% - 25px);
        
    }`));
        document.head.appendChild(style);
        return {
            create: function (div, name, w, h, remove = false, resize = false, dragfull = false) {
                name = name ? name : "";
                w = w ? w : 200;
                h = h ? h : 200;
                let val = document.createElement("div");
                val.className = "rs-ct";
                const { left, top, width, height } = div.getBoundingClientRect();
                val.style.left = ((width - w) / 2) + 'px';
                val.style.top = ((height - h) / 2) + 'px';
                val.style.width = w + 'px';
                val.style.height = h + 'px';
                //val.style.contain=name;
                val.innerHTML = `
                <div class="rs-mv"></div>
                <div class="rs-c"></div>
                ${resize ? '<div class="rs-rb"></div>' : ""}
                ${remove ? '<div class="rs-del"></div>' : ""}`;
                let item = val;
                let dragitem = val.children[0];
                val.titlediv = dragitem;
                let dragrs = resize ? val.children[2] : null;
                let rssize = resize ? dragrs.getBoundingClientRect() : null;
                let removebt = remove ? (resize ? val.children[3] : val.children[2]) : null;
                if (removebt) {
                    removebt.onclick = (e) => {
                        //calls(closecalls,e.target.parentNode);
                        val.ondivclose(e);
                        e.target.parentNode.remove();
                    };
                }
                dragitem.style.setProperty('--sn', `"${name}"`);
                //val.onresize=()=>{};
                val.ondivresize = () => { };
                val.ondivclose = () => { };
                val.onstartdrag = () => { };
                val.onenddrag = () => { };

                if (MaxRect == null) {
                    const r = div.getBoundingClientRect();
                    MaxRect = [r.left, r.top, r.left + r.width, r.top + r.height]
                    console.log(MaxRect);
                }
                

                let userdown = e => {
                    //dragitem.onpointerdown=e=>{//只能拖动标题
                    //val.onpointerdown=e=>{//能拖动全局

                    //val.classList.toggle('scal');
                    const r = div.getBoundingClientRect();
                    MaxRect = [r.left, r.top, r.left + r.width, r.top + r.height];
                    let tag = item;

                    val.onstartdrag(e);
                    const { left, top, width, height } = tag.getBoundingClientRect();
                    //console.log(tag)
                    //console.log(e)
                    if (DragList.indexOf(item) == -1)
                        DragList.length = 0;
                    DragList.push(item);
                    DragList.forEach(xc => {
                        const rx = xc.getBoundingClientRect();
                        xc._offx = xc.offsetLeft - rx.left;
                        xc._offy = xc.offsetTop - rx.top;
                        xc._left = rx.left - e.pageX;
                        xc._top = rx.top - e.pageY;
                        xc._width = rx.width;
                        xc._height = rx.height;
                    });
                    //console.log(`x:${tag._left} y:${tag._top}`)
                    document.onpointermove = m => {
                        //dragmove(m.pageX,m.pageY)

                        let sx = m.pageX;
                        let sy = m.pageY;
                        //console.log(`x:${sx} y:${sy}`);
                        DragList.forEach(x => {
                            if (x._top != null) {
                                let lx = sx + x._left + x._offx;
                                let ly = sy + x._top + x._offy;
                                if (lx < MaxRect[0])
                                    lx = MaxRect[0];
                                if (ly < MaxRect[1])
                                    ly = MaxRect[1];
                                if (lx + x._width > MaxRect[2])
                                    lx = MaxRect[2] - x._width;
                                if (ly + x._height > MaxRect[3])
                                    ly = MaxRect[3] - x._height;
                                x.style.left = `${lx - MaxRect[0]}px`;
                                x.style.top = `${ly - MaxRect[1]}px`;
                            }
                        });
                    }
                    document.onpointerup = m => {
                        val.onenddrag(m);
                        document.onpointermove = () => { }
                        document.onpointerup = () => { }
                    }
                };

                val.onpointerdown = (e) => {
                    let mdiv = val;
                    if (mdiv.topmost) {
                        if (mdiv.parentNode.lastChild != mdiv)
                            mdiv.parentNode.appendChild(mdiv);
                    }
                    if (dragfull) {
                        if(dragrs){
                            let r=dragrs.getBoundingClientRect();;
                            let x=e.pageX;
                            let y=e.pageY;
                            if (x >= r.left && x <= r.left + r.width && y >= r.top && y <= r.top + r.height)return;
                        }
                        userdown(e)
                    }
                };
                dragitem.onpointerdown = (e) => { if (!dragfull) userdown(e) };

                if (dragrs) {
                    let type = 15;
                    dragrs.onpointerdown = e => {
                        const r1 = item.getBoundingClientRect();
                        const r2 = item;
                        const r3 = MaxRect;
                        //console.log(r1)
                        //console.log(r2)
                        let x = e.pageX - r3[0] - (type & 1 ? r1.width : -r1.width) - (type & 1 ? (e.pageX - r1.width - r1.left) : (e.pageX - r1.left));
                        let y = e.pageY - r3[1] - (type & 2 ? r1.height : -r1.height) - (type & 2 ? (e.pageY - r1.height - r1.top) : (e.pageY - r1.top));

                        let sw = (type & 1 ? r1.width : -r1.width);
                        let sh = (type & 2 ? r1.height : -r1.height);
                        let bx = e.pageX;
                        let by = e.pageY;
                        //console.log(`[${e.pageX-r1.left},${e.pageY-r1.top}},${e.pageX},${e.pageY}]x:${x} y:${y} w:${sw} h:${sh} t:${type}`);
                        document.onpointermove = m => {
                            let w = m.pageX - bx;
                            let h = m.pageY - by;
                            let r = { w: w, h: h };
                            if (type & 0x04) {

                                if (w + sw < 0) {
                                    //x=x+w+sw;
                                    //w=-w-sw-2;
                                    r2.style.left = `${x + w + sw}px`;
                                    r2.style.width = `${-w - sw - 2}px`;
                                    r.w = -w - sw;
                                    console.log(`{X:${x + w + sw} W:${-w - sw - 2}}`);
                                }
                                else {
                                    if (x + w + sw < MaxRect[2]) {
                                        r2.style.left = `${x}px`;
                                        r2.style.width = `${w + sw}px`;
                                        r.w = w + sw;
                                    }
                                    //console.log(2)
                                }
                            }
                            if (type & 0x08) {
                                if (h + sh < 0) {
                                    r2.style.top = `${y + h + sh}px`;
                                    r2.style.height = `${-h - sh - 2}px`;
                                    //console.log(3)
                                    r.h = -h - sh;
                                }
                                else {
                                    if (y + h + sh < MaxRect[3]) {
                                        if (y < 0) y = 0;
                                        r2.style.top = `${y}px`;
                                        r2.style.height = `${h + sh}px`;
                                        resize = true;
                                        r.h = h + sh;
                                    }
                                    //console.log(4)
                                }
                            }
                            if (r.w > 0 && r.h > 0) val.ondivresize(r);
                            //    val.onresize(r);
                        }
                        document.onpointerup = m => {
                            document.onpointermove = () => { }
                            document.onpointerup = () => { }
                        }
                    };
                }
                val.topmost = true;
                div.appendChild(val);
                val.panel = val.children[1];
                val.show = (sty) => {
                    if (sty) val.style.cssText = sty;
                    val.style.display = 'block';
                }
                val.hide = () => {
                    val.style.display = 'none';
                    return val.style.cssText;
                }
                val.close = () => {
                    if (val.removebt)
                        val.removebt.click();
                    else
                        val.parentNode.remove();
                }

                val.isRect = (srcdiv) => {
                    const rect1 = srcdiv.getBoundingClientRect();
                    const rect2 = val.getBoundingClientRect();
                    const maxX = Math.max(rect1.left + rect1.width, rect2.left + rect2.width);
                    const maxY = Math.max(rect1.top + rect1.height, rect2.top + rect2.height);
                    const minX = Math.min(rect1.left, rect2.left);
                    const minY = Math.min(rect1.top, rect2.top);
                    if (maxX - minX <= rect1.width + rect2.width && maxY - minY <= rect1.height + rect2.height) {
                        return true;
                    } else {
                        return false;
                    }
                }
                val.isRectPoint = (x, y) => {
                    const r = val.getBoundingClientRect();
                    if (x >= r.left && x <= r.left + r.width && y >= r.top && y <= r.top + r.height) {
                        return true;
                    } else {
                        return false;
                    }
                }
                val.sendtop = () => {
                    let mdiv = val;
                    if (mdiv.parentNode.lastChild != mdiv)
                        mdiv.parentNode.appendChild(mdiv);

                };
                val.addselect = (div) => {
                    DragList.push(div);
                };
                val.clearselect = () => {
                    DragList = [];
                };
                return val;
            },
        };
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    };
})().getInstance();

class AssPlayer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.textlist = [];
        this.mw = 1920;
        this.mh = 1080;
        this.time = 0;
        this.isPlay = false;
        this.fontsize = 52;
        this.font = '52px Arial'
        this.timer = setInterval(() => {
            if (this.isPlay) {
                this.drawImage();
                this.time += 33;
            }
        }, 33);
    }

    decode(text) {
        const input = text;
        const lines = input.split('\n');
        let subtitles = [];
        function time2ms(time) {
            const t = time.split(':');
            const ms = t[2].split('.');
            return t[0] * 3600000 + t[1] * 60000 + ms[0] * 1000 + ms[1] * 10;
        }
        lines.forEach(line => {
            if (line.startsWith('Dialogue:')) {
                const parts = line.split(',');
                let currentSubtitle = {};
                currentSubtitle.start = time2ms(parts[1]);
                currentSubtitle.end = time2ms(parts[2]);
                let text = parts.slice(9).join(',').trim();

                currentSubtitle.text = text.substring(text.lastIndexOf('}') + 1);
                let sp = text.split('\\');
                let mode = sp[1];
                let color = sp[2].split('}')[0].substring(3, 9);
                let args = mode.substring(mode.indexOf('(') + 1).replace(')', '').split(',');
                currentSubtitle.color = '#' + color.toLowerCase();
                currentSubtitle.mode = args.length > 2;
                currentSubtitle.args = args;
                subtitles.push(currentSubtitle);
            }
            else if (line.startsWith('PlayResX:')) {
                this.mw = line.split(':')[1].trim() | 0;
            }
            else if (line.startsWith('PlayResY:')) {
                this.mh = line.split(':')[1].trim() | 0;
            }
        });
        this.textlist = subtitles;
    }

    Play(assdata) {
        this.decode(assdata);
        this.time = 0;
        this.isPlay = true;
    }

    drawImage() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const scalx = this.canvas.width / this.mw;
        const scaly = this.canvas.height / this.mh;
        this.font = `${(this.fontsize*scaly)|0}px Arial`
        for (let i = 0; i < this.textlist.length; i++) {
            let e = this.textlist[i];
            if (!e.textwidth) {
                this.ctx.font = this.font;
                const rect = this.ctx.measureText(e.text);
                e.textwidth = rect.width;
                e.textheight = this.fontsize;
            }
            if (this.time >= e.start && this.time <= e.end) {
                this.ctx.font = this.font;
                this.ctx.fillStyle = e.color;
                let x = 0;
                let y = e.args[1] | 0;
                if (e.mode) {
                    let r = e.end - e.start;
                    let rp = (this.time - e.start) / r;
                    let err = (e.args[2] - e.args[0]);
                    x = ((e.args[0] | 0) + err * rp) * scalx - e.textwidth / 2;
                }
                else {
                    x = (e.args[0] | 0) * scalx - e.textwidth / 2;
                }

                this.ctx.fillText(e.text, x, y * scaly + e.textheight / 2);
            }
        }
    }
}

var createAssPlayer = (id) => {
    let target = id;
    if (typeof value === 'string') target = document.getElementById(id);

    const rect = target.getBoundingClientRect();

    const div = document.createElement('div');
    const canvas = document.createElement('canvas');
    canvas.width = rect.width;
    canvas.height = rect.height;
    div.append(canvas);
    let ass = new AssPlayer(canvas);

    target.append(div);
    return ass;
}

ass=DragDiv.create((()=>{
    const div = document.createElement('div');
    div.style.cssText=`position: absolute;width: 100%;height: 100%;`;
    const body = document.body;
    while (body.firstChild) {
        div.appendChild(body.firstChild);
    }
    body.appendChild(div);
    return div;
})(),'字幕',800,600,true,true,true);
handle=createAssPlayer(ass.panel);
ass.titlediv.innerHTML=`<input oninput="handle.time=(this.value|0)" type="text" style='width: 50px;position: absolute;left:10px;'>`
ass.ondivresize=(r)=>{handle.canvas.width=r.w;handle.canvas.height=r.h;}
ass.style.top='100px';
let imgfile=async function(file) {
    if (!file) return;
    let extension = file.name.split('.').pop().toLowerCase();
    let reader = new FileReader();
    reader.onload = function(e) {
        if (extension === 'ass') {
            let lastfile=e.target.result;
            handle.Play(lastfile);
        }
    };
    if (extension === 'ass') {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

document.addEventListener('dragover', function(e) {
    e.preventDefault();
});

document.addEventListener('paste', function(e) {
    const items = e.clipboardData.items;
    if (!items || items.length === 0) return;
    const item = items[0];
    if (item.kind === 'file') {
        e.preventDefault();
        const file = item.getAsFile();
        imgfile(file);
    }
});

document.addEventListener('drop', function(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    imgfile(file);
});