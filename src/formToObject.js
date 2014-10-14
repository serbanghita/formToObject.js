(function(window, document, undefined){

	'use strict';

	var formToObject = function(){

		if (!(this instanceof formToObject)) {
			var test = new formToObject();
			return test.init.call(test, Array.prototype.slice.call(arguments));
		}

		/**
		* Defaults
		*/
		var formRef   = null,
			keyRegex      = /[^\[\]]+|\[\]/g,
			$form         = null,
			$formElements = [];

		/**
		 * Private methods
		 */
		
		// Check to see if the object is a HTML node.
		function isDomNode( node ){
			return typeof node === 'object' &&
					'nodeType' in node &&
					node.nodeType === 1;
		}

		// Get last numeric key from an object.
		function getLastNumericKey(o){
			return parseInt(Object.keys(o).filter(function(elem){ 
				return !isNaN(parseInt(elem,10)); 
			}).splice(-1)[0], 10) || 0;
		}	

		// Get the real number of properties from an object.
		function getObjLength(o){

			var l, k;

			if( typeof Object.keys === 'function' ) {
				l = Object.keys(o).length;
			} else {
				for (k in o) {
				  if (o.hasOwnProperty(k)) { 
				  	l++;
				  }
				}		
			}

			return l;

		}


		// Iteration through arrays and objects. Compatible with IE.
		function forEach( arr, callback ){

			if([].forEach){
				return [].forEach.call(arr, callback);
			}

			var i;
			for(i in arr){
				// Using Object.prototype.hasOwnProperty instead of
				// arr.hasOwnProperty for IE8 compatibility.
				if( Object.prototype.hasOwnProperty.call(arr,i) ){
					callback.call(arr, arr[i]);
				}
			}

			return;

		}					

		// Constructor
		function init(options){

			if(!options || typeof options !== 'object' || !options[0]){
				return false;
			}

			formRef = options[0];

			if( !setForm() ){
				return false;
			}
			if( !setFormElements() ){
				return false;
			}

			return convertToObj();
		}

		// Set the main form object we are working on.
		function setForm(){

			switch( typeof formRef ){
			case 'string':
				$form = document.getElementById( formRef );
				break;

			case 'object':
				if( isDomNode(formRef) ){
					$form = formRef;
				}
				break;
			}

			return $form;

		}

		// Set the elements we need to parse.
		function setFormElements(){

			$formElements = $form.querySelectorAll('input, textarea, select');
			return $formElements.length;

		}

		function processSingleLevelNode($domNode, value, result){

			var key = $domNode.name;

			// We're only interested in the radio that is checked.
			if( $domNode.nodeName === 'INPUT' &&
				$domNode.type === 'radio' ) {
				if( $domNode.checked ){
					result[key] = value;
					return value;
				} else {
					return;
				}
			}

			// Checkboxes are a special case. We have to grab each checked values
			// and put them into an array.
			if( $domNode.nodeName === 'INPUT' &&
				$domNode.type === 'checkbox' ) {

				if( $domNode.checked ){
					if( !result[key] ){
						result[key] = [];
					}
					return result[key].push( value );
				} else {
					return;
				}

			}

			// Multiple select is a special case.
			// We have to grab each selected option and put them into an array.
			if( $domNode.nodeName === 'SELECT' &&
				$domNode.type === 'select-multiple' ) {

				result[key] = [];
				var $domNodeChilds = $domNode.querySelectorAll('option[selected]');
				if( $domNodeChilds ){
					forEach($domNodeChilds, function(child){
						result[key].push( child.value );
					});
				}
				return;

			}

			// Fallback. The default one to one assign.
			result[key] = value;


		}

		function processMultiLevelNode(arr, value, result){

			var keyName = arr[0];

			if(arr.length > 1){
				if( keyName === '[]' ){ 
					result.push({});
					return processMultiLevelNode(arr.splice(1, arr.length), value, result[getLastNumericKey(result)]);
				} else {

					if( result[keyName] && getObjLength(result[keyName]) > 0 ) {
						//result[keyName].push(null);
						return processMultiLevelNode(arr.splice(1, arr.length), value, result[keyName]); 
					} else {
						result[keyName] = {};				
					}	
					return processMultiLevelNode(arr.splice(1, arr.length), value, result[keyName]);		
				}
				
			}

			// Last key, attach the original value.
			if(arr.length === 1){
				if( keyName === '[]' ){
					//result.push(value);
					result[getLastNumericKey(result) + 1] = value;
					return result;
				} else {
					result[keyName] = value;
					return result;
				}
			}

		}

		function convertToObj(){

			var i = 0, 
				objKeyNames,
				$domNode,
				result = {};

			for(i = 0; i < $formElements.length; i++){
				
				$domNode = $formElements[i];

				// Ignore the element if the 'name' attribute is empty.
				// Ignore the 'disabled' elements.
				if( $domNode.name && !$domNode.disabled ) {
					objKeyNames = $domNode.name.match( keyRegex );
					if( objKeyNames.length === 1 ) {
						processSingleLevelNode($domNode, $domNode.value, result);
					}
					if( objKeyNames.length > 1 ){												
						processMultiLevelNode(objKeyNames, $domNode.value, result);
					}
				}

			}

			return result;

		}

		/**
		 * Expose public methods.
		 */
		return {
			init: init
		};

	};

	/**
	 * Expose the final class.
	 * @type Function
	 */
	window.formToObject = formToObject;

})(window, document);
