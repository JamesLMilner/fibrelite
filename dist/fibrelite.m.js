export default function(t,n,e){var i=this,s=[];this.roundRobin=0,this.totalThreads=n||1,this.debounce=e||333,this.totalThreads>20&&(this.totalThreads=20);var o=function(t){var n=0,e={},i=new Worker("data:,$$="+t+";onmessage="+function(t){Promise.resolve(t.data[1]).then(function(t){return $$.apply($$,t)}).then(function(n){postMessage([t.data[0],0,n],[n].filter(function(t){return t instanceof ArrayBuffer||t instanceof MessagePort||t instanceof ImageBitmap}))},function(n){postMessage([t.data[0],1,""+n])})});return i.onmessage=function(t){e[t.data[0]][t.data[1]](t.data[2]),e[t.data[0]]=null},{resolved:!1,worker:i,fn:function(){var t=[].slice.call(arguments);return new Promise(function(){e[++n]=arguments,i.postMessage([n,t],t.filter(function(t){return t instanceof ArrayBuffer||t instanceof MessagePort||t instanceof ImageBitmap}))})}}};this.debounceId=0,this.debounce=function(){var t=arguments;return new Promise(function(n,e){var i=this,s=[].slice.call(t);return(void 0===this.batchEnds||Date.now()>=this.batchEnds)&&(this.batchEnds=Date.now()+this.debounce),this.lastDebounce=s,n(new Promise(function(t,n){setTimeout(function(){i.lastDebounce!==s&&void 0!==i.lastExecution||(i.lastExecution=i.execute.apply(i,s).then(function(t){return i.lastKnownResult=t,t}),t(i.lastExecution)),void 0!==i.lastKnownResult&&t(i.lastKnownResult),console.log("resolve"),t(i.lastExecution)},i.batchEnds-Date.now())}))}.bind(this))}.bind(this),this.prioritise=function(){var t=arguments;return new Promise(function(n,e){return this.terminateAll(),n(this.execute.apply(this,[].slice.call(t)))}.bind(this))}.bind(this),this.execute=function(){var n=arguments;return new Promise(function(e,i){for(var a=[].slice.call(n);s.length<this.totalThreads;)s.unshift(o(t));var r=s[this.roundRobin].fn.apply(null,a);return this.roundRobin>=this.totalThreads-1?this.roundRobin=0:this.roundRobin++,e(r)}.bind(this))}.bind(this),this.getWorkers=function(){return s},this.terminateAll=function(){s.length>0&&!1===s[i.totalThreads-1].resolved&&s.pop().worker.terminate()}};
//# sourceMappingURL=fibrelite.m.js.map
