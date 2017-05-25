angular.module($APP.name).controller('LoginCtrl', [
    '$scope',
    '$state',
    'AuthService',
    'CacheFactory',
    '$rootScope',
    '$timeout',
    'SyncService',
    function($scope, $state, AuthService, CacheFactory, $rootScope, $timeout, SyncService) {
        $scope.user = [];
        $scope.user.username = "";
        $scope.user.password = "";
        $scope.user.rememberMe = false;
        $scope.popupOpen = false;
        var ppremember = localStorage.getObject('ppremember');
        if (ppremember) {
            $scope.user.username = ppremember.username;
            $scope.user.password = ppremember.password;
            $scope.user.rememberMe = true;
            if (!localStorage.getObject('loggedOut')) {
                AuthService.login({
                    username: $scope.user.username,
                    password: $scope.user.password
                }).success(function(response) {
                    localStorage.removeItem('loggedOut');
                    if (response) {
                        $timeout(function() {
                            SyncService.sync_close();
                            SyncService.sync_button();
                        });
                    }
                }).error(function(err) {
                    localStorage.removeItem('loggedOut');
                    SyncService.sync_close();
                })
            }
        }

        $scope.login = function() {
            AuthService.login({
                username: $scope.user.username,
                password: $scope.user.password
            }).success(function(response) {
                localStorage.removeItem('loggedOut');
                if (response) {
                    if ($scope.user.rememberMe) {
                        localStorage.setObject('ppremember', {
                            'username': $scope.user.username,
                            'password': $scope.user.password
                        });
                    } else {
                        localStorage.clear();
                    }
                    $timeout(function() {
                        SyncService.sync_close();
                        localStorage.setObject('ppreload', {
                            'username': $scope.user.username,
                            'password': $scope.user.password
                        });
                        SyncService.sync_button();
                    });
                }
            }).error(function(err) {
                localStorage.removeItem('loggedOut');
                SyncService.sync_close();
            })
        };
    }
]);
