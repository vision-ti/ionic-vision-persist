(function(){
    'use strict';

    angular.module('vision.persist', [])
        .factory('$connectionFactory', function($cordovaSQLite){
            return {
                showSQL: false,
                db: undefined,
                init:function(DB_CONFIG){

                    this.db = $cordovaSQLite.openDB(DB_CONFIG.name);
                    this.showSQL = DB_CONFIG.showSQL;

                    angular.forEach(DB_CONFIG.entities, function(table) {
                        var columns = [];

                        angular.forEach(table.columns, function(column) {
                            columns.push(column.name + ' ' + column.type);
                        });

                        var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
                        this.execute(query);
                    });
                },
                execute: function(query, bindings){
                    return $cordovaSQLite.execute(this.db, query, bindings).then(function(result){
                        console.info('SqlQuery: ' + query);
                        return result;
                    }, function(error){
                        console.error('Error on execute SqlQuery: ' + query);
                        console.error(error);
                    });
                }
            };
        });

    angular.module('vision.persist', [])
        .factory('DataSet', function(VsUtil, $connectionFactory, VisionEventDispatcher){

            var DataSet = function(){

                var self = this;
                var canceled = false;
                this.entityName = '';
                this.entity = {};

                VisionEventDispatcher.call(this);

                var getInsertConfig = function(){

                    var parameters = [];
                    var sqlQuery = 'insert into ' + self.entityName + ' (';
                    var propertyValue = '';

                    for(var key in self.entity){
                        if(key != '$$hashKey') {
                            sqlQuery += ' ' + key + ', ';
                            propertyValue += ' ?, ';
                            parameters.push(self.entity[key]);
                        }
                    }
                    sqlQuery = sqlQuery.substr(0, sqlQuery.length-2);
                    propertyValue = propertyValue.substr(0, propertyValue.length-2);
                    sqlQuery += ') values ('+propertyValue+')';
                    return {
                        sql: sqlQuery,
                        parameters: parameters
                    }
                };

                var getUpdateConfig = function(){
                    var parameters = [];
                    var sqlQuery = 'update ' + self.entityName + ' set ';

                    for(var key in self.entity){
                        if(key != 'id' && key != '$$hashKey'){
                            sqlQuery += ' ' + key + ' = ?, ';
                            parameters.push(self.entity[key]);
                        }
                    }

                    sqlQuery = sqlQuery.substr(0, sqlQuery.length-2);
                    sqlQuery += ' where id = ? ';
                    parameters.push(self.entity['id']);
                    return {
                        sql: sqlQuery,
                        parameters: parameters
                    }
                };

                this.cancel = function(){
                    canceled = true;
                };

                this.save = function(){

                    canceled = false;

                    self.dispatch(new DataSetEvent(DataSetEvent.BEFORE_SAVE));

                    if (!canceled){

                        var executeConfig;
                        if (VsUtil.isFilled(self.entity.id))
                            executeConfig = getUpdateConfig();
                        else
                            executeConfig = getInsertConfig();

                        return $connectionFactory.execute(executeConfig.sql, executeConfig.parameters).then(function(result){
                            self.dispatch(new DataSetEvent(DataSetEvent.AFTER_SAVE), result);
                        });

                    }else{
                        var deferred = $q.defer();
                        //timeout to process reject if canceled;
                        $timeout(function(){
                            deferred.reject();
                        });

                        return deferred.promise;
                    }
                };

                this.remove = function(){

                    self.dispatch(new DataSetEvent(DataSetEvent.BEFORE_REMOVE));

                    if (!VsUtil.isFilled(self.entity.id)){
                        throw error "ID is required for remove operation.";
                    }
                    var parameters = [self.entity.id];
                    return $connectionFactory.execute('delete from ' + self.entityName + ' where id = (?)', parameters).then(function(result){
                        self.dispatch(new DataSetEvent(DataSetEvent.AFTER_REMOVE, result));
                        return result;
                    });
                }
            };
            DataSet.prototype = new VisionEventDispatcher();

            return DataSet;
        });
})();

/**
 * Eventos do ClientDataSet
 * @param type
 * @param relatedObject
 * @constructor
 */
var DataSetEvent = function(type, resultObject){
    VisionEvent.call(this, type, resultObject);
};
DataSetEvent.prototype = new VisionEvent();

DataSetEvent.BEFORE_SAVE = 'ds:beforeSave';
DataSetEvent.AFTER_SAVE = 'ds:afterSave';
DataSetEvent.BEFORE_REMOVE = 'ds:beforeRemove';
DataSetEvent.AFTER_REMOVE = 'ds:afterRemove';