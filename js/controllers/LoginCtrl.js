angular.module($APP.name).controller('LoginCtrl', [
    '$scope',
    '$state',
    'AuthService',
    '$rootScope',
    '$timeout',
    '$ionicPopup',
    'SyncService',
    function($scope, $state, AuthService, $rootScope, $timeout, $ionicPopup, SyncService) {
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
                }).error(function(err, status) {
                    console.log(status);
                    if (status === 0 || status === -1) {
                        console.log($scope.user.username);
                        console.log($scope.user.password);
                        localStorage.setObject('userToLog', {
                            'username': $scope.user.username,
                            'password': $scope.user.password
                        })
                        localStorage.setObject('ppreload', {
                            'username': $scope.user.username,
                            'password': $scope.user.password
                        });
                        var alertPopup = $ionicPopup.alert({
                            title: 'Please Note',
                            template: "You are offline. Whilst you have no connection you can complete new forms for later syncing with the server but you will not be able to review previously completed forms and registers.",
                        });
                        alertPopup.then(function(res) {});
                    }
                    $rootScope.thisUser = localStorage.getObject("ppuser");
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
            }).error(function(err, status) {
                if (status === 0 || status === -1) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error',
                        template: "You are offline. You can login when online.",
                    });
                    alertPopup.then(function(res) {});
                }
                localStorage.removeItem('loggedOut');
                SyncService.sync_close();
            })
        };
    }
]);
