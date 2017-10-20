ppApp.service('CommonServices', [
    '$stateParams', '$state', '$filter', '$timeout', '$ionicScrollDelegate', '$rootScope', 'PostService', 'SyncService', 'SettingService', '$location', '$q',
    function($stateParams, $state, $filter, $timeout, $ionicScrollDelegate, $rootScope, PostService, SyncService, SettingService, $location, $q) {
        var service = this;
        var settings = {};
        SyncService.getSettings().then(function(res) {
            settings = res;
        });
        service.filterByField = function(array, field, name) {
            var obj = {};
            obj[field] = name;
            var temp = $filter('filter')(array, obj);
            if (temp && temp.length) {
                return temp[0];
            }
            return {};
        };
        service.selectPopover = function(filter, item, titleShow) {
            if (!filter.pi) {
                filter.popup_predicate.name = item.name;
                if (filter.state == 'resource') {
                    if (titleShow.indexOf('Scheduling Resource') > -1) {
                        titleShow = 'Scheduling Resource: ' + item.name;
                    } else {
                        if (titleShow.indexOf('Scheduling Subtask Resource') > -1) {
                            titleShow = 'Scheduling Subtask Resource: ' + item.name;
                        } else {
                            if (titleShow.indexOf('Resource') > -1) {
                                titleShow = 'Resource: ' + item.name;
                            }
                        }
                    }
                    if (titleShow.indexOf('Staff') > -1) {
                        titleShow = 'Staff: ' + item.name;
                    }
                    filter.popup_predicate.product_ref = item.product_ref;
                    filter.popup_predicate.direct_cost = item.direct_cost;
                    //set resource type
                    filter.popup_predicate.res_type_obj = service.filterByField(settings.resource_type, 'name', item.resource_type_name);
                    filter.popup_predicate.resource_type_id = filter.popup_predicate.res_type_obj.id;
                    filter.popup_predicate.resource_type_name = filter.popup_predicate.res_type_obj.name;
                    //set unit
                    filter.popup_predicate.unit_obj = service.filterByField(settings.unit, 'name', item.unit_name);
                    filter.popup_predicate.unit_id = filter.popup_predicate.unit_obj.id;
                    filter.popup_predicate.unit_name = filter.popup_predicate.unit_obj.name;
                }
                if (filter.state == 'staff') {
                    titleShow = 'Staff: ' + item.name;
                    filter.popup_predicate.employer_name = item.employee_name;
                    filter.popup_predicate.staff_role = item.role;
                    filter.popup_predicate.direct_cost = item.direct_cost;
                    //set resource type
                    filter.popup_predicate.res_type_obj = service.filterByField(settings.resource_type, 'name', item.resource_type_name);
                    filter.popup_predicate.resource_type_id = filter.popup_predicate.res_type_obj.id;
                    filter.popup_predicate.resource_type_name = filter.popup_predicate.res_type_obj.name;
                }
                if ((filter.state == 'scheduling' || filter.state == 'payitem') && (filter.substateRes || filter.substateStk && filter.substateStkRes)) {
                    filter.popup_predicate.product_ref = item.product_ref;
                    filter.popup_predicate.direct_cost = item.direct_cost;
                    //set resource type
                    filter.popup_predicate.res_type_obj = service.filterByField(settings.resource_type, 'name', item.resource_type_name);
                    filter.popup_predicate.resource_type_id = filter.popup_predicate.res_type_obj.id;
                    filter.popup_predicate.resource_type_name = filter.popup_predicate.res_type_obj.name;
                    //set unit
                    filter.popup_predicate.unit_obj = service.filterByField(settings.unit, 'name', item.unit_name);
                    filter.popup_predicate.unit_id = filter.popup_predicate.unit_obj.id;
                    filter.popup_predicate.unit_name = filter.popup_predicate.unit_obj.name;
                    if (item.resource_margin) {
                        filter.popup_predicate.resource_margin = item.resource_margin;
                    }
                    if (item.vat) {
                        filter.popup_predicate.vat = item.vat;
                    }
                }
            } else { //TODO:
                // if ($scope.formData.scheduling_field_design) {
                //     titleShow = 'Scheduling: ' + item.reference;
                // }
                // if ($scope.formData.pay_item_field_design) {
                //     titleShow = 'Pay-item: ' + item.reference;
                // }

                filter.popup_predicate.description = item.description;
                filter.popup_predicate.reference = item.reference;
                //set unit
                filter.popup_predicate.unit_obj = service.filterByField(settings.unit, 'name', item.unit_name);
                filter.popup_predicate.unit_id = filter.popup_predicate.unit_obj.id;
                filter.popup_predicate.unit_name = filter.popup_predicate.unit_obj.name;
            }
        };
        service.addResource = function(resources, vat) {
            resources.push({
                "id": 0,
                "resource_field_id": 0,
                "resource_id": 0,
                "position": 0,
                "name": '',
                "product_ref": '',
                "unit_id": 0,
                "unit_name": '',
                "unit_obj": {},
                "resource_type_id": 0,
                "resource_type_name": '',
                "direct_cost": 0,
                "resource_margin": 0,
                "stage_id": 1,
                "stage_name": '',
                "vat": vat,
                "quantity": 0,
                "current_day": '',
                "total_cost": 0,
                "calculation": false,
                "open": true
            });
        };
        service.addStaff = function(resources, startTime, breakTime, finishTime, vat) {
            resources.push({
                name: "",
                customerId: 0,
                employer_name: "",
                staff_role: "",
                product_ref: "",
                unit_name: "",
                direct_cost: 0.0,
                resource_type_name: "",
                resource_margin: 0,
                telephone_number: "",
                email: "",
                safety_card_number: "",
                expiry_date: "",
                staff: true,
                current_day: "",
                start_time: startTime,
                break_time: breakTime,
                finish_time: finishTime,
                total_time: "",
                comment: "",
                vat: vat
            })
        };
        service.addPayitem = function(items) {
            items.push({
                "description": "",
                "reference": "",
                "unit": "",
                "quantity": "",
                "subtasks": [],
                "resources": [],
                "total_cost": 0
            })
        };
        service.addSubtask = function(subtasks, vat) {
            subtasks.push({
                "description": "",
                "resources": [{
                    "open": false,
                    "resource_id": 0,
                    "position": 0,
                    "name": "",
                    "product_ref": "",
                    "unit_id": 0,
                    "unit_name": '',
                    "unit_obj": {},
                    "resource_type_id": 0,
                    "resource_type_name": "",
                    "direct_cost": 0,
                    "quantity": 0,
                    "resource_margin": 0,
                    "current_day": "",
                    "stage_id": 0,
                    "stage_name": "",
                    "calculation": true,
                    "vat": vat,
                    "total_cost": 0
                }]
            });
        };
        service.addResourcePi = function(resources, vat) {
            resources.push({
                "open": false,
                "resource_id": 0,
                "position": 0,
                "name": "",
                "product_ref": "",
                "unit_obj": {},
                "unit_id": 0,
                "unit_name": '',
                "resource_type_id": 0,
                "resource_type_name": "",
                "direct_cost": 0,
                "quantity": 0,
                "resource_margin": 0,
                "current_day": "",
                "stage_id": 0,
                "stage_name": "",
                "calculation": true,
                "vat": vat,
                "total_cost": 0
            });
        };
        service.addResourceInSubtask = function(resources, vat) {
            resources.resources.push({
                "open": false,
                "resource_id": 0,
                "position": 0,
                "name": "",
                "product_ref": "",
                "unit_id": 0,
                "unit_name": '',
                "unit_obj": {},
                "resource_type_id": 0,
                "resource_type_name": "",
                "direct_cost": 0,
                "quantity": 0,
                "resource_margin": 0,
                "current_day": "",
                "stage_id": 0,
                "stage_name": "",
                "vat": vat,
                "calculation": true,
                "total_cost": 0
            });
        };
        service.goToResource = function(substate, filter, resourceField, aux) {
            if (substate || resourceField && resourceField.id == 0) {
                filter.substate = substate || resourceField.resources[0];
                aux.linkAux = 'resource';
                if (filter.substate && filter.substate.name) {
                    aux.titleShow = 'Resource: ' + filter.substate.name;
                } else {
                    aux.titleShow = 'Resource';
                }
            } else {
                aux.linkAux = 'resources';
                aux.titleShow = 'Resources';
            }
        };
        service.goToStaff = function(substate, filter, staffField, aux) {
            if (substate || staffField && staffField.id == 0) {
                filter.substate = substate || staffField.resources[0];
                aux.linkAux = 'staff';
                if (filter.substate && filter.substate.name) {
                    aux.titleShow = 'Staff: ' + filter.substate.name;
                } else {
                    aux.titleShow = 'Staff';
                }
            } else {
                aux.linkAux = 'staffs';
                aux.titleShow = 'Staffs';
            }
        };
        service.goToPayitem = function(substate, filter, payitemField, aux) {
            if (substate || payitemField && payitemField.id == 0) {
                filter.substate = substate || payitemField.pay_items[0];
                if (filter.substate && filter.substate.description) {
                    aux.titleShow = 'Pay-item: ' + filter.substate.description;
                } else {
                    aux.titleShow = 'Pay-item';
                }
                aux.linkAux = 'payitem';
            } else {
                aux.linkAux = 'payitem';
                aux.titleShow = 'Pay-items';
            }
        };
        service.goToScheduling = function(substate, filter, payitemField, aux, projectId) {
            if (substate || payitemField && payitemField.id == 0) {
                filter.substate = substate || payitemField.pay_items[0];
                if (filter.substate && filter.substate.description) {
                    aux.titleShow = 'Scheduling: ' + filter.substate.description;
                } else {
                    aux.titleShow = 'Scheduling';
                }
                aux.linkAux = 'scheduling';
            } else {
                aux.linkAux = 'schedulings';
                aux.titleShow = 'Schedulings';
            }
        };
        service.goStateDown = function(state, substate, data, filter, aux) {
            if (state === 'scheduling') {
                switch (substate) {
                    case 'subtask':
                        filter.state = state;
                        aux.linkAux = 'schedulingStk';
                        if (data.description) {
                            aux.titleShow = 'Scheduling Subtask: ' + data.description;
                        } else {
                            aux.titleShow = 'Scheduling Subtask';
                        }
                        filter.substateStk = data;
                        $ionicScrollDelegate.resize();
                        break;
                    case 'subres':
                        filter.actionBtnShow = false;
                        filter.state = state;
                        aux.linkAux = 'schedulingSubRes';
                        if (data.name) {
                            aux.titleShow = 'Scheduling Subtask Resource: ' + data.name;
                        } else {
                            aux.titleShow = 'Scheduling Subtask Resource';
                        }
                        filter.substateStkRes = data;
                        $ionicScrollDelegate.resize();
                        break;
                    case 'res':
                        filter.actionBtnShow = false;
                        filter.state = state;
                        aux.linkAux = 'schedulingRes';
                        if (data.name) {
                            aux.titleShow = 'Scheduling Resource: ' + data.name;
                        } else {
                            aux.titleShow = 'Scheduling Resource';
                        }
                        filter.substateRes = data;
                        $ionicScrollDelegate.resize();
                        break;
                }
            }
            if (state === 'payitem') {
                switch (substate) {
                    case 'subtask':
                        filter.state = state;
                        aux.linkAux = 'payitemStk';
                        if (data.description) {
                            aux.titleShow = 'Pay-item Subtask: ' + data.description;
                        } else {
                            aux.titleShow = 'Pay-item Subtask';
                        }
                        filter.substateStk = data;
                        $ionicScrollDelegate.resize();
                        break;
                    case 'subres':
                        filter.actionBtnShow = false;
                        filter.state = state;
                        aux.linkAux = 'payitemSubRes';
                        if (data.name) {
                            aux.titleShow = 'Pay-item Subtask Resource: ' + data.name;
                        } else {
                            aux.titleShow = 'Pay-item Subtask Resource';
                        }
                        filter.substateStkRes = data;
                        $ionicScrollDelegate.resize();
                        break;
                    case 'res':
                        filter.actionBtnShow = false;
                        filter.state = state;
                        aux.linkAux = 'payitemRes';
                        if (data.name) {
                            console.log(data.name)
                            aux.titleShow = 'Pay-item Resource: ' + data.name;
                        } else {
                            aux.titleShow = 'Pay-item Resource';
                        }
                        filter.substateRes = data;
                        $ionicScrollDelegate.resize();
                        break;
                }
            }
        };
        service.openPopover = function(test, filter, projectId) {
            switch (test) {
                case 'staff':
                    filter.pi = false;
                    filter.popup_list = settings.staff;
                    break;
                case 'resource':
                    filter.pi = false;
                    filter.popup_list = settings.resources;
                    break;
                case 'payitem':
                    filter.pi = true;
                    filter.popup_list = settings.payitems;
                    // PayitemService.list_payitems(projectId).then(function(data) {
                    //     $rootScope.payitem_list = data;
                    //     filter.popup_list = $rootScope.payitem_list;
                    // });
                    filter.popup_title = "Payitem filter"
                default:
                    filter.pi = true;
                    PostService.post({
                        method: 'GET',
                        url: 'payitem',
                        params: {
                            projectId: projectId
                        }
                    }, function(res) {
                        $rootScope.payitem_list = res.data;
                        // filter.popup_list = $rootScope.payitem_list;
                    }, function(err) {
                        console.log(err);
                    });
            }
        };
        service.addResourceManually = function(filter) {
            switch (filter.state) {
                case 'resource':
                    filter.substate.name = filter.searchText;
                    break;
                case 'staff':
                    filter.substate.name = filter.searchText;
                    break;
                case 'payitem':
                    if (filter.substateRes) {
                        filter.substateRes.name = filter.searchText;
                    }
                    if (filter.substateStk && filter.substateStkRes) {
                        filter.substateStkRes.name = filter.searchText;
                    }
                    break;
                case 'scheduling':
                    if (filter.substateRes) {
                        filter.substateRes.name = filter.searchText;
                    }
                    if (filter.substateStk && filter.substateStkRes) {
                        filter.substateStkRes.name = filter.searchText;
                    }
                    break;
            }
        };
        service.updateCalculation = function(data) {
            if (data.unit_obj.name === 'm' || data.unit_obj.name === 'ft') {
                if (!data.length) {
                    data.length = 0;
                }
                if (!data.wastage) {
                    data.quantity = data.quantity + data.length;
                } else {
                    data.quantity = data.quantity + data.length + data.length / data.wastage;
                }
            }
            if (data.unit_obj.name === 'Days') {
                if (!data.days) {
                    data.days = 0;
                }
                if (!data.number_of) {
                    data.number_of = 0;
                }
                data.quantity = data.days * data.number_of;
            }
            if (data.unit_obj.name === 'm2' || data.unit_obj.name === 'ft2') {
                if (!data.length) {
                    data.length = 0;
                }
                if (!data.width) {
                    data.width = 0;
                }
                if (data.wastage) {
                    data.quantity = data.length * data.width + (data.length * data.width * data.wastage) / 100;

                } else {
                    data.quantity = data.length * data.width;
                }
            }
            if (data.unit_obj.name === 'm3' || data.unit_obj.name === 'ft3') {
                if (!data.length) {
                    data.length = 0;
                }
                if (!data.width) {
                    data.width = 0;
                }
                if (!data.depth) {
                    data.depth = 0;
                }
                if (data.wastage) {
                    data.quantity = data.length * data.width * data.depth + (data.length * data.width * data.depth * data.wastage) / 100;
                } else {
                    data.quantity = data.length * data.width * data.depth;
                }
            }
            if (data.unit_obj.name === 'T') {
                if (!data.length) {
                    data.length = 0;
                }
                if (!data.width) {
                    data.width = 0;
                }
                if (!data.depth) {
                    data.depth = 0;
                }
                if (!data.tm3) {
                    data.tm3 = 0;
                }
                if (data.wastage) {
                    data.quantity = data.length * data.width * data.depth * data.tm3 + (data.length * data.width * data.depth * data.tm3 * data.wastage) / 100;
                } else {
                    data.quantity = data.length * data.width * data.depth * data.tm3;
                }
            }
            data.quantity = Math.round(data.quantity * 100) / 100
        };
        service.updateTitle = function(title, placeholder, titleShow) {
            if (title) {
                if (placeholder === 'Resource') {
                    titleShow = 'Resource: ' + title;
                }
                if (placeholder === 'Staff') {
                    titleShow = 'Staff: ' + title;
                }
                if (placeholder === 'Scheduling') {
                    titleShow = 'Scheduling: ' + title;
                }
                if (placeholder === 'Scheduling Subtask') {
                    titleShow = 'Scheduling Subtask: ' + title;
                }
                if (placeholder === 'Scheduling Subtask') {
                    titleShow = 'Scheduling Subtask: ' + title;
                }
                if (placeholder === 'Scheduling Subtask Resource') {
                    titleShow = 'Scheduling Subtask Resource: ' + title;
                }
                if (placeholder === 'Scheduling Resource') {
                    titleShow = 'Scheduling Resource: ' + title;
                }
                if (placeholder === 'Pay-item') {
                    titleShow = 'Pay-item: ' + title;
                }
                if (placeholder === 'Pay-item Subtask') {
                    titleShow = 'Pay-item Subtask: ' + title;
                }
                if (placeholder === 'Pay-item Subtask') {
                    titleShow = 'Pay-item Subtask: ' + title;
                }
                if (placeholder === 'Pay-item Subtask Resource') {
                    titleShow = 'Pay-item Subtask Resource: ' + title;
                }
                if (placeholder === 'Pay-item Resource') {
                    titleShow = 'Pay-item Resource: ' + title;
                }
            } else {
                titleShow = placeholder;
            }
        };

        service.saveFormToServer = function(request, images, formUp, isNew) {
            PostService.post(request, function(res) {
                if (res.data.message) {
                    formUp.close();
                    $timeout(function() {
                        SettingService.show_message_popup('Submision failed', res.data.message).then(function(res) {
                            $state.go('app.forms', {
                                'projectId': $rootScope.projectId,
                                'categoryId': request.data.category_id
                            });
                        });
                    });
                    return;
                }
                $rootScope.formId = res.data.id || res.data;
                var cnt = 0,
                    finishCallback = function(formUp) { //does not enter for isNew
                        if (isNew) {
                            PostService.post({
                                method: 'GET',
                                url: 'forminstance',
                                params: {
                                    id: $rootScope.formId
                                }
                            }, function(res) {
                                $rootScope.rootForm = res.data;
                                $timeout(function() {
                                    formUp.close();
                                    $state.go('app.formInstance', {
                                        'projectId': $rootScope.projectId,
                                        'type': 'form',
                                        'formId': $rootScope.formId
                                    });
                                });
                            }, function(err) {
                                $timeout(function() {
                                    formUp.close();
                                    $state.go('app.categories', {
                                        'projectId': $rootScope.projectId
                                    });
                                });
                            });
                        } else {
                            $timeout(function() {
                                formUp.close();
                                $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                            });
                        }
                    };

                if (!images.length) {
                    $timeout(function() {
                        formUp.close();
                        finishCallback(formUp);
                    });
                }

                angular.forEach(images, function(img) {
                    img.id = 0;
                    img.formInstanceId = $rootScope.formId;
                    img.projectId = request.data.project_id;
                    if (isNew && img.url) {
                        img = {
                            base64String: '',
                            comment: img.comment,
                            formInstanceId: img.formInstanceId,
                            id: img.id,
                            projectId: img.projectId,
                            tags: img.tags,
                            title: img.title
                        }
                    }

                    PostService.post({
                        method: 'POST',
                        url: 'image/uploadfile',
                        data: img,
                        withCredentials: true
                    }, function(succ) {
                        cnt++;
                        //last image uploaded with success
                        if (cnt >= images.length) {
                            finishCallback(formUp);
                            images = [];
                        }
                    }, function(err) {
                        cnt++;
                        if (cnt >= images.length) {
                            finishCallback(formUp);
                            images = [];
                        }
                    });
                })
            }, function(data) {
                formUp.close();
                if (isNew) {
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

                    //store images to sync
                    angular.forEach(images, function(img) {
                        img.projectId = request.data.project_id;
                        if (isNew && img.url) {
                            img = {
                                base64String: '',
                                comment: img.comment,
                                formInstanceId: img.formInstanceId,
                                id: img.id,
                                projectId: img.projectId,
                                tags: img.tags,
                                title: img.title
                            }
                        }
                        requestList.push(img);
                    })
                    var aux_f = localStorage.getObject('ppfsync');
                    aux_f.push({
                        id: $rootScope.toBeUploadedCount,
                        form: request.data
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
                    if (data && data.status === 400) {
                        $timeout(function() {
                            $timeout(function() {
                                SettingService.show_message_popup('Submision failed', 'Incorrect data, try again');
                            });
                        });
                    } else {
                        $timeout(function() {
                            SettingService.show_message_popup('Submision failed', 'You are offline. Submit forms by syncing next time you are online.').then(function(res) {
                                $state.go('app.forms', {
                                    'projectId': $rootScope.projectId,
                                    'categoryId': request.data.category_id
                                });
                            });
                        });
                    }
                }
                //  else if (data.status === 0 || data.status === 502) {
                // var sync = CacheFactory.get('sync'); //TODO: check if needed
                // if (!sync) {
                //     sync = CacheFactory('sync');
                // }
                // sync.setOptions({
                //     storageMode: 'localStorage'
                // });
                // $rootScope.toBeUploadedCount = sync.keys().length;
                // $rootScope.toBeUploadedCount++;
                // sync.put($rootScope.toBeUploadedCount, requestForm);
                // }
            });
        };

        service.saveSpecialFields = function(formData, specialFields) {
            var prm = $q.defer();
            var prepareResources = function(resources) {
                angular.forEach(resources, function(item) { //
                    if (item.unit_obj) { //TODO:not for staff
                        item.unit_id = item.unit_obj.id;
                        item.unit_name = item.unit_obj.name;
                    }
                    if (item.res_type_obj) {
                        item.resource_type_id = item.res_type_obj.id;
                        item.resource_type_name = item.res_type_obj.name;
                    }
                    if (item.stage_obj) { //TODO: only for res,
                        item.stage_id = item.stage_obj.id;
                        item.stage_name = item.stage_obj.name;
                    }
                    if (item.absenteeism_obj) {
                        item.abseteeism_reason_name = item.absenteeism_obj.reason;
                    }
                    if (item.current_day_obj) {
                        item.current_day = $filter('date')(item.current_day_obj, "dd-MM-yyyy");
                    }
                    if (item.expiry_date_obj) { //TODO: not for res
                        var date = new Date(item.expiry_date_obj);
                        item.expiry_date = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
                    }
                });
                return resources;
            }

            var addResourcesToServer = function() {
                    var def = $q.defer();
                    if (formData.resource_field_design || formData.resource_field_id) {
                        specialFields.resourceField.resources = prepareResources(specialFields.resourceField.resources);
                        specialFields.resourceField.id = 0;
                        PostService.post({
                            method: 'POST',
                            url: 'resourcefield',
                            data: specialFields.resourceField
                        }, function(res) {
                            formData.resource_field_id = res.data.id;
                            def.resolve();
                        }, function(err) {
                            formData.resourceField = formData.resourceField || [];
                            formData.resourceField.push(specialFields.resourceField);
                            def.resolve();
                        });
                    } else {
                        def.resolve();
                    }
                    return def.promise;
                },

                addPayitemToServer = function() {
                    var def = $q.defer();
                    if (formData.pay_item_field_design || formData.pay_item_field_id) {
                        angular.forEach(specialFields.payitemField.pay_items, function(item) {
                            if (item.unit_obj) {
                                item.unit = item.unit_obj.name;
                                item.unit_id = item.unit_obj.id;
                            }
                            item.resources = prepareResources(item.resources);
                            angular.forEach(item.subtasks, function(subtask) {
                                subtask.resources = prepareResources(subtask.resources);
                            });
                        });
                        specialFields.payitemField.id = 0;
                        PostService.post({
                            method: 'POST',
                            url: 'payitemfield',
                            data: specialFields.payitemField
                        }, function(res) {
                            formData.pay_item_field_id = res.data.id;
                            def.resolve();
                        }, function(err) {
                            formData.payitemField = formData.payitemField || [];
                            formData.payitemField.push(specialFields.payitemField);
                            def.resolve();
                        });
                    } else {
                        def.resolve();
                    }
                    return def.promise;
                },

                addSchedulingToServer = function() {
                    var def = $q.defer();
                    if (formData.scheduling_field_design || formData.scheduling_field_id) {
                        angular.forEach(specialFields.payitemField.pay_items, function(item) {
                            if (item.unit_obj) {
                                item.unit = item.unit_obj.name;
                                item.unit_id = item.unit_obj.id;
                            }
                            item.resources = prepareResources(item.resources);
                            angular.forEach(item.subtasks, function(subtask) {
                                item.subtasks = prepareResources(item.subtasks);
                            });
                        });
                        specialFields.payitemField.id = 0;
                        PostService.post({
                            method: 'POST',
                            url: 'schedulingfield',
                            data: specialFields.payitemField
                        }, function(res) {
                            formData.scheduling_field_id = res.data.id;
                            def.resolve();
                        }, function(err) {
                            formData.schedField = formData.schedField || [];
                            formData.schedField.push(specialFields.payitemField);
                            def.resolve();
                        });
                    } else {
                        def.resolve();
                    }
                    return def.promise;
                },

                addStaffToServer = function() {
                    var def = $q.defer();
                    if (formData.staff_field_design || formData.staff_field_id) {
                        specialFields.staffField.resources = prepareResources(specialFields.staffField.resources);
                        specialFields.staffField.id = 0;
                        PostService.post({
                            method: 'POST',
                            url: 'stafffield',
                            data: specialFields.staffField
                        }, function(res) {
                            formData.staff_field_id = res.data.id;
                            def.resolve();
                        }, function(err) {
                            formData.staffField = formData.staffField || [];
                            formData.staffField.push(specialFields.staffField);
                            def.resolve();
                        });
                    } else {
                        def.resolve();
                    }
                    return def.promise;
                };

            var staff = addStaffToServer(),
                schedule = addSchedulingToServer(),
                payitem = addPayitemToServer(),
                resource = addResourcesToServer();

            Promise.all([resource, staff, schedule, payitem]).then(function(res) {
                prm.resolve(formData);
            })
            return prm.promise;
        };


    }
])
