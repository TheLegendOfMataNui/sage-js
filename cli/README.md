# SAGE-JS CLI

The command line utility for SAGE-JS.


# Overview

The module is the command line utility for functionality provided by SAGE-JS.


# Usage
<!-- usage -->
```sh-session
$ npm install -g @sage-js/cli
$ sage-js COMMAND
running command...
$ sage-js (-v|--version|version)
@sage-js/cli/0.9.0 darwin-x64 node-v10.5.0
$ sage-js --help [COMMAND]
USAGE
  $ sage-js COMMAND
...
```
<!-- usagestop -->


# Commands
<!-- commands -->
* [`sage-js help [COMMAND]`](#sage-js-help-command)
* [`sage-js info`](#sage-js-info)
* [`sage-js res:osi:asm:assemble ASM OSI`](#sage-js-resosiasmassemble-asm-osi)
* [`sage-js res:osi:asm:disassemble OSI ASM`](#sage-js-resosiasmdisassemble-osi-asm)

## `sage-js help [COMMAND]`

display help for sage-js

```
USAGE
  $ sage-js help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.0.5/src/commands/help.ts)_

## `sage-js info`

display info about program

```
USAGE
  $ sage-js info

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/info.ts](https://github.com/TheLegendOfMataNui/sage-js/blob/v0.9.0/src/commands/info.ts)_

## `sage-js res:osi:asm:assemble ASM OSI`

assemble an osi file

```
USAGE
  $ sage-js res:osi:asm:assemble ASM OSI

ARGUMENTS
  ASM  assembly file to assemble
  OSI  osi file to output

OPTIONS
  -h, --help  show CLI help

ALIASES
  $ sage-js res:osi:asm:a
```

_See code: [src/commands/res/osi/asm/assemble.ts](https://github.com/TheLegendOfMataNui/sage-js/blob/v0.9.0/src/commands/res/osi/asm/assemble.ts)_

## `sage-js res:osi:asm:disassemble OSI ASM`

disassemble an osi file

```
USAGE
  $ sage-js res:osi:asm:disassemble OSI ASM

ARGUMENTS
  OSI  osi file to disassemble
  ASM  assembly file to output

OPTIONS
  -h, --help                    show CLI help
  --no-transform-branch         no transform branch targets (not position independent)
  --no-transform-class          no transform class inline
  --no-transform-class-symbols  no transform class symbols inline
  --no-transform-global         no transform global inline
  --no-transform-jump           no transform jump targets (not position independent)
  --no-transform-string         no transform string inline
  --no-transform-symbol         no transform symbol inline

ALIASES
  $ sage-js res:osi:asm:d
```

_See code: [src/commands/res/osi/asm/disassemble.ts](https://github.com/TheLegendOfMataNui/sage-js/blob/v0.9.0/src/commands/res/osi/asm/disassemble.ts)_
<!-- commandsstop -->
