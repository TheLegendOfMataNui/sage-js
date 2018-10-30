# SAGE-JS RES-OSI

The main OSI resource module for SAGE-JS.


# Overview

Provides an API for working with OSI files.

Includes a number of abstract instructions that can be used to make manipulating assembly easier.


# Instructions

## Abstract

| Name                             | Size | Args          | Info                                                                                       |
|----------------------------------|------|---------------|--------------------------------------------------------------------------------------------|
| JumpTarget                       | 0    | i32u          | Target for PushConstanti32JumpTarget with same ID                                          |
| PushConstanti32JumpTarget        | 5    | i32u i32s     | Replaces PushConstanti32 before JumpRelative references JumpTarget with target and offset* |
| BranchTarget                     | 0    | i32u          | Target for CompareAndBranchIfFalseTarget and BranchAlwaysTarget with same ID               |
| BranchAlwaysTarget               | 3    | i32u i16s     | Replaces BranchAlways, with target and offset*                                             |
| CompareAndBranchIfFalseTarget    | 3    | i32u i16s     | Replaces CompareAndBranchIfFalse, with target and offset*                                  |
| PushConstantStringString         | 3    | sp8n          | Replaces PushConstantString with inline strings from string table                          |
| GetThisMemberFunctionString      | 3    | sp8n          | Replaces GetThisMemberFunction with inline strings from symbol table                       |
| GetThisMemberValueString         | 3    | sp8n          | Replaces GetThisMemberValue with inline strings from symbol table                          |
| SetThisMemberValueString         | 3    | sp8n          | Replaces SetThisMemberValue with inline strings from symbol table                          |
| GetMemberFunctionString          | 3    | sp8n          | Replaces GetMemberFunction with inline strings from symbol table                           |
| GetMemberValueString             | 3    | sp8n          | Replaces GetMemberValue with inline strings from symbol table                              |
| SetMemberValueString             | 3    | sp8n          | Replaces SetMemberValue with inline strings from symbol table                              |
| GetGameVariableString            | 2    | sp8n sp8n     | Replaces GetGameVariable with inline strings from string table                             |
| SetGameVariableString            | 2    | sp8n sp8n     | Replaces SetGameVariable with inline strings from string table                             |
| CallGameFunctionString           | 3    | sp8n sp8n i8s | Replaces CallGameFunction with inline strings from string table                            |
| CallGameFunctionFromStringString | 2    | sp8n i8s      | Replaces CallGameFunctionFromString with inline string from string table                   |

\* Instructions that jump to targets include an offset to handle jumps to point between instructions (compensates for off-by-one error in some original code).

## BCL

| Byte | Name                        | Size | Args          | Stack | Info                                                            |
|------|-----------------------------|------|---------------|-------|-----------------------------------------------------------------|
| 0x00 | Nop                         | 1    |               |       | Do nothing                                                      |
| 0x02 | DebugOn                     | 1    |               |       | Enable debug or fail if disabled in engine                      |
| 0x03 | DebugOff                    | 1    |               |       | Disable debug or fail if disabled in engine                     |
| 0x04 | LineNumber                  | 5    | i16u i16u     |       | Source line, possibly for assembly line and column              |
| 0x05 | LineNumberAlt1              | 5    | i16u i16u     |       | Source line, line number, source file index                     |
| 0x06 | LineNumberAlt2              | 5    | i16u i16u     |       | Source line number, unknown                                     |
| 0x10 | SetMemberValue              | 3    | i16u          | -2    | Set object property by symbol index                             |
| 0x11 | GetMemberValue              | 3    | i16u          | -1 +1 | Get object property by symbol index                             |
| 0x12 | GetMemberFunction           | 3    | i16u          | -1 +1 | Get object method address by symbol index                       |
| 0x13 | CreateObject                | 3    | i16u          |    +1 | Create an object by class ID                                    |
| 0x14 | MemberFunctionArgumentCheck | 2    | i8s           |    +N | Check the arg count <= N and add N number of stack variables    |
| 0x15 | SetThisMemberValue          | 3    | i16u          | -1    | Set this property by symbol index                               |
| 0x16 | GetThisMemberValue          | 3    | i16u          |    +1 | Get this property by symbol index                               |
| 0x17 | GetThisMemberFunction       | 3    | i16u          |    +1 | Get this method address by symbol index                         |
| 0x18 | GetMemberValueFromString    | 1    |               | -2 +1 | Get object property by string index                             |
| 0x19 | GetMemberFunctionFromString | 1    |               | -2 +1 | Get object property by string index                             |
| 0x1A | SetMemberValueFromString    | 1    |               | -3    | Set object method address by string index                       |
| 0x21 | GetVariableValue            | 3    | i16u          |    +1 | Get variable by index (highest bit means global)                |
| 0x22 | SetVariableValue            | 3    | i16u          | -1    | Set variable by index (highest bit means global)                |
| 0x23 | CreateStackVariables        | 2    | i8s           |    +N | Add N number of stack variables                                 |
| 0x24 | IncrementVariable           | 3    | i16u          |       | Increment variable by index (highest bit means global)          |
| 0x25 | DecrementVariable           | 3    | i16u          |       | Decrement variable by index (highest bit means global)          |
| 0x30 | Pop                         | 1    |               | -1    | Pop a value off the stack                                       |
| 0x31 | PopN                        | 2    | i8s           | -N    | Pop N values off the stack                                      |
| 0x32 | Swap                        | 1    |               | -2 +2 | Swap last 2 values on stack                                     |
| 0x33 | Pull                        | 2    | i8s           |    +1 | Duplicate stack value by index onto stack                       |
| 0x34 | DupN                        | 2    | i8s           |    +N | Duplicate last stack value N times                              |
| 0x35 | Dup                         | 1    |               |    +1 | Duplicate last stack value                                      |
| 0x40 | PushConstanti32             | 5    | i32s          |    +1 | Push constant integer value                                     |
| 0x41 | PushConstanti24             | 4    | int24s        |    +1 | *Unimplemented*                                                 |
| 0x42 | PushConstanti16             | 3    | i16s          |    +1 | Push constant integer value                                     |
| 0x43 | PushConstanti8              | 2    | i8s           |    +1 | Push constant integer value                                     |
| 0x44 | PushConstantf32             | 5    | f32           |    +1 | Push constant float value                                       |
| 0x45 | PushConstant0               | 1    |               |    +1 | Push constant integer value 0                                   |
| 0x46 | PushConstantString          | 3    | i16u          |    +1 | Push string from string table                                   |
| 0x47 | PushNothing                 | 1    |               |    +1 | Push the nothing type                                           |
| 0x48 | PushConstantColor8888       | 5    | i32u          |    +1 | Push constant color value                                       |
| 0x49 | PushConstantColor5551       | 3    | i16u          |    +1 | Push constant color value                                       |
| 0x50 | JumpRelative                | 2    | i8s           | -1    | Jump to popped address relative to file start                   |
| 0x51 | JumpAbsolute                | 2    | i8s           | -1    | Jump to popped address in memory                                |
| 0x52 | Return                      | 1    |               | ?\*   | Return from current subroutine                                  |
| 0x53 | CompareAndBranchIfFalse     | 3    | i16s          | -1    | Jump N number of bytes from after instruction if false or i0    |
| 0x54 | BranchAlways                | 3    | i16s          |       | Jump N number of bytes from after instruction                   |
| 0x60 | EqualTo                     | 1    |               | -2 +1 | Compare last 2 values on stack                                  |
| 0x61 | LessThan                    | 1    |               | -2 +1 | Compare last 2 values on stack                                  |
| 0x62 | GreaterThan                 | 1    |               | -2 +1 | Compare last 2 values on stack                                  |
| 0x63 | LessOrEqual                 | 1    |               | -2 +1 | Compare last 2 values on stack                                  |
| 0x64 | GreaterOrEqual              | 1    |               | -2 +1 | Compare last 2 values on stack                                  |
| 0x6A | And                         | 1    |               | -2 +1 | Check last 2 values on stack are both true                      |
| 0x6B | Or                          | 1    |               | -2 +1 | Check last 2 values on stack are have true                      |
| 0x6C | Not                         | 1    |               | -2 +1 | Check last 2 values on stack are not true                       |
| 0x6D | BitwiseAnd                  | 1    |               | -2 +1 | Bitwise and last 2 values on stack                              |
| 0x6E | BitwiseOr                   | 1    |               | -2 +1 | Bitwise or last 2 values on stack                               |
| 0x6F | BitwiseXor                  | 1    |               | -2 +1 | Bitwise xor last 2 values on stack                              |
| 0x70 | Add                         | 1    |               | -2 +1 | Add the last 2 values on stack                                  |
| 0x71 | Subtract                    | 1    |               | -2 +1 | Subtract the last 2 values on stack                             |
| 0x72 | Multiply                    | 1    |               | -2 +1 | Multiply the last 2 values on stack                             |
| 0x73 | Divide                      | 1    |               | -2 +1 | Divide the last 2 values on stack                               |
| 0x74 | Power                       | 1    |               | -2 +1 | Raise to power the last 2 values on stack                       |
| 0x75 | Modulus                     | 1    |               | -2 +1 | Modulus operator the last 2 values on stack                     |
| 0x76 | BitwiseNot                  | 1    |               | -1 +1 | Bitwise not last value on stack                                 |
| 0x77 | ShiftLeft                   | 1    |               | -2 +1 | Bitwise shift left last 2 values on stack                       |
| 0x78 | ShiftRight                  | 1    |               | -2 +1 | Bitwise shift right last 2 values on stack                      |
| 0x7A | Increment                   | 1    |               | -1 +1 | Increment value of last value on stack by 1                     |
| 0x7B | Decrement                   | 1    |               | -1 +1 | Decrement value of last value on stack by 1                     |
| 0x80 | GetGameVariable             | 5    | i16u i16u     |       | Get variable by ns and name string index *seems non-functional* |
| 0x81 | SetGameVariable             | 5    | i16u i16u     |       | Set variable by ns and name string index *seems non-functional* |
| 0x82 | CallGameFunction            | 6    | i16u i16u i8s | ?\*   | Call native by ns and name string index, N args                 |
| 0x83 | CallGameFunctionFromString  | 6    | i16u i8s      | ?\*   | Call native by ns string index and stack string, N args         |
| 0x84 | CallGameFunctionDirect      | 6    | i32s i8s      | ?\*   | Call native by address, N args (*should only exist in memory*)  |
| 0x90 | CreateArray                 | 1    |               | +1    | Create array                                                    |
| 0x91 | GetArrayValue               | 1    |               | -2 +1 | Get array or string table element                               |
| 0x92 | ElementsInArray             | 1    |               | -1 +1 | Get array or string table length                                |
| 0x93 | SetArrayValue               | 1    |               | -3    | Set array element                                               |
| 0x94 | AppendToArray               | 1    |               | -2    | Push array element                                              |
| 0x95 | RemoveFromArray             | 1    |               | -2    | Remove array element at index                                   |
| 0x96 | InsertIntoArray             | 1    |               | -3    | Add array element at index                                      |
| 0xA0 | SetRedValue                 | 1    |               | -2 +1 | Set color red value                                             |
| 0xA1 | SetGreenValue               | 1    |               | -2 +1 | Set color green value                                           |
| 0xA2 | SetBlueValue                | 1    |               | -2 +1 | Set color blue value                                            |
| 0xA3 | SetAlphaValue               | 1    |               | -2 +1 | Set color alpha value                                           |
| 0xA4 | GetRedValue                 | 1    |               | -1 +1 | Get color red value                                             |
| 0xA5 | GetGreenValue               | 1    |               | -1 +1 | Get color green value                                           |
| 0xA6 | GetBlueValue                | 1    |               | -1 +1 | Get color blue value                                            |
| 0xA7 | GetAlphaValue               | 1    |               | -1 +1 | Get color alpha value                                           |
| 0xB0 | ConvertToString             | 1    |               | -1 +1 | Convert last stack element to string                            |
| 0xB1 | ConvertToFloat              | 1    |               | -1 +1 | Convert last stack element to float                             |
| 0xB2 | ConvertToInteger            | 1    |               | -1 +1 | Convert last stack element to integer                           |
| 0xB8 | IsInteger                   | 1    |               | -1 +1 | Check if last stack element is integer                          |
| 0xB9 | IsFloat                     | 1    |               | -1 +1 | Check if last stack element is float                            |
| 0xBA | IsString                    | 1    |               | -1 +1 | Check if last stack element is string                           |
| 0xBB | IsAnObject                  | 1    |               | -1 +1 | Check if last stack element is an object                        |
| 0xBC | IsGameObject                | 1    |               | -1 +1 | Check if last stack element is a game object                    |
| 0xBD | IsArray                     | 1    |               | -1 +1 | Check if last stack element is array                            |
| 0xBF | GetObjectClassID            | 1    |               | -1 +1 | Get object class ID                                             |
| 0xFF | Halt                        | 1    |               |    +1 | Halt execution                                                  |

\* Unclear how many values are pushed and/or popped under what conditions.
