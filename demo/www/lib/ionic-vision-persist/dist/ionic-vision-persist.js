(function () {
    'use strict';

    angular.module('vision.persist', ['ngCordova', 'vision.event'])

        .factory('$connectionFactory',['$cordovaSQLite', '$window', function ($cordovaSQLite, $window) {

            var db = undefined;
            var showSQL = false;
            var entities = {};

            return {
                getDb: function(){
                    return db;
                },
                getEntities: function(){
                    return entities;
                },
                init: init,
                execute: execute
            };

            function init(dbConfig){

                if ($window.cordova)
                    db = $cordovaSQLite.openDB(dbConfig.name);
                else
                    db = window.openDatabase(dbConfig.name, '1.0', 'database', -1);

                showSQL = dbConfig.showSQL;
                entities = dbConfig.entities;

                var columns;
                var entity;
                for (var entityName in entities){
                    entity = entities[entityName];
                    columns = [];
                    for (var property in entity){
                        columns.push(property + ' ' +  entity[property].type);
                    }
                    var query = 'CREATE TABLE IF NOT EXISTS ' + entityName + ' (' + columns.join(',') + ')';
                    execute(query);
                }
            };

            function execute (query, bindings) {
                return $cordovaSQLite.execute(db, query, bindings).then(function (result) {
                    if (showSQL)
                        console.info('SqlQuery: ' + query);
                    return result;
                }, function(response){
                    //TODO Criar um tratamento especial para erros, pois podem ser de constraint e etc.., não é interessante realizar throw em todos
                    throw response;
                });
            };
        }])

        .factory('DataSet', ['VsUtil', '$connectionFactory', 'VisionEventDispatcher',
            function (VsUtil, $connectionFactory, VisionEventDispatcher) {

                var DataSet = function (entityName) {

                    var self = this;
                    var canceled = false;
                    this.entityName = entityName;
                    this.entity = {};
                    this.appendAfterSave = false;
                    this.resultList = [];

                    VisionEventDispatcher.call(this);

                    /**
                     * Clear entity and instantiate new Object
                     */
                    this.append = function(){
                        canceled = false;
                        this.entity = {};
                        this.dispatch(new DataSetEvent((DataSetEvent.AFTER_APPEND)));
                    };

                    this.cancel = function () {
                        canceled = true;
                    };

                    /**
                     * Save entity
                     * @returns {*}
                     */
                    this.save = function () {

                        canceled = false;

                        this.dispatch(new DataSetEvent(DataSetEvent.BEFORE_SAVE));

                        if (!canceled) {

                            var executeConfig;
                            if (VsUtil.isFilled(self.entity.id))
                                executeConfig = getUpdateConfig();
                            else
                                executeConfig = getInsertConfig();

                            return $connectionFactory.execute(executeConfig.sql, executeConfig.parameters).then(function (result) {

                                if (self.appendAfterSave)
                                    self.append();

                                self.dispatch(new DataSetEvent(DataSetEvent.AFTER_SAVE), result);
                            });

                        } else {
                            var deferred = $q.defer();
                            //timeout to process reject if canceled;
                            $timeout(function () {
                                deferred.reject();
                            });

                            return deferred.promise;
                        }
                    };

                    /**
                     * Remove entity
                     * @returns {*}
                     */
                    this.remove = function () {

                        this.dispatch(new DataSetEvent(DataSetEvent.BEFORE_REMOVE));

                        if (!VsUtil.isFilled(this.entity.id)) {
                            throw 'ID is required for remove operation.';
                        }

                        var parameters = [this.entity.id];
                        return $connectionFactory.execute('delete from ' + this.entityName + ' where id = (?)', parameters).then(function (result) {
                            self.dispatch(new DataSetEvent(DataSetEvent.AFTER_REMOVE, result));
                            return result;
                        });
                    };

                    /**
                     * Find by id
                     * @param id
                     * @returns {*}
                     */
                    this.get = function(id){
                        this.entity = {};
                        return $connectionFactory.execute('select * from ' + this.entityName + ' where id = (?)', [id])
                            .then(function(result){
                                self.entity = result.rows.item(0);
                                self.dispatch(new DataSetEvent(DataSetEvent.GET_RESULT, self.entity));
                                return self.entity;
                            });
                    };

                    /**
                     * Find all
                     * @returns {*}
                     */
                    this.all = function(){
                        return $connectionFactory.execute('select * from ' + this.entityName)
                            .then(function(result){
                                self.resultList = [];

                                for (var i = 0; i < result.rows.length; i++) {
                                    self.resultList.push(result.rows.item(i));
                                }
                                self.dispatch(new DataSetEvent(DataSetEvent.GET_ALL_RESULT, self.resultList));
                                return self.resultList;
                            })
                    };

                    function getInsertConfig() {

                        var parameters = [];
                        var sqlQuery = 'insert into ' + self.entityName + ' (';
                        var propertyValue = '';
                        var entityMetadata = $connectionFactory.getEntities()[self.entityName];
                        for (var key in entityMetadata) {
                            if (key != '$$hashKey') {
                                sqlQuery += ' ' + key + ', ';
                                propertyValue += ' ?, ';

                                //autoincrement do not execute if value is undefined
                                if (key == 'id' && self.entity[key] == undefined)
                                    self.entity[key] = null;

                                parameters.push(self.entity[key]);
                            }
                        }
                        sqlQuery = sqlQuery.substr(0, sqlQuery.length - 2);
                        propertyValue = propertyValue.substr(0, propertyValue.length - 2);
                        sqlQuery += ') values (' + propertyValue + ')';
                        return {
                            sql: sqlQuery,
                            parameters: parameters
                        }
                    };

                    function getUpdateConfig (){
                        var parameters = [];
                        var sqlQuery = 'update ' + self.entityName + ' set ';
                        var entityMetadata = $connectionFactory.getEntities()[self.entityName];
                        for (var key in entityMetadata) {
                            if (key != 'id' && key != '$$hashKey') {
                                sqlQuery += ' ' + key + ' = ?, ';
                                parameters.push(self.entity[key]);
                            }
                        }

                        sqlQuery = sqlQuery.substr(0, sqlQuery.length - 2);
                        sqlQuery += ' where id = ? ';
                        parameters.push(entityMetadata['id']);
                        return {
                            sql: sqlQuery,
                            parameters: parameters
                        }
                    };

                };
                DataSet.prototype = new VisionEventDispatcher();

                return DataSet;
            }]);
})();

/**
 * DataSet Events
 * @param type
 * @param relatedObject
 * @constructor
 */
var DataSetEvent = function (type, resultObject) {
    VisionEvent.call(this, type, resultObject);
};
DataSetEvent.prototype = new VisionEvent();

DataSetEvent.AFTER_APPEND = 'ds:afterAppend';
DataSetEvent.BEFORE_SAVE = 'ds:beforeSave';
DataSetEvent.AFTER_SAVE = 'ds:afterSave';
DataSetEvent.BEFORE_REMOVE = 'ds:beforeRemove';
DataSetEvent.AFTER_REMOVE = 'ds:afterRemove';
DataSetEvent.GET_RESULT = 'ds:getResult';
DataSetEvent.GET_ALL_RESULT = 'ds:getAllResult';