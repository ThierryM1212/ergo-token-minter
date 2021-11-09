# Ergo Token Minter

## Introduction

Small dApp to mint new ergo token using Yoroi dApp connector.
Written in javascript with bootstrap.

It is based on the Yoroi dApp connector example: https://github.com/Emurgo/yoroi-frontend/tree/develop/packages/yoroi-ergo-connector/example-ergo

## Installation

> git clone https://github.com/ThierryM1212/ergo-token-minter.git<br/>
> cd ergo-token-minter <br/>
> npm install <br/>
> npm run build <br/>
> npm run start <br/>
<br/>
http://localhost:8080

## Build static page

This allows to deploy a static webpage for example in apache.

> npm run buildstatic

<br/>In the generated bootstrap.js remove two rows (for me at line 270):
```javascript
    /******/                                } else if(typeof WebAssembly.instantiateStreaming === 'function') {
    /******/                                        promise = WebAssembly.instantiateStreaming(req, importObject);
```
<br/>The static website is generated in the ./dist folder
