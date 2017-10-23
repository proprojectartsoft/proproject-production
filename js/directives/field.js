ppApp.directive('field', [
    '$rootScope',
    '$ionicModal',
    'CommonServices',
    function($rootScope, $ionicModal, CommonServices) {

        return {
            templateUrl: 'view/form/_all.html',
            restrict: 'EA',
            scope: {
                data: '='
            },
            link: function($scope, $elem, $attrs) {
                $scope.value = $scope.data.default_value;
                $scope.dirty = false;
                $scope.submit = false;
                $scope.hash = "H" + $scope.$id;

                $scope.save = function() {
                    $scope.data.value = document.getElementById($scope.hash).toDataURL("image/png");
                    $scope.modal.hide();
                    $scope.modal.remove();
                };

                $scope.data = CommonServices.viewField($scope.data);

                $scope.$on('submit', function() {
                    if ($scope.data.type === "checkbox") {
                        $scope.data.value = $scope.data.value ? true : false;
                    }
                    $scope.submit = true;
                });
                $scope.directiveClick = function(hash) {
                    $ionicModal.fromTemplateUrl('view/form/_modal.html', {
                        scope: $scope,
                        backdropClickToClose: false,
                        hardwareBackButtonClose: false,
                    }).then(function(modal) {
                        $scope.modal = modal;
                        $scope.modal.hash = $scope.hash;
                        $scope.modal.show();
                    });
                };

                $scope.$watch('data.errors', function(data) {
                    if (data && data.length) {
                        angular.element($elem[0].firstChild).addClass('has-error');
                        $rootScope.$emit('invalidField', $scope.data);
                    } else {
                        angular.element($elem[0].firstChild).removeClass('has-error');
                        $rootScope.$emit('validField', $scope.data);
                    }
                });

                $scope.$watch('data.value', function(data) {
                    if ($scope.value !== $scope.data.value) {
                        $scope.dirty = true;
                    }
                    if ((!$scope.data.value && $scope.dirty) || $scope.submit || ($scope.data.value && $scope.data.errors && $scope.data.errors.length)) {
                        $scope.$emit('validateField', $scope.data);
                    }
                });
                $scope.$on('focus', function() {
                    $elem.addClass('focus');
                });

                $scope.$on('blur', function() {
                    $elem.removeClass('focus');
                });

            }
        };
    }
]);
