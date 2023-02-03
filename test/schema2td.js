"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const fs_1 = __importDefault(require("fs"));
const schema2td_1 = require("../src/schema2td");
describe('schema2td', () => {
    it('should fail on missing or invalid schema', () => {
        assert_1.default.throws(() => (0, schema2td_1.schema2td)({ type: 'badtype' }));
    });
    let cases = fs_1.default.readdirSync('test/schema2td-cases')
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        .map((key) => ({ key, ...require('./schema2td-cases/' + key) }))
        .filter(example => !example.skip);
    // use the CASE env var to restrict test cases, for example:
    // CASE=01 DEBUG=schema2td npm run test
    if (process.env.CASE) {
        cases = cases.filter(c => c.key.startsWith(process.env.CASE));
    }
    for (const c of cases) {
        it('should match expected output for case ' + c.key, () => {
            const { td, validateSchema, validateTd } = (0, schema2td_1.schema2td)(c.schema);
            if (c.td)
                assert_1.default.deepStrictEqual(td, c.td);
            for (const sample of c.samples ?? []) {
                validateSchema(sample);
                if (validateSchema.errors)
                    assert_1.default.fail('sample should pass json schema validation ' + JSON.stringify(validateSchema.errors, null, 2));
                validateTd(sample);
                if (validateTd.errors)
                    assert_1.default.fail('sample should pass JTD validation ' + JSON.stringify(validateTd.errors, null, 2));
            }
            for (const sample of c.samplesKo ?? []) {
                validateSchema(sample);
                if (!validateSchema.errors)
                    assert_1.default.fail('sample should fail on json schema validation ' + JSON.stringify(sample));
                validateTd(sample);
                if (!validateTd.errors)
                    assert_1.default.fail('sample should fail on JTD validation ' + JSON.stringify(sample));
            }
        });
    }
});
