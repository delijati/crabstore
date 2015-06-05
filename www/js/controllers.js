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
  '$rootScope',
  '$ionicPopup',
  function($scope, $stateParams, crabstore, $ionicSlideBoxDelegate, $rootScope, $ionicPopup) {
    $scope.item = crabstore.getItemById($stateParams.itemId);
    $scope.download = {progress:0};

    // An alert dialog
    var showPopUp = function() {
      return $ionicPopup.show({
        title: 'Download progress',
        scope: $scope,
        templateUrl: 'templates/download.html',
        buttons: [
          {
            text: '<b>Cancle</b>',
            type: 'button-assertive',
            onTap: function(e) {
              $scope.download.ft.abort();
            }
          }
        ]
      });
    };

    $scope.doDownload = function() {
      var popUp = showPopUp();
      $scope.downloadDisabled = true;
      crabstore.download(
        $stateParams.itemId,
        $scope.item,
        function(result) {
          console.log('success download');
          console.log(result);
          $scope.downloadDisabled = false;
          $scope.download = {progress:0};
          popUp.close();
        },
        function(err) {
          console.log('error in download');
          console.log(err);
          $scope.downloadDisabled = false;
          $scope.download = {progress:0};
          popUp.close();
        },
        function(download) {
          console.log(download.progress);
          angular.copy(download, $scope.download);
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
