/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 	};
/******/
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"main": 0
/******/ 	};
/******/
/******/
/******/
/******/ 	// script path function
/******/ 	function jsonpScriptSrc(chunkId) {
/******/ 		return __webpack_require__.p + "" + chunkId + ".bootstrap.js"
/******/ 	}
/******/
/******/ 	// object to store loaded and loading wasm modules
/******/ 	var installedWasmModules = {};
/******/
/******/ 	function promiseResolve() { return Promise.resolve(); }
/******/
/******/ 	var wasmImportObjects = {
/******/ 		"./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.wasm": function() {
/******/ 			return {
/******/ 				"./ergo_lib_wasm_bg.js": {
/******/ 					"__wbindgen_string_new": function(p0i32,p1i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbindgen_string_new"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbindgen_json_parse": function(p0i32,p1i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbindgen_json_parse"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbindgen_json_serialize": function(p0i32,p1i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbindgen_json_serialize"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbindgen_is_string": function(p0i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbindgen_is_string"](p0i32);
/******/ 					},
/******/ 					"__wbindgen_string_get": function(p0i32,p1i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbindgen_string_get"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbindgen_object_drop_ref": function(p0i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbindgen_object_drop_ref"](p0i32);
/******/ 					},
/******/ 					"__wbindgen_number_new": function(p0f64) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbindgen_number_new"](p0f64);
/******/ 					},
/******/ 					"__wbg_getRandomValues_98117e9a7e993920": function(p0i32,p1i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_getRandomValues_98117e9a7e993920"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbg_randomFillSync_64cc7d048f228ca8": function(p0i32,p1i32,p2i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_randomFillSync_64cc7d048f228ca8"](p0i32,p1i32,p2i32);
/******/ 					},
/******/ 					"__wbg_process_2f24d6544ea7b200": function(p0i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_process_2f24d6544ea7b200"](p0i32);
/******/ 					},
/******/ 					"__wbindgen_is_object": function(p0i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbindgen_is_object"](p0i32);
/******/ 					},
/******/ 					"__wbg_versions_6164651e75405d4a": function(p0i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_versions_6164651e75405d4a"](p0i32);
/******/ 					},
/******/ 					"__wbg_node_4b517d861cbcb3bc": function(p0i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_node_4b517d861cbcb3bc"](p0i32);
/******/ 					},
/******/ 					"__wbg_crypto_98fc271021c7d2ad": function(p0i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_crypto_98fc271021c7d2ad"](p0i32);
/******/ 					},
/******/ 					"__wbg_msCrypto_a2cdb043d2bfe57f": function(p0i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_msCrypto_a2cdb043d2bfe57f"](p0i32);
/******/ 					},
/******/ 					"__wbg_modulerequire_3440a4bcf44437db": function(p0i32,p1i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_modulerequire_3440a4bcf44437db"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbg_newnoargs_ac91a24e57fcaec8": function(p0i32,p1i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_newnoargs_ac91a24e57fcaec8"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbg_call_9e1eb05d905a21d9": function(p0i32,p1i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_call_9e1eb05d905a21d9"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbg_self_bce917bbd61b0be0": function() {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_self_bce917bbd61b0be0"]();
/******/ 					},
/******/ 					"__wbg_window_08048ce184ae3496": function() {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_window_08048ce184ae3496"]();
/******/ 					},
/******/ 					"__wbg_globalThis_d6f1ff349571af81": function() {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_globalThis_d6f1ff349571af81"]();
/******/ 					},
/******/ 					"__wbg_global_63b22b64d239db75": function() {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_global_63b22b64d239db75"]();
/******/ 					},
/******/ 					"__wbindgen_is_undefined": function(p0i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbindgen_is_undefined"](p0i32);
/******/ 					},
/******/ 					"__wbg_buffer_fbad716641c158a5": function(p0i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_buffer_fbad716641c158a5"](p0i32);
/******/ 					},
/******/ 					"__wbg_newwithbyteoffsetandlength_403faa90cb44b1fb": function(p0i32,p1i32,p2i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_newwithbyteoffsetandlength_403faa90cb44b1fb"](p0i32,p1i32,p2i32);
/******/ 					},
/******/ 					"__wbg_new_c9e78bd69716df92": function(p0i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_new_c9e78bd69716df92"](p0i32);
/******/ 					},
/******/ 					"__wbg_set_2fd4486048716f38": function(p0i32,p1i32,p2i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_set_2fd4486048716f38"](p0i32,p1i32,p2i32);
/******/ 					},
/******/ 					"__wbg_length_82dd1e63e9c75f09": function(p0i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_length_82dd1e63e9c75f09"](p0i32);
/******/ 					},
/******/ 					"__wbg_newwithlength_a9f6c1fd1bf4e5e4": function(p0i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_newwithlength_a9f6c1fd1bf4e5e4"](p0i32);
/******/ 					},
/******/ 					"__wbg_subarray_e80c85d931be89c4": function(p0i32,p1i32,p2i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbg_subarray_e80c85d931be89c4"](p0i32,p1i32,p2i32);
/******/ 					},
/******/ 					"__wbindgen_object_clone_ref": function(p0i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbindgen_object_clone_ref"](p0i32);
/******/ 					},
/******/ 					"__wbindgen_debug_string": function(p0i32,p1i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbindgen_debug_string"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbindgen_throw": function(p0i32,p1i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbindgen_throw"](p0i32,p1i32);
/******/ 					},
/******/ 					"__wbindgen_rethrow": function(p0i32) {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbindgen_rethrow"](p0i32);
/******/ 					},
/******/ 					"__wbindgen_memory": function() {
/******/ 						return installedModules["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.js"].exports["__wbindgen_memory"]();
/******/ 					}
/******/ 				}
/******/ 			};
/******/ 		},
/******/ 	};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId) {
/******/ 		var promises = [];
/******/
/******/
/******/ 		// JSONP chunk loading for javascript
/******/
/******/ 		var installedChunkData = installedChunks[chunkId];
/******/ 		if(installedChunkData !== 0) { // 0 means "already installed".
/******/
/******/ 			// a Promise means "currently loading".
/******/ 			if(installedChunkData) {
/******/ 				promises.push(installedChunkData[2]);
/******/ 			} else {
/******/ 				// setup Promise in chunk cache
/******/ 				var promise = new Promise(function(resolve, reject) {
/******/ 					installedChunkData = installedChunks[chunkId] = [resolve, reject];
/******/ 				});
/******/ 				promises.push(installedChunkData[2] = promise);
/******/
/******/ 				// start chunk loading
/******/ 				var script = document.createElement('script');
/******/ 				var onScriptComplete;
/******/
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.src = jsonpScriptSrc(chunkId);
/******/
/******/ 				// create error before stack unwound to get useful stacktrace later
/******/ 				var error = new Error();
/******/ 				onScriptComplete = function (event) {
/******/ 					// avoid mem leaks in IE.
/******/ 					script.onerror = script.onload = null;
/******/ 					clearTimeout(timeout);
/******/ 					var chunk = installedChunks[chunkId];
/******/ 					if(chunk !== 0) {
/******/ 						if(chunk) {
/******/ 							var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 							var realSrc = event && event.target && event.target.src;
/******/ 							error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 							error.name = 'ChunkLoadError';
/******/ 							error.type = errorType;
/******/ 							error.request = realSrc;
/******/ 							chunk[1](error);
/******/ 						}
/******/ 						installedChunks[chunkId] = undefined;
/******/ 					}
/******/ 				};
/******/ 				var timeout = setTimeout(function(){
/******/ 					onScriptComplete({ type: 'timeout', target: script });
/******/ 				}, 120000);
/******/ 				script.onerror = script.onload = onScriptComplete;
/******/ 				document.head.appendChild(script);
/******/ 			}
/******/ 		}
/******/
/******/ 		// Fetch + compile chunk loading for webassembly
/******/
/******/ 		var wasmModules = {"0":["./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.wasm"]}[chunkId] || [];
/******/
/******/ 		wasmModules.forEach(function(wasmModuleId) {
/******/ 			var installedWasmModuleData = installedWasmModules[wasmModuleId];
/******/
/******/ 			// a Promise means "currently loading" or "already loaded".
/******/ 			if(installedWasmModuleData)
/******/ 				promises.push(installedWasmModuleData);
/******/ 			else {
/******/ 				var importObject = wasmImportObjects[wasmModuleId]();
/******/ 				var req = fetch(__webpack_require__.p + "" + {"./node_modules/ergo-lib-wasm-browser/ergo_lib_wasm_bg.wasm":"f524a846ab94a424f340"}[wasmModuleId] + ".module.wasm");
/******/ 				var promise;
/******/ 				if(importObject instanceof Promise && typeof WebAssembly.compileStreaming === 'function') {
/******/ 					promise = Promise.all([WebAssembly.compileStreaming(req), importObject]).then(function(items) {
/******/ 						return WebAssembly.instantiate(items[0], items[1]);
/******/ 					});
/******/ 				} else if(typeof WebAssembly.instantiateStreaming === 'function') {
/******/ 					promise = WebAssembly.instantiateStreaming(req, importObject);
/******/ 				} else {
/******/ 					var bytesPromise = req.then(function(x) { return x.arrayBuffer(); });
/******/ 					promise = bytesPromise.then(function(bytes) {
/******/ 						return WebAssembly.instantiate(bytes, importObject);
/******/ 					});
/******/ 				}
/******/ 				promises.push(installedWasmModules[wasmModuleId] = promise.then(function(res) {
/******/ 					return __webpack_require__.w[wasmModuleId] = (res.instance || res).exports;
/******/ 				}));
/******/ 			}
/******/ 		});
/******/ 		return Promise.all(promises);
/******/ 	};
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// on error function for async loading
/******/ 	__webpack_require__.oe = function(err) { console.error(err); throw err; };
/******/
/******/ 	// object with all WebAssembly.instance exports
/******/ 	__webpack_require__.w = {};
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./bootstrap.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./bootstrap.js":
/*!**********************!*\
  !*** ./bootstrap.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// A dependency graph that contains any wasm must all be imported\n// asynchronously. This `bootstrap.js` file does the single async import, so\n// that no one else needs to worry about it again.\nPromise.all(/*! import() */[__webpack_require__.e(0), __webpack_require__.e(1)]).then(__webpack_require__.bind(null, /*! ./index.js */ \"./index.js\"))\n  .catch(e => console.error(\"Error importing `index.js`:\", e));\n\n\n//# sourceURL=webpack:///./bootstrap.js?");

/***/ })

/******/ });