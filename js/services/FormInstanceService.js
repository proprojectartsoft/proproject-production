angular.module($APP.name).factory('FormInstanceService', [
    '$rootScope',
    '$http',
    'CacheFactory',
    '$ionicPopup',
    '$location',
    '$timeout',
    '$state',
    'ConvertersService',
    'ImageService',
    function($rootScope, $http, CacheFactory, $ionicPopup, $location, $timeout, $state, ConvertersService, ImageService) {
        return {
            get: function(id) {
                return $http.get($APP.server + '/api/forminstance', {
                    params: {
                        id: id
                    }
                }).then(
                    function(payload) {
                        return payload.data;
                    },
                    function(err) {});
            },
            get_gallery: function(formInstanceId, projectId) {
                return $http.get($APP.server + '/api/gallery/instance', {
                    params: {
                        formInstanceId: formInstanceId,
                        projectId: projectId
                    }
                }).then(
                    function(payload) {
                        return payload.data;
                    },
                    function(err) {});
            },
            create: function(data, imgUri) {
                var requestForm = ConvertersService.designToInstance(data);
                return $http.post($APP.server + '/api/forminstance', requestForm, {
                    withCredentials: true
                }).success(function(payload) {
                    if (!payload.message) {
                        var list = ConvertersService.photoList(imgUri, payload.id, requestForm.project_id);
                        if (list.length !== 0) {
                            ImageService.create(list).then(function(x) {
                                return x;
                            });
                        }
                    }
                    return payload.data;
                }).error(function(payload) {
                    console.log("error on create");
                    var requestList = [];
                    var ppfsync = localStorage.getObject('ppfsync');
                    var pppsync = localStorage.getObject('pppsync');
                    if (ppfsync) {
                        $rootScope.toBeUploadedCount = ppfsync.length;
                    } else {
                        $rootScope.toBeUploadedCount = 0;
                        localStorage.setObject('ppfsync', []);
                    }
                    if (!pppsync) {
                        localStorage.setObject('pppsync', []);
                    }
                    $rootScope.toBeUploadedCount++;
                    for (var i = 0; i < imgUri.length; i++) {
                        if (imgUri[i].base64String !== "") {
                            imgUri.projectId = requestForm.project_id;
                            requestList.push(imgUri[i]);
                        }
                    }
                    var aux_f = localStorage.getObject('ppfsync');
                    aux_f.push({
                        id: $rootScope.toBeUploadedCount,
                        form: requestForm
                    });
                    localStorage.setObject('ppfsync', aux_f);
                    if (requestList.length !== 0) {
                        var aux_p = localStorage.getObject('pppsync');
                        aux_p.push({
                            id: $rootScope.toBeUploadedCount,
                            imgs: requestList
                        });
                        localStorage.setObject('pppsync', aux_p);
                    }
                    return payload;
                });
            },
            create_sync: function(dataIn, pic) {
                return $http({
                    method: 'POST',
                    url: $APP.server + '/api/forminstance',
                    data: dataIn
                }).then(function(response) {
                    if (pic) {
                        var list = ConvertersService.photoList(pic, response.data.id, dataIn.project_id);
                        ImageService.create(list).then(function(x) {
                            return x;
                        });
                    }
                });
            },
            update: function(id, data) {
                var requestForm = ConvertersService.instanceToUpdate(data);
                return $http.put($APP.server + '/api/forminstance', requestForm, {
                    params: {
                        'id': id
                    }
                }).then(function(payload) {
                    return payload.data;
                }, function(payload) {
                    if (payload.status === 0 || payload.status === 502) {
                        var sync = CacheFactory.get('sync');
                        if (!sync) {
                            sync = CacheFactory('sync');
                        }
                        sync.setOptions({
                            storageMode: 'localStorage'
                        });
                        $rootScope.toBeUploadedCount = sync.keys().length;
                        $rootScope.toBeUploadedCount++;
                        sync.put($rootScope.toBeUploadedCount, requestForm);
                    }
                });
            },
            save_as: function(data, imgUri) {
                var requestForm = ConvertersService.instanceToNew(data);
                return $http.post($APP.server + '/api/forminstance', requestForm, {
                    withCredentials: true
                }).success(function(payload) {
                    if (payload.data || payload.data && payload.data.message) {
                        $timeout(function() {
                            var alertPopup3 = $ionicPopup.alert({
                                title: 'Submision failed.',
                                template: 'You have not permission to do this operation'
                            });
                            alertPopup3.then(function(res) {
                                $rootScope.$broadcast('sync.todo');
                            });
                        }, 10);
                    } else {
                        var list = ConvertersService.photoList(imgUri, payload.id, requestForm.project_id);
                        if (list.length !== 0) {
                            ImageService.create(list).then(function(x) {
                                return x;
                            });
                        }
                    }
                    return payload.data;
                }).error(function(payload) {
                    var requestList = [];
                    var ppfsync = localStorage.getObject('ppfsync');
                    var pppsync = localStorage.getObject('pppsync');
                    if (ppfsync) {
                        $rootScope.toBeUploadedCount = ppfsync.length;
                    } else {
                        $rootScope.toBeUploadedCount = 0;
                        localStorage.setObject('ppfsync', []);
                    }
                    if (!pppsync) {
                        localStorage.setObject('pppsync', []);
                    }
                    $rootScope.toBeUploadedCount++;
                    for (var i = 0; i < imgUri.length; i++) {
                        if (imgUri[i].base64String !== "") {
                            imgUri.projectId = requestForm.project_id;
                            requestList.push(imgUri[i]);
                        }
                    }
                    var aux_f = localStorage.getObject('ppfsync');
                    aux_f.push({
                        id: $rootScope.toBeUploadedCount,
                        form: requestForm
                    });
                    localStorage.setObject('ppfsync', aux_f);
                    if (requestList.length !== 0) {
                        var aux_p = localStorage.getObject('pppsync');
                        aux_p.push({
                            id: $rootScope.toBeUploadedCount,
                            imgs: requestList
                        });
                        localStorage.setObject('pppsync', aux_p);
                    }
                });
            },
            list: function(projectId, categoryId) {
                return $http.get($APP.server + '/api/forminstance', {
                    params: {
                        projectId: projectId,
                        categoryId: categoryId
                    }
                }).then(
                    function(payload) {
                        return payload.data;
                    },
                    function(err) {});
            },
            list_mobile: function(projectId) {
                return $http.get($APP.server + '/api/forminstance', {
                    params: {
                        projectId: projectId
                    }
                }).then(
                    function(payload) {
                        return payload.data;
                    },
                    function(err) {});
            }
        };
    }
]);
