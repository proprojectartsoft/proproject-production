ppApp.controller('NavCtrl', [
    '$rootScope',
    '$state',
    'AuthService',
    '$scope',
    '$ionicSideMenuDelegate',
    'CacheFactory',
    '$timeout',
    'SyncService',
    'SettingService',
    function($rootScope, $state, AuthService, $scope, $ionicSideMenuDelegate, CacheFactory, $timeout, SyncService, SettingService) {
        $scope.toggleLeft = function($event) {
            $ionicSideMenuDelegate.toggleLeft(true);
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
        $scope.logout = function() {
            if (navigator.onLine) {
                SyncService.sync_close();
                AuthService.logout().success(function() {});
                localStorage.setObject('loggedOut', true);
                localStorage.removeItem('ppremember');
                $state.go('login');
            } else {
                $timeout(function() {
                    SettingService.show_message_popup('Error', "<center>Can't log out now. You are offline.</center>")
                })
            }
        };
        $scope.updateTitle = function(project) {
            $rootScope.navTitle = project.name;
            $rootScope.projectId = project.id;
            localStorage.setObject('ppnavTitle', project.name);
            localStorage.setObject('ppprojectId', project.id);
        };

        $scope.sync = function() {
            if (navigator.onLine) {
                var popup = SettingService.show_loading_popup('Sync');
                SyncService.sync().then(function(res) {
                    popup.close();
                    $state.go('app.categories', {
                        'projectId': $rootScope.projectId
                    });
                })
            } else {
                SettingService.show_message_popup("You are offline", '<center>You cannot sync your data when offline</center>');
            }
        };

        $scope.goOnline = function() {
          window.open('http://proproject.io/', '_system', 'location=yes');
          return false;
        }

        $rootScope.$on('sync.todo', function() {
            console.log('nav ctrl - on sync');
            $state.go('app.categories', {
                'projectId': $rootScope.projectId
            });
            $scope.sync();
        });

        $scope.user = localStorage.getObject("ppuser");
        //mixpanel login info by user
        mixpanel.identify($scope.user.username);

        // mixpanel.time_event("Total time spent on platform");

        mixpanel.register_once({
          'Images uploaded: PP app': 0,
          'Forms completed: PP app': 0,
          'Form shares: PP app': 0
        });

        mixpanel.people.set_once({
          'First Login Date: PP app': new Date(),
          'No. of logins: PP app': 0
        });

        mixpanel.people.set({
          "$last_login": new Date(),         // properties can be dates...
        });

    }
]);
