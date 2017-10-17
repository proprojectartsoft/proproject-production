ppApp.controller('FormsCtrl', [
    '$scope',
    '$stateParams',
    '$rootScope',
    'AuthService',
    '$state',
    '$ionicHistory',
    '$anchorScroll',
    '$ionicSideMenuDelegate',
    'SyncService',
    'DbService',
    'SettingService',
    'SyncService',
    function($scope, $stateParams, $rootScope, AuthService, $state, $ionicHistory, $anchorScroll, $ionicSideMenuDelegate, SyncService, DbService, SettingService, SyncService) {

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
        $APP.db.transaction(function(tx) {
            tx.executeSql('SELECT * FROM DesignsTable WHERE category_id = ?', [$stateParams.categoryId], function(tx, rs) {
                var aux = [];
                for (var i = 0; i < rs.rows.length; i++) {
                    aux.push(JSON.parse(rs.rows.item(i).data));
                }
                $rootScope.formDesigns = aux;
                $scope.isLoaded = true;
                if ($rootScope.formDesigns.length === 0) {
                    $scope.hasData = 'no data';
                }
            }, function(error) {
                console.log('Error selecting designs', error);
            });
        });

        $scope.categoryName = $rootScope.categories[$stateParams.categoryId - 1].name;

        $scope.refresh = function() {
            $rootScope.formDesigns = [];
            designsCache = SyncService.getDesigns(); //DbService.get('designs');
            angular.forEach(designsCache, function(aux) {
                if (aux.category_id === parseInt($stateParams.categoryId)) {
                    $rootScope.formDesigns.push(aux);
                }
            });
        };

        $scope.fixScroll = function() {
            $rootScope.slideHeader = false;
            $rootScope.slideHeaderPrevious = 0;
            $rootScope.slideHeaderHelper = false;
        }
    }
]);
