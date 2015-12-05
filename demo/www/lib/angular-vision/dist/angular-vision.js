'use strict';

/*
 * angular-vision
 * v1.0.0
 * (c) 2014 Vision Tecnologia e Informação http://vision-ti.com.br
 * License: MIT
 */
angular.module('vision.utils', [])

    .factory('VsArrayUtils', ['VsUtil', 'VsBeanUtils', function(VsUtil, VsBeanUtils){

        var VsArrayUtils = function() {};

        /**
         *  Find item by value of labelValue and return value of labelField
         */
        VsArrayUtils.getValueOfLabelField = function(array, labelField, labelValue, value)
        {
            if (value != null)
            {
                var item = VsArrayUtils.getItemByPropertyValue(array, labelValue, value);
                return VsArrayUtils.evaluate(item, labelField);
            }
            else
                return null;
        };

        /**
         *  Return item by property value
         *  Pt-br:Para propriedade String os acentos e espaços são ignorados
         *  <code>
         * 	Ex:<br>
         * 	 	persons= [...];<br>
         *  	item = person;<br>
         * 		property = 'id';
         *		getItemByPropertyValue(persons, 'id', 12);<br>
         *  	Return person by id==12<br>
         *  </code>
         */
        VsArrayUtils.getItemByPropertyValue = function(array, property, value)
        {
            var index = VsArrayUtils.getItemIndexByPropertyValue(array, property, value);
            return index == -1 ? null : array[index];
        };

        /**
         *  Return array index by property value of item
         *  Pt-br:Para propriedade String os acentos e espaços são ignorados
         *  <code>
         * 	Ex:<br>
         * 	 	persons= [...];<br>
         *  	item = person;<br>
         * 		property = 'id';
         *		getItemIndexByPropertyValue(persons, 'id', 12);<br>
         *  	Return index by id==12<br>
         * </code>
         */
        VsArrayUtils.getItemIndexByPropertyValue = function(array, property, value)
        {
            if (VsUtil.isFilled(value) && array != null)
            {
                var beanValue;
                var item;
                for (var i = 0; i < array.length; i++){
                    item = array[i];
                    beanValue = VsBeanUtils.evaluate(item, property);
                    beanValue = beanValue != null ? VsStringUtils.retiraAcentosEEspacos(String(beanValue).toLowerCase()) : null;
                    value = VsStringUtils.retiraAcentosEEspacos(String(value).toLowerCase());
                    if (beanValue == value){
                        return i;
                    }
                }
            }
            return -1;
        };

        return VsArrayUtils;
    }])

    .factory('VsUtil', [function(){

        var VsUtil = function(){};

        VsUtil.isFilled = function(value){
            if (value != null ) value = value.toString();
            return (value != null
                && value != ""
                && value != " "
                && value != "null"
                && value != "NaN"
                && value != "undefined");
        };

        return VsUtil;
    }])

    .factory('VsStringUtils', [function(){

        var VsStringUtils = function(){};

        var EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        //private function
        var escapeRegExp = function(string) {
            return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        };

        //String replaceAll
        VsStringUtils.replaceAll = function(string, find, stringReplace) {
            return string.replace(new RegExp(escapeRegExp(find), 'g'), stringReplace);
        };

        VsStringUtils.retiraAcentosEEspacos = function(texto){
            return VsStringUtils.retiraAcentos(texto).replace(" ", "");
        };

        //Remove acentos
        VsStringUtils.retiraAcentos = function(texto){

            texto = texto.replace("á","a");
            texto = texto.replace("é", "e" );
            texto = texto.replace("í", "i" );
            texto = texto.replace("ó", "o" );
            texto = texto.replace("ú", "u" );
            texto = texto.replace("Á", "A" );
            texto = texto.replace("É", "E" );
            texto = texto.replace("Í", "I" );
            texto = texto.replace("Ó", "O" );
            texto = texto.replace("Ú", "U" );

            texto = texto.replace("â", "a" );
            texto = texto.replace("ê", "e" );
            texto = texto.replace("î", "i" );
            texto = texto.replace("ô", "o" );
            texto = texto.replace("û", "u" );
            texto = texto.replace("Â", "A" );
            texto = texto.replace("Ê", "E" );
            texto = texto.replace("Î", "I" );
            texto = texto.replace("Ô", "O" );
            texto = texto.replace("Û", "U" );

            texto = texto.replace("ã", "a" );
            texto = texto.replace("õ", "o" );
            texto = texto.replace("Ã", "A" );
            texto = texto.replace("Õ", "O" );

            texto = texto.replace("ç", "c" );
            texto = texto.replace("Ç", "C" );

            texto = texto.replace("ü", "u" );
            texto = texto.replace("Ü", "U" );

            texto = texto.replace("à", "a" );
            texto = texto.replace("è", "e" );
            texto = texto.replace("ì", "i" );
            texto = texto.replace("ò", "o" );
            texto = texto.replace("ù", "u" );
            texto = texto.replace("À", "A" );
            texto = texto.replace("È", "E" );
            texto = texto.replace("Ì", "I" );
            texto = texto.replace("Ò", "O" );
            texto = texto.replace("Ù", "U" );

            return texto
        };

        VsStringUtils.isValidEmail = function (email) {
            return EMAIL_REGEXP.test(email);
        };

        return VsStringUtils;
    }])

    .factory('VsBeanUtils', [function(){

        var VsBeanUtils = function(){};
        /**
         * Replace all properties by source
         * @param source
         * @param destination
         */
        VsBeanUtils.replaceAll = function (destination, source) {

            if(source == undefined || destination == undefined)
                return;

            for (var prop in source) {
                if (source[prop] instanceof  Array) {
                    destination[prop] = source[prop].slice(0);
                } else if(source[prop] != null && typeof(source[prop])=="object") {
                    if (destination[prop] == null || destination[prop] == undefined)
                        destination[prop] = {};
                    this.replaceAll(destination[prop], source[prop]);
                } else {
                    destination[prop] = source[prop];
                }
            }
        };

        /**
         * Replace value for nested object
         * @param data
         * @param expression
         * @param value
         */
        VsBeanUtils.replaceValue = function (data, expression, value) {
            var expressionPath = expression.split(".");
            var lastExpressionPath = expressionPath.pop();

            var itemData = data;
            for (var path in expressionPath) {
                itemData = itemData[expressionPath[path]];

                if (itemData == null || itemData == undefined)
                    itemData = {};
            }

            itemData[lastExpressionPath] = value;
        };

        /**
         * Evaluate value of nested object by expression
         * @param data
         * @param expression
         * @returns {*}
         */
        VsBeanUtils.evaluate = function (data, expression) {

            var expressionPath = expression.split(".");

            var itemData = data;
            for (var i in expressionPath) {
                if (itemData != null)
                    itemData = itemData[expressionPath[i]];
            }

            return itemData;
        };

        return VsBeanUtils;
    }]);

angular.module('vision.event', ['vision.utils'])

    /**
     * Event driven
     */
    .factory('VisionEventDispatcher', ['VsArrayUtils', '$filter', '$q', function(VsArrayUtils, $filter, $q){

        var VisionEventDispatcher = function(){

            var listeners = {};

            /**
             * Add listener
             * @param type
             * @param resultHandler
             * @param priority
             */
            this.listen = function(type, resultHandler, priority){

                if (!angular.isDefined(priority))
                    priority = 0;

                if (listeners[type] == null){
                    listeners[type] = [];
                };

                var listenerExists = false;
                for (var i = 0; i < listeners[type].length; i++){
                    if (listeners[type][i].resultHandler == resultHandler){
                        listenerExists = true;
                        break;
                    }
                }

                if (!listenerExists)
                    listeners[type].push({type:type, resultHandler: resultHandler, priority: priority});

            };

            /**
             * Remove listener
             * @param type
             * @param listenHandler
             */
            this.removeListener = function(type, resultHandler){
                var indexOf = VsArrayUtils.getItemIndexByPropertyValue(listeners[type], 'resultHandler', resultHandler);
                if (indexOf > 0){
                    listeners[type].splice(indexOf, 1);
                }
            };

            /**
             * Remove all listeners by type, or remove all if type isn't informed
             * @param type
             */
            this.removeAllListeners = function(type){
                if (type){
                    delete listeners[type];
                }else{
                    listeners = {};
                }
            };

            /**
             * Dispatch event
             * @param event
             */
            this.dispatch = function(event){

                event.target = this;

                var eventListeners = listeners[event.type];
                eventListeners = $filter('orderBy')(eventListeners, 'priority', true);

                //Dispara os listeners
                var stopped = false;

                var promises = [];

                angular.forEach(eventListeners, function(listener){
                    if (!stopped){
                        var promise = listener.resultHandler(event);
                        if (angular.isDefined(promise) && typeof promise.then === 'function'){
                            promises.push(promise);
                        }
                        stopped = event.stopped;
                    }
                });

                return $q.all(promises).then(function(values){
                    return values[0];
                });
            };
        };

        return VisionEventDispatcher;
    }]);

/**
 * VisionEvent class
 * @param type
 * @param resultObject
 * @constructor
 */
var VisionEvent = function(type, resultObject){

    this.type = type;
    this.resultObject = resultObject;
    this.target = undefined;
    this.stopped = false;

    this.stopPropagation = function(){
        this.stopped = true;
    };
};