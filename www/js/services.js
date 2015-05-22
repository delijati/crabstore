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
  '$cordovaFileTransfer',
  '$timeout',
  '$ionicPlatform',
  function($http, auth, $cordovaFileTransfer, $timeout, $ionicPlatform) {

    var _items = {};

    return {
      _request: function(path, success, error, params) {
        var url = 'https://android.clients.google.com/fdfe/' +  path;
        console.log(url);
        var req = {
          method: 'GET',
          url: url,
          responseType: 'arraybuffer',
          headers: {
            'Authorization': 'GoogleLogin auth=' + auth.token,
            'X-DFE-Device-Id': androidid,
          },
          data: paramBuild(params)
        };
        if (params != undefined) {
          req.method = 'POST';
          req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        $http(req).
          success(
            function(data, status, headers, config) {
              var ProtoBuf = dcodeIO.ProtoBuf;
              var ResponseWrapper = ProtoBuf.loadProtoFile(
                'js/googleplay.proto').build('ResponseWrapper');
                var message = ResponseWrapper.decode(data);
                console.log(message.payload);
                success(message.payload);
            }).
              error(
                function(data, status, headers, config) {
                  error([]);
                });
      },
      getItems: _items,
      getItemById: function(id) {
        return _items[id];
      },
      search: function(text, success, error) {
        console.log(text);
        var path = 'search?c=3&q=' + escape(text);
        this._request(
          path,
          function(payload) {
            var doc = payload.searchResponse.doc[0];
            console.log(doc.child.length);
            for(var i=0; i < doc.child.length; i++) {
              var child = doc.child[i];
              _items[child.docid] = child;
            }
            success(_items);
          },
          function(payload) {
            error([]);
          }
        );
      },
      getDetailsByPath: function(path, success, error) {
        this._request(
          path,
          function(payload) {
            var doc = payload.detailsResponse.docV2;
            success(doc);
          },
          function(payload) {
            error([]);
          }
        );
      },
      download: function(id, doc, success, error) {
        var path = 'purchase';
        var params = {
          ot: doc.offer[0].offerType,
          doc: id,
          vc: doc.details.appDetails.versionCode
        };
        this._request(
          path,
          function(payload) {
            $ionicPlatform.ready(function() {
              var url = payload.buyResponse.
                purchaseStatusResponse.appDeliveryData.downloadUrl;
              var cookie = payload.buyResponse.purchaseStatusResponse.
                appDeliveryData.downloadAuthCookie[0];
              var targetPath = cordova.file.documentsDirectory + id + '.apk';
              var trustHosts = true;
              var options = {
                'User-Agent': 'AndroidDownloadManager/4.1.1 (Linux; U; Android 4.1.1; Nexus S Build/JRO03E)',
                'Cookie': cookie.name + '=' + cookie.value,
              };

              $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
              .then(function(result) {
                // success(doc);
                // Success!
              }, function(err) {
                // Error
              }, function (progress) {
                $timeout(function () {
                  console.log((progress.loaded / progress.total) * 100);
                });
              });
            });
          },
          function(payload) {
            error([]);
          },
          params
        );
      }
    };
  }
]);
