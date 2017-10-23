ppApp.controller('FormCtrl', [
    '$scope',
    '$timeout',
    'PostService',
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
    'CommonServices',
    '$filter',
    '$q',
    'SettingService',
    'SyncService',
    function($scope, $timeout, PostService, $rootScope, CacheFactory, $ionicScrollDelegate, $stateParams, $ionicListDelegate, $ionicModal,
        $cordovaCamera, $state, $ionicSideMenuDelegate, $ionicHistory, $ionicPopover, CommonServices, $filter, $q, SettingService, SyncService) {

        $scope.$on('$ionicView.enter', function() {
            $ionicHistory.clearHistory();
            $ionicSideMenuDelegate.canDragContent(false);
        });
        $ionicSideMenuDelegate.canDragContent(false);
        $scope.repeatable = false;
        $scope.linkAux = 'forms';
        $scope.imgURI = [];

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
                    'resources': []
                };

                CommonServices.addResource($scope.resourceField.resources, 0);
                // $scope.filter.substate = $scope.resourceField.resources[0];
            }
            if ($scope.formData.pay_item_field_design) {
                $scope.payitemField = {
                    "id": 0,
                    'register_nominated': $scope.formData.pay_item_field_design.register_nominated,
                    'display_subtask': $scope.formData.pay_item_field_design.display_subtask,
                    'display_resources': $scope.formData.pay_item_field_design.display_resources,
                    "pay_items": []
                };
                CommonServices.addPayitem($scope.payitemField.pay_items);
                //     "open": true,
                //     "child": true,

                $scope.filter.substate = $scope.payitemField.pay_items[0];
            }
            if ($scope.formData.scheduling_field_design) {
                $scope.payitemField = {
                    "id": 0,
                    'display_subtask': $scope.formData.scheduling_field_design.true,
                    "pay_items": []
                };
                CommonServices.addPayitem($scope.payitemField.pay_items);
                //     "open": true,
                //     "child": true,
            }
            if ($scope.formData.staff_field_design) {
                $scope.staffField = {
                    'id': 0,
                    'withTimes': $scope.formData.staff_field_design.withTimes,
                    'resources': []
                };
                CommonServices.addStaff($scope.staffField.resources, $scope.filter.start, $scope.filter.break, $scope.filter.finish, $scope.filter.vat);
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
                    CommonServices.doTotal('resource', $scope.resourceField);
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
                        CommonServices.doTotal('pi', $scope.payitemField);
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
                    CommonServices.doTotal('pisubtask', $scope.filter.substate);
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
                    CommonServices.doTotal('pisubtask', $scope.filter.substateStk);
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
                    CommonServices.doTotal('piresource', $scope.filter.substate);
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
                        CommonServices.doTotal('pi', $scope.payitemField);
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
                    CommonServices.doTotal('pisubtask', $scope.filter.substate);
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
                    CommonServices.doTotal('pisubresource', $scope.filter.substateStk);
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
                    CommonServices.doTotal('piresource', $scope.filter.substate);
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
                    CommonServices.doTotal('pisubtask', $scope.filter.substate);
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
                    CommonServices.doTotal('pisubtask', $scope.filter.substate);
                    break;
            }
            $scope.goToTop();
        }

        $ionicPopover.fromTemplateUrl('view/search.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

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
                    $timeout(function() {
                        var formUp = SettingService.show_loading_popup('Submitting');
                        CommonServices.saveSpecialFields($scope.formData, {
                            resourceField: $scope.resourceField,
                            staffField: $scope.staffField,
                            payitemField: $scope.payitemField
                        }, 'POST').then(function(result) {
                            var data = CommonServices.designToInstance(result, true);
                            //automatically sync previousely offline created forms
                            if (localStorage.getObject('ppfsync') || localStorage.getObject('pppsync')) {
                                SyncService.sync().then(function(res) {
                                    CommonServices.saveFormToServer({
                                        method: 'POST',
                                        url: 'forminstance',
                                        data: data,
                                        withCredentials: true
                                    }, $scope.imgURI, formUp, true);
                                })
                            } else {
                                CommonServices.saveFormToServer({
                                    method: 'POST',
                                    url: 'forminstance',
                                    data: data,
                                    withCredentials: true
                                }, $scope.imgURI, formUp, true);
                            }
                        });
                    });
                }
            });
        };

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
