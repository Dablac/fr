{//====CONSTRUCTORS====
function RelativeAge(date){
    this.delta = Math.abs(Date.now() - new Date(date)) / 1000;
    this.days = Math.floor(this.delta / 86400);
    this.delta -= this.days * 86400;
    this.hours = Math.floor(this.delta / 3600) % 24;
    this.delta -= this.hours * 3600;
    this.minutes = Math.floor(this.delta / 60) % 60;
    this.delta -= this.minutes * 60;
    this.seconds = this.delta % 60;
    this.read = function(){
        switch (true){
            case this.days > 365:
                let years = Math.floor(+this.days/365);
                return years+' year'+(years > 1 ? 's' : '')+', '+this.days%365+' day'+(this.days%365 > 1 ? 's' : '');
            case this.days > 7:
                return this.days+' day'+(this.days > 1 ? 's' : '');
            default:
                return this.days+' day'+(this.days > 1 ? 's' : '')+', '+this.hours+' hour'+(this.hours > 1 ? 's' : '')+'.';
        }
    };
}

function MouseTracker(attached, offset){
    this.x = null;
    this.y = null;
    this.handler = function(event){
        this.x = event.pageX;
        this.y = event.pageY;
        attached.style.left = (this.x + offset[0]) + 'px';
        attached.style.top = (this.y + offset[1])  + 'px';
    }.bind(this);
    window.addEventListener('mousemove', this.handler, false);
}

//LocalStorage pass by reference Object Constructor
function LocalStoreObject(_name, _nameSpace){
    this.nameSpace = !_nameSpace ? 'default' : _nameSpace;
    this.name = _name;
    this.save = function(){
        localStorage[this.nameSpace+'_'+this.name] = JSON.stringify(this);
    };
    this.load = function(){
        if (!!localStorage[this.nameSpace+'_'+this.name]){
            Object.assign(this, JSON.parse(localStorage[this.nameSpace+'_'+this.name]));
        }
    };
    this.load();
}

//Observer constructor for confirmed node additions with handler function
function AdditionObserver(target, _addHandler, _options){
    console.info('new %O(%O, %O, %O)', this, target, _addHandler, _options);
    this.handler = !_addHandler ? added => console.warn('%O was added but %O has no handler', added, this) : _addHandler;
    this.options = !_options ? {subtree: true, childList: true} : _options;
    this.obs = new MutationObserver(mutations => mutations.forEach(mutation => { if (!!mutation.addedNodes && mutation.addedNodes.length > 0){ if (mutation.addedNodes.length > 1) mutation.addedNodes.forEach(this.handler); else this.handler(mutation.addedNodes[0]); }}));
    this.obs.observe(target, this.options);
}

}//====CONSTRUCTORS====
{//====PROTOTYPES====
//find matching direct relative in either direction and return it
Node.prototype.relative = function nodeRelative(selector){
    let ancestor = this.closest(selector);
    if (!!ancestor) return ancestor; else{
        let descendant = this.querySelector(selector);
        if (!!descendant && descendant.contains(this)) return descendant; else return false;
    }
};

//relative based delegated event listener
EventTarget.prototype.addDelegatedListener = function eventTargetAddDelegatedListener(selector, eventType, handler, _bubble) {
    this.addEventListener(eventType, function(event) {
        if (event.target[handler.name+"Delegate"] !== 'false'){
            if (!event.target[handler.name+"Delegate"]){
                if (!!event.target){
                    if (event.target.matches(selector)){
                        event.target[handler.name+"Delegate"] = event.target;
                        return handler(event, event.target);
                    } else {
                        let relative = event.target.relative(selector);
                        event.target[handler.name+"Delegate"] = relative;
                        if (!!relative) return handler(event, relative);
                    }
                }
            } else return handler(event, event.target[handler.name+"Delegate"]);
        }
    }, !!_bubble ? _bubble : false);
};

//one-shot event listener
EventTarget.prototype.addEventTrigger = function eventTargetAddEventTrigger(type, handler, _bubble) {
    var bubble = !!_bubble ? _bubble : false;
    this.addEventListener(type, function(e) {
        e.target.removeEventListener(e.type, arguments.callee, bubble);
        return handler(e);
    }, bubble);
};

//argument only bind
Function.prototype.arg = function functionArg() {
    var slice = Array.prototype.slice,
        args = slice.call(arguments),
        fn = this,
        partial = function() {
            return fn.apply(this, args.concat(slice.call(arguments)));
        };
    partial.prototype = Object.create(this.prototype);
    return partial;
};

//RegExp, String or Index based slice
String.prototype.cut = function stringCut(start, end, _includeIdentifiers){
    //includeIdentifiers = [true/false, true/false] to include the values found by the String/RegExp expression at 'start' and 'end' respectively.
    var includeIdentifiers = !!_includeIdentifiers ? _includeIdentifiers: [false, false];
    var _start = null;
    var _end = null;
    switch (start.constructor){
        case String: _start = !includeIdentifiers[0] ? this.indexOf(start)+start.length : this.indexOf(start);
            break;
        case Number: _start = start;
            break;
        case RegExp:
            let found = this.match(start);
            _start = !includeIdentifiers[0] ? found.index+found[0].length : found.index;
            break;
    }
    if (!!end){
        switch (end.constructor){
            case String: _end = !includeIdentifiers[1] ? this.indexOf(end, _start) : this.indexOf(end, _start)+end.length;
                break;
            case Number: _end = end;
                break;
            case RegExp:
                let found = this.match(end);
                _end = !includeIdentifiers[1] ? found.index : found.index+found[0].length;
                break;
        }
        return this.slice(_start, (+_end > 0 ? _end : this.length));
    } else return this.slice(_start);
};

String.prototype.splice = function stringSplice(index, count, add) {
    if (index < 0) {
        index = this.length + index;
        if (index < 0) {
            index = 0;
        }
    }
    return this.slice(0, index) + (add || "") + this.slice(index + count);
};

Element.prototype.insertAfter = function elementInsertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
};

Element.prototype.cancel = function elementCancel(){
    this.querySelectorAll('[src]').forEach(e => {
        e.dataset.cancelledSrc = e.src;
        e.src = '';
    });
};

Element.prototype.uncancel = function elementUncancel(){
    this.querySelectorAll('[data-cancelled-src]').forEach(e => {
        e.src = e.dataset.cancelledSrc;
        e.dataset.cancelledSrc = '';
    });
};

Element.prototype.detach = function elementDetach(){
    this.cancel();
    this.originalParent = this.parentElement;
    return !!this.parentElement ? this.parentElement.removeChild(this) : this;
};

Element.prototype.attach = function elementAttach(){
    this.uncancel();
    try{
        var best = {e: null, seperation: null, after: false};
        var found = Array.prototype.slice.call(this.originalParent.children).find((e, i, a)=>{
            let diff = e.index - this.index;
            let current = {e: e, seperation: Math.abs(diff), after: diff < 0};
            if (!best.e || current.seperation < best.seperation || (current.seperation === best.seperation && current.after < best.after)) best = current;
            if (current.seperation === 1 || i === a.length) return best.e;
        });
        if (best.after) this.originalParent.insertAfter(this, found); else this.originalParent.insertBefore(this, found);
    }catch(error){
        console.log('%o.attach() %o', this, error);
    }
};

Object.defineProperty(Array.prototype, "erase", {
    enumerable: false,
    writable: false,
    value: function arrayErase(index, _count){
        this.splice(index, !_count ? 1 : _count);
        return this;
    }
});

}//====PROTOTYPES====
{//====UTILITY====
function recurseInput(getInput, verifyInput, useInputCallback, looptime, count, limit){
    let validArgs = ['function', 'function',  'function', 'number', 'number', 'number'];
    try{
        switch (true){
            case !this.timeout:
                this.timeout = [];
                /* falls through */
            case !this.timeout[getInput.name+'Timeout']:
                this.timeout[getInput.name+'Timeout'] = null;
                /* falls through */
            default:
                clearTimeout(this.timeout[getInput.name+'Timeout']);
                this.timeout[getInput.name+'Timeout'] = null;
                break;
        }
        let result = getInput();
        if (!result) throw getInput.name+' result invalid'; else
            if (!!result && result !== this.timeout[getInput.name+'Timeout']){
                if (verifyInput(result)) useInputCallback(result);
                return result;

            }
    }catch (error){
        console.info('[%o/%o] %o %O', ++count, limit, getInput.name, error);
        if ((count < limit) && Array.prototype.slice.call(arguments).every((arg, i) => typeof arg === validArgs[i])){
            this.timeout[getInput.name+'Timeout'] = setTimeout(arguments.callee.bind(this, getInput, verifyInput, useInputCallback, looptime, count++, limit), looptime);
            return this.timeout[getInput.name+'Timeout'];
        }
    }
}

function runAtLoad(cb){
    if (document.readyState !== 'loading') cb(); else document.addEventTrigger('readystatechange', evt=>{ if (document.readyState !== 'loading') cb(); }, false);
}

function setCookie(name, value){
    if (document.cookie.includes(name) && !document.cookie.includes(name+'='+value)){
        document.cookie.replace(new RegExp('(\;\s*'+name+'\=)\w+(\;)', 'g'), '$1'+value+'$2');
    } else document.cookie = name+'='+value;
}
}//====UTILITY====
