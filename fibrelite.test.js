import fibrelite from './fibrelite';

describe('fibrelite', () => {

    it('should be defined', () => {
        expect(fibrelite).toBeDefined();
        expect(fibrelite).toEqual(jasmine.any(Function));
	});

	it('should return an object', () => {
		let worker = new fibrelite( () => 'one' );
		expect(worker).toEqual(jasmine.any(Object));
    });
    
    it('should return the current worker when called', () => {
        let worker = new fibrelite( () => 'one' );
        expect(worker.getWorkers).toEqual(jasmine.any(Function));
		expect(worker.getWorkers()).toEqual(jasmine.any(Array));
	});

	it('should execute function when called', async () => {
		let worker = new fibrelite( a => 'foo: '+a );

        expect(worker.execute).toEqual(jasmine.any(Function));
		let ret = await worker.execute('test');
		expect(ret).toEqual('foo: test');
    });

    it('should execute function with multiple inputs when called', async () => {
		let worker = new fibrelite( (a, b) => { return 'foo: '+a + b });

        expect(worker.execute).toEqual(jasmine.any(Function));
		let ret = await worker.execute('test', 'ing');
		expect(ret).toEqual('foo: testing');
    });


	it('should give different results for executing on different inputs', async () => {
        let worker = new fibrelite( a => 'foo: '+a );
		let ret = await worker.execute('test');
        expect(ret).toEqual('foo: test');
        ret = await worker.execute('bar');
		expect(ret).toEqual('foo: bar');
    });
    
    it('should have a prioritise function', async () => {
        let worker = new fibrelite( a => 'foo: '+a );
 
        expect(worker.debounce).toEqual(jasmine.any(Function));
        let ret = await worker.prioritise('test');
		expect(ret).toEqual('foo: test');
	});
	
	it('when prioritised is called it should not kill workers that have resolved (they can be reused!)', async () => {
		let worker = new fibrelite( a => 'foo: '+a, 1);
		let ret = await worker.prioritise('test');
		let workers = worker.getWorkers();

		expect(workers).toBeDefined();
		expect(workers.length).toEqual(1);
		ret = await worker.prioritise('test');
		let nextWorkers = worker.getWorkers();
		expect(nextWorkers).toBeDefined();
		expect(nextWorkers.length).toEqual(1);
		expect(workers[0].worker !== nextWorkers[0].worker).toEqual(false);
	});
	
	it('when prioritised is called it should kill workers that have not resolved', async () => {
		let worker = new fibrelite( a => { 
			return new Promise((res, rej) => {
				setTimeout(() => { res() }, 100);
			})
		}, 1);

		worker.prioritise('test');
		let workers = worker.getWorkers();

		expect(workers).toBeDefined();
		expect(workers.length).toEqual(1);
		await worker.prioritise('test');
		let nextWorkers = worker.getWorkers();
		expect(workers[0].worker !== nextWorkers[0].worker).toEqual(true);
    });
    
    it('should have a debounce function when called', async () => {
		let worker = new fibrelite( (a) => { return 'foo: '+a }, 1, 250);
        let x = worker.debounce('test');
        let ret = await x;
		expect(ret).toEqual('foo: test');
    });

    it('should debounce inputs', async () => {
		let worker = new fibrelite( (a) => { return 'foo: '+a }, 1, 250);
        let x = worker.debounce('x');
        let y = worker.debounce('y');
        let z = worker.debounce('z');
        let xRes = await x;
        let yRes = await y;
        let zRes = await z;
        expect(xRes).toEqual('foo: z');
        expect(yRes).toEqual('foo: z');
        expect(zRes).toEqual('foo: z');
    });

	it('should forward arguments', async () => {
		let foo = new fibrelite(function() {
			return {
				args: [].slice.call(arguments)
			};
		});

		let ret = await foo.execute('a', 'b', 'c', { position: 4 });
		expect(ret).toEqual({
			args: ['a', 'b', 'c', { position: 4 }]
		});
	});

	it('should invoke async functions', async () => {
		let bar = new fibrelite( a => new Promise( resolve => {
			resolve('bar: '+a);
		}));

		let ret = await bar.execute('test');
		expect(ret).toEqual('bar: test');
	});

});
