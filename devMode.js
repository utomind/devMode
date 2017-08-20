"use strict";

function regEvt() {
    $('a.numPage').on('click', function(e) {
        console.group('devMode#click_anchor');
        var array = $(this).closest('form').serializeArray();
        console.table(array);
        console.groupEnd();
    });
}

var _devMode = function() {
	var _DEV_MODE = true;
	var flag = false;

	return {
		/**
		 * @param paramStr
		 * @returns
		 */
		decParam: function(paramStr) {
		    let paramArr = paramStr.split('&');
		    let paramObj = {};
		    paramArr.forEach(e => {
		        let param = e.split('=');
		        paramObj[param[0]] = decodeURIComponent(param[1]);
		    });
		    return paramObj;
		},
		view: function(paramStr) {
		    console.debug(typeof paramStr);
		    var m = this.decParam(paramStr);
		    var ar = new Array(m);
		    console.group('devMode#view');
		    console.debug('m <' + m + '>');
		    console.table(ar);
		    console.groupEnd()
		},
		viewFormData: function(/** Form */ form) {
			var s = $(form).serialize();
			console.info(s);
			return this.view(s);
		},
		viewById: function(/** Element ID */ emId) {
		    var ar = $(document.getElementById(emId)).serializeArray();
		    console.group('devMode#viewById');
		    console.table(ar);
		    console.groupEnd()
		},
		monitorEvt: function() {
		    $('form').submit(function(e) {
		        console.group('devMode#submit');
		        var array = $(this).serializeArray();
		        console.table(array);
		        console.groupEnd();
		    });
		},
		sizeElement: function(/** Element */ em, /** type */ t = 'input') {
			return $(t, em.tagName + '[name=' + em.name + ']').length;
		},
		viewForms: function(/** boolean */ isConsole = true) {
			if (!this.isDevMode()) return ;
			var $this = this;
			var forms = new Array();
			var array = new Array();
			$.each($('form'), function(i, em) {
				forms.push(em);
				array.push({ 'type': $(em).attr('type'), 'id': em.id, 'name': em.name, 'size': $this.sizeElement(em, 'input') });
			});
			console.table(array);
			return forms;
		},
		viewForm: function(/** Element */ formName, /** boolean */ isConsole = true) {
			if (!this.isDevMode()) return ;
			if (formName === undefined) {
				formName = document.getElementsByTagName('form')[0];
			}
			var array = this.makeForm($(formName), isConsole);
			if (isConsole && array.length > 0) {
				console.table(array);
			}
			return formName;
		},
		viewElements: function(isConsole = true) {
			if (!this.isDevMode()) return ;
			var $this = this;
			var forms = this.viewForms(isConsole);
			for (var i in forms) {
				this.viewForm(forms[i], isConsole);
			}
			return forms;
		},
		makeForm: function(/** Form */ formSel, isConsole = true) {
			var $this = this;
			var array = new Array();
			if (isConsole) {
				$('input', formSel).each(function(i, em) {
					array.push($this.makeEmVal($(this), isConsole));
				});
			} else {
				$('input', formSel).each(function(i, em) {
					$this.toggleElement($(em));
				});
			}
			return array;
		},
		viewElement: function(/** element */ em, isConsole = true) {
			if (isConsole) console.table(new Array(this.makeEmVal($(em), isConsole)));
			else this.toggleElement($(em));
			return em;
		},
		viewElementName: function(/** element */ emName, isConsole = true) {
			var $em = $(emName);
			if (isConsole) console.table(new Array(this.makeEmVal($em, isConsole)));
			else this.toggleElement($em);
			return $em;
		},
		viewElementId: function(/** element */ emId, isConsole = true) {
			var $em = $(document.getElementById(emId));
			if (isConsole) console.table(new Array(this.makeEmVal($em, isConsole)));
			else this.toggleElement($em);
			return $em;
		},
		viewBtn: function(/** Element */ em, isConsole = true) {
			var $em = this.findEm(em === undefined ? '.btn' : em);
			if ($em == false) return ;
			var $this = this;
			var array = new Array();
			$.each($em, function(i, em) {
				if (isConsole) {
					array.push($this.makeEmVal($(em), isConsole));
				} else {
					$this.toggleElement($(em));
				}
			});
			isConsole && console.table(array);
			return this;
		},
		click: function(/** Element */ em) {
			var $em = this.findEm(em === undefined ? 'button.btn' : em);
			if ($em == false) return ;
			var $this = this;
			if ($em.length > 1) {
				$.each($em, function(i, em) {
					$this.viewBtn(em, true);
				});
			} else {
				$em.click();
			}
			return $em;
		},
		makeEmVal: function(/** Element */ $em, /** boolean */ flag = false) {
			var v;
			if (flag) v = { 'type': $em.attr('type'), 'name': $em.attr('name') === undefined ? '#' + $em.attr('id') : $em.attr('name'), 'val': $em.val() };
			else v = '[' + $em.attr('name') + '] ' + $em.val();
			return v;
		},
		viewKeys: function(/** Selector */ s = 'input', /** type */ t = 'form', /** excludeType */ exclude = ':button,:password', /** boolean */ isConsole = true) {
			var $this = this;
			var array = new Array();
//			var $em = $('form input:not(:button,:password)');
			var $em = $(s + ':not(' + exclude + ')', t);
			$.each($em, function(idx, em) {
				if (em.name !== undefined) {
					array.push({ 'type': $(this).attr('type'), 'id': em.id, 'name': em.name, 'form': $(this).closest('form').attr('name') });
					isConsole || $this.toggleElement(em);
				}
			});
			console.table(array);
			return array;
		},
		existKey: function(/** Element */ emName, /** type */ t = '*', isConsole = false) {
			if (emName === undefined) {
				console.error('Please type elementName');
				return;
			}
			var $em = $(t + '[name=' + emName + ']');
			var size = $em.length;
			if (size > 0) {
				var o = {};
				if ($em.is('input')) {
					var $form = $em.closest('form');
					o.form = $form.attr('name');
				}
				var elem = this.getType($em);
				o.type = elem;
				if (elem == 'checkbox') {
					o.val = $em.filter(':checked').val();
				} else {
					o.val = $em.val();
				}
				console.table(new Array(o));
				isConsole || this.toggleElement($em);
			} else {
				console.warn('Element [' + emName + '] not exist');
			}
			return $em;
		},
		getType: function(/** Element */ $em) {
			var t = $em.attr('type');
			if (t === undefined && $em.attr('id') !== undefined) {
				t = document.getElementById($em.attr('id')).nodeName;
			}
			if (t === undefined) {
				t = $em.prop('tagName').toLowerCase();
			}
			return t;
		},
		findEm: function(/** Element */ em, /** Selector */ sel = '*', isView = true) {
			var $em = $(em, sel);
			if ($em === undefined || em == null || $em.length == 0) {
				console.warn('Element can not found');
				return false;
			}
			if (isView) this.toggleElement($em);
			return $em;
		},
		findId: function(/** Element */ emId) {
			var $em = $(document.getElementById(emId));
			this.toggleElement($em);
			return $em;
		},
		getEm: function(/** Element */ em) {
			var $em = this.findEm(em);
			if ($em == false) return ;
			console.info($em.html());
			return $em;
		},
		toggleElement: function(/** jQuery */ $em, /** className */ className='_devInspect') {
			if (!this.isDevMode()) return ;
			if ($em.length == 0) {
				console.warn('Element can not found');
				return this;
			}
			var $this = this;
			$.each($em, function(i, em) {
				var inType = $this.getType($(this));
				var flag = (inType == 'checkbox' || inType == 'radio') ? $(this).parent().hasClass(className) : $(this).hasClass(className);
				var title = '';
				if (!flag) title = $this.makeEmVal($(this));
				//console.info('name <' + $(this).attr('name') + '>, flag <' + flag + '>, title <' + title + '>');

				if (inType == 'checkbox' || inType == 'radio') {
					$this.printElement($(this).parent(), className, title, flag);
				} else {
					$this.printElement($(this), className, title, flag);
				}
			});
			return this;
		},
		printElement: function(/** jQuery */ $em, /** className */ className='_devInspect', /** title */ title, /** boolean */ flag) {
			if (flag) {
				$em.removeClass(className).attr({'title': title}).focusout();
			} else {
				$em.addClass(className).attr({'title': title}).focusin();
			}
			return this;
		},
		dupId: function() {
			var ems = document.body.querySelectorAll('*[id]'), ids = [];
			for (var i = 0, len = ems.length; i < len; i++) {
				if (ids.indexOf(ems[i].id) === -1) {
					ids.push(ems[i].id);
				} else {
					console.error('Multiple IDs #' + ems[i].id);
				}
			}
			return this;
		},
		home: function() {
			this.go('/')
		},
		go: function(/** uri */ uri = '/') {
			window.location.href=uri;
		},
		back: function() {
			window.history.back();
		},
		reload: function() {
			window.location.reload();
		},
		fakeSubmit: function(/** element */ formName, /** boolean */ isView = true) {
			if (formName === undefined) {
				formName = document.getElementsByTagName('form')[0];
			}
			var $form = $(formName);
			var array = $form.serializeArray();
			console.info('action: ' + $form.attr('action'));
			console.table(array);
			if (isView) {
				for (var i in array) {
					array[i].name && this.findEm('input[name=' + array[i].name + ']');
				}
			}
			return $form;
		},
		isDevMode: function() {
			if (!_DEV_MODE) {
				console.warn('_devMode is off');
			}
			return _DEV_MODE;
		},
		devMode: function() {
			this.monitorEvt($('form'), 'submit');
			_DEV_MODE = !_DEV_MODE;
			return _DEV_MODE;
		},
		help: function() {
			console.group('devMode#help()');
			var array = new Array();
			array.push('viewForms(): 전체 Form의 정보를 보여줍니다.');
			array.push('viewForm(element): 해당 Form 내에 존재하는 element 정보를 보여줍니다.');
			array.push('viewFormId(formId): 해당 Form 내에 존재하는 element 정보를 보여줍니다.');
			array.push('viewElements(): 전체 Elements를 보여줍니다.');
			array.push('viewElementId(id): ID에 Element에 해당하는 값을 보여줍니다');
			array.push('viewElementName(elementName): name에 해당하는 Element의 값을 보여줍니다.');
			array.push('viewKeys(boolean): Form에 존재하는 모든 Element 명을 보여줍니다.');
			array.push('existKey(elementName): Element 가 존재하는 지 검사합니다.');
			array.push('findEm(elementName): Element 의 위치를 표시합니다.');
			array.push('fakeSubmit(element): Form 데이터를 전송하기 전 값을 보여줍니다.');
			array.push('dupId(): ID의 중복 검사를 체크합니다.');
			console.info(array.join('\n'));
			console.groupEnd();
		}
    };
}();

$(document).ready(function() {

});
