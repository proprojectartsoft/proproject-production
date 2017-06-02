angular.module($APP.name).controller('EditCtrl', [
    '$scope',
    'FormInstanceService',
    '$timeout',
    'FormUpdateService',
    '$location',
    '$rootScope',
    '$ionicSideMenuDelegate',
    '$ionicScrollDelegate',
    '$ionicPopup',
    '$ionicModal',
    '$cordovaCamera',
    'ConvertersService',
    'ImageService',
    '$ionicHistory',
    'ResourceService',
    'StaffService',
    'SchedulingService',
    'PayitemService',
    '$ionicPopover',
    '$stateParams',
    '$state',
    '$filter',
    function($scope, FormInstanceService, $timeout, FormUpdateService, $location, $rootScope, $ionicSideMenuDelegate, $ionicScrollDelegate, $ionicPopup, $ionicModal, $cordovaCamera, ConvertersService, ImageService, $ionicHistory, ResourceService, StaffService, SchedulingService, PayitemService, $ionicPopover, $stateParams, $state, $filter) {
        $scope.filter = {
            edit: true,
            state: 'form',
            popup_title: 'Resource filter',
            popup_list: [],
            searchText: ''
        }
        $scope.linkAux = 'forms';
        $scope.updateCalculation = function(data) {
            console.log(data)
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
        }
        $scope.updateTitle = function(title, placeholder) {
            if (title) {
                if (placeholder === 'Resource') {
                    $scope.titleShow = 'Resource: ' + title;
                }
                if (placeholder === 'Staff') {
                    $scope.titleShow = 'Staff: ' + title;
                }
                if (placeholder === 'Scheduling') {
                    $scope.titleShow = 'Scheduling: ' + title;
                }
                if (placeholder === 'Scheduling Subtask') {
                    $scope.titleShow = 'Scheduling Subtask: ' + title;
                }
                if (placeholder === 'Scheduling Subtask') {
                    $scope.titleShow = 'Scheduling Subtask: ' + title;
                }
                if (placeholder === 'Scheduling Subtask Resource') {
                    $scope.titleShow = 'Scheduling Subtask Resource: ' + title;
                }
                if (placeholder === 'Scheduling Resource') {
                    $scope.titleShow = 'Scheduling Resource: ' + title;
                }
                if (placeholder === 'Pay-item') {
                    $scope.titleShow = 'Pay-item: ' + title;
                }
                if (placeholder === 'Pay-item Subtask') {
                    $scope.titleShow = 'Pay-item Subtask: ' + title;
                }
                if (placeholder === 'Pay-item Subtask') {
                    $scope.titleShow = 'Pay-item Subtask: ' + title;
                }
                if (placeholder === 'Pay-item Subtask Resource') {
                    $scope.titleShow = 'Pay-item Subtask Resource: ' + title;
                }
                if (placeholder === 'Pay-item Resource') {
                    $scope.titleShow = 'Pay-item Resource: ' + title;
                }
            } else {
                $scope.titleShow = placeholder;
            }
        }
        $scope.backHelper = function() {
            console.log($scope.linkAux)
            switch ($scope.linkAux) {
                case 'forms':
                    $state.go('app.completed', {
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
                    $ionicScrollDelegate.resize();
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
        $scope.goStateDown = function(state, substate, data) {
            console.log(state, substate)
            if (state === 'scheduling') {
                switch (substate) {
                    case 'subtask':
                        $scope.filter.state = state;
                        $scope.linkAux = 'schedulingStk';
                        if (data.description) {
                            $scope.titleShow = 'Scheduling Subtask: ' + data.description;
                        } else {
                            $scope.titleShow = 'Scheduling Subtask';
                        }
                        $scope.filter.substateStk = data;
                        $ionicScrollDelegate.resize();
                        break;
                    case 'subres':
                        $scope.filter.actionBtnShow = false;
                        $scope.filter.state = state;
                        $scope.linkAux = 'schedulingSubRes';
                        if (data.name) {
                            $scope.titleShow = 'Scheduling Subtask Resource: ' + data.name;
                        } else {
                            $scope.titleShow = 'Scheduling Subtask Resource';
                        }
                        $scope.filter.substateStkRes = data;
                        $ionicScrollDelegate.resize();
                        break;
                    case 'res':
                        $scope.filter.actionBtnShow = false;
                        $scope.filter.state = state;
                        $scope.linkAux = 'schedulingRes';
                        if (data.name) {
                            console.log(data.name)
                            $scope.titleShow = 'Scheduling Resource: ' + data.name;
                        } else {
                            console.log('wut?')
                            $scope.titleShow = 'Scheduling Resource';
                        }
                        $scope.filter.substateRes = data;
                        $ionicScrollDelegate.resize();
                        break;
                }
            }
            if (state === 'payitem') {
                switch (substate) {
                    case 'subtask':
                        $scope.filter.state = state;
                        $scope.linkAux = 'payitemStk';
                        if (data.description) {
                            $scope.titleShow = 'Pay-item Subtask: ' + data.description;
                        } else {
                            $scope.titleShow = 'Pay-item Subtask';
                        }
                        $scope.filter.substateStk = data;
                        $ionicScrollDelegate.resize();
                        break;
                    case 'subres':
                        $scope.filter.actionBtnShow = false;
                        $scope.filter.state = state;
                        $scope.linkAux = 'payitemSubRes';
                        if (data.name) {
                            $scope.titleShow = 'Pay-item Subtask Resource: ' + data.name;
                        } else {
                            $scope.titleShow = 'Pay-item Subtask Resource';
                        }
                        $scope.filter.substateStkRes = data;
                        $ionicScrollDelegate.resize();
                        break;
                    case 'res':
                        $scope.filter.actionBtnShow = false;
                        $scope.filter.state = state;
                        $scope.linkAux = 'payitemRes';
                        if (data.name) {
                            console.log(data.name)
                            $scope.titleShow = 'Pay-item Resource: ' + data.name;
                        } else {
                            $scope.titleShow = 'Pay-item Resource';
                        }
                        $scope.filter.substateRes = data;
                        $ionicScrollDelegate.resize();
                        break;
                }
            }
        }
        $scope.goState = function(state, substate) {
            switch (state) {
                case 'resource':
                    $scope.filter.state = state;
                    if (substate || $scope.filter.substate) {
                        if (substate) {
                            $scope.filter.substate = substate;
                        }
                        $scope.linkAux = 'resource';
                        if ($scope.filter.substate.name) {
                            $scope.titleShow = 'Resource: ' + $scope.filter.substate.name;
                        } else {
                            $scope.titleShow = 'Resource';
                        }
                    } else {
                        $scope.linkAux = 'resources';
                        $scope.titleShow = 'Resources';
                    }
                    $ionicScrollDelegate.resize();
                    break;
                case 'staff':
                    $scope.filter.state = state;
                    if (substate || $scope.filter.substate) {
                        if (substate) {
                            $scope.filter.substate = substate;
                        }
                        $scope.linkAux = 'staff';
                        if ($scope.filter.substate.name) {
                            $scope.titleShow = 'Staff: ' + $scope.filter.substate.name;
                        } else {
                            $scope.titleShow = 'Staff';
                        }
                    } else {
                        $scope.linkAux = 'staffs';
                        $scope.titleShow = 'Staffs';
                    }
                    $ionicScrollDelegate.resize();
                    break;
                case 'scheduling':
                    $scope.filter.state = state;
                    if (substate || $scope.filter.substate) {
                        if (substate) {
                            $scope.filter.substate = substate;
                        }
                        if ($scope.filter.substate.description) {
                            $scope.titleShow = 'Scheduling: ' + $scope.filter.substate.description;
                        } else {
                            $scope.titleShow = 'Scheduling';
                        }
                        $scope.linkAux = 'scheduling';
                    } else {
                        $scope.linkAux = 'schedulings';
                        $scope.titleShow = 'Schedulings';
                    }
                    $ionicScrollDelegate.resize();
                    break;
                case 'payitem':
                    $scope.filter.state = state;
                    if (substate || $scope.filter.substate) {
                        if (substate) {
                            $scope.filter.substate = substate;
                        }
                        if ($scope.filter.substate.description) {
                            $scope.titleShow = 'Pay-item: ' + $scope.filter.substate.description;
                        } else {
                            $scope.titleShow = 'Pay-item';
                        }
                        $scope.linkAux = 'payitem';
                    } else {
                        $scope.linkAux = 'payitem';
                        $scope.titleShow = 'Pay-items';
                    }
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

        $scope.filter.vat = $rootScope.custSett.vat;
        $scope.filter.currency = $rootScope.custSett.currency;
        $scope.filter.margin = $rootScope.custSett.margin;
        $scope.filter.start = $rootScope.custSett.start;
        $scope.filter.break = $rootScope.custSett.break;
        $scope.filter.finish = $rootScope.custSett.finish;
        $scope.doTotal = function(type, parent) {
            if (parent) {
                parent.total_cost = 0;
                if (type === 'resource') {
                    angular.forEach(parent.resources, function(res) {
                        parent.total_cost = parent.total_cost + res.quantity * res.direct_cost;
                    });
                }
                if (type === 'piresource') {
                    console.log('piresource', parent)
                    angular.forEach(parent.resources, function(res) {
                        parent.total_cost = parent.total_cost + res.quantity * res.direct_cost;
                        console.log(parent.total_cost, res.quantity, res.direct_cost)

                    });
                }
                if (type === 'pisubresource') {
                    angular.forEach(parent.resources, function(res) {
                        parent.total_cost = parent.total_cost + res.quantity * res.direct_cost;
                    });
                }
                if (type === 'pisubtask') {
                    console.log(parent)
                    angular.forEach(parent.subtasks, function(stk) {
                        parent.total_cost = parent.total_cost + stk.total_cost;
                    });
                }
                if (type === 'pi') {
                    angular.forEach(parent.pay_items, function(pi) {
                        parent.total_cost = parent.total_cost + pi.total_cost;
                    });
                }
            }
        }
        $scope.actionBtnPayitem = function() {
            if ($scope.filter.state === 'payitem' || $scope.filter.state === 'scheduling') {
                if ($scope.filter.substate && !$scope.filter.substateStk) {
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
        $scope.openPopover = function($event, predicate, test) {
            $scope.filter.popup_predicate = predicate;
            if (test !== 'pi') {
                $scope.filter.pi = false;
                if (predicate.staff) {
                    $scope.filter.popup_list = $rootScope.staff_list;
                } else {
                    $scope.filter.popup_list = $rootScope.resource_list;
                }
            } else {
                $scope.filter.pi = true;
                PayitemService.list_payitems($scope.formData.projectId).then(function(data) {
                    $rootScope.payitem_list = data;
                    $scope.filter.popup_list = $rootScope.payitem_list;
                });
            }
            $scope.popover.show($event);
        };
        $scope.selectPopover = function(item) {
            if (!$scope.filter.pi) {
                $scope.filter.popup_predicate.name = item.name;
                console.log($scope.filter.popup_predicate)
                if (!$scope.filter.popup_predicate.staff) {
                    //resource
                    if ($scope.titleShow.indexOf('Scheduling Resource') > -1) {
                        $scope.titleShow = 'Scheduling Resource: ' + item.name;
                    } else {
                        if ($scope.titleShow.indexOf('Scheduling Subtask Resource') > -1) {
                            $scope.titleShow = 'Scheduling Subtask Resource: ' + item.name;
                        } else {
                            if ($scope.titleShow.indexOf('Resource') > -1) {
                                $scope.titleShow = 'Resource: ' + item.name;
                            }
                        }
                    }
                    if ($scope.titleShow.indexOf('Staff') > -1) {
                        $scope.titleShow = 'Staff: ' + item.name;
                    }
                    $scope.filter.popup_predicate.name = item.name;
                    $scope.filter.popup_predicate.product_ref = item.product_ref;
                    $scope.filter.popup_predicate.direct_cost = item.direct_cost;
                    //TODO: use filter!!

                    var restyp = $filter('filter')($rootScope.resource_type_list, {
                        name: item.resource_type_name
                    });
                    $scope.filter.popup_predicate.res_type_obj = restyp[0];
                    $scope.filter.popup_predicate.resource_type_id = restyp[0].id;
                    $scope.filter.popup_predicate.resource_type_name = restyp[0].name;

                    // angular.forEach($rootScope.resource_type_list, function(restyp) {
                    //     console.log(restyp.id, item.resource_type_id)
                    //     if (restyp.name === item.resource_type_name) {
                    //         $scope.filter.popup_predicate.res_type_obj = restyp;
                    //         $scope.filter.popup_predicate.resource_type_id = restyp.id;
                    //         $scope.filter.popup_predicate.resource_type_name = restyp.name;
                    //     }
                    // });
                    angular.forEach($rootScope.unit_list, function(unt) {
                        if (unt.name === item.unit_name) {
                            $scope.filter.popup_predicate.unit_obj = unt;
                            $scope.filter.popup_predicate.unit_id = unt.id;
                            $scope.filter.popup_predicate.unit_name = unt.name;
                        }
                    });
                } else {
                    //staff
                    $scope.titleShow = 'Staff: ' + item.name;
                    $scope.filter.popup_predicate.name = item.name;
                    $scope.filter.popup_predicate.employer_name = item.employee_name;
                    $scope.filter.popup_predicate.staff_role = item.role;
                    $scope.filter.popup_predicate.direct_cost = item.direct_cost;
                    angular.forEach($rootScope.resource_type_list, function(restyp) {
                        console.log(restyp.id, item.resource_type_id)
                        if (restyp.name === item.resource_type_name) {
                            $scope.filter.popup_predicate.res_type_obj = restyp;
                            $scope.filter.popup_predicate.resource_type_id = restyp.id;
                            $scope.filter.popup_predicate.resource_type_name = restyp.name;
                        }
                    });
                }
            } else {
                $scope.filter.popup_predicate.description = item.description;
                $scope.filter.popup_predicate.reference = item.reference;
                angular.forEach($rootScope.unit_list, function(unt) {
                    if (unt.name === item.unit_name) {
                        $scope.filter.popup_predicate.unit_obj = unt;
                        $scope.filter.popup_predicate.unit_id = unt.id;
                        $scope.filter.popup_predicate.unit_name = unt.name;
                    }
                });
            }
            $scope.popover.hide();
        }
        $scope.closePopover = function() {
            $scope.popover.hide();
        }
        $scope.addResource = function() {
            $scope.resourceField.resources.push({
                "id": 0,
                "resource_field_id": 0,
                "resource_id": 0,
                "position": 0,
                "name": '',
                "product_ref": '',
                "unit_id": 0,
                "unit_name": '',
                "resource_type_id": 0,
                "resource_type_name": '',
                "direct_cost": 0,
                "resource_margin": 0,
                "stage_id": 1,
                "stage_name": '',
                "vat": 0,
                "quantity": 0,
                "current_day": '',
                "total_cost": 0,
                "calculation": false,
                "open": true
            });
            $scope.filter.substate = $scope.resourceField.resources[$scope.resourceField.resources.length - 1];
        };
        $scope.addStaff = function() {
            if ($scope.staffField) {
                $scope.staffField.resources.push({
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
                    start_time: $scope.filter.start,
                    break_time: $scope.filter.break,
                    finish_time: $scope.filter.finish,
                    total_time: "",
                    comment: "",
                    vat: 0.0
                })
                $scope.filter.substate = $scope.staffField.resources[$scope.staffField.resources.length - 1];
            }
        }
        $scope.addPayitem = function() {
            $scope.payitemField.pay_items.push({
                "description": "",
                "reference": "",
                "unit": "",
                "quantity": "",
                "subtasks": [],
                "resources": []
            })
            $scope.filter.substate = $scope.payitemField.pay_items[$scope.payitemField.pay_items.length - 1]
        }
        $scope.addSubtask = function() {
            if ($scope.filter.substate && $scope.filter.substate.resources.length === 0) {
                $scope.filter.substate.subtasks.push({
                    "description": "",
                    "resources": [{
                        "open": false,
                        "resource_id": 0,
                        "position": 0,
                        "name": "",
                        "product_ref": "",
                        "unit_id": 0,
                        "unit_name": "",
                        "resource_type_id": 0,
                        "resource_type_name": "",
                        "direct_cost": 0,
                        "quantity": 0,
                        "resource_margin": 0,
                        "current_day": "",
                        "stage_id": 0,
                        "stage_name": "",
                        "calculation": true,
                        "vat": 0
                    }]
                });
                $scope.filter.substateStk = $scope.filter.substate.subtasks[$scope.filter.substate.subtasks.length - 1];
                if ($scope.filter.state === 'scheduling') {
                    $scope.linkAux = 'schedulingStk';
                    $scope.titleShow = 'Scheduling Subtask';
                } else {
                    $scope.linkAux = 'payitemStk';
                    $scope.titleShow = 'Pay-item Subtask';
                }
            }
        }
        $scope.addResourcePi = function() {
            if ($scope.filter.substate && $scope.filter.substate.subtasks.length === 0) {
                $scope.filter.substate.resources.push({
                    "open": false,
                    "resource_id": 0,
                    "position": 0,
                    "name": "",
                    "product_ref": "",
                    "unit_id": 0,
                    "unit_name": "",
                    "resource_type_id": 0,
                    "resource_type_name": "",
                    "direct_cost": 0,
                    "quantity": 0,
                    "resource_margin": 0,
                    "current_day": "",
                    "stage_id": 0,
                    "stage_name": "",
                    "calculation": true,
                    "vat": 0
                });
                $scope.filter.substateRes = $scope.filter.substate.resources[$scope.filter.substate.resources.length - 1];
                if ($scope.filter.state === 'scheduling') {
                    $scope.linkAux = 'schedulingRes';
                    $scope.titleShow = 'Scheduling Resource';
                } else {
                    $scope.linkAux = 'payitemRes';
                    $scope.titleShow = 'Pay-item Resource';
                }
            }
        }
        $scope.addResourceInSubtask = function() {
            if ($scope.filter.substateStk) {
                $scope.filter.substateStk.resources.push({
                    "open": false,
                    "resource_id": 0,
                    "position": 0,
                    "name": "",
                    "product_ref": "",
                    "unit_id": 0,
                    "unit_name": "",
                    "resource_type_id": 0,
                    "resource_type_name": "",
                    "direct_cost": 0,
                    "quantity": 0,
                    "resource_margin": 0,
                    "current_day": "",
                    "stage_id": 0,
                    "stage_name": "",
                    "vat": 0,
                    "calculation": true,
                });
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


        //        ==========================================================================================
        $scope.$on('$ionicView.enter', function() {
            $ionicHistory.clearHistory();
            $ionicSideMenuDelegate.canDragContent(false);
        });
        $scope.formData = angular.copy($rootScope.rootForm);
        $scope.titleShow = $scope.formData.name;
        $scope.goPicture = function() {
            //            $scope.trim();
            $scope.filter.state = 'photos';
            $scope.filter.substate = 'gallery'
            $timeout(function() { // we need little delay
                $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
            });
            pullDown();
        }

        $scope.testPicture = function(item) {
            $scope.filter.substate = 'pic';
            $scope.filter.picture = item;
        }
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
        $scope.imgURI = [];
        $scope.imgToAdd = [];
        $scope.takePicture = function(id) {
            var options = {
                quality: 60,
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
                    $scope.imgToAdd.push($scope.imgURI[$scope.imgURI.length - 1]);
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
                quality: 50,
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
                    $scope.imgToAdd.push($scope.imgURI[$scope.imgURI.length - 1]);
                    $scope.filter.state = 'form';
                    $scope.filter.substate = null;
                });
            }, function(err) {
                // error
            });
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
        FormInstanceService.get($rootScope.formId).then(function(data) {
            $rootScope.formData = data;
            $scope.formData = data;
            FormInstanceService.get_gallery($rootScope.formId, data.project_id).then(function(res) {
                angular.forEach(res, function(image) {
                    image.url = $APP.server + '/pub/images/' + image.base64String;
                })
                $scope.imgURI = res;
            })
        });

        $scope.submit = function(help) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Edit form',
                template: 'Are you sure you want to edit this form?'
            });
            confirmPopup.then(function(res) {
                if (res) {
                    $timeout(function() {
                        var formUp = $ionicPopup.alert({
                            title: "Submitting",
                            template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                            content: "",
                            buttons: []
                        });
                        if ($scope.formData.resource_field_id) {
                            angular.forEach($rootScope.resourceField.resources, function(item) {
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
                                    item.current_day = item.current_day_obj.getDate(); //TODO:
                                }
                            });
                            ResourceService.update_field($rootScope.resourceField).then(function(x) {});
                        }
                        if ($scope.formData.pay_item_field_id) {
                            angular.forEach($rootScope.payitemField.pay_items, function(item) {
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
                                            //                                                    var date = new Date(res.current_day_obj);
                                            //                                                    res.current_day = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
                                            res.current_day = res.current_day_obj;
                                        }
                                        if (res.expiry_date_obj) {
                                            var date = new Date(res.expiry_date_obj);
                                            res.expiry_date = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
                                        }
                                    });
                                });
                            });
                            PayitemService.update_field($rootScope.payitemField).then(function(x) {});
                        }
                        if ($scope.formData.scheduling_field_id) {
                            angular.forEach($rootScope.payitemField.pay_items, function(item) {
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
                                        //                                                var date = new Date(res.current_day_obj);
                                        //                                                res.current_day = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
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
                                            //                                    item.current_day = item.current_day_obj.getDate() + '-' + (item.current_day_obj.getMonth() + 1) + '-' + item.current_day_obj.getFullYear();
                                            res.current_day = res.current_day_obj.getTime();
                                        }
                                        if (res.expiry_date_obj) {
                                            var date = new Date(res.expiry_date_obj);
                                            res.expiry_date = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
                                        }
                                    });
                                });
                            });
                            SchedulingService.update_field($rootScope.payitemField).then(function(x) {});
                        }
                        if ($scope.formData.staff_field_id) {
                            angular.forEach($rootScope.staffField.resources, function(item) {
                                if (item.res_type_obj) {
                                    item.resource_type_id = item.res_type_obj.id;
                                    item.resource_type_name = item.res_type_obj.name;
                                }
                                if (item.absenteeism_obj) {
                                    item.abseteeism_reason_name = item.absenteeism_obj.reason;
                                    item.absenteeism_obj.reason;
                                }
                                if (item.current_day_obj) {
                                    //                                    item.current_day = item.current_day_obj.getDate() + '-' + (item.current_day_obj.getMonth() + 1) + '-' + item.current_day_obj.getFullYear();
                                    item.current_day = item.current_day_obj.getTime();
                                }
                                if (item.expiry_date_obj) {
                                    //                                    item.expiry_date = item.expiry_date_obj.getDate() + '-' + (item.expiry_date_obj.getMonth() + 1) + '-' + item.expiry_date_obj.getFullYear();
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
                            StaffService.update_field($rootScope.staffField).then(function(x) {});
                        }
                        FormInstanceService.update($rootScope.formId, $scope.formData).then(function(data) {
                            if (data && data.status !== 0 && data.status !== 502 && data.status !== 403 && data.status !== 400) {
                                $rootScope.formId = data;
                                var list = ConvertersService.photoList($scope.imgToAdd, $scope.formData.id, $scope.formData.project_id);
                                $scope.imgToAdd = [];
                                if (list.length !== 0) {
                                    ImageService.create(list).then(function(x) {
                                        $timeout(function() {
                                            formUp.close();
                                            $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                        });
                                    });
                                } else {
                                    $timeout(function() {
                                        formUp.close();
                                        $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                    });
                                }
                            } else {
                                $timeout(function() {
                                    formUp.close();
                                    $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                });
                            }
                        });
                    });
                }
            });
        };
        $scope.saveAsNew = function() {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Edit form',
                template: 'Are you sure you want to save this form?'
            });
            confirmPopup.then(function(res) {
                if (res) {
                    $timeout(function() {
                        var formUp = $ionicPopup.alert({
                            title: "Submitting",
                            template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                            content: "",
                            buttons: []
                        });
                        if ($scope.formData.resource_field_id) {
                            angular.forEach($rootScope.resourceField.resources, function(item) {
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
                                    item.current_day = $filter('date')(item.current_day_obj, "dd-MM-yyyy"); //TODO: REMOVE FILTER BUT FIND OUT WHY DATE HAS FORMAT JAN 1, YEAR!!!!
                                }
                            });
                            ResourceService.add_field($rootScope.resourceField).then(function(x) {
                                $scope.formData.resource_field_id = x.id;
                                FormInstanceService.save_as($scope.formData).then(function(data) {
                                    if (data && data.status !== 0 && data.status !== 502 && data.status !== 403 && data.status !== 400) {
                                        $rootScope.formId = data.id;
                                        FormInstanceService.get($rootScope.formId).then(function(data) {
                                            var list = ConvertersService.photoList($scope.imgURI, $scope.formData.id, $scope.formData.project_id);
                                            if (list.length !== 0) {
                                                ImageService.create(list).then(function(x) {
                                                    $timeout(function() {
                                                        formUp.close();
                                                        $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                                    });
                                                });
                                            } else {
                                                $timeout(function() {
                                                    formUp.close();
                                                    $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                                });
                                            }
                                        });
                                    } else {
                                        $timeout(function() {
                                            formUp.close();
                                            $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                        });
                                    }
                                });
                            });
                        }
                        if ($scope.formData.pay_item_field_id) {
                            angular.forEach($rootScope.payitemField.pay_items, function(item) {
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
                                        //                                                var date = new Date(res.current_day_obj);
                                        //                                                res.current_day = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
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
                                            //                                                    var date = new Date(res.current_day_obj);
                                            //                                                    res.current_day = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
                                            res.current_day = res.current_day_obj;
                                        }
                                        if (res.expiry_date_obj) {
                                            var date = new Date(res.expiry_date_obj);
                                            res.expiry_date = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
                                        }
                                    });
                                });
                            });
                            PayitemService.add_field($rootScope.payitemField).then(function(x) {
                                $scope.formData.pay_item_field_id = x.id;
                                FormInstanceService.save_as($scope.formData).then(function(data) {
                                    if (data && data.status !== 0 && data.status !== 502 && data.status !== 403 && data.status !== 400) {
                                        $rootScope.formId = data.id;
                                        FormInstanceService.get($rootScope.formId).then(function(data) {
                                            var list = ConvertersService.photoList($scope.imgURI, $scope.formData.id, $scope.formData.project_id);
                                            if (list.length !== 0) {
                                                ImageService.create(list).then(function(x) {
                                                    $timeout(function() {
                                                        formUp.close();
                                                        $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                                    });
                                                });
                                            } else {
                                                $timeout(function() {
                                                    formUp.close();
                                                    $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                                });
                                            }
                                        });
                                    } else {
                                        $timeout(function() {
                                            formUp.close();
                                            $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                        });
                                    }
                                });
                            });
                        }
                        if ($scope.formData.scheduling_field_id) {
                            angular.forEach($rootScope.payitemField.pay_items, function(item) {
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
                                        //                                                var date = new Date(res.current_day_obj);
                                        //                                                res.current_day = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
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
                                            //                                    item.current_day = item.current_day_obj.getDate() + '-' + (item.current_day_obj.getMonth() + 1) + '-' + item.current_day_obj.getFullYear();
                                            res.current_day = res.current_day_obj.getTime();
                                        }
                                        if (res.expiry_date_obj) {
                                            var date = new Date(res.expiry_date_obj);
                                            res.expiry_date = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
                                        }
                                    });
                                });
                            });
                            SchedulingService.add_field($rootScope.payitemField).then(function(x) {
                                $scope.formData.scheduling_field_id = x.id;
                                FormInstanceService.save_as($scope.formData).then(function(data) {
                                    if (data && data.status !== 0 && data.status !== 502 && data.status !== 403 && data.status !== 400) {
                                        $rootScope.formId = data.id;
                                        FormInstanceService.get($rootScope.formId).then(function(data) {
                                            var list = ConvertersService.photoList($scope.imgURI, $scope.formData.id, $scope.formData.project_id);
                                            if (list.length !== 0) {
                                                ImageService.create(list).then(function(x) {
                                                    $timeout(function() {
                                                        formUp.close();
                                                        $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                                    });
                                                });
                                            } else {
                                                $timeout(function() {
                                                    formUp.close();
                                                    $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                                });
                                            }
                                        });
                                    } else {
                                        $timeout(function() {
                                            formUp.close();
                                            $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                        });
                                    }
                                });
                            });
                        }
                        if ($scope.formData.staff_field_id) {
                            angular.forEach($rootScope.staffField.resources, function(item) {
                                if (item.res_type_obj) {
                                    item.resource_type_id = item.res_type_obj.id;
                                    item.resource_type_name = item.res_type_obj.name;
                                }
                                if (item.absenteeism_obj) {
                                    item.abseteeism_reason_name = item.absenteeism_obj.reason;
                                    item.absenteeism_obj.reason;
                                }
                                if (item.current_day_obj) {
                                    //                                    item.current_day = item.current_day_obj.getDate() + '-' + (item.current_day_obj.getMonth() + 1) + '-' + item.current_day_obj.getFullYear();
                                    //                                    console.log(typeof(item.current_day_obj))
                                    item.current_day = item.current_day_obj.getTime();
                                }
                                if (item.expiry_date_obj) {
                                    //                                    item.expiry_date = item.expiry_date_obj.getDate() + '-' + (item.expiry_date_obj.getMonth() + 1) + '-' + item.expiry_date_obj.getFullYear();
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
                            StaffService.add_field($rootScope.staffField).then(function(x) {
                                $scope.formData.staff_field_id = x.id;
                                FormInstanceService.save_as($scope.formData).then(function(data) {
                                    if (data && data.status !== 0 && data.status !== 502 && data.status !== 403 && data.status !== 400) {
                                        $rootScope.formId = data.id;
                                        FormInstanceService.get($rootScope.formId).then(function(data) {
                                            var list = ConvertersService.photoList($scope.imgURI, $scope.formData.id, $scope.formData.project_id);
                                            if (list.length !== 0) {
                                                ImageService.create(list).then(function(x) {
                                                    $timeout(function() {
                                                        formUp.close();
                                                        $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                                    });
                                                });
                                            } else {
                                                $timeout(function() {
                                                    formUp.close();
                                                    $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                                });
                                            }
                                        });
                                    } else {
                                        $timeout(function() {
                                            formUp.close();
                                            $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                        });
                                    }
                                });
                            });
                        }
                        if (!$scope.formData.scheduling_field_id && !$scope.formData.staff_field_id && !$scope.formData.resource_field_id && !$scope.formData.pay_item_field_id) {
                            FormInstanceService.save_as($scope.formData).then(function(data) {
                                if (data && data.status !== 0 && data.status !== 502 && data.status !== 403 && data.status !== 400) {
                                    $rootScope.formId = data.id;
                                    FormInstanceService.get($rootScope.formId).then(function(data) {
                                        var list = ConvertersService.photoList($scope.imgURI, $scope.formData.id, $scope.formData.project_id);
                                        if (list.length !== 0) {
                                            ImageService.create(list).then(function(x) {
                                                $timeout(function() {
                                                    formUp.close();
                                                    $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                                });
                                            });
                                        } else {
                                            $timeout(function() {
                                                formUp.close();
                                                $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                            });
                                        }
                                    });
                                } else {
                                    $timeout(function() {
                                        formUp.close();
                                        $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                    });
                                }
                            });
                        }
                    });
                }
            });
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
                    var stopY = elmYPosition(id) - 40;
                    $ionicScrollDelegate.scrollTo(0, stopY, true);

                }, 50);
            }
        };
        $scope.toggleGroup = function(group, id) {
            if ($scope.isGroupShown(group)) {
                $scope.shownGroup = null;
            } else {
                $scope.shownGroup = group;
            }
            $scope.goto(id);
        };
        $scope.repeatGroup = function(x) {
            var aux = {};
            console.log(x);
            angular.copy(x, aux);
            aux.repeatable = true;
            aux.id = 0;
            for (var i = 0; i < aux.field_instances.length; i++) {
                aux.field_instances[i].field_group_instance_id = 0;
                aux.field_instances[i].id = 0;
                if (aux.field_instances.option_instances) {
                    for (var j = 0; j < aux.field_instances[i].option_instances.length; j++) {
                        aux.field_instances[i].option_instances[j].id = 0;
                        aux.field_instances[i].option_instances[j].field_instance_id = 0;
                    }
                }
                for (var j = 0; j < aux.field_instances[i].field_values.length; j++) {
                    aux.field_instances[i].field_values[j].name = x.field_instances[i].field_values[j].name;
                    aux.field_instances[i].field_values[j].value = x.field_instances[i].field_values[j].value;
                    aux.field_instances[i].field_values[j].id = 0;
                    aux.field_instances[i].field_values[j].field_instance_id = 0;
                }
            }
            console.log(aux);
            for (var i = 0; i < $scope.formData.field_group_instances.length; i++) {
                if (x === $scope.formData.field_group_instances[i]) {
                    $scope.formData.field_group_instances.splice(i + 1, 0, aux);
                    break;
                }
            }
        };
        $scope.repeatField = function(x, y) {
            var test = {};
            angular.copy(y, test);
            test.repeatable = true;
            test.id = 0;
            for (var i = 0; i < x.field_instances.length; i++) {
                if (x.field_instances[i] === y) {
                    if (x.field_instances.field_values) {
                        for (var j = 0; j <= x.field_instances.field_values.length; j++) {
                            test.field_instances.field_values[j].id = 0;
                        }
                    }
                    x.field_instances.splice(i + 1, 0, test);
                    break;
                }
            }
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
        $scope.goToTop = function() {
            $timeout(function() { // we need little delay
                $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
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
