const k = require('./kPromise');

const startWith = k.startWith;
test('generates a value promise', () => {
    var start = startWith(1);
    expect(start)
        .toBeInstanceOf(Promise);
});

test('iterates over a list', () => {
    var given = [1,2,3];
});