ppApp.controller('SharedFormCtrl', [
    '$rootScope',
    '$scope',
    '$stateParams',
    'PostService',
    'CommonServices',
    '$state',
    function($rootScope, $scope, $stateParams, PostService, CommonServices, $state) {

        $scope.filter = {
            state: 'form',
            edit: false,
            shared: true
        }

        //method to list shared comments for the given form
        function listSharedComments() {
            PostService.post({
                method: 'GET',
                url: 'sharedcomment',
                params: {
                    id: $stateParams.formId
                }
            }, function(result) {
                $scope.commentList = result.data;
            }, function(err) {
                console.log(err);
            });
        }
        listSharedComments();
        $scope.back = function() {
            delete $scope.formData;
        }
        $scope.sendComment = function() {
            var aux = {
                "id": 0,
                "shared_form_id": $stateParams.id,
                "user_id": 0,
                "comment": $scope.filter.comment
            }

            PostService.post({
                method: 'POST',
                url: 'sharedcomment',
                data: aux
            }, function(res) {
                $scope.filter.comment = '';
                listSharedComments();
            }, function(err) {
                console.log(err);
            });
        }

        //get all the fields for the current completed form
        CommonServices.getCompletedForm($stateParams.formId).then(function(response) {
            $scope.formData = response.formData;
            $scope.resourceField = $scope.resourceField || response.resourceField;
            $scope.staffField = $scope.staffField || response.staffField;
            $scope.payitemField = $scope.payitemField || response.payitemField;
            $scope.titleShow = $scope.formData.name;
            //TODO: no total here?
        }, function(reason) {
            CommonServices.show_message_popup("Error", reason);
            $state.go('app.shared');
        });

    }
]);
