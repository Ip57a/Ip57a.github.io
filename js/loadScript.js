function MultipleLoadingScript() {
	this.src = [];		//пути скриптов
	this.runOnLoad = [];	//функции для выполнения после соотв. скрипта
	this.runAfter = [];	//функции для выполнения полсе загрузки все скриптов
	/* runOnLoad, runAfter - массив объектов
	 *  {funcName, param}
	 *  funcName - имя функции,
	 *  param - массив параметров
	 * Для runOnLoad параметры могут быть массивами, н-р:
	 * runOnLoad = [ {
	 *	funcName : "name1",
	 *	param : param1, }, {
	 *	funcName : ["name2", "name3"],
	 *	param : [[param1, param2], [param3]],
	 * }
	 *		
	 *	}*/
	this.start = function() {
		if (this.src == null || this.src.length == 0)
			return;
		this.loadNextScript(0, this.src)
	};

	this.loadNextScript = function(number, src) {
		if (number >= src.length) {
			this.runAfterFunc();
			return;
		}
	
		let script = this.loadScript(src[number]);
		if (script.downloaded) {
			this.runOnLoadFuncs(number);
			this.loadNextScript(++number, src);
		} else {
			let self = this;
			script.addEventListener("load", function() {
				self.runOnLoadFuncs(number);
				self.loadNextScript(++number, src)
			});
		}
	};

	this.runOnLoadFuncs = function(number) {
		this.runFuncs(this.runOnLoad, number)
	}

	this.runFuncs = function(runArray, number) {
		let funcs = runArray[number];
		if (!funcs)
			return;
		if (Array.isArray(funcs)) {
			for (let i = 0; i < funcs.length; i++) {
				this.runFunc(funcs[i]);
			}
		} else 
			this.runFunc(funcs);
	}

	this.runAfterFunc = function() {
		if (this.runAfter && this.runAfter.length > 0)
			for (let i = 0; i < this.runAfter.length; i++) {
				this.runFunc(this.runAfter[i]);
			}
	};

	this.runFunc = function(func) {

		let fn = this.getFunctionFromName(func.funcName);
		if (typeof fn != "function" )
			return;
		fn(func.param);
	};

	this.loadScript = function(src) {
		let script = this.findScript(src);
		if (script != null)
			return script;
		return this.createScript(src);
	};

	this.findScript = function(src) {
		let script = $("head").find("script[src='" + src +"']");
		if (script.length > 0)
			return script[0];
		else
			return null;
	};

	this.createScript = function(src) {
		let script = document.createElement("script");
		script.src = src;
		script.downloaded = false;
		script.addEventListener("load", function() {
			script.downloaded = true;
		}, {once: true});
		document.head.appendChild(script);
		return script;
	};

	this.getFunctionFromName = function(nameFunction) {
		let stopIndex;
		if (!nameFunction || typeof nameFunction != "string" 
			|| (stopIndex = nameFunction.indexOf(".")) === -1)
			return window[nameFunction];
		let startIndex = 0;
		let name = nameFunction.substring(startIndex, stopIndex);
		let obj = window[name];
		if (!obj)
			return null;
		let memObj = obj;
		while (true) {
			startIndex = ++stopIndex;
			stopIndex = nameFunction.indexOf(".", stopIndex);
			if (stopIndex === -1) {
				name = nameFunction.substring(startIndex);
				obj = obj[name];
				if (!obj || typeof obj != "function") 
					return null;
				else {
					return obj.bind(memObj);
					//return obj;
				}
			} else {
				name = nameFunction.substring(startIndex, stopIndex);
				memObj = obj;
				obj = obj[name];
				if (!obj)
					return null
			}
		}
		return null;
	};
}