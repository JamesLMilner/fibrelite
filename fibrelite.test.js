import fibrelite from 'fibrelite';

describe('fibrelite', () => {

	it('should return an async function', () => {
		let g = fibrelite( () => 'one' );
		expect(g).toEqual(jasmine.any(Function));
		expect(g()).toEqual(jasmine.any(Promise));
	});

	it('should invoke sync functions', async () => {
		let foo = fibrelite( a => 'foo: '+a );

		let ret = await foo('test');
		expect(ret).toEqual('foo: test');
	});

	it('should forward arguments', async () => {
		let foo = fibrelite(function() {
			return {
				args: [].slice.call(arguments)
			};
		});

		let ret = await foo('a', 'b', 'c', { position: 4 });
		expect(ret).toEqual({
			args: ['a', 'b', 'c', { position: 4 }]
		});
	});

	it('should invoke async functions', async () => {
		let bar = fibrelite( a => new Promise( resolve => {
			resolve('bar: '+a);
		}));

		let ret = await bar('test');
		expect(ret).toEqual('bar: test');
	});
});
