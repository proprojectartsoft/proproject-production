ppApp.controller('CategoriesCtrl', [
    '$scope',
    '$ionicSideMenuDelegate',
    '$ionicHistory',
    function($scope, $ionicSideMenuDelegate, $ionicHistory) {
        $scope.$on('$ionicView.enter', function() {
            $ionicHistory.clearHistory();
            $ionicSideMenuDelegate.canDragContent(false);
        });
    }
]);
