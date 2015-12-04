angular.module('starter.services', [])

    .factory('Chats', function (DataSet) {

        //Populating sample data
        var ds = new DataSet();
        ds.entityName = 'chats';

        ds.appendAfterSave = true;

        ds.entity = {
            id: 0,
            name: 'Ben Sparrow',
            lastText: 'You on your way?',
            face: 'img/ben.png'
        };
        ds.save();

        ds.entity = {
            id: 1,
            name: 'Max Lynx',
            lastText: 'Hey, it\'s me',
            face: 'img/max.png'
        };
        ds.save();

        ds.entity = {
            id: 2,
            name: 'Adam Bradleyson',
            lastText: 'I should buy a boat',
            face: 'img/adam.jpg'
        };
        ds.save();

        ds.entity = {
            id: 3,
            name: 'Perry Governor',
            lastText: 'Look at my mukluks!',
            face: 'img/perry.png'
        };
        ds.save();

        ds.entity = {
            id: 4,
            name: 'Mike Harrington',
            lastText: 'This is wicked good ice cream.',
            face: 'img/mike.png'
        };
        ds.save();

        ds.listen(DataSetEvent.AFTER_APPEND, function(){
            console.log('afterAppend released');
        });

        ds.listen(DataSetEvent.BEFORE_SAVE, function(){
            console.log('beforeSave released');
        });

        ds.listen(DataSetEvent.AFTER_SAVE, function(result){
            console.log('afterSave released');
        });

        return {
            ds: ds
        };
    });
