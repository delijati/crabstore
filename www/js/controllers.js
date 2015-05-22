'use strict';

angular.module('starter')
.controller('AppCtrl', [
  '$rootScope',
  '$scope',
  '$ionicModal',
  '$timeout',
  'auth',
  function($rootScope, $scope, $timeout, auth) {
    //
  }
])

.controller('LoginCtrl', [
  '$rootScope',
  '$scope',
  '$timeout',
  '$location',
  'auth',
  function($rootScope, $scope, $timeout, $location, auth) {
    // Form data for the login modal
    $scope.loginData = {};

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
      auth.createToken(
        $scope.loginData,
        function(token) {
          console.log(token);
          $location.path('/app/items');
        },
        function(text) {
          console.log(text);
        }
      );
    };
  }
])

.controller('ItemsCtrl',[
  '$scope',
  'crabstore',
  function($scope, crabstore) {
    $scope.searchData = {};
    $scope.items = [];

    $scope.doSearch = function() {
      console.log($scope.searchData.text);
      crabstore.search(
        $scope.searchData.text,
        function(data) {$scope.items = data;},
          function(data) {$scope.items = data;}
      );
    };

  }
])

.controller('ItemCtrl', [
  '$scope',
  '$stateParams',
  'crabstore',
  '$ionicSlideBoxDelegate',
  function($scope, $stateParams, crabstore, $ionicSlideBoxDelegate) {
    $scope.item = crabstore.getItemById($stateParams.itemId);
    $scope.doDownload = function() {
      crabstore.download(
        $stateParams.itemId,
        function() {
        },
        function() {
        }
      );
    };
    crabstore.getDetailsByPath(
      $scope.item.detailsUrl,
      function(data) {
        $scope.detail = data;
        // XXX needed to load calculate with 
        $ionicSlideBoxDelegate.$getByHandle('image-viewer').update();
      },
      function(data) {
        $scope.detail = data;
        // XXX needed to load calculate with 
        $ionicSlideBoxDelegate.$getByHandle('image-viewer').update();
      }
    );
  }
]);