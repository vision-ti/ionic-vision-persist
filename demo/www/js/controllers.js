angular.module('starter.controllers', [])

    .controller('DashCtrl', function ($scope) {
    })

    .controller('ChatsCtrl', function ($scope, Chats) {

        //to binding when all(), see tab-chats.html ng-reapeat
        $scope.chatDs = Chats.ds;
        Chats.ds.all();

        $scope.remove = function (chat) {
            Chats.remove(chat).then(function(){
                Chats.ds.all();
            });
        };
    })

    .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
        //to binding when get, see chat-detail.html
        $scope.chatDs = Chats.ds;
        Chats.ds.get($stateParams.chatId);
    })

    .controller('AccountCtrl', function ($scope) {
        $scope.settings = {
            enableFriends: true
        };
    });
