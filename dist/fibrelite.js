module.exports=function(t,e,n){var o=this,r=[];this.roundRobin=0,this.totalThreads=e||1,this.debounce=n||333,this.totalThreads>20&&(this.totalThreads=20);var s=function(t){o.cachedObjectUrl||(o.cachedObjectUrl=URL.createObjectURL(new Blob(["onmessage=("+function(t){return function(e){Promise.resolve(e.data[1]).then(t.apply.bind(t,t)).then(function(t){postMessage([e.data[0],0,t])},function(t){postMessage([t.data[0],1,""+t])})}}+")("+t+")"])));var e=new Worker(o.cachedObjectUrl),n=0,r={};e.onmessage=function(t){r[t.data[0]][t.data[1]](t.data[2]),r[t.data[0]]=null};var s={resolved:!1,worker:e,fn:function(t){return t=[].slice.call(arguments),new Promise(function(){s.resolved=!1,r[++n]=arguments,e.postMessage([n,t])}).then(function(t){return s.resolved=!0,t})}};return s};this.debounceExecute=function(t){return new Promise(function(e,n){var o=this;return this.latestValue=t,e(new Promise(function(e,n){(void 0===o.batchEnds||Date.now()>=o.batchEnds)&&(o.batchEnds=Date.now()+o.debounce),o.latestValue=t,new Promise(function(){setTimeout(function(){o.latestValue!==t&&void 0!==o.lastExecution||(o.lastExecution=o.execute(t).then(function(t){return o.lastKnownResult=t,t}),e(o.lastExecution)),void 0!==o.lastKnownResult&&e(Promise.resolve(o.lastKnownResult)),e(o.lastExecution)},o.batchEnds-Date.now())})}))}.bind(o))},this.prioritiseExecute=function(t){return new Promise(function(e,n){return r.length>0&&!1===r[this.totalThreads-1].resolved&&r.pop().worker.terminate(),e(this.execute(t))}.bind(o))},this.execute=function(e){return new Promise(function(n,o){for(;r.length<this.totalThreads;)r.unshift(s(t));var i=r[this.roundRobin].fn(e);return this.roundRobin>=this.totalThreads-1||this.roundRobin++,n(i)}.bind(o))},this.getCurrentWorker=function(){return currentThread.worker}};
//# sourceMappingURL=fibrelite.js.map
