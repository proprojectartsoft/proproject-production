ppApp.controller('RegisterCtrl', [
    '$scope',
    '$rootScope',
    '$stateParams',
    '$stateParams',
    '$location',
    '$ionicSideMenuDelegate',
    '$ionicHistory',
    'PostService',
    function($scope, $rootScope, $stateParams, $stateParams, $location, $ionicSideMenuDelegate, $ionicHistory, PostService) {
        $rootScope.categoryId = $stateParams.categoryId;
        $scope.refresh = refresh;

        $scope.$on('$ionicView.enter', function() {
            $ionicHistory.clearHistory();
            $ionicSideMenuDelegate.canDragContent(false);
        });

        $rootScope.slideHeader = false;
        $rootScope.slideHeaderPrevious = 0;
        $rootScope.slideHeaderHelper = false;

        $scope.refresh(true);

        $scope.dateToString = function(val) {
            var date = new Date(parseInt(val));
            return date.toString();
        };

        function refresh(isInit) {
            PostService.post({
                method: 'GET',
                url: 'newregister',
                params: {
                    code: $stateParams.code,
                    projectid: $stateParams.projectId
                }
            }, function(res) {
                $scope.listHelp = [];
                $scope.data = res.data;
                $scope.num = $scope.data.records.values.length;
                if (isInit) {
                    $scope.parsedData = $scope.transform(res.data.records);
                }
                $scope.$broadcast('scroll.refreshComplete');
            }, function(err) {
                $scope.$broadcast('scroll.refreshComplete');
                console.log(err);
            });
        }

        $scope.help = function(label, register) {
            for (var i = 0; i < register.length; i++) {
                if (register[i].key === label) {
                    return register[i].value;
                }
            }
            return '-';
        };

        $scope.change = function(id) {
            $rootScope.formId = id;
            PostService.post({
                method: 'GET',
                url: 'forminstance',
                params: {
                    id: $rootScope.formId
                }
            }, function(res) {
                $rootScope.rootForm = res.data;
                $location.path("/app/view/" + $rootScope.projectId + "/register/" + $rootScope.formId);
            }, function(err) {
                console.log(err);
            });
        };

        $scope.transform = function(data) {
            var list = [];
            var aux;
            angular.forEach(data.values, function(register) {
                aux = {};
                angular.forEach(register, function(reg) {
                    if (reg.key === 'Date completed') {
                        aux['date_completed'] = reg.value;
                    } else {
                        aux[reg.key] = reg.value;
                    }
                });
                list.push(aux);
            });
            return list;
        };
    }
]);
