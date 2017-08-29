angular.module($APP.name).controller('NavCtrl', [
    '$rootScope',
    '$state',
    'AuthService',
    '$scope',
    '$ionicSideMenuDelegate',
    'CacheFactory',
    '$timeout',
    '$http',
    '$ionicPopup',
    'SyncService',
    'DbService',
    function($rootScope, $state, AuthService, $scope, $ionicSideMenuDelegate, CacheFactory, $timeout, $http, $ionicPopup, SyncService, DbService) {
        //assign the arrow or the burger menu icon when appropriate
        $scope.$watch(function() {
            return $('body').attr('class');
        }, function(cls) {
            if (cls.indexOf("menu-open") !== -1) {
                $('.menu-btn button').removeClass("ion-navicon");
                $('.menu-btn button').addClass("ion-android-arrow-back");
            } else {
                $('.menu-btn button').addClass("ion-navicon");
                $('.menu-btn button').removeClass("ion-android-arrow-back");
            }
        });
        $scope.toggleLeft = function($event) {
            $ionicSideMenuDelegate.toggleLeft();
            $($event.target)
                .toggleClass("ion-navicon")
                .toggleClass("ion-android-arrow-back");
        };
        var settingsCache = CacheFactory.get('settings');
        if (!settingsCache) {
            settingsCache = CacheFactory('settings');
            settingsCache.setOptions({
                storageMode: 'localStorage'
            });
        }

        $rootScope.categories = [{
                "id": 1,
                "name": "Health and Safety",
                "description": "Health and safety category",
                "image_url": "healthsafety"
            },
            {
                "id": 2,
                "name": "Design",
                "description": "Design category",
                "image_url": "design"
            },
            {
                "id": 3,
                "name": "Quality Assurance",
                "description": "Quality Assurance category",
                "image_url": "qa"
            },
            {
                "id": 4,
                "name": "Contractual",
                "description": "Contractual category",
                "image_url": "contractual"
            },
            {
                "id": 5,
                "name": "Environmental",
                "description": "Environmental category",
                "image_url": "environmental"
            },
            {
                "id": 6,
                "name": "Financial",
                "description": "Financial category",
                "image_url": "financial"
            }
        ];
        $scope.isDisconnect = {
            checked: false
        };
        $scope.pushIsDisconnectChange = function() {
            if ($scope.isDisconnect.checked) {
                $scope.logout();
            }
        };
        $scope.logout = function() {
            if (navigator.onLine) {
                SyncService.sync_close();
                AuthService.logout().success(function() {});
                localStorage.setObject('loggedOut', true);
                $state.go('login');
            } else {
                $timeout(function() {
                    DbService.popopen('Error', "<center>Can't log out now. You are offline.</center>")
                })
            }
        };
        $scope.force_logout = function() {
            AuthService.logout().success(function() {});
        }
        $scope.updateTitle = function(project) {
            $rootScope.navTitle = project.name;
            $rootScope.projectId = project.id;
            localStorage.setObject('ppnavTitle', project.name);
            localStorage.setObject('ppprojectId', project.id);
        };

        $scope.sync = function() {
            if (navigator.onLine) {
                SyncService.sync_button();
            } else {
                var offlinePopup = $ionicPopup.alert({
                    title: "You are offline",
                    template: "<center>You cannot sync your data when offline</center>",
                    content: "",
                    buttons: [{
                        text: 'Ok',
                        type: 'button-positive',
                        onTap: function(e) {
                            offlinePopup.close();
                        }
                    }]
                });
            }
        };
        $rootScope.$on('sync.todo', function() {
            $state.go('app.categories', {
                'projectId': $rootScope.projectId
            });
            $scope.sync();
        });
    }
]);
