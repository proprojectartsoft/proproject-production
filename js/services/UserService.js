angular.module($APP.name).service('UserService', [
    '$http',
    '$rootScope',
    '$location',
    function ($http, $rootScope, $location) {
        return {
            update: function (dataIn) {
                $http({
                    method: 'PUT',
                    url: '/api/user',
                    data: dataIn
                }).success(function (response) {
                    $rootScope.$broadcast('reloadTableEvent');
                }).error(function (response) {
                });
            },
            create: function (dataIn) {
                $http({
                    method: 'POST',
                    url: '/api/user',
                    data: dataIn
                }).success(function (response) {
                    $rootScope.$broadcast('reloadTableEvent');
                }).error(function (response) {
                });
            },
            signUp: function (dataIn) {
                $http({
                    method: 'POST',
                    url: '/pub/signup',
                    data: dataIn
                }).success(function (response) {
                    $location.path('/login.html');
                }).error(function (response) {
                });
            },
            list: function () {
                return $http.get('/api/user')
                        .then(
                                function (payload) {
                                    return payload.data;
                                });
            }
        };
    }
]);