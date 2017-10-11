ppApp.controller('LoginCtrl', [
    '$scope',
    '$state',
    'AuthService',
    '$rootScope',
    '$timeout',
    '$ionicPopup',
    'SyncService',
    function($scope, $state, AuthService, $rootScope, $timeout, $ionicPopup, SyncService) {
        console.log("LOGIN CONTROLLER");
        $scope.user = [];
        $scope.user.username = "";
        $scope.user.password = "";
        $scope.user.rememberMe = false;
        $scope.popupOpen = false;
        var ppremember = localStorage.getObject('ppremember');
        console.log(ppremember);
        if (ppremember) {
            var popup = $ionicPopup.alert({
                title: "Sync",
                template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                content: "",
                buttons: []
            });
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
                            SyncService.sync_button().then(function(res) {
                                popup.close();
                            })
                        });
                    } else {
                        popup.close();
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
            } else {
                popup.close();
            }
        } else {
            console.log("NOT PPREMEMBERED");
        }

        $scope.login = function() {
            var popup = $ionicPopup.alert({
                title: "Sync",
                template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                content: "",
                buttons: []
            });
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
                        SyncService.sync_button().then(function(err) {
                            popup.close();
                        })
                    });
                } else {
                    popup.close();
                }
            }).error(function(err, status) {
                popup.close();
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
