/** Copyright 2016 Jim Armstrong (www.algorithmist.net)
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// Specs for various alpha release of Typescript Math Toolkit function parser
import {TSMT$FunctionParser} from './src/FunctionParser';

// Test Suites
describe('Function Parser', () => {
  
  let __parser: TSMT$FunctionParser  = new TSMT$FunctionParser();
  let __parser2: TSMT$FunctionParser = new TSMT$FunctionParser(['x']);

  it('evaluates to NaN for no parsed expression', function() {
    let value: number = __parser.evaluate([0.0]);
    expect(isNaN(value)).toBe(true);
  });

  it('evaluates to NaN for empty independent variable list (no parse)', function() {
    let vars: Array<string> = new Array<string>();

    __parser.variables = vars;
    let value: number  = __parser.evaluate([0.0]);
    expect(isNaN(value)).toBe(true);
  });

  it('returns error for parse of invalid expression #1', function() {
    let parsed: boolean = __parser2.parse('x1');
    expect(parsed).toBe(false);
  });

  it('returns error for parse of invalid expression #2', function() {
    let parsed: boolean = __parser2.parse('5x + 1');
    expect(parsed).toBe(false);
  });

  it('returns success for parse of valid expression', function() {
    let parsed: boolean = __parser.parse('x + 1');
    expect(parsed).toBe(true);
  });

  it('returns 2.0 for "x+1" evaluated at x=1', function() {
    let parsed: boolean = __parser.parse('x + 1');
    let value: number   = __parser.evaluate([1.0]);

    expect(value).toBe(2.0);
  });

  it('returns NaN for "x+1" with no independent variable value', function() {
    let parsed: boolean = __parser.parse('x + 1');
    let value: number   = __parser.evaluate([]);

    expect(isNaN(value)).toBe(true);
  });

  it('returns NaN for "x+1" with non-numeric independent variable value', function() {
    let parsed: boolean = __parser.parse('x + 1');
    let value: number   = __parser.evaluate([NaN]);

    expect(isNaN(value)).toBe(true);
  });

  it('returns expected values for "x+1" with multiple calls to evaluate()', function() {
    let parsed: boolean = __parser.parse('x + 1');

    let value: number   = __parser.evaluate([0.0]);
    expect(value).toBe(1.0);

    value = __parser.evaluate([-1.0]);
    expect(value).toBe(0.0);

    value = __parser.evaluate([10.0]);
    expect(value).toBe(11.0);
  });

  it('returns expected values for "x^2 + 2*x - 3" with multiple calls to evaluate()', function() {
    let parsed: boolean = __parser2.parse( "x^2 + 2*x - 3" );
    let f: Function     = (x:number): number => { return x*x + 2*x - 3; }

    let value: number   = __parser2.evaluate([0.0]);
    let compare: number = f(0.0);
    expect(Math.abs(value-compare)).toBeCloseTo(0.0, 2);

    value   = __parser2.evaluate([1.0]);
    compare = f(1.0);
    expect(Math.abs(value-compare)).toBeCloseTo(0.0, 2);

    value   = __parser2.evaluate([-1.0]);
    compare = f(-1.0);
    expect(Math.abs(value-compare)).toBeCloseTo(0.0, 2);

    value   = __parser2.evaluate([2.0]);
    compare = f(2.0);
    expect(Math.abs(value-compare)).toBeCloseTo(0.0, 2);

    value   = __parser2.evaluate([-2.0]);
    compare = f(-2.0);
    expect(Math.abs(value-compare)).toBeCloseTo(0.0, 2);
  });

  it('properly clears and parses a complex expression', function() {
    __parser.clear();
    __parser.variables = ["x"];
   
    let success: boolean = __parser.parse( "2*e^(x/2)" );
    expect(success).toBe(true);
  });

  it('returns expected values for "2*e^(x/2)" with multiple calls to evaluate()', function() {
    let f: Function     = (x: number): number => { return 2*Math.exp(0.5*x); }

    let value: number   = __parser.evaluate([0.0]);
    let compare: number = f(0.0);
    expect(Math.abs(value-compare)).toBeCloseTo(0.0, 2);

    value   = __parser.evaluate([1.0]);
    compare = f(1.0);
    expect(Math.abs(value-compare)).toBeCloseTo(0.0, 2);

    value   = __parser.evaluate([2.0]);
    compare = f(2.0);
    expect(Math.abs(value-compare)).toBeCloseTo(0.0, 2);

    value   = __parser.evaluate([3.0]);
    compare = f(3.0);
    expect(Math.abs(value-compare)).toBeCloseTo(0.0, 2);

    value   = __parser.evaluate([4.0]);
    compare = f(4.0);
    expect(Math.abs(value-compare)).toBeCloseTo(0.0, 2);
  });

  it('properly clears and parses a function of two independent variables', function() {
    __parser.clear();
    __parser.variables = ["x", "y"];
   
    let success: boolean = __parser.parse( "-3*sin(x/3) + 2*cos(y) + x^2 + 3*y" );
    expect(success).toBe(true);
  });

  it('returns expected values for "-3*sin(x/3) + 2*cos(y) + x^2 + 3*y" with multiple calls to evaluate()', function() {
    let f: Function     = (x: number, y: number): number => { return -3*Math.sin(x/3) + 2*Math.cos(y) + x*x + 3.0*y; }

    let value: number   = __parser.evaluate([0.0, 1.0]);
    let compare: number = f(0.0, 1.0);
    expect(Math.abs(value-compare)).toBeCloseTo(0.0, 2);

    value   = __parser.evaluate([1.0, 1.0]);
    compare = f(1.0, 1.0);
    expect(Math.abs(value-compare)).toBeCloseTo(0.0, 2);

    value   = __parser.evaluate([2.0, 1.0]);
    compare = f(2.0, 1.0);
    expect(Math.abs(value-compare)).toBeCloseTo(0.0, 2);

    value   = __parser.evaluate([3.0, 2.0]);
    compare = f(3.0, 2.0);
    expect(Math.abs(value-compare)).toBeCloseTo(0.0, 2);

    value   = __parser.evaluate([4.0, 5.0]);
    compare = f(4.0, 5.0);
    expect(Math.abs(value-compare)).toBeCloseTo(0.0, 2);
  });

  it('properly constructs a function of one independent variables', function() {
    __parser2 = new TSMT$FunctionParser(["x"]);
   
    let success: boolean = __parser2.parse("2.5*sin(1/x) + 3.025*x^2 - e^(-1/x) - 2.75/x");
    expect(success).toBe(true);
  });

  it('returns expected values for "2.5*sin(1/x) + 3.025*x^2 - e^(-1/x) - 2.75/x" with multiple calls to evaluate()', function() {
    let f: Function     = (x: number): number => { return 2.5*Math.sin(1/x) + 3.025*x*x - Math.exp(-1/x) - 2.75/x; }

    let value: number   = __parser2.evaluate([2.5]);
    let compare: number = f(2.5);
    expect(Math.abs(value-compare)).toBeCloseTo(0.0, 2);

    value   = __parser2.evaluate([-1.0]);
    compare = f(-1.0);
    expect(Math.abs(value-compare)).toBeCloseTo(0.0, 2);
  });

});
