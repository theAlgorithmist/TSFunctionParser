# Typescript Math Toolkit Function Parser

In early 2001, I came across a blog post that discussed a function parser, i.e. code that accepted a function defined in a calculator-style syntax - often called infix notation.  After parsing the function definition, the code evaluated the function for specific numerical values of the independent variable(s).  Some pseudo-code was provided which I took as a starting point for a C++ class.  I finished the C++ code simply as an exercise and then ported it to Actionscript 2/3 for EdTech applications in Flash/Flex.  It was eventually converted to Javascript and is now part of the Typescript Math Toolkit.

I decided to release the alpha version of the Typescript code both to serve as another example of the practical use of Typescript and to encourage thought on better ways to solve the problem.  String processing is not my strong suit, so I believe there are much better ways to author this code.  If you would like to make a contribution to the ongoing development of the Typescript Math Toolkit, then here is one opportunity.


Author:  Jim Armstrong - [The Algorithmist]

@algorithmist

theAlgorithmist [at] gmail [dot] com

Typescript: 2.0.0

Version: 1.0.0


## Installation

Installation involves all the usual suspects

  - npm and gulp installed globally
  - Clone the repository
  - npm install
  - get coffee (this is the most important step)


### Building and Running the unit tests

1. gulp compile

2. gulp serve

The test suite is in Jasmine.  The parser is in the _src_ folder. 


### Using the parser

General usage follows the pattern,

- Define independent variable(s)
- Parse the function in infix notation, i.e. "2*sin(x) + 4"
- Perform multiple evaluations of the function for specific numerical values of the independent variable(s)

Two symbols, 'pi' and 'e', are automatically recognized.  

The following list of 'math' functions are supported: abs, acos, asin, atan, ceil, cos, floor, ln, max, min, round, sin, sqrt, and tan.

Refer to the specs in _parser.specs.ts_ for specific usage examples.

Note that the parser appears to contain redundant evaluation methods, i.e. _eval_ and _evaluate_.  The former is required for compatibility with the TSMT Function Graphing Engine.  This allows the function parser to be used as if it were a library function in the engine.


License
----

Apache 2.0

**Free Software? Yeah, Homey plays that**

[//]: # (kudos http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

[The Algorithmist]: <https://www.linkedin.com/in/jimarmstrong>
