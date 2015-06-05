'use strict';

var androidid = '328c8916709f749a'; // use ionic.Platform.device().uuid

angular.module('starter')
.factory('auth', [
  '$http',
  'localStorageService',
  'GoogleAPIUrl',
  function($http, localStorageService, GoogleAPIUrl) {
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
          url: GoogleAPIUrl + '/auth',
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
          console.error(headers);
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
  '$ionicPlatform',
  '$rootScope',
  'GoogleAPIUrl',
  function($http, auth, $cordovaFileTransfer, $ionicPlatform, $rootScope,
           GoogleAPIUrl) {
    var _items = {};

    return {
      _request: function(path, success, error, params) {
        var url = GoogleAPIUrl + '/fdfe/' +  path;
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
        _items = {};
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
      download: function(id, doc, success, error, progress) {
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
              var targetPath = cordova.file.dataDirectory + id + '.apk';
              console.log(targetPath);
              var trustHosts = true;
              var options = {
                headers: {
                  Cookie: cookie.name + '=' + cookie.value
                },
              };

              var ft = $cordovaFileTransfer.download(url, targetPath, options, trustHosts);
              var download = {num:id, progress:0, ft:ft};
              ft.then(function(result) {
                success(result);
              },
              function(err) {
                error(err);
              },
              function (status) {
                download.progress = status.loaded/status.total;
                progress(download);
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
