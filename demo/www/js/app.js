angular.module('starter', ['ionic', 'ngCordova', 'vision.persist', 'starter.controllers', 'starter.services'])

    .run(function ($ionicPlatform, $connectionFactory, Chats) {
        $ionicPlatform.ready(function () {

            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }

            var dbConfig = {
                name: 'visionPersistDemo.db',
                showSQL: true,
                entities: {
                    chat: {
                        id:         {type: 'integer primary key'},
                        name:       {type: 'text'},
                        lastText:   {type: 'text'},
                        face:       {type: 'text'}
                    }
                }
            };
            $connectionFactory.init(dbConfig);

            //Initiate
            Chats.populateSampleData();
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider

            .state('tab', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html'
            })

            // Each tab has its own nav history stack:

            .state('tab.dash', {
                url: '/dash',
                views: {
                    'tab-dash': {
                        templateUrl: 'templates/tab-dash.html',
                        controller: 'DashCtrl'
                    }
                }
            })

            .state('tab.chats', {
                url: '/chats',
                views: {
                    'tab-chats': {
                        templateUrl: 'templates/tab-chats.html',
                        controller: 'ChatsCtrl'
                    }
                }
            })
            .state('tab.chat-detail', {
                url: '/chats/:chatId',
                views: {
                    'tab-chats': {
                        templateUrl: 'templates/chat-detail.html',
                        controller: 'ChatDetailCtrl'
                    }
                }
            })

            .state('tab.account', {
                url: '/account',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/tab-account.html',
                        controller: 'AccountCtrl'
                    }
                }
            });

        $urlRouterProvider.otherwise('/tab/dash');

    });
