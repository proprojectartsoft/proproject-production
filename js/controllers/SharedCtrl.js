ppApp.controller('SharedCtrl', [
    '$rootScope',
    '$scope',
    'PostService',
    'SyncService',
    function($rootScope, $scope, PostService, SyncService) {
        $scope.filter = {
            stateshare: 'form',
            edit: false,
            shared: true
        }
        PostService.post({
            method: 'GET',
            url: 'share',
            params: {
                shared: false
            }
        }, function(result) {
            $scope.sharedListData = result.data;
            $scope.num = result.data.length;
        }, function(err) {
            console.log(err);
        });

        $scope.back = function() {
            delete $scope.formData;
        }
    }
]);
