angular.module($APP.name).factory('ResourceService', [
    '$http', '$rootScope',
    function($http, $rootScope) {
        return {
            upload: function(data) {
                var fd = new FormData();
                for (var key in data)
                    fd.append(key, data[key]);
                return $http.post($APP.server + 'api/resource/importresourcesfile', fd, {
                    headers: {
                        'Content-Type': undefined
                    }
                }).then(function successCallback(response) {
                    $rootScope.uploadStatus = 'ok';
                }, function errorCallback(response) {
                    $rootScope.uploadStatus = 'error';
                });
            },
            //list all the resources
            list_manager: function() {
                return $http.get($APP.server + '/api/resource').then(
                    function(payload) {
                        return payload.data;
                    });
            },
            //list all units
            list_unit: function() {
                return $http.get($APP.server + '/api/unit').then(
                    function(payload) {
                        return payload.data;
                    });
            },
            list_stage: function() {
                return $http.get($APP.server + '/api/stage').then(
                    function(payload) {
                        return payload.data;
                    });
            },
            //list all resource types
            list_resourcetype: function() {
                return $http.get($APP.server + '/api/resourcetype').then(
                    function(payload) {
                        return payload.data;
                    });
            },
            //list all absenteeism reasons
            list_absenteeism: function() {
                return $http.get($APP.server + '/api/absenteeismreasons/list').then(
                    function(payload) {
                        return payload.data;
                    });
            },
            get_field_design: function(id) {
                return $http.get($APP.server + '/api/resourcefielddesign', {
                    params: {
                        id: id
                    },
                }).then(function(payload) {
                    return payload.data;
                });
            },
            //list all resources added to a form given by id
            get_field: function(id) {
                return $http.get($APP.server + '/api/resourcefield', {
                    params: {
                        id: id
                    },
                }).then(function(payload) {
                    return payload.data;
                });
            },
            //add resources to a form
            add_field: function(data) {
                return $http.post($APP.server + '/api/resourcefield', data, {}).then(function successCallback(response) {
                    return response.data;
                }, function errorCallback(response) {
                    return response.data;
                });
            },
            //update the resources of a form
            update_field: function(data) {
                return $http.put($APP.server + '/api/resourcefield', data, {}).then(function successCallback(response) {
                    return response.data;
                }, function errorCallback(response) {
                    return response.data;
                });
            }
        };
    }
]);
