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
    'PostService',
    function($scope, $stateParams, $rootScope, AuthService, $state, $ionicHistory, $anchorScroll, $ionicSideMenuDelegate, SettingService, SyncService, PostService) {

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

        // mixpanel track events
        mixpanel.track("Page view: PP app", {'Page name:': 'Created forms list'});

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
            PostService.post({
                method: 'GET',
                url: 'formdesign/mobilelist',
                params: {
                    categoryId: null
                }
            }, function(result) {
                angular.forEach(result.data, function(aux) {
                    if (aux.category_id === parseInt($stateParams.categoryId)) {
                        $rootScope.formDesigns.push(aux);
                    }
                });
                $APP.db.transaction(function(tx) {
                    tx.executeSql('DROP TABLE IF EXISTS DesignsTable');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS DesignsTable (id int primary key, name text, guidance text, category_id int, permission int, data text)');
                    angular.forEach(result.data, function(form) {
                        tx.executeSql('INSERT INTO DesignsTable VALUES (?,?,?,?,?,?)', [form.id, form.name, form.guidance, form.category_id, form.permission, JSON.stringify(form)]);
                    });
                    $scope.$broadcast('scroll.refreshComplete');
                }, function(error) {
                    $scope.$broadcast('scroll.refreshComplete');
                    console.log('Transaction ERROR: ' + error.message);
                });
            }, function(err) {
                SyncService.getDesigns().then(function(res) {
                    angular.forEach(res, function(aux) {
                        if (aux.category_id === parseInt($stateParams.categoryId)) {
                            $rootScope.formDesigns.push(aux);
                        }
                    });
                    $scope.$broadcast('scroll.refreshComplete');
                })
            })
        };

        $scope.fixScroll = function() {
            $rootScope.slideHeader = false;
            $rootScope.slideHeaderPrevious = 0;
            $rootScope.slideHeaderHelper = false;
        }
    }
]);
