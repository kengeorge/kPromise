const k = require('./kPromise');


describe('kPromise functions', () => {

    const basicObj = function() {
        return {one: 1, two: 2};
    };

    const givenStart = function() {
        return startWith(basicObj());
    };

    const startWith = k.startWith;
    test('should generate a value promise', async() => {
        const given = startWith(1);

        expect.assertions(2);
        await expect(given).toBeInstanceOf(Promise);
        await expect(given).resolves.toBe(1);
    });

    const failWith = k.failWith;
    it('should fail on a given value', async() => {
        const errorVal = "boom";

        expect.assertions(1);
        await expect(failWith(errorVal)).rejects.toBe(errorVal);
    });

    const get = k.get;
    test('retrieves a field', async() => {
        const given = givenStart();

        expect.assertions(1);
        await expect(given.then(get('two'))).resolves.toBe(2);

    });

    const forEach = k.forEach;
    test('should iterate over a list', async() => {
        const given = [1, 2, 3];

        let actual = startWith(given)
            .then(forEach((num) => num + 1));

        expect.assertions(1);
        let expected = [2, 3, 4];
        await expect(actual).resolves.toEqual(expected);
    });

    test('should iterate over a list of objects', async() => {
        const givenA = basicObj();
        const givenB = basicObj();
        const givenC = basicObj();

        let actual = startWith([givenA, givenB, givenC])
            .then(forEach((o) => o.one));

        expect.assertions(1);
        let expected = [1, 1, 1];
        await expect(actual).resolves.toEqual(expected);
    });

    test('should iterate over an object', async() => {
        const given = givenStart();

        expect.assertions(1);
        await expect(given
            .then(forEach((num, val) => num + val)))
            .resolves.toEqual(["one1", "two2"]);
    });

    const decorate = k.decorate;
    test('should decorate a given field', async() => {
        const given = givenStart();

        let actual = given.then(decorate('three', (g) => g.one + g.two));

        expect.assertions(1);
        let expected = basicObj();
        expected.three = 3;
        await expect(actual).resolves.toEqual(expected);
    });

    const passBefore = k.passBefore;
    test('should pass input before additional arguments', async() => {
        const given = basicObj();
        const plus = {thing: "additional"};

        const when = (input, additional) => {
            input.added = additional;
            return input;
        };

        const actual = await startWith(given).then(passBefore(when, plus));

        expect.assertions(2);
        expect(actual).toBe(given);
        expect(actual.added).toBe(plus);
    });

    test('should chain', async() => {
        const givenA = {name: "A"};
        const givenB = {name: "B"};

        const when = (o, b) => o.name + " " + b;

        const actual = await startWith([givenA, givenB])
            .then(forEach(passBefore(when, true)));

        expect.assertions(2);
        expect(actual[0]).toEqual("A true");
        expect(actual[1]).toEqual("B true");
    });

});
