ppApp.controller('CategoriesCtrl', [
    '$scope',
    '$ionicSideMenuDelegate',
    '$ionicHistory',
    'SyncService',
    'SettingService',
    function($scope, $ionicSideMenuDelegate, $ionicHistory, SyncService, SettingService) {
        $scope.$on('$ionicView.enter', function() {
            $ionicHistory.clearHistory();
            $ionicSideMenuDelegate.canDragContent(false);
        });
        SyncService.getProjects().then(function(res) {
            $scope.projects = res;
            console.log($scope.projects);

        }, function(reason) {
            SettingService.show_message_popup("Error", reason);
        });
    }
]);
