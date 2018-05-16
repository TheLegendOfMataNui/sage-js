grammar ASM;




// Parser rules:
file
: statements EOF
;

statements
: statement*
;

statement
: line
| instruction
| block
;

line
: comment NL
;

instruction
: identifier arguments comment NL
;

block
: begin statements end
;

begin
: BEGIN identifier arguments comment NL
;

end
: END comment NL
;

arguments
:
| argument (COMMA argument)*
;

argument
: argumentNumber
| argumentString
;

argumentNumber
: NUMBER
;

argumentString
: STRING
;

comment
:
| COMMENT
;

identifier
: IDENTIFIER
;




// Lexer rules:
COMMENT
: ';' ~[\r\n]*
;

BEGIN
: 'begin'
;

END
: 'end'
;

COMMA
: ','
;

STRING
: '"' (STRING_ESC | STRING_CHARS)* '"'
;

NUMBER
: FLOAT
| INT
| INT_HEX
| INT_BIN
| INT_OCTAL
| INFINITY
| NAN
;

IDENTIFIER
: [_a-zA-Z][_a-zA-Z0-9]*
;

NL
: ('\r\n' | '\r' | '\n')
;

WS
: [ \t]+ -> skip
;




// Fragments:
fragment INT
: [-+]? ('0' | [1-9][0-9]*)
;

fragment FLOAT
: INT? ('.' [0-9]*) EXP?
| [-+] ('.' [0-9]*) EXP?
| INT EXP
;

fragment INFINITY
: [-+]? 'Infinity'
;

fragment NAN
: 'NaN'
;

fragment EXP
: [Ee] INT
;

fragment INT_HEX
: [-+]? '0x' HEX+
;

fragment INT_BIN
: [-+]? '0b' [01]+
;

fragment INT_OCTAL
: [-+]? '0o' [0-7]+
;

fragment HEX
: [0-9a-fA-F]
;

fragment STRING_UNICODE
: 'u' HEX HEX HEX HEX
;

fragment STRING_ESC
: '\\' (["\\/bfnrt] | STRING_UNICODE)
;

fragment STRING_CHARS
: ~ ["\\\u0000-\u001F]
;
