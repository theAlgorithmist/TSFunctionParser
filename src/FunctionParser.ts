/** 
 * Copyright 2016 Jim Armstrong (www.algorithmist.net)
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

/**
 * Typescript Math Toolkit: Parse and numerically evaluates functions expressed in a calculator-type syntax, sometimes known as infix notation.  
 *
 * Example: x^3 - x^2 + sin(x) + e^-cos(pi*x)/2
 *
 * The two symbols 'pi' and 'e' are automatically recognized and the following list of 'math' functions are supported: abs, acos, asin, atan, ceil, cos, 
 * floor, ln, max, min, round, sin, sqrt, and tan.
 * 
 * The parser supports addition (+), subtraction (-), multiplication (*), division (/) and exponentiation (^) operators.  Operator precedence 
 * is ^, /, *, -, + .  Also, note that implicit multiplication is not supported, i.e. x^2 + 2x - 3 needs to be written as x^2 + 2*x - 3.
 * 
 * By default, the function is evaluated presuming an independent variable, 'x' whose numerical value is provided.  An array of independent variables 
 * (String names) may be supplied to the parser.
 * 
 * Create a list of independent variables at construction.  Define a function using the parse() method.  Evaluate the function for specific values 
 * of the independent variables as many times as desired with the evaluate() method.
 * 
 * @param variables : Array - List of independent varible names (Strings)
 * 
 * Note:  Always use parentheses to make expressions unambiguous.
 *
 * @author Jim Armstrong (www.algorithmist.net)
 * 
 * @version 1.0
 */
 export class TSMT$FunctionParser
 {
   // symbolic names for operators converted to stack functions
   private ADD: string      = "add";
   private DIVIDE: string   = "div";
   private MAX: string      = "max";
   private MIN: string      = "min";
   private MULTIPLY: string = "mul";
   private POWER            = "pow";
   private SUBTRACT         = "sub";
      
   // sort of a grammar ... sort of
   private LETTERS: string        = "abcdefghijklmnopqrstuwvxzy";
   private NUMBERS: string        = "0123456789.";
   private MATH_OPERATORS: string = "+-/^*";
   private OPERATORS: string       = this.MATH_OPERATORS + "(),";
   private UNARY: string           = "+-*/^,(";
   private OP_LIST_1: string       = "^*+,/)";
   private OP_LIST_2: string       = "^*+-,/)";
   private OP_LIST_3: string       = "^*+-,/(";
   private OP_LIST_4: string       = "^*+,/(";
      
   // single- and two-argument functions
   private ONE_ARG_FUNCTIONS:Array<string> = [ "abs", "acos", "asin", "atan", "ceil", "cos", "floor", "ln", "round", "sin", "sqrt", "tan" ];
   private TWO_ARG_FUNCTIONS:Array<string> = [ this.ADD, this.DIVIDE, this.MAX, this.MIN, this.MULTIPLY, this.POWER, this.SUBTRACT ];
      
   // token types
   private NONE: string                = "";
   private IS_ONE_ARG_FUNCTION: string = "fun1";
   private IS_TWO_ARG_FUNCTION: string = "fun2";
   private IS_LETTER: string           = "let";
   private IS_NUMBER: string           = "num";
   private IS_VARIABLE: string         = "var";
   private IS_OPERATOR: string         = "op";
   private IS_CONSTANT: string         = "c";
   private IS_NONE: string             = "n";
    
   // for parsing
   private PI: string             = "pi";
   private E: string              = "e";
   private LEFT_PAREN: string     = "(";
   private RIGHT_PAREN: string    = ")";
   private COMMA: string          = ",";
   private MINUS: string          = "-";
   private PLUS: string           = "+";
   private MULTIPLICATION: string = "*";
   private DIVISION: string       = "/";
   private EXPONENT: string       = "^";
  
   // list independent variables
   private _variables:Array<string>;
      
   // processing tokens
   private _tokenValue: string;
   private _tokenType: string;
   private _tokenLength: number;
    
   // RPN function stack
   private _functionStack:Array<string>;
   
  /**
   * Create a new function parser
   *
   * @param variables : Array<string> Optional array of independent variables, i.e. ['x'], ['x', 'y'], ['s', 't']  Setting the 
   * variables array may be deferred to post-construction.  Use the class-supplied mutator to assign the list of independent
   * variables before function evaluation.
   *
   * @return Nothing
   */
   constructor(variables?:Array<string>)
   {
     this._variables = variables == null || variables.length == 0 ? ["x"] : variables.slice();
      
     this._tokenValue    = this.NONE;
     this._tokenType     = this.NONE;
     this._tokenLength   = 0;
     this._functionStack = new Array<string>();
   }
      
   // stack functions
   private abs(x: number): number            { return Math.abs(x);   }
   private acos(x: number): number           { return Math.acos(x);  }
   private add(x: number, y: number): number { return x + y;         }
   private asin(x: number): number           { return Math.asin(x);  }
   private atan(x: number): number           { return Math.atan(x);  }
   private ceil(x: number): number           { return Math.ceil(x);  }
   private cos(x: number): number            { return Math.cos(x);   }
   private div(x: number, y: number): number { return x / y;         }
   private floor(x: number): number          { return Math.floor(x); }
   private ln(x: number): number             { return Math.log(x);   }
   private max(x: number, y: number)         { return Math.max(x,y); }
   private min(x: number, y: number)         { return Math.min(x,y); }
   private mul(x: number, y: number)         { return x * y;         }
   private pow(x: number, y: number)         { return Math.pow(x,y); }
   private round(x: number): number          { return Math.round(x); }
   private sin(x: number): number            { return Math.sin(x);   }
   private sub(x: number, y: number): number { return x - y;         }
   private sqrt(x: number): number           { return Math.sqrt(x);  }
   private tan(x: number): number            { return Math.tan(x);   }
   
  /**
   * Assign independent variables
   * 
   * @param vars: Array<string> New independent variables names (single names with no spaces)
   *
   * @return Nothing. 
   */
   public set variables(vars: Array<string>)
   {
     this._variables = vars == null || vars.length == 0 ? ["x"] : vars.slice();
   }
      
  /**
   * Clear the parser and prepare for new data
   *
   * @return Nothing.  Call parse() to parse a new function followed by evaluate() for one or more function evaluations.  This is only truly necessary if making
   * a change in the function's independent variable list before a parse.
   */
   public clear(): void
   {
     this._variables.length = 0;
     this._functionStack.length = 0;
   }

  /**
   * Parse a function and prepare it for evaluation
   * 
   * @param str : String - Representation of function such as "x^3 - 2*cost(x) + e^-tan(pi*x)/2".  
   *
   * @return Boolean - True if parsing was successful.  The function must be parsed before evaluation.  Input errors result in no parsed result and the 
   * function may not be evaluated.  In the future, this may return an object that contains both the Boolean value and an indication of what step the parsing
   * failed, which can be used as a debugging aid.
   * 
   * Note:  Any prior function stack is overwriteen
   */
   public parse(str: string): boolean
   {
     let trimStr: string = this.__trim(str);
	      
     // check basic errors
     if( trimStr == "" )
       return false; 
     
     if( !this.__validateChars(trimStr) )
       return false;
        
     if( !this.__validateParentheses(trimStr) )
       return false;
        
     if( !this.__validateTokens(trimStr) )
       return false;
        
     let processed: string = this.__processTokens(trimStr);
     if( processed == "" )
       return false;
      
     this._functionStack.length = 0;
      
     // cache function stack for future evaluations
     this.__createFunctionStack(processed);
        
     return true;
   }
  	 
  /**
   * Evaluate the function of a single variable at the given value of the independent variable (used in the function-plotting engine, for example)
   *
   * @param x : number Value of independent variable
   *
   * @return number f(x)
   */
   public eval(x: number): number
   {
     return this.evaluate([x]);
   }

  /**
   * Evaluate parsed function using numerical values for all independent variables.
   * 
   * @param variables : Array<number> Independent variable numeric values. Example: Independent variables are 's' and 't'.  evaluate( [1.7, 2.5] ) evaluates the function 
   * at s = 1.7 and t = 2.5.
   *
   * @return Number - Numerical value of the function or NaN if there is an error during function evaluation.  Most common errors are not parsing a function
   * before evaluation and mismatch between variable list and numerical values.
   */
   public evaluate(variables: Array<number>): number 
   { 
     if( this._functionStack.length == 0 )
	      return NaN; 
        
     if( variables.length != this._variables.length )
       return NaN; 
        
     let len: number = variables.length;
     let j: number;
     for (j=0; j<len; j++)
     {
       if( isNaN(variables[j]) || !isFinite(variables[j]))
         return NaN;
     }
      
    let token: string         = "";
    let tokenType: string     = "";
    let opStack:Array<number> = new Array<number>();  // numerical operands
    let arg1: number          = 0;
    let arg2: number          = 0;     
    let i: number             = 0;
    let f: Function;
        
    while( i < this._functionStack.length )
    {
      // in reverse order, type is before value
		  tokenType = this._functionStack[i];
		  token     = this._functionStack[i+1];
		     
		  switch( tokenType )
		  {
		    case this.IS_CONSTANT:
          if( token == this.E )
            opStack.push(Math.E);
          else if( token == this.PI )
            opStack.push(Math.PI);
        break;
          
        case this.IS_NUMBER: 
          opStack.push( parseFloat(token) );
        break;
		        
        case this.IS_ONE_ARG_FUNCTION:
          arg1 = opStack.pop();
                 
          f = this[token];  // access the function with the provided name, i.e. abs() or sin()
          if( f == null )
            return NaN;     // user entered an unsupported function or mis-typed coss instead of cos
              
          opStack.push( f(arg1) );
        break;
               
        case this.IS_TWO_ARG_FUNCTION:
          arg1 = opStack.pop(); 
          arg2 = opStack.pop();
                 
          f = this[token];
          if( f == null )
            return NaN;

          opStack.push( f(arg1,arg2) ); 
        break;
           
        case this.IS_VARIABLE:
          for( j=0; j<len; j++ )
          {
            if( token == this._variables[j] )
              opStack.push( variables[j] );
          }
        break;
	     	   
        default:
          return NaN;  // invalid token made its way into the function stack
      }
		      
		  i += 2;
    }
	 
	  return opStack[0];
  }

  // RPN function stack in RPN
  private __createFunctionStack(str: string): void
  {
    // easier to process LTR and then reverse than process RTL
    let len: number         = str.length;
    let position: number    = 0;
    let token: string       = "";
    let tokenType: string   = "";
    let tokenLength: number = 0;
  	    
  	this._functionStack.length = 0;
  	   
  	while( position < len )
    {
      token       = this.__nextToken(str, position);
      tokenType   = this.__getTokenType(token);
      tokenLength = token.length;
	       
	    if( !(tokenType == this.IS_NONE) )
	    {
	      if( tokenType == this.IS_CONSTANT || 
	          tokenType == this.IS_NUMBER   || 
	          tokenType == this.IS_VARIABLE || 
	          tokenType == this.IS_ONE_ARG_FUNCTION || 
	          tokenType == this.IS_TWO_ARG_FUNCTION )
        {
          this._functionStack.push( token     );
          this._functionStack.push( tokenType );
        }
      }
	    else
	      return;  
	       
	    position += tokenLength;
	  }
	     
	  // get RPN
	  this._functionStack = this._functionStack.reverse();
  }
  	 
  // internal method - process all tokens; errors cause blank string to be returned
  private __processTokens(str: string): string
  {
    // adding a negative is the same as subtracting, so +- is replaced with -
    let myStr: string = str;
    myStr             = myStr.replace("/\+-/g", this.MINUS);
  	   
    // exponentiation becomes POWER(base,exponent)
    if( myStr.indexOf("^") != -1 )
      myStr = this.__processExponentiation(myStr);
  	   
    // unary minus becomes SUBTRACT(0,argument)
    myStr = this.__processUnaryMinus(myStr);
  	   
    // remaining operators
    myStr = this.__processOperator(myStr, this.DIVISION      );
    myStr = this.__processOperator(myStr, this.MULTIPLICATION);
    myStr = this.__processOperator(myStr, this.MINUS         );
    myStr = this.__processOperator(myStr, this.PLUS          );
  	   
    if( !this.__validateParentheses(myStr) )
      return "";
  	   
    return myStr;
  }
  	 
  // internal method - process into a function pow(base,exponent) 
  private __processExponentiation(str: string): string
  { 
    // process from last exponent, back to beginning of string
    //
    // check there there is no exponentiation at the beginning or end of expression
    if( str.indexOf(this.EXPONENT) == 0 )
      return "";
    else if( str.charAt(str.length-1) == this.EXPONENT )
      return "";
      		
    // process until no more exponentiation symbols found
    let myStr: string       = str;
    let expIndex: number    = 0;
    let theBase: string     = "";
    let theExponent: string = "";
       
    let leftMarker: number;
    let rightMarker: number;
       
    while( myStr.indexOf(this.EXPONENT) != -1 )
    { 
      expIndex    = myStr.lastIndexOf(this.EXPONENT);
      theBase     = "";
      theExponent = "";
        
      // process backwards (or to the left) to get the base of the exponent
      leftMarker = this.__getBackwardArgument(str, expIndex);
      if( leftMarker == -1 )
        return "";
      else
        theBase = str.substring(leftMarker, expIndex); 
        
      // process forward of current position to get the exponent
      rightMarker = this.__getForwardArgument(str, expIndex);
      if( rightMarker == -1 )
        return "";
      else
        theExponent = str.substring(expIndex+1, rightMarker); 
        
      // in case the argument to the exponent is placed in parens
      theExponent = this.__stripParens(theExponent);
          
      // base^exponent replaced with pow(base,exponent)
      myStr = myStr.substring(0,leftMarker) + this.POWER + this.LEFT_PAREN + theBase + "," + theExponent + this.RIGHT_PAREN + myStr.substring(rightMarker,myStr.length+1);
    }
      
    return myStr;
  }
  	  
  // internal method - strip all left/right parens - expecting only one occurence of each
  private __stripParens(str: string): string
  {
    let tmp: string = str.replace(this.LEFT_PAREN, "");
  	return tmp.replace(this.RIGHT_PAREN, "");
  }
  	 
  // internal method - process unary minus operator - same as a SUBTRACT operation with zero as the first argument
  private __processUnaryMinus(str: string): string 
  { 
    let myStr: string = str;
     
    // can't have no minus sign :
    if( myStr.indexOf(this.MINUS) == -1 )
      return myStr;
  
    // can't have it the very end, either
    if( myStr.charAt(str.length-1) == this.MINUS )
      return "";

    let i: number   = 0;
    let j: number   = 0;
    let len: number = myStr.length;
       
    for( i=0; i<len; ++i )
    {
	    if( myStr.charAt(i) == this.MINUS && this.__isUnary(myStr.charAt(i-1)) )
	    {    
        j = this.__getForwardArgument(myStr, i);
        if( j == -1 )
          return ""; 
		   
        myStr = myStr.substring(0,i) + this.SUBTRACT + "(0," + myStr.substring(i+1,j) + this.RIGHT_PAREN + myStr.substring(j,myStr.length);
      }
    }

    return myStr;
  }
    
  // internal method, process operators with common logic
  private __processOperator(str: string, operator: string): string 
  { 
    let myStr: string        = str;
    let position: number     = 0;
    let leftMarker: number   = 0;
    let leftOperand: string  = "";
    let rightMarker: number  = 0;
    let rightOperand: string = "";
        
    if( myStr.indexOf(operator) == -1 )
      return myStr;
    else if( myStr.indexOf(operator) == 0 && operator != this.MINUS )
      return "";
    else if( myStr.charAt(myStr.length-1) == operator )
      return "";
    else
    { 
      while( myStr.indexOf(operator) != -1 )
      {
        position   = myStr.indexOf(operator);
	      leftMarker = this.__getBackwardArgument(myStr, position);
	          
	      if( leftMarker == -1 )
          return ""; 
        else
          leftOperand = myStr.substring(leftMarker,position); 
		
        rightMarker = this.__getForwardArgument(myStr, position);
	   
        if( rightMarker == -1 )
	        return ""; 
        else
          rightOperand = myStr.substring(position+1, rightMarker);
		
        // process +, -, *, and /
        switch( operator )
        {
          case this.PLUS:
            myStr = myStr.substring(0,leftMarker) + this.ADD + this.LEFT_PAREN + leftOperand + "," + rightOperand + 
                    this.RIGHT_PAREN + myStr.substring(rightMarker,myStr.length+1);
          break;
            
          case this.MINUS:
            myStr = myStr.substring(0,leftMarker) + this.SUBTRACT + this.LEFT_PAREN + leftOperand + "," + rightOperand + 
                    this.RIGHT_PAREN + myStr.substring(rightMarker,myStr.length+1);
          break;
            
          case this.MULTIPLICATION: 
	          myStr = myStr.substring(0,leftMarker) + this.MULTIPLY + this.LEFT_PAREN + leftOperand + "," + rightOperand + 
	                  this.RIGHT_PAREN + myStr.substring(rightMarker,myStr.length+1);
		      break;
		
		      case this.DIVISION:
	          myStr = myStr.substring(0,leftMarker) + this.DIVIDE + this.LEFT_PAREN + leftOperand + "," + rightOperand + 
	                  this.RIGHT_PAREN + myStr.substring(rightMarker,myStr.length+1);
		      break;
        } 
      }
		
      return myStr;
    }
  }
  	 
  // internal method - get argument of something to the right of marked position
  private __getForwardArgument(str: string, position: number): number
  {
  	let toRight: number = position+1;
    let len: number     = str.length;
        
    // character to immediate right of position marker
    let charToRight: string = str.charAt(position+1);
        
    // compensate for leading minus
    if( charToRight == this.MINUS )
    {  
      toRight++;
          
      if( toRight >= len )
        return -1;
      else
        charToRight = str.charAt(toRight);
    }
  
    // number?  If so, get next non-number
    if( this.__isNumber(charToRight) )
      return this.__getNextNonNumber(str, toRight+1);
    else if( this.__isLetter(charToRight) )
    { 
      toRight = this.__getNextNonChar(str, toRight+1);
      if( toRight == len-1 )
        return toRight;
        
      if( this.__isMathOperator( str.charAt(toRight) ) )
        return toRight;
        
      // open parent next?
      if( str.charAt(toRight) == this.LEFT_PAREN )
      {			
        // find matching right paren
        toRight = this.__matchLeftParen(str, toRight);
      }
    }
    else if( charToRight == this.LEFT_PAREN )
    {	
      // match the left paren
	    toRight = this.__matchLeftParen(str, toRight);
    }  
    else 
      return -1;
			  
    return toRight+1;
  }
  	 
  // internal method - get the argument of something left of parens
  private __getBackwardArgument(str: string, position: number): number 
  {
    let charAtLeft: string = str.charAt(position-1);
	  let toLeft: number     = position-1;
	     
    if( this.__isNumber(charAtLeft) )
    {   
      while( (this.__isNumber(str.charAt(toLeft)) || str.charAt(toLeft) == ".") && toLeft >= 0 )
        toLeft--; 
	  }  
    else if( this.__isLetter(charAtLeft) )
    {   
      while( this.__isLetter(str.charAt(toLeft)) && toLeft >= 0 )
        toLeft--; 
	  }
    else if( charAtLeft == this.RIGHT_PAREN )
    { 
	    toLeft = this.__matchRightParen(str, toLeft);
		   
      if( toLeft >= 0 && this.__isNumber(str.charAt(toLeft)) )
        return -1;
						 
      if( toLeft == 0 && str.charAt(toLeft) !=  this.MINUS && str.charAt(toLeft) != this.LEFT_PAREN )
	      return -1;
	
      if( toLeft > 0 && this.__isLetter(str.charAt(toLeft-1)) )
      {
        toLeft--;
        while( this.__isLetter(str.charAt(toLeft)) && toLeft >= 0 )
          toLeft--; 		   
      }			
	  }
    else 
      return -1;

    return toLeft+1;	
  }

  // internal method - validate all tokens in a string
  private __validateTokens(str: string): boolean
  {
    let curPosition: number = 0;
    let count: number       = 0;
        
    let len: number = str.length;
	     
	  // can't begin an expression with an operator, although a leading minus is okay
    let first: string = str.charAt(0);
    let last: string  = str.charAt(str.length-1);
        
    if( first != this.MINUS )
    {
      if( this.__isOperator(first) )
        return false;
    }
        
    let token: string;
    let tokenType: string;
    let tokenLength: number;
    let cp1: number;
    let prevChar: string;
    let firstAfterToken: number;
    let firstCharAfterToken: string;
        
    while( curPosition < len )
    {
      token       = this.__nextToken(str,curPosition);
      tokenType   = this.__getTokenType(token);
      tokenLength = token.length;
          
      if( tokenType != this.NONE )
      {
        cp1                 = curPosition - 1;
        prevChar            = curPosition == 0 ? "" : str.charAt(cp1);
        firstAfterToken     = curPosition + tokenLength;
        firstCharAfterToken = str.charAt(firstAfterToken);
			       
        if( tokenType == this.IS_ONE_ARG_FUNCTION )
        {
          if( !(firstCharAfterToken == this.LEFT_PAREN) )
            return false;						   
				
          if( curPosition > 0 && !(this.__isOperator(prevChar)) )
            return false;
					
          if( curPosition > 0 && prevChar == ")" )
            return false;
        }
		   
        if( tokenType == this.IS_VARIABLE )
        {
          if( token == this.PI || token == this.E )
            return false;
			
          if( curPosition > 0 && !(this.__isOperator(prevChar)) )
            return false;
					
          if( curPosition > 0 && prevChar == ")" )
            return false;
					
          if( firstAfterToken < len && !(this.__isOperator(firstCharAfterToken)) )
            return false;
					
          if( firstAfterToken < len && firstCharAfterToken == "(" )
            return false;
        }
          
        if( tokenType == this.IS_NUMBER )
        {
          if( curPosition > 0 && !(this.__isOperator(prevChar)) )
            return false;
					
          if( curPosition > 0 && prevChar == ")" ) 
            return false;
					
          if( firstAfterToken < len && !(this.__isOperator(firstCharAfterToken)) )
            return false;
            
          if( firstAfterToken < len && firstCharAfterToken == this.LEFT_PAREN )
            return false;
        }
			  
        if( token == this.LEFT_PAREN )
        { 
          if( firstAfterToken < len && this.OP_LIST_1.indexOf(firstCharAfterToken) != -1 )
            return false;
        }
				
        if( token == this.RIGHT_PAREN )
        {
          if( firstAfterToken < len && this.OP_LIST_2.indexOf(firstCharAfterToken) == -1 )
            return false;
					
          if( cp1 >= 0 && this.OP_LIST_3.indexOf(prevChar) != -1 )
            return false;
        }
				 
        if( token == this.COMMA )
        {
          if( curPosition==0 || curPosition==len-1 )
            return false;
				  
          if( firstAfterToken < len && this.OP_LIST_2.indexOf(firstCharAfterToken) >= 0 )
            return false;
					
          if( cp1 >=0 && this.OP_LIST_3.indexOf(prevChar) >= 0 )
            return false;
        }
				 
        if( this.MATH_OPERATORS.indexOf(token) != -1 )
        {
          if( this.OP_LIST_1.indexOf(firstCharAfterToken) != -1 )
            return false;
			 
          if( this.OP_LIST_4.indexOf(prevChar) >= 0 && token != "-" )
            return false;
        }
      }
      else 
        return false;
	
      curPosition += tokenLength;
	    count       += 1;
    }
	     
	  return true;
  }
  	 
  // internal method - get the token type
  private __getTokenType(token: string): string
  {
    if( token == this.PI || token == this.E )
      return this.IS_CONSTANT;
		      
    if( this.__isOneArgFunction(token) )
      return this.IS_ONE_ARG_FUNCTION;
  	   
    if( this.__isOperator(token) )
      return this.IS_OPERATOR;
  	   
    if( this.__isVariable(token) )
      return this.IS_VARIABLE;
  	   
    if( this.__isNumber(token) )
      return this.IS_NUMBER;
  	   
    if( this.__isTwoArgFunction(token) )
      return this.IS_TWO_ARG_FUNCTION;
  	   
    return this.NONE;
  }
	
  // internal method - validate characters as expected by the parser
  private __validateChars(str: string): boolean
  {
    let i: number;
    let myChar: string;
    let legalCount: number;
    let l: number = str.length;
        
    for (i; i<l; ++i)
    {
      myChar = str.charAt(i);
	
      // string must contain number, letter, or operator
	    legalCount  = this.NUMBERS.indexOf(myChar);
	    legalCount += this.LETTERS.indexOf(myChar);
	    legalCount += this.OPERATORS.indexOf(myChar);
	       
	    if (legalCount == -3)
        return false;
	  }
	     
	  return true;
  }
    
  // internal method - validate parentheses for balance
  private __validateParentheses(str: string): boolean
  {
    let i: number;
    let char: string;
	  let leftCount: number  = 0;
	  let rightCount: number = 0;
	  let l: number          = str.length;
	      
	  for (i=0; i<l; ++i)
	  {
	    char = str.charAt(i);
      if (char == this.LEFT_PAREN)
        leftCount++;
      else if (char == this.RIGHT_PAREN)
        rightCount++;
    }
		
    return leftCount == rightCount;
  }
    
  // internal method - get next token in sequence
  private __nextToken(str: string, position: number): string 
  {
    let len: number = str.length;
    let char: string;
    let end: number;
        
    if (position >= len)
      return this. NONE; 
    else 
    {
      let char: string = str.charAt(position);
      if( this.__isLetter(char) )
      {
        end = this.__getNextNonChar(str, position+1);
	
        return str.substring(position, end);
      }
					  
      if( this.__isNumber(char) )
      {
        end = this.__getNextNonNumber(str, position+1);
		 
	      return str.substring(position, end);
      }
			 		  
      if( this.__isOperator(char) )
        return char;
		  
      return this.NONE;
    }
  }

  // internal method - is the supplied string a one-argument function?
  private __isOneArgFunction(str: string): boolean
  {
    let i: number;
    let len: number = this.ONE_ARG_FUNCTIONS.length;
        
    for (i=0; i<len; ++i)
    {	
      if  (str == this.ONE_ARG_FUNCTIONS[i])
        return true;
    }
      	
    return false;
  }
    
  // internal method - is the supplied string a two-argument function?
  private __isTwoArgFunction(str: string): boolean
  {
    let i: number;
    let len: number = this.TWO_ARG_FUNCTIONS.length;
        
    for (i=0; i<len; ++i)
	  {	
	    if (str == this.TWO_ARG_FUNCTIONS[i])
	      return true;
    }
      	
	  return false;
  }
    
  // internal method - is the supplied string a variable?
  private __isVariable(str: string): boolean
  {
    let i: number;
    let len: number = this._variables.length;
        
	  for (i=0; i<len; ++i)
    {
      if (str == this._variables[i])
        return true;
    }
	
    return false;
  }
    
  // internal method - is the supplied string a valid letter
  private __isLetter(str: string): boolean 
  { 
    return this.LETTERS.indexOf(str) != -1;
  }
    
  // internal method - is the supplied string a numbber
  private __isNumber(str: string): boolean 
  { 
    let x: number = parseFloat(str);
    return !isNaN(x) && isFinite(x);
  }
    
  // internal method - is the supplied string an operator?
  private __isOperator(str: string) 
  { 
    return this.OPERATORS.indexOf(str) != -1;
  }
    
  // internal method - is the supplied string a math operator?
  private __isMathOperator(str: string): boolean 
  { 
    return this.MATH_OPERATORS.indexOf(str) != -1;
  }
    
  // internal method - trim the input string for specific purposes of the function parser
  private __trim(str: string): string
  {
    let myStr: string = "";
    var len: number   = str.length;
    var l1: number    = str.length - 1;      
    var i: number;

    for (i=0; i<len; ++i) 
    {
      if (str.charCodeAt(i) > 32) 
        myStr += str.charAt(i);
    } 
      
    return myStr;
  }
    
  // internal method - get the next non-character position in a string, starting at the supplied position
  private __getNextNonChar(str: string, position: number): number
  {
    var c: string = str.charAt(position);
    var i: number = position;
    var l: number = str.length;
      
    while( this.LETTERS.indexOf(c) != -1 && i < l )
    {
      i++;
      c = str.charAt(i);
    }
      
    return i;
  }
      
  // internal method - get the next non-number position, starting at the supplied position, and going in the specified direction - note that 2.5, for example, is a number
  private __getNextNonNumber(str: string, position: number, dir: number=1)
  {
    // tbd, make 'dir' an enum
        
    let c: string = str.charAt(position);
    let i: number = position;
    let l: number = str.length;
      
    if (dir == 1)
    {
      while( this.NUMBERS.indexOf(c) != -1 && i < l )
      {
        i++;
        c = str.charAt(i);
      }
    }
    else
    {
      while( this.NUMBERS.indexOf(c) != -1 && i >= 0 )
      {
        i--;
        c = str.charAt(i);
      }
    }
      
    return i;
  }
    
  // internal method - get the next non-operator position, starting at the supplied position
  private __getNextNonOperator(str: string, position: number): number
  { 
    let c: string = str.charAt(position);
    let i: number = position;
    let l: number = str.length;
      
    while (this.OPERATORS.indexOf(c) != -1 && i < l)
    {
      i++;
      c = str.charAt(i);
    }
      
    return i;
  }
    
  // internal method - is the character unary?
  private __isUnary(char: string): boolean
  {
    return this.UNARY.indexOf(char) != -1;
  }
    
  // internal method - from starting position of a left paren, find the matching right paren taking nested parens into account
  private __matchLeftParen(str: string, start: number): number
  {
    // str.charAt(start) should be "("
    let leftCount: number  = 1;
    let rightCount: number = 0;
    let len: number        = str.length;
    let index: number      = -1;
    let i: number;
    let char: string;
        
    for (i=start+1; i<len; ++i)
    {
      char = str.charAt(i);
      if (char == this.LEFT_PAREN)
        leftCount++;
        
      if (char == this.RIGHT_PAREN)
      {
        rightCount ++;
        if (rightCount == leftCount)
        {
          index = i;
          break;
        }
      }
    }
      
    return index;
  }
    
  // internal method, from the starting position of a right paren, find the matching left paren taking nested paren into account. 
  private __matchRightParen(str: string, start: number): number
  {
    // str.charAt(start) should be ")"
    let leftCount: number  = 0;
    let rightCount: number = 1;
    let len: number        = str.length;
    let index: number      = -1;
    let i: number;
    let char: string;

    for (i=start-1; i>=0; i--)
    {
      char = str.charAt(i);
      if (char == this.RIGHT_PAREN)
        rightCount++;
        
      if (char == this.LEFT_PAREN)
      {
        leftCount ++;
        if (rightCount == leftCount)
        {
          index = i;
          break;
        }
      }
    }
      
    return index;
  }
}