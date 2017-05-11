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
            create: function(data, imgUri) {
                var requestForm = ConvertersService.designToInstance(data)
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
                    console.log(aux_f);
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
                console.log('create_sync')
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
            save_as: function(data) {
                var requestForm = ConvertersService.instanceToNew(data);
                return $http.post($APP.server + '/api/forminstance', requestForm, {
                    withCredentials: true
                }).then(function(payload) {
                    if (payload.data.message) {
                        $timeout(function() {
                            var alertPopup3 = $ionicPopup.alert({
                                title: 'Submision failed.',
                                template: 'You have not permission to do this operation'
                            });
                            alertPopup3.then(function(res) {
                                $rootScope.$broadcast('sync.todo');
                            });
                        }, 10);
                    }
                    return payload.data;
                }, function(payload) {
                    //                    formUp.close();
                    console.log(payload)
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
                        $timeout(function() {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Submision failed.',
                                template: 'You are offline. Submit forms by syncing next time you are online'
                            }).then(function(res) {
                                $state.go('app.forms', {
                                    'projectId': $rootScope.projectId,
                                    'categoryId': requestForm.category_id
                                });
                            });
                        }, 100);
                    } else {
                        //                        formUp.close();
                        var alertPopup2 = $ionicPopup.alert({
                            title: 'Submision failed.',
                            template: 'Incorrect data, try again'
                        });
                        alertPopup2.then(function(res) {});
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
