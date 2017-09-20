angular.module($APP.name).controller('FormInstanceCtrl', [
    '$scope',
    '$rootScope',
    '$stateParams',
    '$location',
    'FormInstanceService',
    '$ionicSideMenuDelegate',
    '$ionicHistory',
    'ResourceService',
    'StaffService',
    'SchedulingService',
    'PayitemService',
    '$ionicPopup',
    'ShareService',
    '$ionicScrollDelegate',
    'SecuredPopups',
    'CommonServices',
    '$timeout',
    '$state',
    '$filter',
    'DbService',
    function($scope, $rootScope, $stateParams, $location, FormInstanceService, $ionicSideMenuDelegate, $ionicHistory, ResourceService, StaffService,
        SchedulingService, PayitemService, $ionicPopup, ShareService, $ionicScrollDelegate, SecuredPopups, CommonServices, $timeout, $state, $filter, DbService) {
        $scope.$on('$ionicView.enter', function() {
            $ionicHistory.clearHistory();
            $ionicSideMenuDelegate.canDragContent(false);
        });

        var temp = $filter('filter')(DbService.get('custsett'), {
            name: 'currency'
        });
        if (temp && temp.length) {
            $scope.currency = temp[0].value;
        }
        $scope.linkAux = 'forms';
        $scope.resource_type_list = DbService.get('resource_type');
        $scope.unit_list = DbService.get('unit');
        $scope.abs_list = DbService.get('absenteeism');
        //set project settings
        var proj = $filter('filter')(DbService.get('projects'), {
            id: $stateParams.projectId
        })[0];
        if (proj && proj.settings) {
            $scope.proj_margin = $filter('filter')(proj.settings, {
                name: "margin"
            })[0];
        } else {
            $scope.proj_margin.value = 0;
        }
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
                                var resSalePrice = res.direct_cost * (1 + (res.resource_margin || 0) / 100) * (1 + ($scope.proj_margin.value || 0) / 100);
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
                                    var resSalePrice = res.direct_cost * (1 + (res.resource_margin || 0) / 100) * (1 + ($scope.proj_margin.value || 0) / 100);
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
        FormInstanceService.get($rootScope.formId).then(function(data) {
            $rootScope.formData = data;
            $scope.formData = data;
            $scope.titleShow = $scope.formData.name;
            //get resources data
            if (data.resource_field_id) {
                ResourceService.get_field(data.resource_field_id).then(function(res) {
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
                });
            }
            //get staff data
            if (data.staff_field_id) {
                StaffService.get_field(data.staff_field_id).then(function(res) {
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
                });
            }
            //get schedule data
            if (data.scheduling_field_id) {
                SchedulingService.get_field(data.scheduling_field_id).then(function(res) {
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
                });
            }
            //get payment data
            if (data.pay_item_field_id) {
                PayitemService.get_field(data.pay_item_field_id).then(function(res) {
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
                });
            }
        });
        if ($scope.formData) {
            if ($scope.formData.length !== 0) {
                $scope.hasData = true;
            }
        }

        function setResourceType(item) {
            var restype = $filter('filter')($scope.resource_type_list, {
                name: item.resource_type_name
            })[0];
            if (restype)
                item.res_type_obj = restype;
        }

        function setUnit(item) {
            var unt = $filter('filter')($scope.unit_list, {
                id: item.unit_id
            })[0];
            if (unt)
                item.unit_obj = unt;
        }

        function setAbsenteeism(item) {
            var abs = $filter('filter')($scope.abs_list, {
                reason: item.abseteeism_reason_name
            })[0];
            if (abs)
                item.absenteeism_obj = abs;
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

        function createPopup(id) {
            return {
                template: '<input type="text" ng-model="filter.email">',
                title: 'Share form',
                subTitle: 'Please enter a valid e-mail address.',
                scope: $scope,
                buttons: [{
                    text: '<i class="ion-person-add"></i>',
                    onTap: function(e) {
                        $scope.importContact(id);
                    }
                }, {
                    text: 'Cancel',
                }, {
                    text: 'Send',
                    type: 'button-positive',
                    onTap: function(e) {
                        if (!$scope.filter.email) {
                            e.preventDefault();
                            var alertPopup = $ionicPopup.alert({
                                title: 'Share',
                                template: "",
                                content: "Please insert a valid e-mail address.",
                                buttons: [{
                                    text: 'OK',
                                    type: 'button-positive',
                                    onTap: function(e) {
                                        alertPopup.close();
                                    }
                                }]
                            });
                        } else {
                            sendEmail($scope.filter.email, id);
                        }
                    }
                }]
            }
        }

        function sendEmail(res, id) {
            if (res) {
                var alertPopup1 = $ionicPopup.alert({
                    title: "Sending email",
                    template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                    content: "",
                    buttons: []
                });
                ShareService.form.create(id, res).then(function(response) {
                        alertPopup1.close();
                        if (response.message === "Form shared") {
                            res = "";
                            var alertPopupC = SecuredPopups.show('alert', {
                                title: 'Share',
                                template: 'Email sent.'
                            });
                        }
                    },
                    function(err) {
                        alertPopup1.close();
                        if (err.status == 422) {
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
                        var popup = $ionicPopup.show(createPopup(id));
                    });
                } else {
                    var alertPopup1 = $ionicPopup.alert({
                        title: 'Share',
                        template: "",
                        content: "E-mail already added to share list.",
                        buttons: [{
                            text: 'OK',
                            type: 'button-positive',
                            onTap: function(e) {
                                alertPopup1.close();
                                var popup = $ionicPopup.show(createPopup(id));
                            }
                        }]
                    });
                }
            } else {
                $scope.filter.email = contact;
                $timeout(function() {
                    var popup = $ionicPopup.show(createPopup(id));
                });
            }
        }

        $scope.importContact = function(id) {
            $timeout(function() {
                navigator.contacts.pickContact(function(contact) {
                    if (contact.emails) {
                        addContact(id, contact.emails[0].value);
                    } else {
                        var alertPopup1 = $ionicPopup.alert({
                            title: 'Share',
                            template: "",
                            content: "No e-mail address was found. Please enter one manually.",
                            buttons: [{
                                text: 'OK',
                                type: 'button-positive',
                                onTap: function(e) {
                                    alertPopup1.close();
                                    var popup = $ionicPopup.show(createPopup(id));
                                }
                            }]
                        });
                    }
                });
            });
        }
        $scope.shareThis = function(predicate) {
            var popup = $ionicPopup.show(createPopup(predicate.id));
        };

        $scope.goToTop = function() {
            $timeout(function() { // we need little delay
                $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
            });
        }

    }
]);
