const k = require('./kPromise');


describe('kPromise functions', () => {

    const basicObj = function() {
        return {one: 1, two: 2};
    };

    const givenStart = function() {
        return startWith(basicObj());
    };


    const startWith = k.startWith;
    it('should generate a value promise', async() => {
        const given = startWith(1);

        expect.assertions(2);
        await expect(given).toBeInstanceOf(Promise);
        await expect(given).resolves.toBe(1);
    });

    const promise = k.promise;
    const tap = k.tap;
    it('should tap and wait for operation', async() => {
        const actual = [0];
        await startWith(actual)
            .then(tap((val) => {
                return promise((res) => {
                    setTimeout(res, 2000);
                })
                    .then(() => {
                        val[val.length] = 1;
                        return val;
                    });
            }))
            .then((val) => {
                val[val.length] = 2;
                return val;
            });

        expect.assertions[3];
        expect(actual[0]).toBe(0);
        expect(actual[1]).toBe(1);
        expect(actual[2]).toBe(2);
    });

    const fork = k.fork;
    it('should tap and continue', async() => {
        const actual = [0];
        await startWith(actual)
            .then(fork((val) => {
                return promise((res) => setTimeout(res, 1000))
                    .then(() => {
                        val[val.length] = 1;
                        return val;
                    });
            }))
            .then((val) => {
                val[val.length] = 2;
                return val;
            })
            .then(() => promise((res) => setTimeout(res, 1500)));

        expect.assertions[3];
        expect(actual[0]).toBe(0);
        expect(actual[1]).toBe(2);
        expect(actual[2]).toBe(1);
    });

    const failWith = k.failWith;
    it('should fail on a given value', async() => {
        const errorVal = "boom";

        expect.assertions(1);
        await expect(failWith(errorVal)).rejects.toBe(errorVal);
    });

    const get = k.get;
    it('retrieves a field', async() => {
        const given = givenStart();

        expect.assertions(1);
        await expect(given.then(get('two'))).resolves.toBe(2);

    });

    const forEach = k.forEach;
    it('should iterate over a list', async() => {
        const given = [1, 2, 3];

        let actual = startWith(given)
            .then(forEach((num) => num + 1));

        expect.assertions(1);
        let expected = [2, 3, 4];
        await expect(actual).resolves.toEqual(expected);
    });

    it('should iterate over a list of objects', async() => {
        const givenA = basicObj();
        const givenB = basicObj();
        const givenC = basicObj();

        let actual = startWith([givenA, givenB, givenC])
            .then(forEach((o) => o.one));

        expect.assertions(1);
        let expected = [1, 1, 1];
        await expect(actual).resolves.toEqual(expected);
    });

    //TODO would like an in-order iterator
    it('should iterate sequentially', async() => {
        const givenA = {main: "1", sublist: ["2", "3"]};
        const givenB = {main: "4", sublist: ["5", "6"]};

        let actual = "";
        await startWith([givenA, givenB])
            .then(forEach(item =>
                startWith(item)
                    .then(tap(item => actual += item.main))
                    .then(get('sublist'))
                    .then(forEach(subitem => actual += subitem))
            ));

        expect.assertions(1);
        console.log(actual);
        expect(actual).toBe("123456");
    });

    it('should iterate over an object', async() => {
        const given = givenStart();

        expect.assertions(1);
        await expect(given
            .then(forEach((num, val) => num + val)))
            .resolves.toEqual(["one1", "two2"]);
    });

    const decorate = k.decorate;
    it('should decorate a given field', async() => {
        const given = givenStart();

        let actual = given.then(decorate('three', (g) => g.one + g.two));

        expect.assertions(1);
        let expected = basicObj();
        expected.three = 3;
        await expect(actual).resolves.toEqual(expected);
    });

    const passBefore = k.passBefore;
    it('should pass input before additional arguments', async() => {
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

    it('should chain', async() => {
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
