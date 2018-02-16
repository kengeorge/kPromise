const k = require('./kPromise');

const basicObj = function() {
    return {one: 1, two: 2};
};

const givenStart = function() {
    return startWith(basicObj());
};

const startWith = k.startWith;
test('generates a value promise', async() => {
    let given = startWith(1);

    expect.assertions(2);
    await expect(given).toBeInstanceOf(Promise);
    await expect(given).resolves.toBe(1);
});

const get = k.get;
test('retrieves a field', async() => {
    let given = givenStart();

    expect.assertions(1);
    await expect(given.then(get('two'))).resolves.toBe(2);

});

const forEach = k.forEach;
test('iterates over a list', async() => {
    let given = [1, 2, 3];

    let actual = startWith(given)
        .then(forEach((num) => num + 1));

    expect.assertions(1);
    let expected = [2, 3, 4];
    await expect(actual).resolves.toEqual(expected);
});

test('iterates over an object', async() => {
    let given = givenStart();

    expect.assertions(1);
    await expect(given
        .then(forEach((num, val) => num + val)))
        .resolves.toEqual(["one1", "two2"]);
});

const decorate = k.decorate;
test('decorates a given field', async() => {
    let given = givenStart();

    let actual = given.then(decorate('three', (g) => g.one + g.two));

    expect.assertions(1);
    let expected = basicObj();
    expected.three = 3;
    await expect(actual).resolves.toEqual(expected);
});

const passBefore = k.passBefore;
test('passes input then additional arguments', async() => {
    const given = basicObj();
    const plus = "additional";

    const mock = jest.fn()
        .mockReturnValueOnce(10);

    const when = startWith(given).then(passBefore(mock, plus));

    expect.assertions(2);
    await expect(when).resolves.toBe(10);
    await expect(mock).toHaveBeenCalledWith(given, plus);
});

