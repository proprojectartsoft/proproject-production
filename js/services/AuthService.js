angular.module($APP.name).factory('AuthService', [
    '$http',
    '$location',
    '$state',
    '$rootScope',
    'CacheFactory',
    '$ionicPopup',
    '$ionicPlatform',
    function($http, $location, $state, $rootScope, CacheFactory, $ionicPopup, $ionicPlatform) {
        var settingsCache = CacheFactory.get('settings');
        return {
            init: function() {
                $http.get($APP.server + '/api/me', {
                    withCredentials: true
                }).success(function(user) {
                    $rootScope.online = true;
                    $rootScope.currentUser = {
                        id: user.id,
                        username: user.username,
                        role_id: user.role.id,
                        role_title: user.role.title,
                        active: user.active
                    };
                    $state.go("app.categories");
                }).error(function(data, status, headers, config) {
                    if (status === 403) {
                        var user = localStorage.getObject("ppreload");
                        if (user) {
                            $http({
                                method: 'POST',
                                url: $APP.server + '/pub/login',
                                withCredentials: true,
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'Accept': 'application/json;odata=verbose'
                                },
                                transformRequest: function(obj) {
                                    return 'login.user.name=' + user.username + '&login.user.password=' + user.password + '&user=true';
                                },
                                data: user
                            }).then(function(user) {
                                if (!user.role) {
                                    user = user.data.data;
                                }
                                $rootScope.currentUser = {
                                    id: user.id,
                                    username: user.username,
                                    role_id: user.role.id,
                                    role_title: user.role.title,
                                    active: user.active
                                };

                                settingsCache = CacheFactory.get('settings');
                                if (!settingsCache) {
                                    settingsCache = CacheFactory('settings');
                                    settingsCache.setOptions({
                                        storageMode: 'localStorage'
                                    });
                                }
                                localStorage.setObject("ppuser", $rootScope.currentUser)
                                $rootScope.online = true;
                                $state.go('app.categories');
                            }, function errorCallback(response) {
                                if (response.status === 0) {
                                    if ($rootScope.online) {
                                        showAlert1.show();
                                        $rootScope.online = false;
                                    }
                                    $rootScope.currentUser = localStorage.getObject("ppuser");
                                    if ($rootScope.currentUser) {
                                        $state.go("app.categories");
                                    }
                                }
                                if (response.status === 502) {
                                    if ($rootScope.online) {
                                        $rootScope.online = false;
                                        alert('Server offline');
                                    }
                                }
                            });
                        } else {
                            $ionicPlatform.ready(function() {
                                $APP.db.transaction(function(tx) {
                                    tx.executeSql('DROP TABLE IF EXISTS ProjectsTable');
                                    tx.executeSql('DROP TABLE IF EXISTS DesignsTable');
                                    tx.executeSql('DROP TABLE IF EXISTS ResourcesTable');
                                    tx.executeSql('DROP TABLE IF EXISTS UnitTable');
                                    tx.executeSql('DROP TABLE IF EXISTS CustsettTable');
                                }, function(error) {
                                    console.log('Transaction ERROR: ' + error.message);
                                }, function() {
                                    var ppremember = localStorage.getObject('ppremember');
                                    if (ppremember) {
                                        localStorage.clear();
                                        localStorage.setObject('ppremember', ppremember)
                                    }
                                });
                                $state.go("login");
                            });
                        }
                        $rootScope.online = true;
                    } else if (status === 502) {
                        $rootScope.online = false;
                    }
                });
            },

            login: function(user) {
                return $http({
                        method: 'POST',
                        url: $APP.server + '/pub/login',
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json;odata=verbose'
                        },
                        transformRequest: function(obj) {
                            return 'login.user.name=' + user.username + '&login.user.password=' + user.password + '&user=true';
                        },
                        data: user
                    }).success(function(payload) {
                        $rootScope.online = true;
                        $rootScope.currentUser = {
                            id: payload.data.id,
                            username: payload.data.username,
                            role_id: payload.data.role.id,
                            role_title: payload.data.role.title,
                            active: payload.data.active
                        };
                        var settingsCache = CacheFactory.get('settings');
                        if (!settingsCache) {
                            settingsCache = CacheFactory('settings');
                            settingsCache.setOptions({
                                storageMode: 'localStorage'
                            });
                        }
                        localStorage.setObject("ppuser", $rootScope.currentUser)
                        return payload.data.data;
                    })
                    .error(function(response, status) {
                        if (status === 0 || status === -1) {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Please Note',
                                template: "You are offline. Whilst you have no connection you can complete new forms for later syncing with the server but you will not be able to review previously completed forms and registers.",
                            });
                            alertPopup.then(function(res) {});
                        }
                        if (status === 502) {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Offline',
                                template: "<center>Server offline</center>",
                            });
                            alertPopup.then(function(res) {});
                        }
                        if (status === 400) {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Error',
                                template: "<center>Incorrect user data.</center>",
                            });
                            alertPopup.then(function(res) {});
                        }
                        if (status === 401) {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Error',
                                template: 'Your account has been de-activated. Contact your supervisor for further information.',
                            });
                            alertPopup.then(function(res) {});
                        }
                    })
            },
            logout: function() {
                return $http.post($APP.server + '/pub/logout', {})
                    .success(function() {})
                    .error(function(error) {
                        return 'error';
                    });
            },
            version: function() {
                return $http.get($APP.server + '/api/userversion/session', '', {}).then(function(payload) {
                    return payload.data;
                });
            },
            me: function() {
                return $http.get($APP.server + '/api/me').then(function(user) {
                    $rootScope.online = true;
                    return user.data;
                }, function errorCallback(response) {
                    $rootScope.online = false;
                });
            }
        }
    }
]);
