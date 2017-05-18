angular.module($APP.name).factory('StaffService', [
    '$http', '$rootScope',
    function($http, $rootScope) {
        return {
            //list the added staff for a form given by id
            get_field: function(id) {
                return $http.get($APP.server + '/api/stafffield', {
                    params: {
                        id: id
                    },
                }).then(function(payload) {
                    return payload.data;
                });
            },
            //add staff for a form
            add_field: function(data) {
                return $http.post($APP.server + '/api/stafffield', data, {}).then(function successCallback(response) {
                    return response.data;
                }, function errorCallback(response) {
                    return response.data;
                });
            },
            //update staff for a form
            update_field: function(data) {
                return $http.put($APP.server + '/api/stafffield', data, {}).then(function successCallback(response) {
                    return response.data;
                }, function errorCallback(response) {
                    return response.data;
                });
            },
            //list all staffs
            list_manager: function() {
                return $http.get($APP.server + '/api/staff').then(
                    function(payload) {
                        return payload.data;
                    });
            },
            upload: function(data) {
                var fd = new FormData();
                for (var key in data)
                    fd.append(key, data[key]);
                return $http.post($APP.server + 'api/stafffield/importstaffsfile', fd, {
                    headers: {
                        'Content-Type': undefined
                    }
                }).then(function successCallback(response) {
                    $rootScope.uploadStatus = 'ok';
                }, function errorCallback(response) {
                    $rootScope.uploadStatus = 'error';
                });
            },
        };
    }
]);
