# Ergo Token Minter

## Introduction

Small dApp to mint new ergo token using Yoroi dApp connector.
Written in javascript with bootstrap.

It is based on the Yoroi dApp connector example: https://github.com/Emurgo/yoroi-frontend/tree/develop/packages/yoroi-ergo-connector/example-ergo

## Installation

> git clone
> cd ergo-token-minter
> npm install
> npm run start

http://localhost:8080

## Build static page

This allow to deploy a static webpage in apache.

> npm run buildstatic

In the generated bootstrap.js remove two rows (for me at line 270)
/******/                                } else if(typeof WebAssembly.instantiateStreaming === 'function') {
/******/                                        promise = WebAssembly.instantiateStreaming(req, importObject);

