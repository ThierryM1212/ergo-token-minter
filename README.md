# Ergo Token Minter / Burner

## Introduction

dApp to mint and burn ergo tokens using Yoroi dApp connector.
Written in javascript with bootstrap v4.

It can be tried at https://tokenminter.ergo.ga/

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

<br/>The static website is generated in the ./dist folder

<br/>In the generated bootstrap.js remove two rows to avoid error loading the wasm (for me at line 270):
```javascript
    /******/                                } else if(typeof WebAssembly.instantiateStreaming === 'function') {
    /******/                                        promise = WebAssembly.instantiateStreaming(req, importObject);
```
