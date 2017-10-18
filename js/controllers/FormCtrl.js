ppApp.controller('FormCtrl', [
    '$scope',
    '$timeout',
    'PostService',
    'FormUpdateService',
    '$rootScope',
    'CacheFactory',
    '$ionicScrollDelegate',
    '$stateParams',
    '$ionicListDelegate',
    '$ionicModal',
    '$cordovaCamera',
    '$state',
    '$ionicSideMenuDelegate',
    '$ionicHistory',
    '$ionicPopover',
    'ConvertersService',
    'CommonServices',
    '$filter',
    '$q',
    'SettingService',
    'SyncService',
    function($scope, $timeout, PostService, FormUpdateService, $rootScope, CacheFactory, $ionicScrollDelegate, $stateParams, $ionicListDelegate, $ionicModal,
        $cordovaCamera, $state, $ionicSideMenuDelegate, $ionicHistory, $ionicPopover, ConvertersService, CommonServices, $filter, $q, SettingService, SyncService) {

        $scope.$on('$ionicView.enter', function() {
            $ionicHistory.clearHistory();
            $ionicSideMenuDelegate.canDragContent(false);
        });
        $ionicSideMenuDelegate.canDragContent(false);
        $scope.repeatable = false;
        $scope.linkAux = 'forms';
        pullDown();
        var custSett = [];
        SyncService.getSettings().then(function(settings) {
            custSett = settings.custsett;
            $scope.filter = {
                state: 'form',
                actionBtn: false,
                edit: true,
                popup_title: 'Resource filter',
                popup_list: [],
                searchText: ''
            };
            $scope.resource_type_list = settings.resource_type;
            $scope.unit_list = settings.unit;
            $scope.abs_list = settings.absenteeism;
            $scope.filter.vat = parseInt(CommonServices.filterByField(custSett, 'name', 'vat').value, 10);
            $scope.currency = CommonServices.filterByField(custSett, 'name', 'currency').value;
            $scope.filter.currency = angular.copy($scope.currency);
            $scope.filter.start = CommonServices.filterByField(custSett, 'name', 'start').value;
            $scope.filter.break = CommonServices.filterByField(custSett, 'name', 'break').value;
            $scope.filter.finish = CommonServices.filterByField(custSett, 'name', 'finish').value;
            // $scope.filter.margin = CommonServices.filterByField(custSett,'name', 'margin').value;
        })

        //list payitems
        PostService.post({
            method: 'GET',
            url: 'payitem',
            params: {
                projectId: $stateParams.projectId
            }
        }, function(res) {
            $scope.popup_list = res.data;
        }, function(err) {
            $scope.popup_list = [];
        });

        //set project settings
        SyncService.getProjects().then(function(res) {
            var proj = CommonServices.filterByField(res, 'id', parseInt($stateParams.projectId, 10));
            if (proj.settings) {
                $rootScope.proj_margin = parseInt(CommonServices.filterByField(proj.settings, 'name', "margin").value);
            } else {
                $rootScope.proj_margin = 0;
            }
        }, function(reason) {
            SettingService.show_message_popup("Error", reason);
        });

        //Populate resourceField, staffField, payitemField with data from server and an empty list for resources
        //every resource added, independently on the field type(staff, resource, pay item, schedule) will be added to resources list of the corresponding Field
        SyncService.selectDesignsWhere('id', $stateParams.formId).then(function(res) {
            $scope.formData = res[0];
            $scope.titleShow = $scope.formData.name;
            $scope.shownGroup = $scope.formData.field_group_designs[0];

            angular.forEach($scope.formData.field_group_designs, function(field) {
                if (field.repeatable) {
                    $scope.repeatable = true;
                    return false;
                }
            });

            if ($scope.formData.resource_field_design) {
                $scope.resourceField = {
                    'id': 0,
                    'customer_id': $scope.formData.customer_id,
                    'register_nominated': $scope.formData.resource_field_design.register_nominated,
                    'date_option': $scope.formData.resource_field_design.date_option,
                    'financial_option': $scope.formData.resource_field_design.financial_option,
                    'total_cost': 0,
                    'resources': [{
                        "id": 0,
                        "resource_field_id": 0,
                        "resource_id": 0,
                        "position": 0,
                        "calculation": false,
                        "name": '',
                        "product_ref": '',
                        "unit_id": 0,
                        "unit_name": '',
                        "resource_type_id": 0,
                        "unit_obj": "",
                        "resource_type_name": '',
                        "direct_cost": 0,
                        "resource_margin": 0,
                        "stage_id": 1,
                        "stage_name": '',
                        "vat": $scope.filter.vat,
                        "quantity": 0,
                        "current_day": '',
                        "total_cost": 0,
                        "staff_role": '',
                        "expiry_date": '',
                        "abseteeism_reason_name": ''
                    }]
                };
                // $scope.filter.substate = $scope.resourceField.resources[0];
            }
            if ($scope.formData.pay_item_field_design) {
                $scope.payitemField = {
                    "id": 0,
                    'register_nominated': $scope.formData.pay_item_field_design.register_nominated,
                    'display_subtask': $scope.formData.pay_item_field_design.display_subtask,
                    'display_resources': $scope.formData.pay_item_field_design.display_resources,
                    "pay_items": [{
                        "description": "",
                        "reference": "",
                        "unit": "",
                        "quantity": "",
                        "open": true,
                        "child": true,
                        "subtasks": [],
                        "resources": [],
                        "total_cost": 0
                    }]
                };
                $scope.filter.substate = $scope.payitemField.pay_items[0];
            }
            if ($scope.formData.scheduling_field_design) {
                $scope.payitemField = {
                    "id": 0,
                    'display_subtask': $scope.formData.scheduling_field_design.true,
                    "pay_items": [{
                        "description": "",
                        "reference": "",
                        "unit": "",
                        "quantity": "",
                        "open": true,
                        "child": true,
                        "subtasks": [],
                        "resources": [],
                        "total_cost": 0
                    }]
                };
            }
            if ($scope.formData.staff_field_design) {
                $scope.staffField = {
                    'id': 0,
                    'withTimes': $scope.formData.staff_field_design.withTimes,
                    'resources': [{
                        "name": "",
                        "customerId": 0,
                        "employer_name": "",
                        "staff_role": "",
                        "product_ref": "",
                        "unit_name": "",
                        "direct_cost": 0.0,
                        "resource_type_name": "",
                        "resource_margin": 0,
                        "telephone_number": "",
                        "email": "",
                        "safety_card_number": "",
                        "expiry_date": "",
                        "staff": true,
                        "current_day": "",
                        "start_time": $scope.filter.start,
                        "break_time": $scope.filter.break,
                        "finish_time": $scope.filter.finish,
                        "total_time": "",
                        "comment": "",
                        "open": true,
                        "vat": $scope.filter.vat
                    }]
                };
            }
        }, function(reason) {
            console.log(reason);
        });

        $scope.updateCalculation = function(data) {
            CommonServices.updateCalculation(data);
        };
        $scope.updateTitle = function(title, placeholder) {
            CommonServices.updateTitle(title, placeholder, $scope.titleShow);
        };
        //Keep track of current state and set the state to go back to
        $scope.backHelper = function() {
            switch ($scope.linkAux) {
                case 'forms':
                    $state.go('app.forms', {
                        'projectId': $stateParams.projectId,
                        'categoryId': $scope.formData.category_id
                    });
                    break;
                case 'photos':
                    $scope.filter.substate = null;
                    $scope.filter.state = 'form';
                    $ionicScrollDelegate.resize();
                    $scope.linkAux = 'forms';
                    break;
                case 'photodetails':
                    $scope.filter.substate = 'gallery';
                    $scope.linkAux = 'photos';
                    pullDown();
                    break;
                case 'resource':
                    $scope.doTotal('resource', $scope.resourceField);
                    $scope.titleShow = 'Resources';
                    $scope.filter.state = 'resource';
                    $scope.filter.substate = null;
                    $ionicScrollDelegate.resize();
                    $scope.linkAux = 'resources';
                    break;
                case 'resources':
                    $scope.filter.state = 'form';
                    $ionicScrollDelegate.resize();
                    $scope.linkAux = 'forms';
                    break;
                case 'staff':
                    $scope.filter.state = 'staff';
                    $scope.titleShow = 'Staffs';
                    $scope.filter.substate = null;
                    $ionicScrollDelegate.resize();
                    $scope.linkAux = 'staffs';
                    break;
                case 'staffs':
                    $scope.filter.state = 'form';
                    $ionicScrollDelegate.resize();
                    $scope.linkAux = 'forms';
                    break;
                case 'scheduling':
                    if ($scope.filter.substate) {
                        $scope.filter.state = 'scheduling';
                        $scope.doTotal('pi', $scope.payitemField);
                        $scope.filter.substateStkRes = null;
                        $scope.filter.substateStk = null;
                        $scope.filter.substateRes = null;
                        $scope.filter.substate = null;
                        $ionicScrollDelegate.resize();
                        $scope.titleShow = 'Schedulings';
                        $scope.linkAux = 'schedulings';
                    } else {
                        $scope.filter.state = 'form';
                        $ionicScrollDelegate.resize();
                        $scope.linkAux = 'forms';
                        $scope.titleShow = $scope.formData.name;
                    }
                    break;
                case 'schedulings':
                    $scope.filter.state = 'form';
                    $ionicScrollDelegate.resize();
                    $scope.linkAux = 'forms';
                    $scope.titleShow = $scope.formData.name;
                    break;
                case 'schedulingStk':
                    $scope.filter.state = 'scheduling';
                    $scope.doTotal('pisubtask', $scope.filter.substate);
                    $scope.filter.substateStk = null;
                    $ionicScrollDelegate.resize();
                    $scope.linkAux = 'scheduling';
                    if ($scope.filter.substate.description) {
                        $scope.titleShow = 'Scheduling: ' + $scope.filter.substate.description;
                    } else {
                        $scope.titleShow = 'Scheduling';
                    }
                    break;
                case 'schedulingSubRes':
                    $scope.filter.state = 'scheduling';
                    $scope.doTotal('pisubtask', $scope.filter.substateStk);
                    $scope.filter.actionBtnShow = true;
                    $scope.filter.substateStkRes = null;
                    $ionicScrollDelegate.resize();
                    $scope.linkAux = 'schedulingStk';
                    if ($scope.filter.substateStk.description) {
                        $scope.titleShow = 'Scheduling Subtaks: ' + $scope.filter.substateStk.description;
                    } else {
                        $scope.titleShow = 'Scheduling Subtaks';
                    }
                    break;
                case 'schedulingRes':
                    $scope.filter.state = 'scheduling';
                    $scope.doTotal('piresource', $scope.filter.substate);
                    $scope.filter.actionBtnShow = true;
                    $scope.filter.substateRes = null;
                    $ionicScrollDelegate.resize();
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
                        $scope.doTotal('pi', $scope.payitemField);
                        $scope.filter.substateStkRes = null;
                        $scope.filter.substateStk = null;
                        $scope.filter.substateRes = null;
                        $scope.filter.substate = null;
                        $ionicScrollDelegate.resize();
                        $scope.titleShow = 'Pay-items';
                        $scope.linkAux = 'payitems';
                    } else {
                        $scope.filter.state = 'form';
                        $ionicScrollDelegate.resize();
                        $scope.linkAux = 'forms';
                        $scope.titleShow = $scope.formData.name;
                    }
                    break;
                case 'payitems':
                    $scope.filter.state = 'form';
                    $ionicScrollDelegate.resize();
                    $scope.linkAux = 'forms';
                    $scope.titleShow = $scope.formData.name;
                    break;
                case 'payitemStk':
                    $scope.filter.state = 'payitem';
                    $scope.doTotal('pisubtask', $scope.filter.substate);
                    $scope.filter.substateStk = null;
                    $ionicScrollDelegate.resize();
                    $scope.linkAux = 'payitem';
                    if ($scope.filter.substate.description) {
                        $scope.titleShow = 'Pay-item: ' + $scope.filter.substate.description;
                    } else {
                        $scope.titleShow = 'Pay-item';
                    }
                    break;
                case 'payitemSubRes':
                    $scope.filter.state = 'payitem';
                    $scope.doTotal('pisubresource', $scope.filter.substateStk);
                    $scope.filter.actionBtnShow = true;
                    $scope.filter.substateStkRes = null;
                    $ionicScrollDelegate.resize();
                    $scope.linkAux = 'payitemStk';
                    if ($scope.filter.substateStk.description) {
                        $scope.titleShow = 'Pay-item Subtaks: ' + $scope.filter.substateStk.description;
                    } else {
                        $scope.titleShow = 'Pay-item Subtaks';
                    }
                    break;
                case 'payitemRes':
                    $scope.filter.state = 'payitem';
                    $scope.doTotal('piresource', $scope.filter.substate);
                    $scope.filter.actionBtnShow = true;
                    $scope.filter.substateRes = null;
                    $ionicScrollDelegate.resize();
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
        //Navigate to subtasks for scheduling and pay item fields
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
        //Navigate to given state
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
                    $scope.doTotal('pisubtask', $scope.filter.substate);
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
                    $scope.doTotal('pisubtask', $scope.filter.substate);
                    break;
            }
            $scope.goToTop();
        }

        $ionicPopover.fromTemplateUrl('view/search.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.doTotal = function(type, parent) {
            if (parent) {
                parent.total_cost = 0;
                if (type === 'resource' || type === 'piresource' || type === 'pisubresource') {
                    angular.forEach(parent.resources, function(res) {
                        if (isNaN(res.quantity)) {
                            res.total_cost = 0;
                        }
                        if (isNaN(res.direct_cost)) {
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
            }
        }

        //Open resource filter with the corresponding resources list
        $scope.openPopover = function($event, predicate, test) {
            $scope.filter.popup_predicate = predicate;
            CommonServices.openPopover(test, $scope.filter, $stateParams.projectId);
            $scope.popover.show($event);
        };

        //Select a resource from resource filter
        $scope.selectPopover = function(item) {
            CommonServices.selectPopover($scope.filter, item, $scope.titleShow);
            $scope.popover.hide();
        }

        $scope.closePopover = function() {
            if ($scope.filter.searchText) {
                CommonServices.addResourceManually($scope.filter);
                $scope.filter.searchText = '';
            }
            $scope.popover.hide();
        }
        var designsCache = CacheFactory.get('designsCache');
        if (!designsCache || designsCache.length === 0) {
            designsCache = CacheFactory('designsCache');
            designsCache.setOptions({
                storageMode: 'localStorage'
            });
        }

        $scope.onSelect = function(item) {
            if ($scope.filter.state === 'resource') {
                $scope.filter.substate.name = item.name;
                $scope.filter.substate.product_ref = item.product_ref;
                $scope.filter.substate.direct_cost = item.direct_cost;
                angular.forEach($scope.unit_list, function(unit) {
                    if (unit.id === item.unit_id) {
                        $scope.filter.substate.unit_obj = unit;
                    }
                });
                angular.forEach($scope.resource_type_list, function(res_type) {
                    if (res_type.id === item.resource_type_id) {
                        $scope.filter.substate.resource_type_obj = res_type;
                    }
                });
            }
        };

        //Special fields - add button pressed (+)
        $scope.actionBtnPayitem = function() {
            if ($scope.filter.state === 'payitem' || $scope.filter.state === 'scheduling') {
                if ($scope.filter.substate && !$scope.filter.substateStk) {
                    if (!$scope.filter.substate.resources)
                        $scope.filter.substate.resources = [];
                    if (!$scope.filter.substate.subtasks)
                        $scope.filter.substate.subtasks = [];
                    if ($scope.filter.substate.resources.length === 0 && $scope.filter.substate.subtasks.length === 0) {
                        $scope.filter.actionBtn = !$scope.filter.actionBtn;
                    } else {
                        if ($scope.filter.substate.resources.length !== 0 && $scope.filter.substate.subtasks.length === 0) {
                            $scope.addResourcePi();
                        } else {
                            $scope.addSubtask();
                        }
                    }
                } else {
                    if ($scope.filter.substateStk) {
                        $scope.addResourceInSubtask();
                    } else {
                        if ($scope.filter.state === 'payitem') {
                            $scope.linkAux = 'payitem';
                            $scope.titleAux = 'Pay-item';
                        } else {
                            $scope.linkAux = 'scheduling';
                            $scope.titleAux = 'Scheduling';
                        }
                        $scope.addPayitem();
                    }
                }
            }
            if ($scope.filter.state === 'resource') {
                $scope.linkAux = 'resource';
                $scope.titleAux = 'Resource';
                $scope.addResource();
            }
            if ($scope.filter.state === 'staff') {
                $scope.linkAux = 'staff';
                $scope.titleAux = 'Staff';
                $scope.addStaff();
            }
        };

        //Add new resource in resourceField; initialized with unit info
        $scope.addResource = function() {
            CommonServices.addResource($scope.resourceField.resources, $scope.filter.vat);
            $scope.filter.substate = $scope.resourceField.resources[$scope.resourceField.resources.length - 1];
        };
        //Add new resource in staffField; initialized with start, break and finish times
        $scope.addStaff = function() {
            if ($scope.staffField) {
                CommonServices.addStaff($scope.staffField.resources, $scope.filter.start, $scope.filter.break, $scope.filter.finish, $scope.filter.vat);
                $scope.filter.substate = $scope.staffField.resources[$scope.staffField.resources.length - 1];
            }
        }
        //Add new resource in payitemField
        $scope.addPayitem = function() {
            CommonServices.addPayitem($scope.payitemField.pay_items);
            $scope.filter.substate = $scope.payitemField.pay_items[$scope.payitemField.pay_items.length - 1]
        }
        //Add new subtask
        $scope.addSubtask = function() {
            if ($scope.filter.substate && $scope.filter.substate.resources.length === 0) {
                CommonServices.addSubtask($scope.filter.substate.subtasks, $scope.filter.vat);
                $scope.filter.substateStk = $scope.filter.substate.subtasks[$scope.filter.substate.subtasks.length - 1]
                if ($scope.filter.state === 'scheduling') {
                    $scope.linkAux = 'schedulingStk';
                    $scope.titleShow = 'Scheduling Subtask';
                } else {
                    $scope.linkAux = 'payitemStk';
                    $scope.titleShow = 'Pay-item Subtask';
                }
            }
        }
        //Add new resource in payitemField (as subtask)
        $scope.addResourcePi = function() {
            if ($scope.filter.substate && $scope.filter.substate.subtasks.length === 0) {
                CommonServices.addResourcePi($scope.filter.substate.resources, $scope.filter.vat);
                $scope.filter.substateRes = $scope.filter.substate.resources[$scope.filter.substate.resources.length - 1]
                if ($scope.filter.state === 'scheduling') {
                    $scope.linkAux = 'schedulingRes';
                    $scope.titleShow = 'Scheduling Resource';
                } else {
                    $scope.linkAux = 'payitemRes';
                    $scope.titleShow = 'Pay-item Resource';
                }
            }
        }
        //Add new resource in payitemField subtask
        $scope.addResourceInSubtask = function() {
            if ($scope.filter.substateStk) {
                CommonServices.addResourceInSubtask($scope.filter.substateStk, $scope.filter.vat);
                $scope.filter.substateStkRes = $scope.filter.substateStk.resources[$scope.filter.substateStk.resources.length - 1];
                if ($scope.filter.state === 'scheduling') {
                    $scope.linkAux = 'schedulingSubRes';
                    $scope.titleShow = 'Scheduling Subtask Resource';
                } else {
                    $scope.linkAux = 'payitemSubRes';
                    $scope.titleShow = 'Pay-item Subtask Resource';
                }
            }
        }

        $scope.imgCounter = 0;
        $scope.trim = function() {
            $scope.pictures = [];
            var i, j, temparray, chunk = 3;
            if ($scope.imgURI) {
                for (i = 0, j = $scope.imgURI.length; i < j; i += chunk) {
                    temparray = $scope.imgURI.slice(i, i + chunk);
                    $scope.pictures.push(temparray);
                }
            }
        };
        $scope.addSpot = function() {
            if ($scope.imgURI.length < 9) {
                $scope.imgURI.push({
                    "id": $scope.imgCounter,
                    "base64String": "",
                    "comment": "",
                    "tags": "",
                    "title": " ",
                    "projectId": 0,
                    "formInstanceId": 0
                });
                $scope.imgCounter++;
                $scope.trim();
            }
        };
        $scope.delSpot = function(id) {
            for (var i = 0; i < $scope.imgURI.length; i++) {
                if ($scope.imgURI[i].id === id) {
                    $scope.imgURI.splice(i, 1);
                    $scope.trim();
                    break;
                }
            }
        };
        $scope.test = function(item) {
            $scope.item = item;
            $ionicModal.fromTemplateUrl('view/form/_picture_modal.html', {
                scope: $scope
            }).then(function(modal) {
                $timeout(function() {
                    $scope.picModal = modal;
                    $scope.picModal.show();
                });
            });
        };
        $scope.doShow = function() {
            $scope.picModal.hide();
            $scope.picModal.remove();
        };

        function elmYPosition(id) {
            var elm = document.getElementById(id);
            var y = elm.offsetTop;
            var node = elm;
            while (node.offsetParent && node.offsetParent !== document.body) {
                node = node.offsetParent;
                y += node.offsetTop;
            }
            return y;
        }

        $scope.goto = function(id) {
            if (id) {
                $scope.scroll_ref = $timeout(function() { // we need little delay
                    var stopY = elmYPosition(id) - 48;
                    $ionicScrollDelegate.scrollTo(0, stopY, true);
                }, 50);
            }
        };
        $scope.repeatGroup = function(x) {
            var aux = {};
            angular.copy(x, aux);
            aux.repeatable = true;
            aux.id = 0;
            $ionicListDelegate.closeOptionButtons();
            for (var i = 0; i < aux.field_designs.length; i++) {
                aux.field_designs[i].field_group_design_id = 0;
                aux.field_designs[i].id = 0;
                if (aux.field_designs[i].option_designs) {
                    for (var j = 0; j < aux.field_designs[i].option_designs.length; j++) {
                        aux.field_designs[i].option_designs[j].id = 0;
                        aux.field_designs[i].option_designs[j].field_design_id = 0;
                    }
                }
                if (aux.field_designs[i].field_values) {
                    for (var j = 0; j < aux.field_designs[i].field_values.length; j++) {
                        aux.field_designs[i].field_values[j].id = 0;
                        aux.field_designs[i].field_values[j].field_design_id = 0;
                    }
                }
            }
            for (var i = 0; i < $scope.formData.field_group_designs.length; i++) {
                if (x === $scope.formData.field_group_designs[i]) {
                    $scope.formData.field_group_designs.splice(i + 1, 0, aux);
                    break;
                }
            }
        };
        $scope.repeatField = function(x, y) {
            var test = {};
            angular.copy(y, test);
            test.repeatable = true;
            test.id = 0;
            for (var i = 0; i < x.field_designs.length; i++) {
                if (x.field_designs[i] === y) {
                    if (x.field_designs.option_designs) {
                        for (var j = 0; j < x.field_designs.option_designs.length; j++) {
                            test.field_designs.option_designs[j].id = 0;
                        }
                    }
                    x.field_designs.splice(i + 1, 0, test);
                    break;
                }
            }
        };
        $scope.toggleGroup = function(group, id) {
            if ($scope.isGroupShown(group)) {
                $scope.shownGroup = null;
            } else {
                $scope.shownGroup = null;
                $timeout(function() {
                    $scope.shownGroup = group;
                }, 30);

            }
            $scope.goto(id);
        };
        $scope.isGroupShown = function(group) {
            return $scope.shownGroup === group;
        };
        $scope.$on('updateScopeFromDirective', function() {
            FormUpdateService.addProduct($scope.formData, $scope.modalHelper);
        });
        $scope.$on('moduleSaveChanges', function() {
            $scope.formData = FormUpdateService.getProducts();
        });
        $scope.goPicture = function() {
            $scope.linkAux = 'photos';
            $scope.titleShow = 'Photo Gallery';
            $scope.filter.state = 'photos';
            $scope.filter.substate = 'gallery'
            $timeout(function() { // we need little delay
                $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
            });
            pullDown();
        }
        $scope.testPicture = function(item) {
            $scope.linkAux = 'photodetails';
            $scope.titleShow = 'Photo Gallery';
            $scope.filter.substate = 'pic';
            $scope.filter.picture = item;
            $scope.goToTop();
        }
        $scope.imgURI = [];
        $scope.takePicture = function() {
            var options = {
                quality: 20,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: true,
                correctOrientation: true
            };

            $cordovaCamera.getPicture(options).then(function(imageData) {
                $timeout(function() {
                    SettingService.show_message_popup('Form gallery', 'Photo added. Check form gallery for more options.');
                    $scope.imgURI.push({
                        "id": 0,
                        "base64String": imageData,
                        "comment": "",
                        "tags": "",
                        "title": " ",
                        "projectId": 0,
                        "formInstanceId": 0
                    })
                    $scope.filter.picture = $scope.imgURI[$scope.imgURI.length - 1];
                    $scope.filter.state = 'form';
                    $scope.filter.substate = null;
                });
            }, function(err) {
                // An error occured. Show a message to the user
            });
        };
        $scope.addPicture = function(index) {
            var options = {
                maximumImagesCount: 1,
                quality: 20,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                correctOrientation: true,
                allowEdit: false
            };

            $cordovaCamera.getPicture(options).then(function(imageData) {
                $timeout(function() {
                    SettingService.show_message_popup('Form gallery', 'Photo added. Check form gallery for more options.');
                    $scope.imgURI.push({
                        "id": 0,
                        "base64String": imageData,
                        "comment": "",
                        "tags": "",
                        "title": " ",
                        "projectId": 0,
                        "formInstanceId": 0
                    })
                    $scope.filter.picture = $scope.imgURI[$scope.imgURI.length - 1];
                    $scope.filter.state = 'form';
                    $scope.filter.substate = null;
                });

            }, function(err) {});
        };
        $scope.removePicture = function(index) {
            if ($scope.imgURI.length !== 0) {
                $scope.imgURI.splice(index, 1);
            }
            pullDown();
        };
        $scope.convertToDataURLviaCanvas = function(url, callback) {
            var img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function() {
                var canvas = document.createElement('CANVAS');
                var ctx = canvas.getContext('2d');
                var dataURL;
                canvas.height = this.height;
                canvas.width = this.width;
                ctx.drawImage(this, 0, 0);
                dataURL = canvas.toDataURL('image/jpg');
                callback(dataURL);
                canvas = null;
            };
            img.src = url;
        };
        //allow or not calculations in subtasks
        $scope.actionBtnCalculation = function() {
            if ($scope.filter.substateRes) {
                $scope.filter.substateRes.calculation = !$scope.filter.substateRes.calculation;
            }
            if ($scope.filter.substateStkRes) {
                $scope.filter.substateStkRes.calculation = !$scope.filter.substateStkRes.calculation;
            }
        }
        $scope.deleteElement = function(parent, data) {
            var i = parent.indexOf(data);
            if (data.subtasks) {
                if (parent.length === 1) {
                    parent.splice(i, 1);
                    $scope.addPayitem();
                } else {
                    parent.splice(i, 1);
                }
            } else {
                if (i !== -1) {
                    parent.splice(i, 1);
                }
            }
        }
        $scope.submit = function() {
            SettingService.show_confirm_popup('New form', 'Are you sure you want to submit the data?').then(function(res) {
                if (res) {
                    if ($scope.picModal) {
                        $scope.picModal.remove();
                        if ($scope.picModal) {
                            delete $scope.picModal;
                        }
                    }
                    $timeout(function() {
                        function addResource() {
                            var def = $q.defer();
                            if ($scope.formData.resource_field_design) {
                                angular.forEach($scope.resourceField.resources, function(item) {
                                    if (item.unit_obj) {
                                        item.unit_id = item.unit_obj.id;
                                        item.unit_name = item.unit_obj.name;
                                    }
                                    if (item.res_type_obj) {
                                        item.resource_type_id = item.res_type_obj.id;
                                        item.resource_type_name = item.res_type_obj.name;
                                    }
                                    if (item.stage_obj) {
                                        item.stage_id = item.stage_obj.id;
                                        item.stage_name = item.stage_obj.name;
                                    }
                                    if (item.absenteeism_obj) {
                                        item.abseteeism_reason_name = item.absenteeism_obj.reason;
                                    }
                                    if (item.current_day_obj) {
                                        item.current_day = item.current_day_obj;
                                    }
                                });
                                PostService.post({
                                    method: 'POST',
                                    url: 'resourcefield',
                                    data: $scope.resourceField
                                }, function(x) {
                                    $scope.formData.resource_field_id = x.data.id;
                                    def.resolve();
                                }, function(err) {
                                    $scope.formData.resourceField = $scope.formData.resourceField || [];
                                    $scope.formData.resourceField.push($scope.resourceField);
                                    def.resolve();
                                });
                            } else {
                                def.resolve();
                            }
                            return def.promise;
                        }

                        function addPayitem() {
                            var def = $q.defer();
                            if ($scope.formData.pay_item_field_design) {
                                $scope.payitemField.display_subtasks = $scope.formData.pay_item_field_design.display_subtasks;
                                $scope.payitemField.display_resources = $scope.formData.pay_item_field_design.display_resources;
                                $scope.payitemField.register_nominated = $scope.formData.pay_item_field_design.register_nominated;
                                angular.forEach($scope.payitemField.pay_items, function(item) {
                                    if (item.unit_obj) {
                                        item.unit = item.unit_obj.name;
                                        item.unit_id = item.unit_obj.id;
                                    }
                                    angular.forEach(item.resources, function(res) {
                                        if (res.unit_obj) {
                                            res.unit_id = res.unit_obj.id;
                                            res.unit_name = res.unit_obj.name;
                                        }
                                        if (res.res_type_obj) {
                                            res.resource_type_id = res.res_type_obj.id;
                                            res.resource_type_name = res.res_type_obj.name;
                                        }
                                        if (res.absenteeism_obj) {
                                            res.abseteeism_reason_name = res.absenteeism_obj.reason;
                                        }
                                        if (res.current_day_obj) {
                                            res.current_day = res.current_day_obj;
                                        }
                                        if (res.expiry_date_obj) {
                                            var date = new Date(res.expiry_date_obj);
                                            res.expiry_date = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
                                        }
                                    });
                                    angular.forEach(item.subtasks, function(subtask) {
                                        angular.forEach(subtask.resources, function(res) {
                                            if (res.unit_obj) {
                                                res.unit_id = res.unit_obj.id;
                                                res.unit_name = res.unit_obj.name;
                                            }
                                            if (res.res_type_obj) {
                                                res.resource_type_id = res.res_type_obj.id;
                                                res.resource_type_name = res.res_type_obj.name;
                                            }
                                            if (res.absenteeism_obj) {
                                                res.abseteeism_reason_name = res.absenteeism_obj.reason;
                                            }
                                            if (res.current_day_obj) {
                                                res.current_day = res.current_day_obj;
                                            }
                                            if (res.expiry_date_obj) {
                                                var date = new Date(res.expiry_date_obj);
                                                res.expiry_date = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
                                            }
                                        });
                                    });
                                });
                                PostService.post({
                                    method: 'POST',
                                    url: 'payitemfield',
                                    data: $scope.payitemField
                                }, function(x) {
                                    $scope.formData.pay_item_field_id = x.data.id;
                                    def.resolve();
                                }, function(err) {
                                    $scope.formData.payitemField = $scope.formData.payitemField || [];
                                    $scope.formData.payitemField.push($scope.payitemField);
                                    def.resolve();
                                });
                            } else {
                                def.resolve();
                            }
                            return def.promise;
                        }

                        function addScheduling() {
                            var def = $q.defer();
                            if ($scope.formData.scheduling_field_design) {
                                $scope.payitemField.display_subtasks = $scope.formData.scheduling_field_design.display_subtasks;
                                $scope.payitemField.display_resources = $scope.formData.scheduling_field_design.display_resources;
                                $scope.payitemField.register_nominated = $scope.formData.scheduling_field_design.register_nominated;
                                angular.forEach($scope.payitemField.pay_items, function(item) {
                                    if (item.unit_obj) {
                                        item.unit = item.unit_obj.name;
                                        item.unit_id = item.unit_obj.id;
                                    }
                                    angular.forEach(item.resources, function(res) {
                                        if (res.unit_obj) {
                                            res.unit_id = res.unit_obj.id;
                                            res.unit_name = res.unit_obj.name;
                                        }
                                        if (res.res_type_obj) {
                                            res.resource_type_id = res.res_type_obj.id;
                                            res.resource_type_name = res.res_type_obj.name;
                                        }
                                        if (res.absenteeism_obj) {
                                            res.abseteeism_reason_name = res.absenteeism_obj.reason;
                                        }
                                        if (res.current_day_obj) {
                                            res.current_day = res.current_day_obj;
                                        }
                                        if (res.expiry_date_obj) {
                                            var date = new Date(res.expiry_date_obj);
                                            res.expiry_date = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
                                        }
                                    });
                                    angular.forEach(item.subtasks, function(subtask) {
                                        angular.forEach(subtask.resources, function(res) {
                                            if (res.unit_obj) {
                                                res.unit_id = res.unit_obj.id;
                                                res.unit_name = res.unit_obj.name;
                                            }
                                            if (res.res_type_obj) {
                                                res.resource_type_id = res.res_type_obj.id;
                                                res.resource_type_name = res.res_type_obj.name;
                                            }
                                            if (res.absenteeism_obj) {
                                                res.abseteeism_reason_name = res.absenteeism_obj.reason;
                                            }
                                            if (res.current_day_obj) {
                                                res.current_day = res.current_day_obj.getTime();
                                            }
                                            if (res.expiry_date_obj) {
                                                var date = new Date(res.expiry_date_obj);
                                                res.expiry_date = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
                                            }
                                        });
                                    });
                                });
                                PostService.post({
                                    method: 'POST',
                                    url: 'schedulingfield',
                                    data: $scope.payitemField
                                }, function(x) {
                                    $scope.formData.scheduling_field_id = x.data.id;
                                    def.resolve();
                                }, function(err) {
                                    $scope.formData.schedField = $scope.formData.schedField || [];
                                    $scope.formData.schedField.push($scope.payitemField);
                                    def.resolve();
                                });
                            } else {
                                def.resolve();
                            }
                            return def.promise;
                        }

                        function addStaff() {
                            var def = $q.defer();
                            if ($scope.formData.staff_field_design) {
                                angular.forEach($scope.staffField.resources, function(item) {
                                    if (item.res_type_obj) {
                                        item.resource_type_id = item.res_type_obj.id;
                                        item.resource_type_name = item.res_type_obj.name;
                                    }
                                    if (item.absenteeism_obj) {
                                        item.abseteeism_reason_name = item.absenteeism_obj.reason;
                                        item.absenteeism_obj.reason;
                                    }
                                    if (item.current_day_obj) {
                                        item.current_day = item.current_day_obj.getTime();
                                    }
                                    if (item.expiry_date_obj) {
                                        item.expiry_date = item.expiry_date_obj.getFullYear() + '-' + (item.expiry_date_obj.getMonth() + 1) + '-' + item.expiry_date_obj.getDate();
                                    }
                                });
                                PostService.post({
                                    method: 'POST',
                                    url: 'stafffield',
                                    data: $scope.staffField
                                }, function(x) {
                                    $scope.formData.staff_field_id = x.data.id;
                                    def.resolve();
                                }, function(err) {
                                    $scope.formData.staffField = $scope.formData.staffField || [];
                                    $scope.formData.staffField.push($scope.staffField);
                                    def.resolve();
                                });
                            } else {
                                def.resolve();
                            }
                            return def.promise;
                        }

                        var staff = addStaff();
                        var schedule = addScheduling();
                        var payitem = addPayitem();
                        var resource = addResource();

                        Promise.all([resource, staff, schedule, payitem]).then(function(res) {
                            $scope.fastSave($scope.formData, $scope.imgURI);
                        })
                    });
                }
            });
        };
        $scope.fastSave = function(datax, imgUri) {
            var formUp = SettingService.show_loading_popup('Submitting');
            //automatically sync previousely offline created forms
            if (localStorage.getObject('ppfsync') || localStorage.getObject('pppsync')) {
                SyncService.sync().then(function() {
                    create();
                })
            } else {
                create();
            }

            function create() {
                var requestForm = ConvertersService.designToInstance(datax);

                PostService.post({
                    method: 'POST',
                    url: 'forminstance',
                    data: requestForm,
                    withCredentials: true
                }, function(payload) {
                    if (!payload.message) { //TODO: check
                        angular.forEach(imgUri, function(img) {
                            img.id = 0;
                            img.formInstanceId = payload.id;
                            img.projectId = requestForm.project_id;
                            PostService.post({
                                method: 'POST',
                                url: 'image/uploadfile',
                                data: img,
                                withCredentials: true
                            }, function(payload) {

                            }, function(err) {

                            });
                        })
                    }

                    var data = payload.data;
                    if (data && data.data && data.data.message) {
                        $timeout(function() {
                            formUp.close();
                            $timeout(function() {
                                SettingService.show_message_popup('Submision failed', 'You do not have permission to perform this operation').then(function(res) {
                                    $rootScope.$broadcast('sync.todo');
                                });
                            });
                        });
                    } else {
                        $rootScope.formId = data.id;
                        if (!data.message && data.status !== 0) {
                            PostService.post({
                                method: 'GET',
                                url: 'forminstance',
                                params: {
                                    id: $rootScope.formId
                                }
                            }, function(res) {
                                $rootScope.rootForm = res.data;
                                formUp.close();
                                $state.go('app.formInstance', {
                                    'projectId': $rootScope.projectId,
                                    'type': 'form',
                                    'formId': res.data.id
                                });
                            }, function(err) {
                                console.log(err);
                            });
                        }
                    }

                }, function(data) {
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

                    formUp.close();
                    if (data && data.status === 400) {
                        $timeout(function() {
                            $timeout(function() {
                                SettingService.show_message_popup('Submision failed', 'Incorrect data, try again');
                            });
                        });
                    } else {
                        $timeout(function() {
                            $timeout(function() {
                                SettingService.show_message_popup('Submision failed', 'You are offline. Submit forms by syncing next time you are online.').then(function(res) {
                                    $state.go('app.forms', {
                                        'projectId': $rootScope.projectId,
                                        'categoryId': $scope.formData.category_id
                                    });
                                });
                            });
                        });
                    }
                });
            }
        }

        function pullDown() {
            $('html').css({
                'visibility': 'hidden'
            });
            angular.element(document).ready(function() {
                $timeout(function() {
                    console.log("wait");
                    $('.pull-down').each(function() {
                        var $this = $(this);
                        var h = $this.parent().height() - $this.height() - $this.next().height();
                        $this.css({
                            'padding-top': h
                        });
                    })
                    document.getElementsByTagName("html")[0].style.visibility = "visible";
                }, 100);
            })
        }

        $scope.goToTop = function() {
            $timeout(function() { // we need little delay
                $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
            });
        }
    }
]);
