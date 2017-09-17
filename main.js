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
                    return Math.floor(+this.days/365)+' years, '+this.days%365+' days';
                case this.days > 7:
                    return this.days+' days';
                default:
                    return this.days+' days, '+this.hours+' hours.';
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
}//====CONSTRUCTORS====

{//====PROTOTYPES====
    //delegated event listener
    EventTarget.prototype.addDelegatedListener = function delegatedListener(method, match, eventType, handler, _bubble) {
        this.addEventListener(eventType, function(event) {
            if (event.target && (event.target[method] === match || event.target.parentElement[method](match) === event.target)) {
                return handler(event);
            }
        }, !!_bubble ? _bubble : false);
    };

    //one-shot event listener
    EventTarget.prototype.addEventTrigger = function(type, handler, _bubble) {
        var bubble = !!_bubble ? _bubble : false;
        this.addEventListener(type, function(e) {
            e.target.removeEventListener(e.type, arguments.callee, bubble);
            return handler(e);
        }, bubble);
    };
    
    //argument only bind
    Function.prototype.arg = function() {
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
    String.prototype.cut = function(start, end, _includeIdentifiers){
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

    String.prototype.cut = function(start, end, includeEndString){
        let _start = start.constructor === RegExp ? this.search(start)+this.match(start)[0].length : (start.constructor === String ? this.indexOf(start)+start.length : start);
        if (!!end){
            let _end = end.constructor === RegExp ? this.search(end) : (end.constructor === String ? (!includeEndString ? this.indexOf(end, _start) : this.indexOf(end, _start)+end.length) : end);
            return this.slice(_start, (+_end > 0 ? _end : this.length));
        } else return this.slice(_start);
    };

    String.prototype.splice = function spliceSlice(index, count, add) {
        if (index < 0) {
            index = this.length + index;
            if (index < 0) {
                index = 0;
            }
        }
        return this.slice(0, index) + (add || "") + this.slice(index + count);
    };

    Element.prototype.cancel = function(){
        this.querySelectorAll('[src]').forEach(function(e,i,a){
            e.dataset.cancelledSrc = e.src;
            e.src = '';
        });
    };

    Element.prototype.uncancel = function(){
        this.querySelectorAll('[cancelled-src]').forEach(function(e,i,a){
            e.src = e.dataset.cancelledSrc;
            e.dataset.cancelledSrc = '';
        });
    };

    Element.prototype.detach = function(){
        this.cancel();
        return !!this.parentElement ? this.parentElement.removeChild(this) : this;
    };

    Element.prototype.attach = function(){
        this.uncancel();
        try{
            var best = {e: null, seperation: null, after: false};
            var found = Array.prototype.slice.call(this.originalParent.children).find(function(e, i, a){
                let diff = e.index - this.index;
                let current = {e: e, seperation: Math.abs(diff), after: diff < 0};
                if (!best.e || current.seperation < best.seperation || (current.seperation === best.seperation && current.after < best.after)) best = current;
                if (current.seperation === 1 || i === a.length) return best.e;
            }.bind(this));
            if (best.after) this.originalParent.insertAfter(this, found); else this.originalParent.insertBefore(this, found); 
        }catch(error){
            console.log('%o.attach() %o', this, error);
        }
    };

    Element.prototype.insertAfter = function(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    };

    Element.prototype.addClass = function elementPrototypeAddClass(classToAdd){
        if (!this.classList.contains(classToAdd)) this.classList.add(classToAdd);
    };

    Element.prototype.removeClass = function elementPrototypeRemoveClass(classToRemove){
        if (this.classList.contains(classToRemove)) this.classList.remove(classToRemove);
    };

    Array.prototype.erase = function(index, count){
        var _count = count || 1;
        this.splice(index, _count);
        return this;
    };
}//====PROTOTYPES====

{//====UTILITY====
    function recurseWrapper(fn, looptime, cb){
        try{
            switch (true){
                case !this.timeout:
                    this.timeout = [];
                case !this.timeout[fn.name+'Timeout']:
                    this.timeout[fn.name+'Timeout'] = null;
                default:
                    clearTimeout(this.timeout[fn.name+'Timeout']);
                    this.timeout[fn.name+'Timeout'] = null;
                    break;
            }
            let result = fn();
            if (!!result && result !== this.timeout[fn.name+'Timeout']){
                cb(result);
                return result; 
            } else throw 'no result';
        }catch (error){
            console.log('%o %o', fn.name, error);
            this.timeout[fn.name+'Timeout'] = setTimeout(arguments.callee.bind(this, fn, looptime, cb), looptime);
            return this.timeout[fn.name+'Timeout'];
        }
    }

    function runAtLoad(cb){
        if (document.readyState !== 'loading') cb(); else document.addEventTrigger('DOMContentLoaded', cb, false);
    }

    function setCookie(name, value){
        if (document.cookie.includes(name) && !document.cookie.includes(name+'='+value)){
            document.cookie.replace(new RegExp('(\;\s*'+name+'\=)\w+(\;)', 'g'), '$1'+value+'$2');
        } else document.cookie = name+'='+value;
    }
}//====UTILITY====
