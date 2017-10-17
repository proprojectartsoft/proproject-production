ppApp.controller('ForgotPasswordCtrl', [
    '$scope',
    'AuthService',
    '$state',
    'SettingService',
    function($scope, AuthService, $state, SettingService) {
        $scope.user = [];
        $scope.user.username = "";
        $scope.submit = function() {
            $scope.syncPopup = SettingService.show_loading_popup("Sending request", "<center><ion-spinner icon='android'></ion-spinner></center>");
            AuthService.forgotpassword($scope.user.username).then(function(result) {
                $scope.user.username = "";
                $state.go('login');
                $scope.syncPopup.close();
            });
        };
    }
]);
