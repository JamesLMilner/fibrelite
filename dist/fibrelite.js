module.exports=function(t,e,n){var o=this,i=[];this.roundRobin=0,this.totalThreads=e||1,this.debounce=n||333,this.totalThreads>20&&(this.totalThreads=20);var r=function(t){var e=0,n={},o=new Worker("data:,$$="+t+";onmessage="+function(t){Promise.resolve(t.data[1]).then(function(t){return $$.apply($$,t)}).then(function(e){postMessage([t.data[0],0,e],[e].filter(function(t){return t instanceof ArrayBuffer||t instanceof MessagePort||t instanceof ImageBitmap}))},function(e){postMessage([t.data[0],1,""+e])})});return o.onmessage=function(t){n[t.data[0]][t.data[1]](t.data[2]),n[t.data[0]]=null},{resolved:!1,worker:o,fn:function(t){return t=[].slice.call(arguments),new Promise(function(){n[++e]=arguments,o.postMessage([e,t],t.filter(function(t){return t instanceof ArrayBuffer||t instanceof MessagePort||t instanceof ImageBitmap}))})}}};this.debounceExecute=function(t){return new Promise(function(e,n){var o=this;return this.latestValue=t,e(new Promise(function(e,n){(void 0===o.batchEnds||Date.now()>=o.batchEnds)&&(o.batchEnds=Date.now()+o.debounce),o.latestValue=t,new Promise(function(){setTimeout(function(){o.latestValue!==t&&void 0!==o.lastExecution||(o.lastExecution=o.execute(t).then(function(t){return o.lastKnownResult=t,t}),e(o.lastExecution)),void 0!==o.lastKnownResult&&e(Promise.resolve(o.lastKnownResult)),e(o.lastExecution)},o.batchEnds-Date.now())})}))}.bind(o))},this.prioritiseExecute=function(t){return new Promise(function(e,n){return this.terminateAll(),e(this.execute(t))}.bind(o))},this.execute=function(e){return new Promise(function(n,o){for(;i.length<this.totalThreads;)i.unshift(r(t));var s=i[this.roundRobin].fn(e);return this.roundRobin>=this.totalThreads-1?this.roundRobin=0:this.roundRobin++,n(s)}.bind(o))},this.getCurrentWorker=function(){return currentThread.worker},this.terminateAll=function(){i.length>0&&!1===i[o.totalThreads-1].resolved&&i.pop().worker.terminate()}};
//# sourceMappingURL=fibrelite.js.map
