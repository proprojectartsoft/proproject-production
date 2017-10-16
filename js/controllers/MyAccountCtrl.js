ppApp.controller('MyAccountCtrl', [
    '$rootScope',
    '$scope',
    'AuthService',
    'PostService',
    function($rootScope, $scope, AuthService, PostService) {
        $scope.server = $APP.server;
        AuthService.me().then(function(me) {
            if (me !== 'error') {
                $rootScope.role_id = me.role.id;
                $rootScope.accessed = me.accessed;
                PostService.post({
                    method: 'GET',
                    url: 'user',
                    params: {
                        id: id
                    }
                }, function(result) {
                    $scope.profileHeader = result.data;
                }, function(err) {
                    console.log(err);
                });
            }
        });
        $scope.saveChanges = function() {
            PostService.post({
                method: 'PUT',
                url: 'user',
                data: $scope.profileHeader
            }, function(result) {}, function(err) {});
        }
    }
]);
