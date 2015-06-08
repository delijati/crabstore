describe('controllers.LoginCtrl', function(){
  var scope;

  // load the controller's module
  beforeEach(module('crabstore'));

  beforeEach(inject(function($rootScope, $controller) {
    scope = $rootScope.$new();
    $controller('LoginCtrl', {$scope: scope});
  }));

  // tests start here
  it('loginData is empty', function(){
    expect(scope.loginData).toEqual({});
  });
});
