if (!window.Promise) {
	window.Promise = function(func) {
		if (!(this instanceof Promise))
			throw new TypeError("Promise must be created using 'new' operator");
		if (typeof func !== "function")
			throw new TypeError("Argument is not a function");
		const PENDING = "pending";
		const FULFILLED = "fulfilled";
		const REJECTED = "rejected";
		const THEN_HANDLER = "thenHandler";
		const CATCH_HANDLER = "catchHandler";
		const FINALLY_HANDLER = "finallyHandler";
		let _state = PENDING;
		let _result = undefined;
		let _queue = new Set();
		let self = this;
		let Handler = function(okFunc, errFunc, typeHandler) {
			this.okFunc = okFunc;
			this.errFunc = errFunc;
			this.resolve = null;
			this.reject = null;
			this.typeHandler = typeHandler;
		}

		function run(func) {
			try {
				func(_resolve, _reject);
			} catch (e) {
				_reject(e);
			}
		};

		function _settlePromise(resolve, reject, func) {
			let result;
			try {
				if (typeof func === "function") {
					result = func(_result);
					if (result instanceof Promise) {
						result.then(function(res) {
							resolve(res);
						});
						result.catch(function(err) {
							reject(err);
						});
						return;
					}
				}
				resolve(result);
			}catch (e) {
				reject(e);
			}
		}

		function _throwPromise(resolve, reject) {
			if (_state === FULFILLED) {
				if (typeof resolve === "function")
					resolve(_result);
			} else if (_state === REJECTED) {
				if (typeof reject === "function")
					reject(_result);
			}
		}

		function _executeFunc(item) {
			let funcAct;
			let funcPromise = getActPromise(item.typeHandler);
			if (typeof funcPromise !== "function")
				return;
			if (_state === FULFILLED) {
				func = item.okFunc;
			} else if (_state === REJECTED) {
				func = item.errFunc;
			}
			funcPromise(item.resolve, item.reject, func);
		}

		function getActPromise(typeHandler) {
			switch(typeHandler){
				case THEN_HANDLER:
					if (_state === FULFILLED)
						return _settlePromise
					else if (_state === REJECTED)
						return _throwPromise;
					else 
						return null
				case CATCH_HANDLER:
					if (_state === FULFILLED)
						return _throwPromise;
					else if (_state === REJECTED)
						return _settlePromise;
					else
						return null;
				case FINALLY_HANDLER:
					return _settlePromise;
				default:
					return null;
			}
		}

		function _executeQueue() {
			setTimeout(function() {
				_queue.forEach(function(item) {
					_executeFunc(item);
				});
				_queue.clear();
			}, 0);
		};

		let promiseExecute = function(value, state) {
			if (_state != PENDING)
				return self;
			_state = state;
			_result = value;
			_executeQueue();
			return self
		};

		function _resolve(value) {
			return promiseExecute(value, FULFILLED);
		};

		function _reject(error) {
			return promiseExecute(error, REJECTED);
		};

		function newAct(okFunc, errFunc, typeAct) {
			let handler = new Handler(okFunc, errFunc, typeAct);
			let promise = new Promise(function(resolve, reject) {
				handler.resolve = resolve;
				handler.reject = reject;
			});
			_queue.add(handler);
			return promise;
		}

		this.then = function(okFunc, errorFunc) {
			let promise = newAct(okFunc, errorFunc, THEN_HANDLER);
			if (_state === FULFILLED)
				_executeQueue();
			return promise;
		};

		this.catch = function(errorFunction) {
			let promise = newAct(null, errorFunction, CATCH_HANDLER);
			if (_state === REJECTED)
				_executeQueue();
			return promise;
		};

		this.finally = function(onFinally) {
			let promise = newAct(onFinally, onFinally,
				FINALLY_HANDLER);
			if (_state !== PENDING)
				_executeQueue();
			return promise;
		}

		run(func);
	}
}