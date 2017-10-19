ppApp.controller('FormInstanceCtrl', [
    '$scope',
    '$rootScope',
    '$stateParams',
    '$location',
    '$ionicSideMenuDelegate',
    '$ionicHistory',
    '$ionicScrollDelegate',
    'SecuredPopups',
    'CommonServices',
    '$timeout',
    '$state',
    '$filter',
    'PostService',
    'SettingService',
    'SyncService',
    function($scope, $rootScope, $stateParams, $location, $ionicSideMenuDelegate, $ionicHistory, $ionicScrollDelegate, SecuredPopups, CommonServices, $timeout, $state, $filter, PostService, SettingService, SyncService) {
        $scope.$on('$ionicView.enter', function() {
            $ionicHistory.clearHistory();
            $ionicSideMenuDelegate.canDragContent(false);
        });
        SyncService.getSettings().then(function(settings) {
            var temp = $filter('filter')(settings.custsett, {
                name: 'currency'
            });
            if (temp && temp.length) {
                $scope.currency = temp[0].value;
            }
            $scope.resource_type_list = settings.resource_type;
            $scope.unit_list = settings.unit;
            $scope.abs_list = settings.absenteeism;
        })

        $scope.linkAux = 'forms';
        //set project settings
        SyncService.getProjects().then(function(res) {
            var proj = $filter('filter')(res, {
                id: $stateParams.projectId
            });
            if (proj && proj.length && proj[0].settings) {
                $rootScope.proj_margin = parseInt(CommonServices.filterByField(proj[0].settings, 'name', "margin").value);
            } else {
                $rootScope.proj_margin = 0;
            }
        }, function(reason) {
            SettingService.show_message_popup("Error", reason);
        });

        $scope.updateTitle = function(title, placeholder) {
            CommonServices.updateTitle(title, placeholder, $scope.titleShow);
        }

        $scope.backHelper = function() {
            switch ($scope.linkAux) {
                case 'forms':
                    $scope.back();
                    break;
                case 'photos':
                    $scope.filter.substate = null;
                    $scope.filter.state = 'form';
                    $scope.linkAux = 'forms';
                    break;
                case 'photodetails':
                    $scope.filter.substate = 'gallery';
                    $scope.linkAux = 'photos';
                    break;
                case 'resource':
                    $scope.filter.state = 'resource';
                    $scope.filter.substate = null;
                    $scope.linkAux = 'resources';
                    break;
                case 'resources':
                    $scope.filter.state = 'form';
                    $scope.linkAux = 'forms';
                    break;
                case 'staff':
                    $scope.filter.state = 'staff';
                    $scope.filter.substate = null;
                    $scope.linkAux = 'staffs';
                    break;
                case 'staffs':
                    $scope.filter.state = 'form';
                    $scope.linkAux = 'forms';
                    break;
                case 'scheduling':
                    if ($scope.filter.substate) {
                        $scope.filter.state = 'scheduling';
                        $scope.filter.substateStkRes = null;
                        $scope.filter.substateStk = null;
                        $scope.filter.substateRes = null;
                        $scope.filter.substate = null;
                        $scope.titleShow = 'Schedulings';
                        $scope.linkAux = 'schedulings';
                    } else {
                        $scope.filter.state = 'form';
                        $scope.linkAux = 'forms';
                        $scope.titleShow = $scope.formData.name;
                    }
                    break;
                case 'schedulings':
                    $scope.filter.state = 'form';
                    $scope.linkAux = 'forms';
                    $scope.titleShow = $scope.formData.name;
                    break;
                case 'schedulingStk':
                    $scope.filter.state = 'scheduling';
                    $scope.filter.substateStk = null;
                    $scope.linkAux = 'scheduling';
                    if ($scope.filter.substate.description) {
                        $scope.titleShow = 'Scheduling: ' + $scope.filter.substate.description;
                    } else {
                        $scope.titleShow = 'Scheduling';
                    }
                    break;
                case 'schedulingSubRes':
                    $scope.filter.state = 'scheduling';
                    $scope.filter.actionBtnShow = true;
                    $scope.filter.substateStkRes = null;
                    $scope.linkAux = 'schedulingStk';
                    if ($scope.filter.substateStk.description) {
                        $scope.titleShow = 'Scheduling Subtaks: ' + $scope.filter.substateStk.description;
                    } else {
                        $scope.titleShow = 'Scheduling Subtaks';
                    }
                    break;
                case 'schedulingRes':
                    $scope.filter.state = 'scheduling';
                    $scope.filter.actionBtnShow = true;
                    $scope.filter.substateRes = null;
                    $scope.linkAux = 'scheduling';
                    if ($scope.filter.substate.description) {
                        $scope.titleShow = 'Scheduling:' + $scope.filter.substate.description;
                    } else {
                        $scope.titleShow = 'Scheduling';
                    }
                    break;
                case 'payitem':
                    if ($scope.filter.substate) {
                        $scope.filter.state = 'payitem';
                        $scope.filter.substateStkRes = null;
                        $scope.filter.substateStk = null;
                        $scope.filter.substateRes = null;
                        $scope.filter.substate = null;
                        $scope.titleShow = 'Pay-items';
                        $scope.linkAux = 'payitems';
                    } else {
                        $scope.filter.state = 'form';
                        $scope.linkAux = 'forms';
                        $scope.titleShow = $scope.formData.name;
                    }
                    break;
                case 'payitems':
                    $scope.filter.state = 'form';
                    $scope.linkAux = 'forms';
                    $scope.titleShow = $scope.formData.name;
                    break;
                case 'payitemStk':
                    $scope.filter.state = 'payitem';
                    $scope.filter.substateStk = null;
                    $scope.linkAux = 'payitem';
                    if ($scope.filter.substate.description) {
                        $scope.titleShow = 'Pay-item: ' + $scope.filter.substate.description;
                    } else {
                        $scope.titleShow = 'Pay-item';
                    }
                    break;
                case 'payitemSubRes':
                    $scope.filter.state = 'payitem';
                    $scope.filter.actionBtnShow = true;
                    $scope.filter.substateStkRes = null;
                    $scope.linkAux = 'payitemStk';
                    if ($scope.filter.substateStk.description) {
                        $scope.titleShow = 'Pay-item Subtaks: ' + $scope.filter.substateStk.description;
                    } else {
                        $scope.titleShow = 'Pay-item Subtaks';
                    }
                    break;
                case 'payitemRes':
                    $scope.filter.state = 'payitem';
                    $scope.filter.actionBtnShow = true;
                    $scope.filter.substateRes = null;
                    $scope.linkAux = 'payitem';
                    if ($scope.filter.substate.description) {
                        $scope.titleShow = 'Pay-item:' + $scope.filter.substate.description;
                    } else {
                        $scope.titleShow = 'Pay-item';
                    }
                    break;
            }
            $scope.goToTop();
        };
        $scope.goStateDown = function(state, substate, data) {
            $scope.aux = {
                linkAux: $scope.linkAux,
                titleShow: $scope.titleShow
            }
            CommonServices.goStateDown(state, substate, data, $scope.filter, $scope.aux);
            $scope.linkAux = $scope.aux.linkAux;
            $scope.titleShow = $scope.aux.titleShow;
            $scope.goToTop();
        }
        $scope.goState = function(state, substate) {
            switch (state) {
                case 'resource':
                    $scope.filter.state = state;
                    $scope.aux = {
                        linkAux: $scope.linkAux,
                        titleShow: $scope.titleShow
                    }
                    CommonServices.goToResource(substate, $scope.filter, $scope.resourceField, $scope.aux);
                    $scope.linkAux = $scope.aux.linkAux;
                    $scope.titleShow = $scope.aux.titleShow;
                    $ionicScrollDelegate.resize();
                    break;
                case 'staff':
                    $scope.filter.state = state;
                    $scope.aux = {
                        linkAux: $scope.linkAux,
                        titleShow: $scope.titleShow
                    }
                    CommonServices.goToStaff(substate, $scope.filter, $scope.staffField, $scope.aux);
                    $scope.linkAux = $scope.aux.linkAux;
                    $scope.titleShow = $scope.aux.titleShow;
                    $ionicScrollDelegate.resize();
                    break;
                case 'scheduling':
                    $scope.filter.state = state;
                    $scope.aux = {
                        linkAux: $scope.linkAux,
                        titleShow: $scope.titleShow
                    }
                    CommonServices.goToScheduling(substate, $scope.filter, $scope.payitemField, $scope.aux);
                    $scope.linkAux = $scope.aux.linkAux;
                    $scope.titleShow = $scope.aux.titleShow;
                    $ionicScrollDelegate.resize();
                    break;
                case 'payitem':
                    $scope.filter.state = state;
                    $scope.aux = {
                        linkAux: $scope.linkAux,
                        titleShow: $scope.titleShow
                    }
                    CommonServices.goToPayitem(substate, $scope.filter, $scope.payitemField, $scope.aux);
                    $scope.linkAux = $scope.aux.linkAux;
                    $scope.titleShow = $scope.aux.titleShow;
                    $ionicScrollDelegate.resize();
                    if ($scope.filter.substate)
                        $scope.doTotal('pisubtask', $scope.filter.substate);
                    break;
            }
            $scope.goToTop();
        }

        $scope.doTotal = function(predicate, data) {
            if (predicate === 'payitem') {
                data.total_cost = 0;
                angular.forEach(data.pay_items, function(item) {
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
                    data.total_cost = data.total_cost + item.total_cost;
                })
            }
        }

        $scope.filter = {
            state: 'form',
            edit: false
        }
        $scope.filter.email = "";
        $scope.isLoaded = false;
        $scope.hasData = false;
        $scope.formData = $rootScope.rootForm;
        $rootScope.slideHeader = false;
        $rootScope.slideHeaderPrevious = 0;
        $rootScope.slideHeaderHelper = false;

        //get all the fields for the current completed form
        PostService.post({
            method: 'GET',
            url: 'forminstance',
            params: {
                id: $rootScope.formId
            }
        }, function(res) {
            var data = res.data;
            $scope.formData = data;
            $scope.titleShow = $scope.formData.name;
            //get resources data
            if (data.resource_field_id) {
                PostService.post({
                    method: 'GET',
                    url: 'resourcefield',
                    params: {
                        id: data.resource_field_id
                    }
                }, function(r) {
                    var res = r.data;
                    $scope.resourceField = res;
                    angular.forEach($scope.resourceField.resources, function(item) {
                        setResourceType(item);
                        setUnit(item);
                        setAbsenteeism(item);
                        item.total_cost = item.direct_cost * item.quantity + item.direct_cost * item.quantity * item.vat / 100;
                        if (item.current_day) {
                            var partsOfStr = item.current_day.split('-');
                            item.current_day_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
                        }
                    });
                    $rootScope.resourceField = $scope.resourceField;
                }, function(err) {
                    console.log(err);
                });
            }
            //get staff data
            if (data.staff_field_id) {
                PostService.post({
                    method: 'GET',
                    url: 'stafffield',
                    params: {
                        id: data.staff_field_id
                    }
                }, function(r) {
                    var res = r.data;
                    $scope.staffField = res;
                    angular.forEach($scope.staffField.resources, function(item) {
                        setResourceType(item);
                        setUnit(item);
                        setAbsenteeism(item);
                        if (item.current_day) {
                            var partsOfStr = item.current_day.split('-');
                            item.current_day_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
                        }
                        if (item.expiry_date) {
                            var partsOfStr = item.expiry_date.split('-');
                            item.expiry_date_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
                        }
                    });
                    $rootScope.staffField = $scope.staffField;
                }, function(err) {
                    console.log(err);
                });
            }
            //get schedule data
            if (data.scheduling_field_id) {
                PostService.post({
                    method: 'GET',
                    url: 'schedulingfield',
                    params: {
                        id: data.scheduling_field_id
                    }
                }, function(r) {
                    var res = r.data;
                    $scope.payitemField = res;
                    $scope.doTotal('payitem', $scope.payitemField);
                    angular.forEach($scope.payitemField.pay_items, function(item) {
                        setUnit(item);
                        item.total_cost = 0;
                        angular.forEach(item.resources, function(res) {
                            setResourceType(res);
                            setUnit(res);
                            setAbsenteeism(res);
                            if (res.current_day) {
                                var partsOfStr = res.current_day.split('-');
                                item.current_day_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
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
                                setResourceType(res);
                                setUnit(res);
                                setAbsenteeism(res);
                                if (res.current_day) {
                                    var partsOfStr = res.current_day.split('-');
                                    item.current_day_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
                                    res.current_day_obj = res.current_day;
                                }
                                if (res.expiry_date) {
                                    var partsOfStr = res.expiry_date.split('-');
                                    item.expiry_date_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
                                    res.expiry_date_obj = res.expiry_date;
                                }
                                // res.total_cost = res.quantity * res.direct_cost + res.quantity * res.direct_cost * res.vat / 100;
                                subtask.total_cost += res.total_cost;
                            });
                            item.total_cost += subtask.total_cost;
                        });
                    });
                    $rootScope.payitemField = $scope.payitemField;
                }, function(err) {
                    console.log(err);
                });
            }
            //get payment data
            if (data.pay_item_field_id) {
                PostService.post({
                    method: 'GET',
                    url: 'payitemfield',
                    params: {
                        id: data.pay_item_field_id
                    }
                }, function(r) {
                    var res = r.data;
                    $scope.payitemField = res;
                    $scope.doTotal('payitem', $scope.payitemField)
                    angular.forEach($scope.payitemField.pay_items, function(item) {
                        setUnit(item);
                        item.total_cost = 0;
                        angular.forEach(item.resources, function(res) {
                            setResourceType(res);
                            setUnit(res);
                            setAbsenteeism(res);
                            if (res.current_day) {
                                var partsOfStr = res.current_day.split('-');
                                item.current_day_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
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
                                setResourceType(res);
                                setUnit(res);
                                setAbsenteeism(res);
                                if (res.current_day) {
                                    var partsOfStr = res.current_day.split('-');
                                    item.current_day_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
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
                    $rootScope.payitemField = $scope.payitemField;
                }, function(err) {
                    console.log(err);
                });
            }
        }, function(err) {
            console.log(err);
        });

        if ($scope.formData) {
            if ($scope.formData.length !== 0) {
                $scope.hasData = true;
            }
        }

        function setResourceType(item) {
            item.res_type_obj = CommonServices.filterByField($scope.resource_type_list, 'name', item.resource_type_name);
        }

        function setUnit(item) {
            item.unit_obj = CommonServices.filterByField($scope.unit_list, 'id', item.unit_id);
        }

        function setAbsenteeism(item) {
            item.absenteeism_obj = CommonServices.filterByField($scope.abs_list, 'reason', item.abseteeism_reason_name);
        }

        $scope.back = function() {
            if ($stateParams.type === "register") {
                $location.path("/app/register/" + $rootScope.projectId + "/" + $scope.formData.category_id + "/" + $scope.formData.code);
            }
            if ($stateParams.type === "form") {
                $location.path("/app/view/" + $rootScope.projectId + "/" + $scope.formData.category_id);
            }
        };
        $scope.edit = function() {
            $location.path("/app/edit/" + $rootScope.projectId + "/" + $scope.formData.id);
        };

        $scope.getFullCode = function(row) {
            if (row.revision !== '0') {
                return row.code + '-' + row.form_number + '-Rev' + row.revision;
            } else {
                return row.code + '-' + row.form_number;
            }
        };

        function sendEmail(res, id) {
            if (res) {
                var alertPopup1 = SettingService.show_loading_popup("Sending email", "<center><ion-spinner icon='android'></ion-spinner></center>");
                PostService.post({
                    method: 'POST',
                    url: 'share',
                    params: {
                        formId: id,
                        email: res
                    }
                }, function(response) {
                    alertPopup1.close();
                    if (response.data.message === "Form shared") {
                        res = "";
                        var alertPopupC = SecuredPopups.show('alert', {
                            title: 'Share',
                            template: 'Email sent.'
                        });
                    }
                }, function(err) {
                    alertPopup1.close();
                    if (err.data.status == 422) {
                        res = "";
                        var alertPopupC = SecuredPopups.show('alert', {
                            title: 'Share',
                            template: 'Form already shared to this user.'
                        });
                    } else {
                        var alertPopupC = SecuredPopups.show('alert', {
                            title: 'Share',
                            template: 'An unexpected error occured while sending the e-mail.'
                        });
                    }
                });
            }
        }

        function addContact(id, contact) {
            if ($scope.filter.email && $scope.filter.email != "") {
                if (!$scope.filter.email.includes(contact)) {
                    $scope.filter.email = $scope.filter.email + "," + contact;
                    $timeout(function() {
                        SettingService.show_create_popup($scope.filter.email, $scope.importContact, sendEmail, id);
                        // var popup = $ionicPopup.show(createPopup(id));
                    });
                } else {
                    SettingService.show_message_popup('Share', "E-mail already added to share list.");
                }
            } else {
                $scope.filter.email = contact;
                $timeout(function() {
                    SettingService.show_create_popup($scope.filter.email, $scope.importContact, sendEmail, id);

                    // var popup = $ionicPopup.show(createPopup(id));
                });
            }
        }

        $scope.importContact = function(id) {
            $timeout(function() {
                navigator.contacts.pickContact(function(contact) {
                    if (contact.emails) {
                        addContact(id, contact.emails[0].value);
                    } else {
                        SettingService.show_message_popup('Share', "No e-mail address was found. Please enter one manually.");
                    }
                });
            });
        }
        $scope.shareThis = function(predicate) {
            SettingService.show_create_popup($scope.filter.email, $scope.importContact, sendEmail, predicate.id);

            // var popup = $ionicPopup.show(createPopup(predicate.id));
        };

        $scope.goToTop = function() {
            $timeout(function() { // we need little delay
                $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
            });
        }

    }
]);
