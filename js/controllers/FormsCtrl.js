ppApp.controller('FormsCtrl', [
    '$scope',
    '$stateParams',
    '$rootScope',
    'AuthService',
    '$state',
    '$ionicHistory',
    '$anchorScroll',
    '$ionicSideMenuDelegate',
    'SettingService',
    'SyncService',
    function($scope, $stateParams, $rootScope, AuthService, $state, $ionicHistory, $anchorScroll, $ionicSideMenuDelegate, SettingService, SyncService) {

        $scope.$on('$ionicView.enter', function() {
            $ionicHistory.clearHistory();
            $ionicSideMenuDelegate.canDragContent(false);
        });

        $scope.isLoaded = false;
        $scope.hasData = '';
        $scope.categoryId = $stateParams.categoryId;
        $rootScope.slideHeader = false;
        $rootScope.slideHeaderPrevious = 0;
        $rootScope.slideHeaderHelper = false;

        $rootScope.$on('$stateChangeStart', function() {
            $anchorScroll.yOffset = 0;
        });

        AuthService.me().then(function(user) {
            if (user && user.active === false) {
                SettingService.show_message_popup('Error', 'Your account has been de-activated. Contact your supervisor for further information.');
            }
        }, function errorCallback(error) {});
        $rootScope.formDesigns = [];
        SyncService.selectDesignsWhere('category_id', $stateParams.categoryId).then(function(res) {
            $rootScope.formDesigns = res;
            $scope.isLoaded = true;
            if ($rootScope.formDesigns.length === 0) {
                $scope.hasData = 'no data';
            }
        }, function(reason) {
            console.log(reason);
        });

        $scope.categoryName = $rootScope.categories[$stateParams.categoryId - 1].name;

        $scope.refresh = function() {
            $rootScope.formDesigns = [];
            SyncService.getDesigns().then(function(res) {
                designsCache = res;
                angular.forEach(designsCache, function(aux) {
                    if (aux.category_id === parseInt($stateParams.categoryId)) {
                        $rootScope.formDesigns.push(aux);
                    }
                });
                $scope.$broadcast('scroll.refreshComplete');
            })
        };

        $scope.fixScroll = function() {
            $rootScope.slideHeader = false;
            $rootScope.slideHeaderPrevious = 0;
            $rootScope.slideHeaderHelper = false;
        }
    }
]);
