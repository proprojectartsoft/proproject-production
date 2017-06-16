angular.module($APP.name).controller('FormCtrl', [
    '$scope',
    'FormInstanceService',
    '$timeout',
    'FormUpdateService',
    'StaffService',
    '$rootScope',
    'CacheFactory',
    '$ionicScrollDelegate',
    '$ionicPopup',
    '$stateParams',
    '$ionicListDelegate',
    '$ionicModal',
    '$cordovaCamera',
    '$state',
    'SyncService',
    '$ionicSideMenuDelegate',
    '$ionicHistory',
    '$stateParams',
    'ResourceService',
    'PayitemService',
    'SchedulingService',
    '$ionicPopover',
    'ConvertersService',
    'ImageService',
    'CommonServices',
    '$filter',
    function($scope,
        FormInstanceService,
        $timeout,
        FormUpdateService,
        StaffService,
        $rootScope,
        CacheFactory,
        $ionicScrollDelegate,
        $ionicPopup,
        $stateParams,
        $ionicListDelegate,
        $ionicModal,
        $cordovaCamera,
        $state,
        SyncService,
        $ionicSideMenuDelegate,
        $ionicHistory,
        $stateParams,
        ResourceService,
        PayitemService,
        SchedulingService,
        $ionicPopover,
        ConvertersService,
        ImageService,
        CommonServices,
        $filter,
    ) {
        $scope.$on('$ionicView.enter', function() {
            $ionicHistory.clearHistory();
            $ionicSideMenuDelegate.canDragContent(false);
        });
        $ionicSideMenuDelegate.canDragContent(false);

        $scope.linkAux = 'forms';
        pullDown();
        $scope.resource_type_list = localStorage.getObject('resource_type_list');
        $scope.unit_list = localStorage.getObject('unit_list');
        $scope.abs_list = localStorage.getObject('abs_list');

        //Populate resourceField, staffField, payitemField with data from server and an empty list for resources
        //every resource added, independently on the field type(staff, resource, pay item, schedule) will be added to resources list of the corresponding Field
        $APP.db.executeSql('SELECT * FROM DesignsTable WHERE id=' + $stateParams.formId, [],
            function(rs) {
                $scope.formData = JSON.parse(rs.rows.item(0).data)
                $scope.titleShow = $scope.formData.name;
                $scope.shownGroup = $scope.formData.field_group_designs[0];
                $scope.filter.vat = $rootScope.custSett.vat;
                $scope.filter.currency = $rootScope.custSett.currency;
                $scope.filter.margin = $rootScope.custSett.margin;
                $scope.filter.start = $rootScope.custSett.start;
                $scope.filter.break = $rootScope.custSett.break;
                $scope.filter.finish = $rootScope.custSett.finish;
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
                            "vat": 0,
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
                            "resources": []
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
                            "resources": []
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
                            "vat": 0.0
                        }]
                    };
                }
            },
            function(error) {
                console.log('SELECT SQL DesignsTable statement ERROR: ' + error.message);
            });
        $scope.updateCalculation = function(data) {
            console.log(data)
            CommonServices.updateCalculation(data);
        }
        $scope.updateTitle = function(title, placeholder) {
            CommonServices.updateTitle(title, placeholder, $scope.titleShow);
        }
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
            // if (state === 'scheduling') {
            //     switch (substate) {
            //         case 'subtask':
            //             $scope.filter.state = state;
            //             $scope.linkAux = 'schedulingStk';
            //             if (data.description) {
            //                 $scope.titleShow = 'Scheduling Subtask: ' + data.description;
            //             } else {
            //                 $scope.titleShow = 'Scheduling Subtask';
            //             }
            //             $scope.filter.substateStk = data;
            //             $ionicScrollDelegate.resize();
            //             break;
            //         case 'subres':
            //             $scope.filter.actionBtnShow = false;
            //             $scope.filter.state = state;
            //             $scope.linkAux = 'schedulingSubRes';
            //             if (data.name) {
            //                 $scope.titleShow = 'Scheduling Subtask Resource: ' + data.name;
            //             } else {
            //                 $scope.titleShow = 'Scheduling Subtask Resource';
            //             }
            //             $scope.filter.substateStkRes = data;
            //             $ionicScrollDelegate.resize();
            //             break;
            //         case 'res':
            //             $scope.filter.actionBtnShow = false;
            //             $scope.filter.state = state;
            //             $scope.linkAux = 'schedulingRes';
            //             if (data.name) {
            //                 console.log(data.name)
            //                 $scope.titleShow = 'Scheduling Resource: ' + data.name;
            //             } else {
            //                 console.log('wut?')
            //                 $scope.titleShow = 'Scheduling Resource';
            //             }
            //             $scope.filter.substateRes = data;
            //             $ionicScrollDelegate.resize();
            //             break;
            //     }
            // }
            // if (state === 'payitem') {
            //     switch (substate) {
            //         case 'subtask':
            //             $scope.filter.state = state;
            //             $scope.linkAux = 'payitemStk';
            //             if (data.description) {
            //                 $scope.titleShow = 'Pay-item Subtask: ' + data.description;
            //             } else {
            //                 $scope.titleShow = 'Pay-item Subtask';
            //             }
            //             $scope.filter.substateStk = data;
            //             $ionicScrollDelegate.resize();
            //             break;
            //         case 'subres':
            //             $scope.filter.actionBtnShow = false;
            //             $scope.filter.state = state;
            //             $scope.linkAux = 'payitemSubRes';
            //             if (data.name) {
            //                 $scope.titleShow = 'Pay-item Subtask Resource: ' + data.name;
            //             } else {
            //                 $scope.titleShow = 'Pay-item Subtask Resource';
            //             }
            //             $scope.filter.substateStkRes = data;
            //             $ionicScrollDelegate.resize();
            //             break;
            //         case 'res':
            //             $scope.filter.actionBtnShow = false;
            //             $scope.filter.state = state;
            //             $scope.linkAux = 'payitemRes';
            //             if (data.name) {
            //                 console.log(data.name)
            //                 $scope.titleShow = 'Pay-item Resource: ' + data.name;
            //             } else {
            //                 $scope.titleShow = 'Pay-item Resource';
            //             }
            //             $scope.filter.substateRes = data;
            //             $ionicScrollDelegate.resize();
            //             break;
            //     }
            // }
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
        }

        $ionicPopover.fromTemplateUrl('view/search.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.doTotal = function(type, parent) {
            if (parent) {
                parent.total_cost = 0;
                if (type === 'resource') {
                    angular.forEach(parent.resources, function(res) {
                        if (isNaN(res.quantity)) {
                            res.total_cost = 0;
                        }
                        if (isNaN(res.direct_cost)) {
                            res.total_cost = 0;
                        }
                        parent.total_cost = parent.total_cost + res.quantity * res.direct_cost;
                    });
                }
                if (type === 'piresource') {
                    console.log('piresource', parent)
                    angular.forEach(parent.resources, function(res) {
                        if (isNaN(res.quantity)) {
                            res.total_cost = 0;
                        }
                        if (isNaN(res.direct_cost)) {
                            res.total_cost = 0;
                        }
                        parent.total_cost = parent.total_cost + res.quantity * res.direct_cost;
                    });
                }
                if (type === 'pisubresource') {
                    angular.forEach(parent.resources, function(res) {
                        if (isNaN(res.quantity)) {
                            res.total_cost = 0;
                        }
                        if (isNaN(res.direct_cost)) {
                            res.total_cost = 0;
                        }
                        parent.total_cost = parent.total_cost + res.quantity * res.direct_cost;
                    });
                }
                if (type === 'pisubtask') {
                    console.log(parent)
                    angular.forEach(parent.subtasks, function(stk) {
                        if (isNaN(stk.total_cost)) {
                            stk.total_cost = 0;
                        }
                        parent.total_cost = parent.total_cost + stk.total_cost;
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
            if ($scope.filter.searchText) { //TODO:
                switch ($scope.filter.state) {
                    case 'resource':
                        $scope.resourceField.name = $scope.filter.searchText;
                        break;
                    case 'staff':
                        $scope.staffField.name = $scope.filter.searchText;
                        break;
                    default:
                        $scope.payitemField.name = $scope.filter.searchText;
                }
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
        $scope.filter = {
            state: 'form',
            actionBtn: false,
            edit: true,
            popup_title: 'Resource filter',
            popup_list: [],
            searchText: ''
        };
        $scope.onSelect = function(item) {
            console.log("On select - FORM CTRL");
            console.log('item', item);
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
            console.log($scope.filter.state, $scope.filter.substate)
            if ($scope.filter.state === 'payitem' || $scope.filter.state === 'scheduling') {
                if ($scope.filter.substate && !$scope.filter.substateStk) {
                    if ($scope.filter.substate.resources && $scope.filter.substate.subtasks && $scope.filter.substate.resources.length === 0 && $scope.filter.substate.subtasks.length === 0) {
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

        PayitemService.list_payitems($stateParams.projectId).then(function(result) {
            $scope.popup_list = result;
        })

        //Add new resource in resourceField; initialized with unit info
        $scope.addResource = function() {
            CommonServices.addResource($scope.resourceField.resources);
            $scope.filter.substate = $scope.resourceField.resources[$scope.resourceField.resources.length - 1];
        };
        //Add new resource in staffField; initialized with start, break and finish times
        $scope.addStaff = function() {
            if ($scope.staffField) {
                CommonServices.addStaff($scope.staffField.resources, $scope.filter.start, $scope.filter.break, $scope.filter.finish);
                $scope.filter.substate = $scope.staffField.resources[$scope.staffField.resources.length - 1];
            }
        }
        //Add new resource in payitemField TODO: check if all fields completed
        $scope.addPayitem = function() {
            CommonServices.addPayitem($scope.payitemField.pay_items);
            $scope.filter.substate = $scope.payitemField.pay_items[$scope.payitemField.pay_items.length - 1]
        }
        //Add new subtask TODO: check if all fields completed
        $scope.addSubtask = function() {
            if ($scope.filter.substate && $scope.filter.substate.resources.length === 0) {
                CommonServices.addSubtask($scope.filter.substate.subtasks);
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
        //Add new resource in payitemField (as subtask) TODO: check if all fields completed
        $scope.addResourcePi = function() {
            if ($scope.filter.substate && $scope.filter.substate.subtasks.length === 0) {
                CommonServices.addResourcePi($scope.filter.substate.resources);
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
        //Add new resource in payitemField subtask TODO: check if all fields completed
        $scope.addResourceInSubtask = function() {
            if ($scope.filter.substateStk) {
                CommonServices.addResourceInSubtask($scope.filter.substateStk);
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
            //            $scope.trim();
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
            //            $scope.trim();
            $scope.linkAux = 'photodetails';
            $scope.titleShow = 'Photo Gallery';
            $scope.filter.substate = 'pic';
            console.log(item)
            $scope.filter.picture = item;
            console.log($scope.imgURI)
            //            console.log($scope.imgURI[item], $scope.filter.picture)
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
                    var alertPopup = $ionicPopup.alert({
                        title: 'Form gallery',
                        template: 'Photo added. Check form gallery for more options.'
                    });
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
                    var alertPopup = $ionicPopup.alert({
                        title: 'Form gallery',
                        template: 'Photo added. Check form gallery for more options.'
                    });

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
            var confirmPopup = $ionicPopup.confirm({
                title: 'New form',
                template: 'Are you sure you want to submit the data?'
            });
            confirmPopup.then(function(res) {
                if (res) {
                    if ($scope.picModal) {
                        $scope.picModal.remove();
                        if ($scope.picModal) {
                            delete $scope.picModal;
                        }
                    }
                    $timeout(function() {
                        var resourceOK = false,
                            staffOK = false,
                            schedulingOK = false,
                            payOK = false;
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
                                    // var date = new Date(item.current_day_obj);
                                    // item.current_day = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
                                    item.current_day = item.current_day_obj;
                                }
                            });
                            ResourceService.add_field($scope.resourceField).success(function(x) {
                                $scope.formData.resource_field_id = x.id;
                                resourceOK = true;
                                if (resourceOK && staffOK && schedulingOK && payOK) {
                                    $scope.fastSave($scope.formData, $scope.imgURI);
                                }
                            }).error(function(err) {
                                resourceOK = true;
                                if (resourceOK && staffOK && schedulingOK && payOK) {
                                    $scope.fastSave($scope.formData, $scope.imgURI);
                                }
                            });
                        } else {
                            resourceOK = true;
                        }
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
                                        // var date = new Date(res.current_day_obj);
                                        // res.current_day = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
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
                                            // var date = new Date(res.current_day_obj);
                                            // res.current_day = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
                                            res.current_day = res.current_day_obj;
                                        }
                                        if (res.expiry_date_obj) {
                                            var date = new Date(res.expiry_date_obj);
                                            res.expiry_date = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
                                        }
                                    });
                                });
                            });
                            PayitemService.add_field($scope.payitemField).success(function(x) {
                                $scope.formData.pay_item_field_id = x.id;
                                // $scope.fastSave($scope.formData, $scope.imgURI);
                                payOK = true;
                                if (resourceOK && staffOK && schedulingOK && payOK) {
                                    $scope.fastSave($scope.formData, $scope.imgURI);
                                }
                            }).error(function(err) {
                                payOK = true;
                                if (resourceOK && staffOK && schedulingOK && payOK) {
                                    $scope.fastSave($scope.formData, $scope.imgURI);
                                }
                            });
                        } else {
                            payOK = true;
                        }
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
                                        // var date = new Date(res.current_day_obj);
                                        // res.current_day = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
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
                                            // item.current_day = item.current_day_obj.getDate() + '-' + (item.current_day_obj.getMonth() + 1) + '-' + item.current_day_obj.getFullYear();
                                            res.current_day = res.current_day_obj.getTime();
                                        }
                                        if (res.expiry_date_obj) {
                                            var date = new Date(res.expiry_date_obj);
                                            res.expiry_date = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
                                        }
                                    });
                                });
                            });
                            SchedulingService.add_field($scope.payitemField).success(function(x) {
                                $scope.formData.scheduling_field_id = x.id;
                                // $scope.fastSave($scope.formData, $scope.imgURI);
                                schedulingOK = true;
                                if (resourceOK && staffOK && schedulingOK && payOK) {
                                    $scope.fastSave($scope.formData, $scope.imgURI);
                                }
                            }).error(function(err) {
                                schedulingOK = true;
                                if (resourceOK && staffOK && schedulingOK && payOK) {
                                    $scope.fastSave($scope.formData, $scope.imgURI);
                                }
                            });
                        } else {
                            schedulingOK = true;
                        }
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
                                    // item.current_day = item.current_day_obj.getDate() + '-' + (item.current_day_obj.getMonth() + 1) + '-' + item.current_day_obj.getFullYear();
                                    item.current_day = item.current_day_obj.getTime();
                                }
                                if (item.expiry_date_obj) {
                                    // item.expiry_date = item.expiry_date_obj.getDate() + '-' + (item.expiry_date_obj.getMonth() + 1) + '-' + item.expiry_date_obj.getFullYear();
                                    item.expiry_date = item.expiry_date_obj.getFullYear() + '-' + (item.expiry_date_obj.getMonth() + 1) + '-' + item.expiry_date_obj.getDate();
                                }
                                if (item.start_time_obj) {
                                    item.start_time = item.start_time_obj.getHours() + ':' + item.start_time_obj.getMinutes();
                                }
                                if (item.break_time_obj) {
                                    item.break_time = item.break_time_obj.getHours() + ':' + item.break_time_obj.getMinutes();
                                }
                                if (item.finish_time_obj) {
                                    item.finish_time = item.finish_time_obj.getHours() + ':' + item.finish_time_obj.getMinutes();
                                }
                            });
                            StaffService.add_field($scope.staffField).success(function(x) {
                                $scope.formData.staff_field_id = x.id;
                                // $scope.fastSave($scope.formData, $scope.imgURI);
                                staffOK = true;
                                if (resourceOK && staffOK && schedulingOK && payOK) {
                                    $scope.fastSave($scope.formData, $scope.imgURI);
                                }
                            }).error(function(err) {
                                staffOK = true;
                                if (resourceOK && staffOK && schedulingOK && payOK) {
                                    $scope.fastSave($scope.formData, $scope.imgURI);
                                    //TODO: keep locally for online sync and do that in SyncService
                                }
                            });
                        } else {
                            staffOK = true;
                        }
                        if (!$scope.formData.resource_field_design && !$scope.formData.scheduling_field_design && !$scope.formData.pay_item_field_design && !$scope.formData.staff_field_design) {
                            $scope.fastSave($scope.formData, $scope.imgURI);
                        }
                    });
                }
            });
        };
        $scope.fastSave = function(datax, img) {
            var formUp = $ionicPopup.alert({
                title: "Submitting",
                template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                content: "",
                buttons: []
            });
            //automatically sync previousely offline created forms TODO: move inside success
            if (localStorage.getObject('ppfsync') || localStorage.getObject('pppsync'))
                SyncService.sync_button();
            FormInstanceService.create(datax, img)
                .success(function(data) {
                    if (data && data.data && data.data.message) {
                        $timeout(function() {
                            formUp.close();
                            $timeout(function() {
                                var alertPopup3 = $ionicPopup.alert({
                                    title: 'Submision failed',
                                    template: 'You do not have permission to perform this operation'
                                });
                                alertPopup3.then(function(res) {
                                    $rootScope.$broadcast('sync.todo');
                                });
                            });
                        });
                    } else {
                        $rootScope.formId = data.id;
                        if (!data.message && data.status !== 0) {
                            FormInstanceService.get($rootScope.formId).then(function(data) {
                                $rootScope.rootForm = data;
                                formUp.close();
                                $state.go('app.formInstance', {
                                    'projectId': $rootScope.projectId,
                                    'type': 'form',
                                    'formId': data.id
                                });
                            });
                        }
                    }
                }).error(function(data) {
                    formUp.close();
                    if (data && data.status === 400) {
                        $timeout(function() {
                            $timeout(function() {
                                var alertPopup2 = $ionicPopup.alert({
                                    title: 'Submision failed',
                                    template: 'Incorrect data, try again'
                                });
                                alertPopup2.then(function(res) {});
                            });
                        });
                    } else {
                        $timeout(function() {
                            $timeout(function() {
                                var alertPopup = $ionicPopup.alert({
                                    title: 'Submision failed',
                                    template: 'You are offline. Submit forms by syncing next time you are online.'
                                }).then(function(res) {
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
    }
]);
