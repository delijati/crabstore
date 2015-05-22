'use strict';

var androidid = '5B2A2FD8BCADEC6'; // use ionic.Platform.device().uuid

angular.module('starter')
.factory('auth', [
  '$http',
  'localStorageService',
  function($http, localStorageService) {
    return {
      token: localStorageService.get('google_token'),
      isLoggedIn: function() {
        return this.token !== null;
      },
      createToken: function(user, success, error) {
        var self = this;
        var params = {
          'Email': user.username,
          'Passwd': user.password,
          'service': 'androidmarket',
          // 'accountType': 'HOSTED_OR_GOOGLE',
          // 'has_permission': '1',
          // 'source': 'android',
          // 'androidId': androidid, // $scope.loginData.androidid,
          // 'app': 'com.android.vending',
          // 'device_country': 'fr',
          // 'operatorCountry': 'fr',
          // 'lang': 'fr',
          // 'sdk_version': '19'
        };
        var req = {
          method: 'POST',
          url: 'https://android.clients.google.com/auth',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: paramBuild(params)
        };
        $http(req).
          success(function(data, status, headers, config) {
          data = data.split('\n');
          // console.log('login: ' + data.length);
          // console.log(data);
          for(var i=0; i < data.length; i++) {
            if(data[i].toLowerCase().startsWith('auth=')) {
              self.token = data[i].split('=')[1];
              localStorageService.set('google_token', self.token);
              console.log('auth: ' + self.token);
              break;
            }
          }
          success(self.token);
        }).
          error(function(data, status, headers, config) {
          console.error('login error');
          console.error(data);
          error('login error');
        });
      }
    };
  }
])
.factory('crabstore', [
  '$http',
  'auth',
  function($http, auth) {

    var _items = {};

    return {
      getItems: _items,
      getItemById: function(id) {
        return _items[id];
      },
      search: function(text, success, error) {
        console.log(text);
        var path = 'search?c=3&q=' + escape(text);
        var url = 'https://android.clients.google.com/fdfe/' +  path;
        var req = {
          method: 'GET',
          url: url,
          responseType: 'arraybuffer',
          headers: {
            'Authorization': 'GoogleLogin auth=' + auth.token,
            'X-DFE-Device-Id': androidid,
          }
        };
        $http(req).
          success(function(data, status, headers, config) {
          var ProtoBuf = dcodeIO.ProtoBuf;
          var ResponseWrapper = ProtoBuf.loadProtoFile(
            'js/googleplay.proto').build('ResponseWrapper');
            var message = ResponseWrapper.decode(data);
            console.log('Got: ');
            console.log(data.length);
            console.log(message);
            var doc = message.payload.searchResponse.doc[0];
            console.log(doc.child.length);
            for(var i=0; i < doc.child.length; i++) {
              var child = doc.child[i];
              _items[child.docid] = child;
            }
            success(_items);
        }).
          error(function(data, status, headers, config) {
          error([]);
        });
      },
      getDetailsByPath: function(path, success, error) {
        console.log(path);
        var url = 'https://android.clients.google.com/fdfe/' +  path;
        var req = {
          method: 'GET',
          url: url,
          responseType: 'arraybuffer',
          headers: {
            'Authorization': 'GoogleLogin auth=' + auth.token,
            'X-DFE-Device-Id': androidid,
          }
        };
        $http(req).
          success(function(data, status, headers, config) {
          var ProtoBuf = dcodeIO.ProtoBuf;
          var ResponseWrapper = ProtoBuf.loadProtoFile(
            'js/googleplay.proto').build('ResponseWrapper');
            var message = ResponseWrapper.decode(data);
            console.log('Got detail: ');
            console.log(message);
            var doc = message.payload.detailsResponse.docV2;
            success(doc);
        }).
          error(function(data, status, headers, config) {
          error([]);
        });
      },
      download: function(id, success, error) {
        console.log('download');
      }
    };
  }
]);
