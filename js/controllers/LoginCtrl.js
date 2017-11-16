ppApp.controller('LoginCtrl', [
    '$scope',
    '$state',
    'AuthService',
    '$rootScope',
    '$timeout',
    'SyncService',
    'SettingService',
    '$ionicPlatform',
    function($scope, $state, AuthService, $rootScope, $timeout, SyncService, SettingService, $ionicPlatform) {
        $scope.user = {
            username: "",
            password: "",
            rememberMe: false,
            gmt: -(new Date().getTimezoneOffset() / 60)
        }
        var ppremember = localStorage.getObject('ppremember');
        if (ppremember) {
            $ionicPlatform.ready(function() {
                var popup = SettingService.show_loading_popup("Sync");
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
                                SyncService.sync(true).then(function(res) {
                                    popup.close();
                                    $state.go('app.categories', {
                                        'projectId': $rootScope.projectId
                                    });
                                })
                            });
                        } else {
                            popup.close();
                            $state.go('app.categories', {
                                'projectId': $rootScope.projectId
                            });
                        }
                    }).error(function(err, status) {
                        popup.close();
                        if (status === 0 || status === -1) {
                            localStorage.setObject('userToLog', {
                                'username': $scope.user.username,
                                'password': $scope.user.password
                            })

                            localStorage.setObject('ppreload', {
                                'username': $scope.user.username,
                                'password': $scope.user.password
                            });
                            SettingService.show_message_popup('Please Note', "You are offline. Whilst you have no connection you can complete new forms for later syncing with the server but you will not be able to review previously completed forms and registers.");
                        }
                        $rootScope.thisUser = localStorage.getObject("ppuser");
                        localStorage.removeItem('loggedOut');
                        SyncService.sync_close();
                        $state.go('app.categories', {
                            'projectId': $rootScope.projectId
                        });
                    })
                } else {
                    popup.close();
                }
            });
        }

        $scope.login = function() {
            var popup = SettingService.show_loading_popup("Sync");
            AuthService.login({
                username: $scope.user.username,
                password: $scope.user.password,
                gmt: -(new Date().getTimezoneOffset() / 60)
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
                        SyncService.sync(true).then(function(err) {
                            popup.close();
                            $state.go('app.categories', {
                                'projectId': $rootScope.projectId
                            });
                        })
                    });
                } else {
                    popup.close();
                    $state.go('app.categories', {
                        'projectId': $rootScope.projectId
                    });
                }
            }).error(function(err, status) {
                popup.close();
                if (status === 0 || status === -1) {
                    SettingService.show_message_popup('Error', "<center>You are offline. You can login when online.</center>");
                }
                localStorage.removeItem('loggedOut');
                SyncService.sync_close();
            })
        };
    }
]);
