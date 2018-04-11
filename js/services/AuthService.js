ppApp.factory('AuthService', [
    '$http',
    '$state',
    '$rootScope',
    'CacheFactory',
    'SettingService',
    function($http, $state, $rootScope, CacheFactory, SettingService) {
        var settingsCache = CacheFactory.get('settings');
        return {
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
                            return 'login.user.name=' + user.username + '&login.user.password=' + user.password + '&user=true' + '&login.user.gmt=' + user.gmt;
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
                        localStorage.setObject("ppuser", $rootScope.currentUser);
                        // track the elapsed time between a Log In and Log Out event
                        //call time_event at Log In
                        mixpanel.time_event("total time spent on PP app");
                        return payload.data;
                    })
                    .error(function(response, status) {
                        if (status === 502) {
                            SettingService.show_message_popup('Offline', "<center>Server offline</center>");
                        }
                        if (status === 400) {
                            SettingService.show_message_popup('Error', "<center>Incorrect user data.</center>");
                        }
                        if (status === 401) {
                            SettingService.show_message_popup('Error', "Your account has been de-activated. Contact your supervisor for further information.");
                        }
                    })
            },
            logout: function() {
                return $http.post($APP.server + '/pub/logout', {})
                    .success(function() {
                      //call time_event again at Log Out to send an event with the session time
			                mixpanel.track("total time spent on PP app");
                    })
                    .error(function(error) {
                        return 'error';
                    });
            },
            version: function() {
                return $http.get($APP.server + '/api/userversion/session', '', {}).success(function(payload) {
                    return payload.data;
                }).error(function(err) {
                    return err;
                });
            },
            me: function() {
                return $http.get($APP.server + '/api/me').then(function(user) {
                    $rootScope.online = true;
                    return user.data;
                }, function errorCallback(response) {
                    $rootScope.online = false;
                    if (navigator.onLine) {
                      SettingService.show_message_popup('Error', "Your session expired. Please log in to continue.");
                      $state.go('login');
                    }
                });
            }
        }
    }
]);
