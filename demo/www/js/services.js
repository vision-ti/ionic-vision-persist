angular.module('starter.services', [])

    .factory('Chats', ['DataSet', function (DataSet) {

        //Populating sample data
        var ds = new DataSet('chat');

        ds.listen(DataSetEvent.AFTER_APPEND, function () {
            console.log('afterAppend released');
        });

        ds.listen(DataSetEvent.BEFORE_SAVE, function () {
            console.log('beforeSave released');
        });

        ds.listen(DataSetEvent.AFTER_SAVE, function (result) {
            console.log('afterSave released');
        });

        return {
            ds: ds,
            get: get,
            remove: remove,
            populateSampleData: populateSampleData
        };

        function get(id){
          return ds.get(id);
        }

        function remove(chat){
            ds.entity = chat;
            return ds.remove();
        }

        function populateSampleData() {

            ds.appendAfterSave = true;

            ds.entity = {
                name: 'Ben Sparrow',
                lastText: 'You on your way?',
                face: 'img/ben.png'
            };
            ds.save();

            ds.entity = {
                name: 'Max Lynx',
                lastText: 'Hey, it\'s me',
                face: 'img/max.png'
            };
            ds.save();

            ds.entity = {
                name: 'Adam Bradleyson',
                lastText: 'I should buy a boat',
                face: 'img/adam.jpg'
            };
            ds.save();

            ds.entity = {
                name: 'Perry Governor',
                lastText: 'Look at my mukluks!',
                face: 'img/perry.png'
            };
            ds.save();

            ds.entity = {
                name: 'Mike Harrington',
                lastText: 'This is wicked good ice cream.',
                face: 'img/mike.png'
            };
            ds.save();
        };
    }]);
