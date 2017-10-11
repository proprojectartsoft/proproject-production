ppApp.service('InstanceService', [
    '$http',
    '$rootScope',
    'CacheFactory',
    function($http, $rootScope, CacheFactory) {
        return {
            reload: function() {
                var reloadCache = CacheFactory.get('reloadCache');
                if (!reloadCache) {
                    reloadCache = CacheFactory('reloadCache');
                    reloadCache.setOptions({
                        storageMode: 'localStorage'
                    });
                }
                $rootScope.currentUser = reloadCache.get("reload");
                var user = $rootScope.currentUser;
                if (user) {
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
                    }).
                    success(function(user) {})
                        .error(function(fallback) {});;
                }
            }
        };
    }
]);
