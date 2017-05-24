angular.module($APP.name).controller('CategoriesCtrl', [
    'AuthService',
    'CacheFactory',
    '$state',
    '$scope',
    '$ionicSideMenuDelegate',
    '$ionicHistory',
    function(AuthService, CacheFactory, $state, $scope, $ionicSideMenuDelegate, $ionicHistory) {
        $scope.$on('$ionicView.enter', function() {
            $ionicHistory.clearHistory();
            $ionicSideMenuDelegate.canDragContent(false);
        });

    }
]);
