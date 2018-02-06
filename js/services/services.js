ppApp.service('PostService', [
    '$q',
    '$http',
    '$timeout',
    '$state',
    '$filter',
    'pendingRequests',
    '$rootScope',
    function($q, $http, $timeout, $state, $filter, pendingRequests, $rootScope) {

        var service = this;
        /**
         * Method to post data
         * @param {object} params - object containing post params
         * - {
         *      url: 'login',
         *      endPoint: 'pub/',
         *      method: 'POST',
         *      params: {}, - for params of the URL
         *      data: {},   - for data to be posted
         *      headers: {},
         *      extraParams: {},
         *      transformRequest: {Function},
         *      transformResponse: {Function}
         *     }
         * @param {Function} success - callback on success
         * @param {Function} error - callback on error
         * @param {Object} [popup] - optional popup object to be closed
         */
        service.post = function(params, success, error, popup) {
            if (['POST', 'PUT', 'GET', 'DELETE'].indexOf(params.method) < 0) {
                return error({
                    error: 500,
                    response: 'Wrong method used'
                });
            }

            var dt = {},
                baseEndPoint = params.hasOwnProperty('endPoint') ? params.endPoint : 'api/',
                baseQueryTo = $APP.server + baseEndPoint,
                self = this;

            self.errorId = 0;
            self.errorStatus = "Unrecognized error";

            /**
             * Method to run on success
             *
             * @param {Object} response - server JSON response parsed into an object or caught in the middle
             * @returns {Object} - error | success object
             */
            self.successCallback = function(response) {
                if (popup) popup.close();

                // This is the success (200)
                // It might be throwing weird or expected errors so we better deal with them at this level
                if (!response) {
                    //console.log('Unknown Server error');
                    dt = {
                        error: 'Something went wrong. The server did not return a proper response!',
                        status: 299 // custom error status
                    };
                    return error({
                        'data': dt
                    });
                }

                success(response);
            };

            /**
             * Method to run on error
             * @param {Object} response - server JSON response parsed into an object or caught in the middle
             * @returns {Object} - error object
             */
            self.errorCallback = function(response) {
                if (popup) popup.close();

                // forced stop querying
                if (!response) {
                    $rootScope.stopQuerying = true;
                    dt = {
                        error: 'Not authorized',
                        status: 401
                    };
                    return error({
                        'data': dt
                    });
                }

                if ([401, 403].indexOf(response.status) > -1) {
                    $rootScope.stopQuerying = true;
                    pendingRequests.cancelAll();
                    sessionStorage.removeItem('isLoggedIn');
                    dt = {
                        error: 'Not authorized',
                        status: response.status
                    };
                    return error({
                        'data': dt
                    });
                }

                dt = {
                    error: response.statusText || 'Unknown server error',
                    status: response.status || 500
                };
                return error({
                    'data': dt
                });
            };

            // classic request object
            var requestObject = {
                method: params.method,
                url: baseQueryTo + params.url,
                data: params.data,
                withCredentials: params.withCredentials
            };

            if (params.data && typeof params.data === 'object') {
                requestObject.data = params.data;
            }

            if (params.params && typeof params.params === 'object') {
                requestObject.params = params.params;
            }
            if (params.transformRequest && typeof params.transformRequest === 'object') {
                requestObject.transformRequest = params.transformRequest;
            }

            if (params.transformResponse && typeof params.transformResponse === 'object') {
                requestObject.transformResponse = params.transformResponse;
            }

            if (params.extraParams && Object.keys(params.extraParams).length) {
                for (var i in params.extraParams) {
                    if (!params.extraParams.hasOwnProperty(i)) continue;
                    requestObject[i] = params.extraParams[i];
                }
            }

            // add cache control to all requests
            requestObject.headers = {
                'Cache-control': 'no-cache, no-store, max-age=0',
                'Pragma': 'no-cache'
            };

            if (params.headers && Object.keys(params.headers).length) {
                for (var y in params.headers) {
                    if (!params.headers.hasOwnProperty(y)) continue;
                    requestObject.headers[y] = params.headers[y];
                }
            }

            // load the $http service
            if (!$rootScope.stopQuerying) {

                var canceller = $q.defer();
                pendingRequests.add({
                    url: requestObject.url,
                    canceller: canceller
                });
                requestObject.timeout = canceller.promise;

                try {
                    $http(requestObject).then(
                        self.successCallback,
                        self.errorCallback
                    );
                } catch (err) {
                    return self.errorCallback({
                        statusText: 'Unknown server error: ' + err,
                        status: 500
                    });
                }
                pendingRequests.remove(requestObject.url);
            } else {
                return self.errorCallback;
            }
        };
    }
]);

ppApp.service('pendingRequests', ['$filter', function($filter) {
    var pending = [];
    this.get = function() {
        return pending;
    };
    this.add = function(request) {
        pending.push(request);
    };
    this.remove = function(request) {
        pending = $filter('filter')(pending, function(p) {
            return p.url !== request;
        });
    };
    this.cancelAll = function() {
        angular.forEach(pending, function(p) {
            p.canceller.resolve();
        });
        pending.length = 0;
    };
}]);

ppApp.service('SettingService', ['$ionicPopup', '$ionicBackdrop', '$ionicBody', '$timeout',
    function($ionicPopup, $ionicBackdrop, $ionicBody, $timeout) {
        var self = this;
        self.show_message_popup = function(title, template) {
            var popup = $ionicPopup.alert({
                title: title,
                template: template,
                content: "",
                buttons: [{
                    text: 'Ok',
                    type: 'button-positive',
                    onTap: function(e) {
                        popup.close();
                    }
                }]
            });
            return popup;
        };

        self.show_loading_popup = function(title) {
            return $ionicPopup.show({
                title: title,
                template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                content: "",
                buttons: []
            });
        };

        self.show_confirm_popup = function(title, template) {
            return $ionicPopup.confirm({
                title: title,
                template: template
            });
        };

        self.close_all_popups = function() {
            noop = angular.noop;
            elevated = false;
            var popupStack = $ionicPopup._popupStack;
            if (popupStack.length > 0) {
                popupStack.forEach(function(popup, index) {
                    if (popup.isShown === true) {
                        popup.remove();
                        popupStack.pop();
                    }
                });
            }

            $ionicBackdrop.release();
            //Remove popup-open & backdrop if this is last popup
            $timeout(function() {
                // wait to remove this due to a 300ms delay native
                // click which would trigging whatever was underneath this
                $ionicBody.removeClass('popup-open');
                // $ionicPopup._popupStack.pop();
            }, 400, false);
            ($ionicPopup._backButtonActionDone || noop)();
        };
    }
]);

ppApp.service('CommonServices', [
    '$stateParams', '$state', '$filter', '$timeout', '$ionicScrollDelegate', '$rootScope', 'PostService', 'SyncService', 'SettingService', '$location', '$q', 'CacheFactory',
    function($stateParams, $state, $filter, $timeout, $ionicScrollDelegate, $rootScope, PostService, SyncService, SettingService, $location, $q, CacheFactory) {
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
                    filter.popup_predicate.vat = item.vat;
                    filter.popup_predicate.resource_margin = item.resource_margin || 0;
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
                    filter.popup_predicate.staff_id = (item.id > 0) ? item.id : 0;
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
        service.addResource = function(resources, data) {
            resources.push({
                "id": data.id,
                "resource_field_id": data.resource_field_id,
                "open": data.open,
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
                "vat": data.vat || 0,
                "total_cost": 0
            });
        };
        service.addStaff = function(resources, startTime, breakTime, finishTime, vat, totalTime) {
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
                break_time: new Date(0, 0, 0, parseInt(breakTime.split(':')[0]), parseInt(breakTime.split(':')[1])),
                finish_time: finishTime,
                total_time: totalTime,
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
            var temp = {
                "description": "",
                "resources": []
            };
            service.addResource(temp.resources, {
                open: false,
                stage_id: 0,
                calculation: true,
                vat: 0
            });
            subtasks.push(temp);
        };
        service.goToResource = function(substate, filter, resourceField, aux, isCreate) {
            if (!resourceField.resources.length && isCreate) {
                service.addResource(resourceField.resources, {
                    open: true,
                    stage_id: 1,
                    calculation: false,
                    id: 0,
                    resource_field_id: 0,
                    vat: 0
                });
                filter.substate = resourceField.resources[0];
                aux.linkAux = 'resource';
                aux.titleShow = 'Resource';
            } else
            if (substate) {
                filter.substate = substate;
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
        service.goToStaff = function(substate, filter, staffField, aux, isCreate) {
            if (!staffField.resources.length && isCreate) {
                service.addStaff(staffField.resources, filter.start, filter.break, filter.finish, filter.vat);
                filter.substate = staffField.resources[0];
                aux.linkAux = 'staff';
                aux.titleShow = 'Staff';
            } else if (substate) {
                substate.break_time = substate.break_time ? new Date(0, 0, 0, parseInt(substate.break_time.split(':')[0]), parseInt(substate.break_time.split(':')[1])) : 0;
                filter.substate = substate;
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
        service.goToPayitem = function(substate, filter, payitemField, aux, isCreate) {
            if (!payitemField.pay_items.length && isCreate) {
                service.addPayitem(payitemField.pay_items);
                filter.substate = payitemField.pay_items[0];
                aux.titleShow = 'Pay-item';
                aux.linkAux = 'payitem';
            }
            if (substate) {
                filter.substate = substate;
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
        service.goToScheduling = function(substate, filter, payitemField, aux, isCreate) {
            if (!payitemField.pay_items.length && isCreate) {
                service.addPayitem(payitemField.pay_items);
                filter.substate = substate || payitemField.pay_items[0];
                aux.titleShow = 'Scheduling';
                aux.linkAux = 'scheduling';
            }
            if (substate) {
                filter.substate = substate;
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
        service.goState = function(state, substate, filter, data, isCreate) {
            filter.state = state;
            var aux = {
                linkAux: data.linkAux,
                titleShow: data.titleShow
            }
            switch (state) {
                case 'resource':
                    service.goToResource(substate, filter, data.resourceField, aux, isCreate);
                    service.doTotal('resource', data.resourceField);
                    break;
                case 'staff':
                    service.goToStaff(substate, filter, data.staffField, aux, isCreate);
                    break;
                case 'scheduling':
                    service.goToScheduling(substate, filter, data.payitemField, aux, isCreate);
                    service.doTotal('pisubtask', filter.substate);
                    break;
                case 'payitem':
                    service.goToPayitem(substate, filter, data.payitemField, aux, isCreate);
                    if (filter.substate)
                        service.doTotal('pisubtask', filter.substate);
                    break;
            }
            return {
                linkAux: aux.linkAux,
                titleShow: aux.titleShow
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
                    }, function(err) {
                        console.log(err);
                    });
            }
        };
        service.backHelper = function(linkAux, filter, data, doCompute) {
            var response = {};
            switch (linkAux) {
                case 'photos':
                    //return from gallery to forms
                    filter.substate = null;
                    filter.state = 'form';
                    response.linkAux = 'forms';
                    break;
                case 'photodetails':
                    //return from test picture to gallery
                    filter.substate = 'gallery';
                    response.linkAux = 'photos';
                    break;
                case 'resource':
                    //return from view resource details to resources list
                    if (doCompute) {
                        service.doTotal('resource', data.resourceField);
                        response.titleShow = 'Resources';
                    }
                    filter.state = 'resource';
                    filter.substate = null;
                    response.linkAux = 'resources';
                    break;
                case 'resources':
                    //return from resources list to forms
                    filter.state = 'form';
                    response.linkAux = 'forms';
                    break;
                case 'staff':
                    filter.state = 'staff';
                    if (doCompute){
                        service.doTotal('staff', filter.substate);
                        response.titleShow = 'Staffs';
                    }
                    filter.substate = null;
                    response.linkAux = 'staffs';
                    break;
                case 'staffs':
                    filter.state = 'form';
                    response.linkAux = 'forms';
                    break;
                case 'scheduling':
                    if (filter.substate) {
                        filter.state = 'scheduling';
                        if (doCompute)
                            service.doTotal('pi', data.payitemField);
                        filter.substateStkRes = null;
                        filter.substateStk = null;
                        filter.substateRes = null;
                        filter.substate = null;
                        response.titleShow = 'Schedulings';
                        response.linkAux = 'schedulings';
                    } else {
                        filter.state = 'form';
                        response.linkAux = 'forms';
                    }
                    break;
                case 'schedulings':
                    filter.state = 'form';
                    response.linkAux = 'forms';
                    break;
                case 'schedulingStk':
                    filter.state = 'scheduling';
                    if (doCompute)
                        service.doTotal('pisubtask', filter.substate);
                    filter.substateStk = null;
                    response.linkAux = 'scheduling';
                    if (filter.substate.description) {
                        response.titleShow = 'Scheduling: ' + filter.substate.description;
                    } else {
                        response.titleShow = 'Scheduling';
                    }
                    break;
                case 'schedulingSubRes':
                    filter.state = 'scheduling';
                    if (doCompute)
                        service.doTotal('pisubtask', filter.substateStk);
                    filter.actionBtnShow = true;
                    filter.substateStkRes = null;
                    response.linkAux = 'schedulingStk';
                    if (filter.substateStk.description) {
                        response.titleShow = 'Scheduling Subtaks: ' + filter.substateStk.description;
                    } else {
                        response.titleShow = 'Scheduling Subtaks';
                    }
                    break;
                case 'schedulingRes':
                    filter.state = 'scheduling';
                    if (doCompute)
                        service.doTotal('piresource', filter.substate);
                    filter.actionBtnShow = true;
                    filter.substateRes = null;
                    response.linkAux = 'scheduling';
                    if (filter.substate.description) {
                        response.titleShow = 'Scheduling:' + filter.substate.description;
                    } else {
                        response.titleShow = 'Scheduling';
                    }
                    break;
                case 'payitem':
                    if (filter.substate) {
                        filter.state = 'payitem';
                        if (doCompute)
                            service.doTotal('pi', data.payitemField);
                        filter.substateStkRes = null;
                        filter.substateStk = null;
                        filter.substateRes = null;
                        filter.substate = null;
                        response.titleShow = 'Pay-items';
                        response.linkAux = 'payitems';
                    } else {
                        filter.state = 'form';
                        response.linkAux = 'forms';
                    }
                    break;
                case 'payitems':
                    filter.state = 'form';
                    response.linkAux = 'forms';
                    break;
                case 'payitemStk':
                    filter.state = 'payitem';
                    if (doCompute)
                        service.doTotal('pisubtask', filter.substate);
                    filter.substateStk = null;
                    response.linkAux = 'payitem';
                    if (filter.substate.description) {
                        response.titleShow = 'Pay-item: ' + filter.substate.description;
                    } else {
                        response.titleShow = 'Pay-item';
                    }
                    break;
                case 'payitemSubRes':
                    filter.state = 'payitem';
                    if (doCompute)
                        service.doTotal('pisubresource', filter.substateStk);
                    filter.actionBtnShow = true;
                    filter.substateStkRes = null;
                    response.linkAux = 'payitemStk';
                    if (filter.substateStk.description) {
                        response.titleShow = 'Pay-item Subtaks: ' + filter.substateStk.description;
                    } else {
                        response.titleShow = 'Pay-item Subtaks';
                    }
                    break;
                case 'payitemRes':
                    filter.state = 'payitem';
                    if (doCompute)
                        service.doTotal('piresource', filter.substate);
                    filter.actionBtnShow = true;
                    filter.substateRes = null;
                    response.linkAux = 'payitem';
                    if (filter.substate.description) {
                        response.titleShow = 'Pay-item:' + filter.substate.description;
                    } else {
                        response.titleShow = 'Pay-item';
                    }
                    break;
            }
            return response;
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
        function calcTime(start, finish, breakTime) {
          var hhmm = ''
          var stringBreak = breakTime.split(":");
          var stringStart = start.split(":");
          var stringFinish = finish.split(":");
          var totalTime = ((parseInt(stringFinish[0]) * 60) + parseInt(stringFinish[1])) - ((parseInt(stringStart[0]) * 60) + parseInt(stringStart[1])) - ((parseInt(stringBreak[0]) * 60) + parseInt(stringBreak[1]));
          var hh = Math.floor(totalTime / 60)
          var mm = Math.abs(totalTime % 60)
          hhmm = hh + ':';
          if (mm < 10) {
            hhmm = hhmm + '0' + mm;
          } else {
            hhmm = hhmm + mm;
          }
          return hhmm;
        }
        service.doTotal = function(type, parent) {
            if (parent) {
                parent.total_cost = 0;
                if (type === 'resource' || type === 'piresource' || type === 'pisubresource') {
                    angular.forEach(parent.resources, function(res) {
                        if (isNaN(res.quantity) || isNaN(res.direct_cost)) {
                            res.total_cost = 0;
                        }
                        //compute resource sale price
                        var resSalePrice = res.direct_cost * (1 + (res.resource_margin || 0) / 100) * (1 + ($rootScope.proj_margin || 0) / 100);
                        //compute resource total including VAT/Tax
                        var vatComponent = resSalePrice * (1 + (res.vat || 0) / 100) * res.quantity;
                        res.total_cost = vatComponent;
                        parent.total_cost = parent.total_cost + res.total_cost;
                    });
                }
                if (type === 'pisubtask') {
                    angular.forEach(parent.subtasks, function(stk) {
                        if (isNaN(stk.total_cost)) {
                            stk.total_cost = 0;
                        }
                        parent.total_cost = parent.total_cost + stk.total_cost;
                    });
                    angular.forEach(parent.resources, function(res) {
                        //compute resource sale price
                        var resSalePrice = res.direct_cost * (1 + (res.resource_margin || 0) / 100) * (1 + ($rootScope.proj_margin || 0) / 100);
                        //compute resource total including VAT/Tax
                        var vatComponent = resSalePrice * (1 + (res.vat || 0) / 100) * res.quantity;
                        res.total_cost = vatComponent;
                        parent.total_cost = parent.total_cost + res.total_cost;
                    });
                }
                if (type === 'pi') {
                    angular.forEach(parent.pay_items, function(pi) {
                        if (isNaN(pi.total_cost)) {
                            pi.total_cost = 0;
                        }
                        parent.total_cost = parent.total_cost + pi.total_cost;
                    });
                }

                if (type === 'staff') {
                    parent.break_time = (typeof parent.break_time === "string") ? parent.break_time : $filter('date')(parent.break_time, "HH:mm");
                    parent.start_time = (typeof parent.start_time === "string") ? parent.start_time : $filter('date')(parent.start_time, "HH:mm");
                    parent.finish_time = (typeof parent.finish_time === "string") ? parent.finish_time : $filter('date')(parent.finish_time, "HH:mm");
                    parent.total_time = calcTime(parent.start_time, parent.finish_time, parent.break_time);
                }

                if (type === 'payitem') {
                    parent.total_cost = 0;
                    angular.forEach(parent.pay_items, function(item) {
                        item.total_cost = 0;
                        if (item.resources.length !== 0) {
                            angular.forEach(item.resources, function(res) {
                                if (!isNaN(res.quantity) && !isNaN(res.direct_cost)) {
                                    //compute resource sale price
                                    var resSalePrice = res.direct_cost * (1 + (res.resource_margin || 0) / 100) * (1 + ($rootScope.proj_margin || 0) / 100);
                                    //compute resource total including VAT/Tax
                                    var vatComponent = resSalePrice * (1 + (res.vat || 0) / 100) * res.quantity;
                                    res.total_cost = vatComponent;
                                    item.total_cost = item.total_cost + res.total_cost;
                                }
                            })
                        }
                        if (item.subtasks.length !== 0) {
                            angular.forEach(item.subtasks, function(stk) {
                                stk.total_cost = 0;
                                angular.forEach(stk.resources, function(res) {
                                    if (!isNaN(res.quantity) && !isNaN(res.direct_cost)) {
                                        //compute resource sale price
                                        var resSalePrice = res.direct_cost * (1 + (res.resource_margin || 0) / 100) * (1 + ($rootScope.proj_margin || 0) / 100);
                                        //compute resource total including VAT/Tax
                                        var vatComponent = resSalePrice * (1 + (res.vat || 0) / 100) * res.quantity;
                                        res.total_cost = vatComponent;
                                        stk.total_cost = stk.total_cost + res.total_cost;
                                    }
                                })
                                if (!isNaN(stk.total_cost)) {
                                    item.total_cost = item.total_cost + stk.total_cost;
                                }
                            })
                        }
                        parent.total_cost = parent.total_cost + item.total_cost;
                    })
                }
            }
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

                                    //mixpanel people proprieties
                                    mixpanel.people.increment('Forms completed: PP app', 1);

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
                                $state.go('app.formInstance', {
                                    'projectId': $rootScope.projectId,
                                    'type': 'form',
                                    'formId': $rootScope.formId
                                });
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

                    PostService.post({
                        method: 'POST',
                        url: 'image/uploadfile',
                        data: img,
                        withCredentials: true
                    }, function(succ) {
                        cnt++;

                        //mixpanel people proprieties
                        mixpanel.people.increment('Images uploaded: PP app', 1);

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
                    var ppfsync = localStorage.getObject('ppfsync'),
                        pppsync = localStorage.getObject('pppsync');
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
                        //for saved as new
                        // if (!img.url) {
                        img.projectId = request.data.project_id;
                        // }
                    })
                    var aux_f = localStorage.getObject('ppfsync');
                    aux_f.push({
                        id: $rootScope.toBeUploadedCount,
                        form: request.data
                    });
                    localStorage.setObject('ppfsync', aux_f);
                    if (images.length !== 0) {
                        var aux_p = localStorage.getObject('pppsync');
                        aux_p.push({
                            id: $rootScope.toBeUploadedCount,
                            imgs: images
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
            });
        };

        service.saveSpecialFields = function(formData, specialFields, method) {
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
                        if (method == 'POST')
                            specialFields.resourceField.id = 0;
                        PostService.post({
                            method: method,
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
                        if (method == 'POST')
                            specialFields.payitemField.id = 0;
                        PostService.post({
                            method: method,
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
                        if (method == 'POST')
                            specialFields.payitemField.id = 0;
                        PostService.post({
                            method: method,
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
                        if (method == 'POST')
                            specialFields.staffField.id = 0;
                        PostService.post({
                            method: method,
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

        service.getCompletedForm = function(formId) {
            var deffered = $q.defer();
            //get all the fields for the current completed form
            PostService.post({
                method: 'GET',
                url: 'forminstance',
                params: {
                    id: formId
                }
            }, function(res) {
                var response = {
                    formData: res.data
                };

                var getResources = function(data) {
                        var prm = $q.defer();
                        //get resources data
                        if (data.formData.resource_field_id) {
                            PostService.post({
                                method: 'GET',
                                url: 'resourcefield',
                                params: {
                                    id: data.formData.resource_field_id
                                }
                            }, function(r) {
                                data.resourceField = r.data;
                                angular.forEach(data.resourceField.resources, function(item) {
                                    item.res_type_obj = service.filterByField(settings.resource_type, 'name', item.resource_type_name);
                                    item.unit_obj = service.filterByField(settings.unit, 'id', item.unit_id);
                                    item.absenteeism_obj = service.filterByField(settings.absenteeism, 'reason', item.abseteeism_reason_name);
                                    item.total_cost = item.direct_cost * item.quantity + item.direct_cost * item.quantity * item.vat / 100;
                                    if (item.current_day) {
                                        var partsOfStr = item.current_day.split('-');
                                        item.current_day_obj = new Date(partsOfStr[2], parseInt(partsOfStr[1]) - 1, partsOfStr[0])
                                    }
                                });
                                $rootScope.resourceField = data.resourceField;
                                prm.resolve();
                            }, function(err) {
                                console.log(err);
                                prm.resolve();
                            });
                        } else {
                            prm.resolve();
                        }
                        return prm.promise;
                    },
                    getStaff = function(data) {
                        var prm = $q.defer();
                        //get staff data
                        if (data.formData.staff_field_id) {
                            PostService.post({
                                method: 'GET',
                                url: 'stafffield',
                                params: {
                                    id: data.formData.staff_field_id
                                }
                            }, function(r) {
                                data.staffField = r.data;
                                angular.forEach(data.staffField.resources, function(item) {
                                    item.res_type_obj = service.filterByField(settings.resource_type, 'name', item.resource_type_name);
                                    item.unit_obj = service.filterByField(settings.unit, 'id', item.unit_id);
                                    item.absenteeism_obj = service.filterByField(settings.absenteeism, 'reason', item.abseteeism_reason_name);
                                    if (item.current_day) {
                                        var partsOfStr = item.current_day.split('-');
                                        item.current_day_obj = new Date(partsOfStr[2], parseInt(partsOfStr[1]) - 1, partsOfStr[0])
                                    }
                                    if (item.expiry_date) {
                                        var partsOfStr = item.expiry_date.split('-');
                                        item.expiry_date_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
                                    }
                                });
                                $rootScope.staffField = data.staffField;
                                prm.resolve();
                            }, function(err) {
                                console.log(err);
                                prm.resolve();
                            });
                        } else {
                            prm.resolve();
                        }
                        return prm.promise;
                    },
                    getPayitems = function(data) {
                        var prm = $q.defer();
                        //get payment data
                        if (data.formData.pay_item_field_id) {
                            PostService.post({
                                method: 'GET',
                                url: 'payitemfield',
                                params: {
                                    id: data.formData.pay_item_field_id
                                }
                            }, function(r) {
                                data.payitemField = r.data;
                                service.doTotal('payitem', data.payitemField)
                                angular.forEach(data.payitemField.pay_items, function(item) {
                                    item.unit_obj = service.filterByField(settings.unit, 'id', item.unit_id);
                                    item.total_cost = 0;
                                    angular.forEach(item.resources, function(res) {
                                        res.res_type_obj = service.filterByField(settings.resource_type, 'name', res.resource_type_name);
                                        res.unit_obj = service.filterByField(settings.unit, 'id', res.unit_id);
                                        res.absenteeism_obj = service.filterByField(settings.absenteeism, 'reason', res.abseteeism_reason_name);
                                        if (res.current_day) {
                                            var partsOfStr = res.current_day.split('-');
                                            item.current_day_obj = new Date(partsOfStr[2], parseInt(partsOfStr[1]) - 1, partsOfStr[0])
                                        }
                                        if (res.expiry_date) {
                                            var partsOfStr = res.expiry_date.split('-');
                                            item.expiry_date_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
                                        }
                                        // res.total_cost = res.quantity * res.direct_cost + res.quantity * res.direct_cost * res.vat / 100;
                                        item.total_cost += res.total_cost;
                                    });
                                    angular.forEach(item.subtasks, function(subtask) {
                                        subtask.total_cost = 0;
                                        angular.forEach(subtask.resources, function(res) {
                                            res.res_type_obj = service.filterByField(settings.resource_type, 'name', res.resource_type_name);
                                            res.unit_obj = service.filterByField(settings.unit, 'id', res.unit_id);
                                            res.absenteeism_obj = service.filterByField(settings.absenteeism, 'reason', res.abseteeism_reason_name);
                                            if (res.current_day) {
                                                var partsOfStr = res.current_day.split('-');
                                                item.current_day_obj = new Date(partsOfStr[2], parseInt(partsOfStr[1]) - 1, partsOfStr[0])
                                            }
                                            if (res.expiry_date) {
                                                var partsOfStr = res.expiry_date.split('-');
                                                item.expiry_date_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
                                            }
                                            // res.total_cost = res.quantity * res.direct_cost + res.quantity * res.direct_cost * res.vat / 100;
                                            subtask.total_cost += res.total_cost;
                                        });
                                        item.total_cost += subtask.total_cost;
                                    });
                                });
                                $rootScope.payitemField = data.payitemField;
                                prm.resolve();
                            }, function(err) {
                                console.log(err);
                                prm.resolve();
                            });
                        } else {
                            prm.resolve();
                        }
                        return prm.promise;
                    },
                    getScheduling = function(data) {
                        var prm = $q.defer();
                        //get schedule data
                        if (data.formData.scheduling_field_id) {
                            PostService.post({
                                method: 'GET',
                                url: 'schedulingfield',
                                params: {
                                    id: data.formData.scheduling_field_id
                                }
                            }, function(r) {
                                data.payitemField = r.data;
                                service.doTotal('payitem', data.payitemField);
                                angular.forEach(data.payitemField.pay_items, function(item) {
                                    item.unit_obj = service.filterByField(settings.unit, 'id', item.unit_id);
                                    item.total_cost = 0;
                                    angular.forEach(item.resources, function(res) {
                                        res.res_type_obj = service.filterByField(settings.resource_type, 'name', res.resource_type_name);
                                        res.unit_obj = service.filterByField(settings.unit, 'id', res.unit_id);
                                        res.absenteeism_obj = service.filterByField(settings.absenteeism, 'reason', res.abseteeism_reason_name);
                                        if (res.current_day) {
                                            var partsOfStr = res.current_day.split('-');
                                            item.current_day_obj = new Date(partsOfStr[2], parseInt(partsOfStr[1]) - 1, partsOfStr[0])
                                        }
                                        if (res.expiry_date) {
                                            var partsOfStr = res.expiry_date.split('-');
                                            item.expiry_date_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
                                        }
                                        // res.total_cost = res.quantity * res.direct_cost + res.quantity * res.direct_cost * res.vat / 100;
                                        item.total_cost += res.total_cost;
                                    });
                                    angular.forEach(item.subtasks, function(subtask) {
                                        subtask.total_cost = 0;
                                        angular.forEach(subtask.resources, function(res) {
                                            res.res_type_obj = service.filterByField(settings.resource_type, 'name', res.resource_type_name);
                                            res.unit_obj = service.filterByField(settings.unit, 'id', res.unit_id);
                                            res.absenteeism_obj = service.filterByField(settings.absenteeism, 'reason', res.abseteeism_reason_name);
                                            if (res.current_day) {
                                                var partsOfStr = res.current_day.split('-');
                                                item.current_day_obj = new Date(partsOfStr[2], parseInt(partsOfStr[1]) - 1, partsOfStr[0])
                                                res.current_day_obj = item.current_day_obj //res.current_day;TODO:
                                            }
                                            if (res.expiry_date) {
                                                var partsOfStr = res.expiry_date.split('-');
                                                item.expiry_date_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
                                                res.expiry_date_obj = item.expiry_date_obj //TODO:res.expiry_date;
                                            }
                                            // res.total_cost = res.quantity * res.direct_cost + res.quantity * res.direct_cost * res.vat / 100;
                                            subtask.total_cost += res.total_cost;
                                        });
                                        item.total_cost += subtask.total_cost;
                                    });
                                });
                                $rootScope.payitemField = data.payitemField;
                                prm.resolve();
                            }, function(err) {
                                console.log(err);
                                prm.resolve();
                            });
                        } else {
                            prm.resolve();
                        }
                        return prm.promise;
                    };

                var resPrm = getResources(response),
                    staffPrm = getStaff(response),
                    payPrm = getPayitems(response),
                    schedulePrm = getScheduling(response);
                Promise.all([resPrm, staffPrm, payPrm, schedulePrm]).then(function(r) {
                    deffered.resolve(response);
                })
            }, function(err) {
                deffered.reject("Form instance could not be loaded. Please try again later.");
            });

            return deffered.promise;
        };

        var designToInstanceValuesFormat = function(data, isNew) {
            var field_values = [],
                field;
            if (isNew) {
                field = data;
            } else {
                field = data.field_values[0];
            }
            switch (data.type) {
                case 'date':
                    var x = '';
                    if (field.value && field.value != 'Invalid Date') {
                        if (typeof field.value === 'object') {
                            x = new Date(field.value);
                            var dd = x.getDate();
                            var MM = x.getMonth() + 1;
                            var yyyy = x.getFullYear();
                            if (dd < 10) {
                                dd = '0' + dd;
                            }
                            if (MM < 10) {
                                MM = '0' + MM;
                            }
                            x = dd + '-' + MM + '-' + yyyy;
                        } else {
                            x = field.name
                        }
                    }
                    field_values = [{
                        "id": !isNew && field.id || 0,
                        "name": x,
                        "value": x,
                        "position": field.position,
                        "field_instance_id": isNew && 0 || field.field_instance_id
                    }];
                    break;
                case 'time':
                    var x = '';
                    if (field.value && field.value != 'Invalid Date') {
                        x = new Date(field.value);
                        var hh = x.getHours();
                        var mm = x.getMinutes();
                        if (hh < 10) {
                            hh = '0' + hh;
                        }
                        if (mm < 10) {
                            mm = '0' + mm;
                        }
                        x = hh + ':' + mm;
                    }
                    field_values = [{
                        "id": !isNew && field.id || 0,
                        "name": x,
                        "value": x,
                        "position": field.position,
                        "field_instance_id": field.field_instance_id || 0
                    }];
                    break;
                case 'select':
                    var array = isNew && field.option_designs || data.field_values;
                    angular.forEach(array, function(option_value) {
                        field_values.push({
                            "id": !isNew && field.id || 0,
                            "name": option_value.name,
                            "value": option_value.value === field.value,
                            "position": field.position,
                            "field_instance_id": field.field_instance_id || 0
                        });
                    });
                    break;
                case 'radio':
                    var array = isNew && field.option_designs || data.field_values;
                    angular.forEach(array, function(option_value) {
                        field_values.push({
                            "id": !isNew && field.id || 0,
                            "name": option_value.name,
                            "value": option_value.value === field.value,
                            "position": field.position,
                            "field_instance_id": field.field_instance_id || 0
                        });
                    });
                    break;
                case 'checkbox_list':
                    var array = isNew && field.option_designs || data.field_values;
                    angular.forEach(array, function(option_value) {
                        field_values.push({
                            "id": !isNew && option_value.id || 0,
                            "name": option_value.name,
                            "value": option_value.value === true,
                            "position": field.position,
                            "field_instance_id": option_value.field_instance_id || 0
                        });
                    });
                    break;
                case 'checkbox':
                    field_values = [{
                        "id": !isNew && field.id || 0,
                        "name": field.value || false,
                        "value": field.value || false,
                        "position": field.position,
                        "field_instance_id": field.id || 0
                    }];
                    break;
                default: //type: text, email, textarea, number, signature
                    field_values = [{
                        "id": !isNew && field.id || 0,
                        "name": field.value,
                        "value": field.value || '',
                        "position": field.position,
                        "field_instance_id": field.field_instance_id || 0
                    }];
                    break;
            }
            return field_values;
        };

        service.designToInstance = function(design, isNew) {
            var settings = CacheFactory.get('settings');
            if (!settings || settings.length === 0) {
                settings = CacheFactory('settings');
                settings.setOptions({
                    storageMode: 'localStorage'
                });
            }
            $rootScope.thisUser = localStorage.getObject("ppuser");
            var requestForm = {
                "id": 0,
                "active": true,
                "name": design.name,
                "guidance": design.guidance,
                "code": design.code || design.form_design_code,
                "hash": null,
                "pdf": design.pdf,
                "project_id": parseInt($stateParams.projectId) || design.project_id,
                "customer_id": design.customer_id,
                "category": design.category,
                "category_id": design.category_id,
                "user_id": $rootScope.thisUser && $rootScope.thisUser.id,
                "created_on": new Date().getTime(),
                "updated_on": new Date().getTime(),
                "formDesignId": design.formDesignId || design.id,
                "resource_field_id": design.resource_field_id,
                "staff_field_id": design.staff_field_id,
                "pay_item_field_id": design.pay_item_field_id,
                "scheduling_field_id": design.scheduling_field_id,
                "field_group_instances": [],
                "resourceField": design.resourceField,
                "staffField": design.staffField,
                "payitemField": design.payitemField,
                "schedField": design.schedField,
            };
            var requestGroupList = [],
                requestFieldList = [];
            var requestGroup, requestField;

            angular.forEach(design.field_group_designs || design.field_group_instances, function(field_group) {
                requestGroup = angular.copy(field_group);
                requestGroup.id = 0;
                requestGroup.form_instance_id = 0;
                requestGroup.at_revision = "0";
                requestGroup.field_instances = [];
                requestFieldList = [];

                angular.forEach(field_group.field_designs || field_group.field_instances, function(field) {
                    var aux = null;
                    if (isNew) {
                        aux = designToInstanceValuesFormat(field, true);
                    } else {
                        aux = designToInstanceValuesFormat(field);
                        angular.forEach(aux, function(val) {
                            val.id = 0;
                            val.field_instance_id = 0;
                        });
                    }

                    requestField = angular.copy(field);
                    requestField.id = 0;
                    requestField.field_group_instance_id = 0;
                    requestField.at_revision = "0";
                    requestField.option_instances = [] || field.option_instances;
                    requestField.field_values = aux;
                    requestFieldList.push(requestField);
                });
                requestGroup.field_instances = requestFieldList;
                requestGroupList.push(requestGroup);
            });
            requestForm.field_group_instances = requestGroupList;
            return (requestForm);
        };
        service.viewField = function(data) {
            if (data.type === "checkbox" && data.field_values && data.field_values.length > 0) {
                if (data.field_values[0].value === 'true' || data.field_values[0].value === true) {
                    data.value = true;
                } else {
                    data.value = false;
                }
            }
            if ((data.type === "select" || data.type === "radio") && data.field_values && data.field_values.length > 0) {
                angular.forEach(data.field_values, function(entry) {
                    if (entry.value === true || entry.value === "true") {
                        data.value = entry.name;
                    }
                });
            }
            if (data.type === "time" && data.field_values && data.field_values.length > 0) {
                if (data.field_values[0].value !== '' && data.field_values[0].value !== 0 && data.field_values[0].value !== '0') {
                    data.value = new Date("01 " + data.field_values[0].value);
                } else {
                    data.value = null;
                }
            }
            if (data.type === "date" && data.field_values && data.field_values.length > 0) {
                var fix = data.field_values[0].value.substr(3, 2) + '-' + data.field_values[0].value.substr(0, 2) + '-' + data.field_values[0].value.substr(6, 4);
                if (data.field_values[0].value !== '0' && data.field_values[0].value !== 0 && data.field_values[0].value !== '') {
                    data.value = new Date(fix);
                } else {
                    data.value = null;
                }
            }
            return data;
        };
        service.instanceToUpdate = function(instance) {
            var data = angular.copy(instance);
            var settings = CacheFactory.get('settings');
            if (!settings || settings.length === 0) {
                settings = CacheFactory('settings');
                settings.setOptions({
                    storageMode: 'localStorage'
                });
            }
            $rootScope.thisUser = localStorage.getObject("ppuser");;
            var requestForm = angular.copy(data);
            delete requestForm.form_design_code;
            delete requestForm.has_photos;
            delete requestForm.permission;
            delete requestForm.project_name;
            delete requestForm.project_number;
            delete requestForm.revision;
            requestForm.updated_on = new Date().getTime();
            requestForm.field_group_instances = [];
            requestForm.user_id = $rootScope.thisUser.id;
            var requestGroupList = [],
                requestFieldList = [],
                requestGroup, requestField;

            angular.forEach(data.field_group_instances, function(field_group) {
                requestFieldList = [];
                requestGroup = angular.copy(field_group);
                requestGroup.field_instances = [];

                angular.forEach(field_group.field_instances, function(field) {
                    requestField = angular.copy(field);
                    requestField.field_values = designToInstanceValuesFormat(field)
                    requestFieldList.push(requestField);
                });
                requestGroup.field_instances = requestFieldList;
                requestGroupList.push(requestGroup);
            });
            requestForm.field_group_instances = requestGroupList;
            return requestForm;
        };
    }
]);
