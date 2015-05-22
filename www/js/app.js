// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving
// Angular modules 'starter' is the name of this angular module example (also
// set in a <body> attribute in index.html) the 2nd parameter is an array of
// 'requires' 'starter.controllers' is found in controllers.js
'use strict';

angular.module('starter', ['ionic', 'LocalStorageModule', 'ngCordova'])

.run([
  '$ionicPlatform',
  '$rootScope',
  '$state',
  'auth',
  function($ionicPlatform, $rootScope, $state, auth) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory
      // bar above the keyboard for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
    console.log('RUNNN!!!');

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      console.log('From: ' + fromState.url + ' => To: ' + toState.url);
      console.log(auth.isLoggedIn());
      console.log(auth.token);

      // if(!auth.isLoggedIn() && fromState.url === '^') {
      //   event.preventDefault();
      //   $state.go('app.login');
      // } 

      if(!auth.isLoggedIn() && toState.url !== '/login') {
        event.preventDefault();
        $state.go('app.login');
      }
    });

  }
])

.config([
  '$stateProvider',
  '$urlRouterProvider',
  '$httpProvider',
  'localStorageServiceProvider',
  function($stateProvider, $urlRouterProvider, $httpProvider, localStorageServiceProvider) {
    localStorageServiceProvider
    .setPrefix('crabstore');

    $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })
    .state('app.login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      views: {
        'menuContent': {
          templateUrl: 'templates/login.html',
          controller: 'LoginCtrl'
        }
      }
    })

    .state('app.items', {
      url: '/items',
      views: {
        'menuContent': {
          templateUrl: 'templates/items.html',
          controller: 'ItemsCtrl'
        }
      }
    })

    .state('app.single', {
      url: '/items/:itemId',
      views: {
        'menuContent': {
          templateUrl: 'templates/item.html',
          controller: 'ItemCtrl'
        }
      }
    });

    $urlRouterProvider.otherwise('/app/items');

    // if none of the above states are matched, use this as the fallback
    $httpProvider.interceptors.push(function($q, $location, localStorageService) {
      return {
        'responseError': function(response) {
          console.log(response.status);
          if(response.status === 401 || response.status === 403 || response.status === 405) {
            localStorageService.remove('google_token');
            $location.path('/app/login');
          }
          return $q.reject(response);
        }
      };
    });
  }
]);
