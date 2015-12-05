(function () {
    'use strict';

    angular.module('vision.persist', ['ngCordova', 'vision.event'])

        .factory('$connectionFactory',['$cordovaSQLite', '$window', function ($cordovaSQLite, $window) {

            var db;
            var showSQL = false;
            var entities;

            return {
                db: db,
                showSQL: showSQL,
                entities: entities,
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

                    VisionEventDispatcher.call(this);

                    var getInsertConfig = function () {

                        var parameters = [];
                        var sqlQuery = 'insert into ' + this.entityName + ' (';
                        var propertyValue = '';

                        //TODO Substituir pelo entities configurado no connectionFactory, dessa forma o dataSet fica seguro, e teremos um dataSet por entidade, para garantir os bindings
                        for (var key in this.entity) {
                            if (key != '$$hashKey') {
                                sqlQuery += ' ' + key + ', ';
                                propertyValue += ' ?, ';
                                parameters.push(this.entity[key]);
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

                    var getUpdateConfig = function () {
                        var parameters = [];
                        var sqlQuery = 'update ' + this.entityName + ' set ';

                        //TODO Substituir pelo entities configurado no connectionFactory, dessa forma o dataSet fica seguro, e teremos um dataSet por entidade, para garantir os bindings
                        for (var key in this.entity) {
                            if (key != 'id' && key != '$$hashKey') {
                                sqlQuery += ' ' + key + ' = ?, ';
                                parameters.push(this.entity[key]);
                            }
                        }

                        sqlQuery = sqlQuery.substr(0, sqlQuery.length - 2);
                        sqlQuery += ' where id = ? ';
                        parameters.push(this.entity['id']);
                        return {
                            sql: sqlQuery,
                            parameters: parameters
                        }
                    };

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
                            throw error "ID is required for remove operation.";
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
                        return $connectionFactory.execute('select * from ' + this.entityName + ' where id = (?)', parameters)
                            .then(function(result){
                                this.entity = result.rows.item(0);
                                self.dispatch(new DataSetEvent(DataSetEvent.GET_RESULT, this.entity));
                                return this.entity;
                            });
                    };

                    /**
                     * Find all
                     * @returns {*}
                     */
                    this.all = function(){
                        return $connectionFactory.execute('select * from ' + this.entityName)
                            .then(function(result){
                                var entities = [];

                                for (var i = 0; i < result.rows.length; i++) {
                                    entities.push(result.rows.item(i));
                                }
                                self.dispatch(new DataSetEvent(DataSetEvent.GET_ALL_RESULT, entities));
                                return entities;
                            })
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