<div align="center">
  <img src="https://raw.githubusercontent.com/punicasuite/punica-python/master/punica.png" height="200" width="200"><br><br>
</div>

# Punica TS

<!-- TOC -->



- [1. Overview](#1-overview)
- [2. Setting up the development environment](#2-setting-up-the-development-environment)
- [3. Install](#3-install)
- [4. Quickstart](#4-quickstart)
    - [4.1. Create a Project](#41-create-a-project)
        - [4.1.1. Initializing a New Project](#411-initializing-a-new-project)
	- [4.1.2. Creating a Box Project](#412-creating-a-box-project)
    - [4.2. Compiling](#42-compiling)
    - [4.3. Deployment](#43-deployment)
    - [4.4. Invocation](#44-invocation)
    - [4.5. Node](#45-node)
    - [4.6. Scpm](#46-scpm)
    - [4.7  Smartx](#47-smartx)
    - [4.8  Test](#48-test)
    - [4.9  Wallet](#49-wallet)
    - [4.10  Tool](#410-tool)
    	- [4.10.1  Transform tool](#4101-tool-transform)
- [5. Example](#5-example)
    - [5.1. Checkout Version](#51-checkout-version)
    - [5.2. Unbox Tutorialtoken](#52-unbox-tutorialtoken)
    - [5.3. Compile Contract](#53-compile-contract)
    - [5.4. Deploy Smart Contract](#54-deploy-smart-contract)
    - [5.5. Invoke Function in Smart Contract](#55-invoke-function-in-smart-contract)

<!-- /TOC -->



## 1. Overview

Welcome to Punica! Punica has (almost) everything you need for Ontology DApp development.

```shell
punica-ts
Usage: punica-ts [options] [command]

Punica CLI - The Ontology Blockchain dApp development framework

Options:
  -v, --version         output the version number
  -p, --project [PATH]  specify a punica project directory
  -d, --debug           print exceptions
  -h, --help            output usage information

Commands:
  init                  initialize new and empty Ontology DApp project
  unbox [options]       download a Punica Box, a pre-built Ontology DApp project.
  compile [options]     compile the specified contracts to avm and abi files
  deploy [options]      deploy the specified contracts to specified chain
  invoke [options]      invoke the function list in default-config or specify config.
  list [options]        list all the function in default-config or specified config.
  smartx                Ontology smart contract IDE,SmartX (http://smartx.ont.io/)
  node                  Ontology Blockchain private net in test mode
  test                  test Smart contracts
  wallet                manage your ontid, account, asset
  tool                  tooling functions
```

## 2. Setting up the development environment

There are a few technical requirements before we start. Please install the following:

- [Node.js 10.0.0] (https://nodejs.org)
- [Npm] (https://www.npmjs.com) - installed with Node.js

### Developing and Running

Execute these commands in the project's root directory:

#### Download
```
git clone 'https://github.com/OntologyCommunityDevelopers/punica-ts.git'
cd punica-ts
```

#### Install dependencies

```
npm install
```

#### Build
This will build the project with minimum polyfilling for better debug experience.

````
npm run build
````

You will get the packaged code under '/lib'.



## 3. Global install without building

```shell
npm install punica-ts -g
```

## 4. Quickstart

To use most Punica commands, you need to run them against an existing Punica project. So the first step is to create a Punica project.

### 4.1. Create a Project

#### 4.1.1. Initializing a New Project

You can create a bare Punica project with no smart contracts included, use `punica-ts init` command.

Once this operation is completed, you'll now have a project structure with the following items:

- `contracts/`: Directory for Ontology smart contracts.
- `src/`: Directory for DApp source file.
- `test/`: Directory for test files for testing your application and contracts.
- `wallet/`: Directory for save Ontology wallet file.

```shell
punica-ts init --help
Usage: init [options]

initialize new and empty Ontology DApp project

Options:
  -h, --help  output usage information
```

**Note**: If you not run punica cli in you project root directory, you need to use `-p` or `--project` option to specify your DApp project's path.

#### 4.1.2. Creating a Box Project

You can create a bare project template, but for those just getting started, you can use Punica Boxes, which are example applications and project templates.

We'll use the [ontology-tutorialtoken box](https://github.com/wdx7266/ontology-tutorialtoken), which creates a OEP4 token that can be transferred between accounts:

- Create a new directory for your Punica project:

```shell
mkdir tutorialtoken
cd tutorialtoken
```

- Download ("unbox") the MetaCoin box:

```shell
punica-ts unbox --box_name tutorialtoken
```

```shell
punica-ts unbox --help
Usage: unbox [options]

download a Punica Box, a pre-built Ontology DApp project.

Options:
  --box_name <BOX_NAME>  specify which box to unbox
  -h, --help             output usage information
```

**Note**:

- You can use the `punica-ts unbox --box_name <box-name>` command to download any of the other Punica Boxes.
- If you not run punica cli in you project root directory, you need to use `-p` or `--project` option to specify your DApp project's path.



### 4.2. Compiling

You can use the following command to compile your Ontology smart contracts:

```shell
punica-ts compile
```

If everything goes smoothly, you can find the `avm` and `abi` file in `contracts/build` folder.

```shell
contacts
    ├─build
    │      contract.avm
    │      contract_abi.json
```

For more usage, you can use `punica-ts compile --help` command.

```shell
punica-ts compile --help
Usage: compile [options]

compile the specified contracts to avm and abi files

Options:
  --contracts [CONTRACTS]  specify contracts files in contracts dir
  -h, --help               output usage information
```

**Note**: If you not run punica cli in you project root directory, you need to use `-p` or `--project` option to specify your DApp project's path.

### 4.3. Deployment

To deploy your contract, run the following:

```shell
punica-ts deploy
```

This will deploy your smart contract in `build` directory.

A simple deployment process looks like this:

```shell
Deploying...
Using network 'testNet'.
Running deployment: hello_ontology.avm
Contract has been deployed to address 0x24ed10357c6a6506297367f29ed80065a42a4625.
```

For more usage, you can use `punica-ts deploy --help` command.

```shell
punica-ts deploy --help
Usage: deploy [options]

deploy the specified contracts to specified chain

Options:
  --network [NETWORK]  specify which network the contracts will be deployed to
  --avm [AVM]          specify which avm file will be deployed
  --wallet [WALLET]    specify which wallet file will be used
  --config [CONFIG]    specify which deploy config file will be used
  -h, --help           output usage information
```

**Note**:

- If you not run punica cli in you project root directory, you need to use `-p` or `--project` option to specify your DApp project's path.
- If multi `avm` file exist in your `build` directory, you need to use `--avm` option to specify which contract you want to deploy.
- If multi wallet file exist in your `wallet` directory, you may need to use `--wallet` option to specify which wallet you want to use. otherwise, a random wallet file in `wallet` directory will be used.

### 4.4. Invocation

If you want to invoke a list of function in your deployed smart contract, a convenience way is to use `invoke` command.

Suppose we have an invoke config in our `default-config.json`:

```json
"invokeConfig":{
    "abi": "oep4_token_abi.json",
    "defaultPayer": "ANH5bHrrt111XwNEnuPZj6u95Dd6u7G4D6",
    "gasPrice": 0,
    "gasLimit": 21000000,
    "functions": [
        {   
	    "name": "Name",
            "params": {},
            "signers": {},
            "preExec": true
        },
	{
            "name": "Symbol",
            "params": {},
            "signers": {},
            "preExec": true
        },
	{
            "name": "Decimal",
            "params": {},
            "signers": {},
            "preExec": true
        },
        {
	    "name": "TotalSupply",
            "params": {},
            "signers": {},
            "preExec": true
        },
        {
	    "name":"BalanceOf",
            "params": {
                "account": "ByteArray:ANH5bHrrt111XwNEnuPZj6u95Dd6u7G4D6"
            },
            "signers": {},
            "preExec": true
        },
        {
	    "name": "Transfer",
            "params": {
                "from_acct": "ByteArray:ANH5bHrrt111XwNEnuPZj6u95Dd6u7G4D6",
                "to_acct": "ByteArray:AazEvfQPcQ2GEFFPLF1ZLwQ7K5jDn81hve",
                "amount": 1
            },
            "signers": {
                "m": 1,
                "signer": ["ANH5bHrrt111XwNEnuPZj6u95Dd6u7G4D6"]
            },
            "preExec": false
        },
        {
	    "name": "TransferMulti",
            "params": {
                "args": [
                    {
                        "from": "ByteArray:ANH5bHrrt111XwNEnuPZj6u95Dd6u7G4D6",
                        "to": "ByteArray:AazEvfQPcQ2GEFFPLF1ZLwQ7K5jDn81hve",
                        "amount": 1
                    },
                    {
                        "from": "ByteArray:AazEvfQPcQ2GEFFPLF1ZLwQ7K5jDn81hve",
                        "to": "ByteArray:Ad4H6AB3iY7gBGNukgBLgLiB6p3v627gz1",
                        "amount": 2
                    }
                ]
            },
            "signers": {
                "m": 1,
                "signer": ["ANH5bHrrt111XwNEnuPZj6u95Dd6u7G4D6", "AazEvfQPcQ2GEFFPLF1ZLwQ7K5jDn81hve"]
            },
            "payer": "ANH5bHrrt111XwNEnuPZj6u95Dd6u7G4D6",
            "preExec": false
        },
        {
	    "name": "Allowance",
            "params": {
                "owner": "ByteArray:ANH5bHrrt111XwNEnuPZj6u95Dd6u7G4D6",
                "spender": "ByteArray:AazEvfQPcQ2GEFFPLF1ZLwQ7K5jDn81hve"
            },
            "signers": {
                "m": 1,
                "signer": ["ANH5bHrrt111XwNEnuPZj6u95Dd6u7G4D6"]
            },
            "preExec": false
        },
        {
	    "name": "TransferFrom",
            "params": {
                "sender": "ByteArray:AazEvfQPcQ2GEFFPLF1ZLwQ7K5jDn81hve",
                "from_acct": "ByteArray:ANH5bHrrt111XwNEnuPZj6u95Dd6u7G4D6",
                "to_acct": "ByteArray:Ad4H6AB3iY7gBGNukgBLgLiB6p3v627gz1",
                "amount": 1
            },
            "signers": {
                "m": 1,
                "signer": ["ANH5bHrrt111XwNEnuPZj6u95Dd6u7G4D6"]
            },
            "preExec": false
        },
        {
	    "name": "Init",
            "params": {},
            "signers": {},
            "preExec": true
        }
    ]
}
```
To view the functions that can call:

```shell
punica-ts list
```

The following output we will get:
```shell
All Functions:
         Init
         Name
         Symbol
         Decimal
         TotalSupply
         BalanceOf
         Transfer
         TransferMulti
         Allowance
         TransferFrom
```

To run our invoke function list, run the following:

`punica-ts invoke`

The following output we will get:

```shell
Invoking...
Using network 'testNet'.
Running invocation: oep4.json
Unlock default payer account...
Please input account password: 
Invoking Name...
Invocation was successful. Result: 546f6b656e4e616d65
Invoking Symbol......

```

For more usage, you can use `punica-ts invoke --help` command.

```shell
punica-ts invoke --help
Usage: invoke [options]

invoke the function list in default-config or specify config.

Options:
  --network [NETWORK]      specify which network the contracts will be invoked
  --wallet <WALLET>        specify which wallet file will be used
  --functions <FUNCTIONS>  specify which function will be executed
  --config <CONFIG>        specify which config file will be used
  -h, --help               output usage information
```

**Note**:

- If you not run punica cli in you project root directory, you need to use `-p` or `--project` option to specify your DApp project's path.
- If multi wallet file exist in your `wallet` directory, you may need to use `--wallet` option to specify which wallet you want to use. otherwise, a random wallet file in `wallet` directory will be used.

### 4.5 Node

```shell
punica-ts node

Ontology Blockchain private net in test mode.
Please download from: https://github.com/punicasuite/solo-chain/releases
```

### 4.6. Scpm

```shell
punica-ts scpm -h
Usage: scpm [options]

smart contract package manager，support download and publish

Options:
  -h, --help  output usage information
```
### 4.7  Smartx

```shell
punica-ts smartx

Ontology smart contract IDE - SmartX.
Please go to Smartx for debugging smart contracts: http://smartx.ont.io/#/
```
### 4.8  Test

```shell
punica-ts test -h
Usage: test [options] [command]

test Smart contracts

Options:
  -h, --help          output usage information

Commands:
  template [options]  generate test template file
  exec [options]      execute the test file
```
### 4.9  Wallet

```shell
punica-ts wallet -h
Usage: wallet [options] [command]

manage your ontid, account, asset

Options:
  -h, --help  output usage information

Commands:
  account     manage your account
  asset       manage your asset, transfer, balance,...
  ontid       manage your ont_id, list or add.

```

### 4.10  Tools

```shell
punica-ts tool -h
Usage: tool [options] [command]

tooling functions

Options:
  -h, --help                   output usage information

Commands:
  transform                    transform data
  decryptprivatekey [options]  decrypt encoded private key
  
```

### 4.10.1  Transformation tools

```shell
punica-ts tool transform -h
Usage: transform [options] [command]

transform data

Options:
  -h, --help              output usage information

Commands:
  addresstohex [options]  transform address to hex
  stringtohex [options]   transform string to hex
  hexreverse [options]    reverse hex string
  numtohex [options]      transform number to NeoVM hex string
  generateprivatekey      generate random private key
  
```

## 5. Example

### 5.1. Checkout Version

```shell
C:\tutorialtoken> punica-ts -v
0.2.12
```

### 5.2. Unbox Tutorialtoken

```shell
C:\tutorialtoken> punica-ts unbox tutorialtoken
Downloading...
Unpacking...
Unbox successful. Enjoy it!```

### 5.3. Compile Contract

```shell
C:\tutorialtoken> tree
C:.
├─contracts
│     └─build
│
├─src
│  └─static
│      ├─css
│      │  └─fonts
│      ├─html
│      └─js
└─wallet
```

```shell
C:\tutorialtoken> punica-ts compile
Compiling...
Compiled, Thank you.
```

```shell
C:\tutorialtoken> tree
C:.
│
├─contracts
│     └─build
│
├─src
│  └─static
│      ├─css
│      │  └─fonts
│      ├─html
│      └─js
└─wallet
```

```shell
C:\tutorialtoken> tree build /F
C:\TUTORIALTOKEN\BUILD
    oep4_token.avm
    oep4_token_abi.json
```

### 5.4. Deploy Smart Contract

After compile successful, you can deploy your smart contract into a Ontolog Network.

```shell
C:\tutorialtoken> punica-ts deploy
Deploying...
Using network 'testNet'.
Running deployment: oep4_token.avm
Contract has been deployed to address 0x24ed10357c6a6506297367f29ed80065a42a4625.
```

If the contract has been deployed into the current network, you will get the following output.

```shell
C:\tutorialtoken> punica-ts deploy
Deploying...
Using network 'testNet'.
Running deployment: oep4_token.avm
Contract is already deployed at 0x24ed10357c6a6506297367f29ed80065a42a4625
```

### 5.5. Invoke Function in Smart Contract

```shell
C:\tutorialtoken> punica-ts invoke
Invoking...
Using network 'testNet'.
Running invocation: oep4.json
Unlock default payer account...
Please input account password: 
Invoking Name...
Invocation was successful. Result: 546f6b656e4e616d65
Invoking Symbol......
```
