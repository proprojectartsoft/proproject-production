ppApp.controller('RegistersCtrl', [
    '$scope',
    '$rootScope',
    '$stateParams',
    'RegisterService',
    'CacheFactory',
    'AuthService',
    '$ionicPopup',
    '$state',
    '$ionicSideMenuDelegate',
    '$timeout',
    '$ionicHistory',
    'PostService',
    function($scope, $rootScope, $stateParams, RegisterService, CacheFactory, AuthService, $ionicPopup, $state, $ionicSideMenuDelegate, $timeout, $ionicHistory, PostService) {
        $scope.isLoaded = false;

        $scope.$on('$ionicView.enter', function() {
            $ionicHistory.clearHistory();
            $ionicSideMenuDelegate.canDragContent(false);
        });

        $scope.hasData = '';
        $rootScope.slideHeader = false;
        $rootScope.slideHeaderPrevious = 0;
        $rootScope.slideHeaderHelper = false;

        $scope.$on('$stateChangeSuccess', function() {});

        AuthService.me().then(function(user) {
            if (user && user.active === false) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Your account has been de-activated. Contact your supervisor for further information.',
                });
                alertPopup.then(function(res) {
                    var projectsCache = CacheFactory.get('projectsCache');
                    if (projectsCache) {
                        projectsCache.destroy();
                    }
                    var designsCache = CacheFactory.get('designsCache');
                    if (designsCache) {
                        designsCache.destroy();
                    }
                    var instanceCache = CacheFactory.get('instanceCache');
                    if (instanceCache) {
                        instanceCache.destroy();
                    }
                    var registersCache = CacheFactory.get('registersCache');
                    if (registersCache) {
                        registersCache.destroy();
                    }
                    var registerCache = CacheFactory.get('registerCache');
                    if (registerCache) {
                        registerCache.destroy();
                    }

                    var reloadCache = CacheFactory.get('reloadCache');
                    if (reloadCache) {
                        reloadCache.destroy();
                    }

                    var syncCache = CacheFactory.get('sync');
                    if (syncCache) {
                        syncCache.destroy();
                    }

                    var settingsCache = CacheFactory.get('settings');
                    if (settingsCache) {
                        settingsCache.destroy();
                    }
                    AuthService.logout().success(function() {}, function() {});
                    $state.go('login');
                });

            }
        }, function errorCallback(error) {});

        $scope.refresh = function(isInit) {
            PostService.post({
                method: 'GET',
                url: 'newregister',
                params: {
                    projectid: $stateParams.projectId,
                    categoryid: $stateParams.categoryId
                }
            }, function(res) { //TODO: check the flow
                if (res.data && !res.data.length) {
                    $scope.hasData = 'no data';
                }
                if (isInit) {
                    $scope.isLoaded = true;
                    $scope.registers = res.data;
                    if (!res.data) {
                        $scope.hasData = 'no data';
                    }
                } else {
                    if (res.data) {
                        $scope.registers = res.data;
                    }
                    $scope.$broadcast('scroll.refreshComplete');
                }
            }, function(err) {
                console.log(err);
            });
        }

        if ($stateParams.categoryId) {
            $rootScope.categoryId = $stateParams.categoryId;
            $scope.refresh(true);
        }
        $scope.categoryName = $rootScope.categories[$stateParams.categoryId - 1].name;
    }
]);
