module.exports=function(t,e){var n=this,r=[];this.roundRobin=0,this.totalThreads=e||1,this.totalThreads>20&&(this.totalThreads=20);var o=function(t){n.cachedObjectUrl||(n.cachedObjectUrl=URL.createObjectURL(new Blob(["onmessage=("+function(t){return function(e){Promise.resolve(e.data[1]).then(t.apply.bind(t,t)).then(function(t){postMessage([e.data[0],0,t])},function(t){postMessage([t.data[0],1,""+t])})}}+")("+t+")"])));var e=new Worker(n.cachedObjectUrl),r=0,o={};e.onmessage=function(t){o[t.data[0]][t.data[1]](t.data[2]),o[t.data[0]]=null};var s={resolved:!1,worker:e,fn:function(t){return t=[].slice.call(arguments),new Promise(function(){s.resolved=!1,o[++r]=arguments,e.postMessage([r,t])}).then(function(t){return s.resolved=!0,t})}};return s};this.waitExecute=function(e){return new Promise(function(n,s){return 1===this.totalThreads?r.length&&!1===r[0].resolved&&void 0!==this.lastKnownValue?n(this.lastKnownValue):(r.length||(r[0]=o(t)),this.lastKnownValue=r[0].fn(e),n(this.lastKnownValue)):s(Error("waitExecute requires only use of one worker"))}.bind(n))},this.prioritiseExecute=function(t){return new Promise(function(e,n){return r.length>0&&!1===r[this.totalThreads-1].resolved&&r.pop().worker.terminate(),e(this.execute(t))}.bind(n))},this.execute=function(e){return new Promise(function(n,s){for(;r.length<this.totalThreads;)r.unshift(o(t));var i=r[this.roundRobin].fn(e);return this.roundRobin>=this.totalThreads-1||this.roundRobin++,n(i)}.bind(n))},this.getCurrentWorker=function(){return currentThread.worker}};
//# sourceMappingURL=fibrelite.js.map
