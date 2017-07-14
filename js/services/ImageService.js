angular.module($APP.name).factory('ImageService', [
    '$http',
    function($http) {
        return {
            create: function(data) {
                return $http.post($APP.server + '/api/image/uploadfiles', data, {
                    withCredentials: true
                }).then(function(payload) {
                    return payload.data;
                });
            }
        }
    }
]);
