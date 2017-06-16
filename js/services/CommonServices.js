angular.module($APP.name).service('CommonServices', [
    '$stateParams', '$filter', '$ionicScrollDelegate', '$rootScope', 'PayitemService',
    function($stateParams, $filter, $ionicScrollDelegate, $rootScope, PayitemService) {
        return {
            selectPopover: function(filter, item, titleShow) {
                var resource_type_list = localStorage.getObject('resource_type_list');
                var unit_list = localStorage.getObject('unit_list');
                var abs_list = localStorage.getObject('abs_list');
                if (!filter.pi) {
                    filter.popup_predicate.name = item.name;
                    if (filter.state == 'resource') {
                        //resource
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
                        var restyp = $filter('filter')(resource_type_list, {
                            name: item.resource_type_name
                        })[0];
                        if (restyp) {
                            filter.popup_predicate.res_type_obj = restyp;
                            filter.popup_predicate.resource_type_id = restyp.id;
                            filter.popup_predicate.resource_type_name = restyp.name;
                        }
                        var unt = $filter('filter')(unit_list, {
                            name: item.unit_name
                        })[0];
                        if (unt) {
                            filter.popup_predicate.unit_obj = unt;
                            filter.popup_predicate.unit_id = unt.id;
                            filter.popup_predicate.unit_name = unt.name;
                        }
                    }
                    if (filter.state == 'staff') {
                        //staff
                        titleShow = 'Staff: ' + item.name;
                        filter.popup_predicate.employer_name = item.employee_name;
                        filter.popup_predicate.staff_role = item.role;
                        filter.popup_predicate.direct_cost = item.direct_cost;
                        var restyp = $filter('filter')(resource_type_list, {
                            name: item.resource_type_name
                        })[0];
                        if (restyp) {
                            filter.popup_predicate.res_type_obj = restyp;
                            filter.popup_predicate.resource_type_id = restyp.id;
                            filter.popup_predicate.resource_type_name = restyp.name;
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
                    var unt = $filter('filter')(unit_list, {
                        name: item.unit_name
                    })[0];
                    if (unt) {
                        filter.popup_predicate.unit_obj = unt;
                        filter.popup_predicate.unit_id = unt.id;
                        filter.popup_predicate.unit_name = unt.name;
                    }
                }
            },
            addResource: function(resources) {
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
                    "vat": 0,
                    "quantity": 0,
                    "current_day": '',
                    "total_cost": 0,
                    "calculation": false,
                    "open": true
                });
            },
            addStaff: function(resources, startTime, breakTime, finishTime) {
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
                    vat: 0.0
                })
            },
            addPayitem: function(items) {
                items.push({
                    "description": "",
                    "reference": "",
                    "unit": "",
                    "quantity": "",
                    "subtasks": [],
                    "resources": []
                })
            },
            addSubtask: function(subtasks) {
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
                        "vat": 0
                    }]
                });
            },
            addResourcePi: function(resources) {
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
                    "vat": 0
                });
            },
            addResourceInSubtask: function(resources) {
                resources.push({
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
                    "vat": 0,
                    "calculation": true,
                });
            },
            goToResource: function(substate, filter, resourceField, aux) {
                if (substate || resourceField.resources[0]) {
                    filter.substate = substate || resourceField.resources[0];
                    aux.linkAux = 'resource';
                    if (filter.substate.name) {
                        aux.titleShow = 'Resource: ' + filter.substate.name;
                    } else {
                        aux.titleShow = 'Resource';
                    }
                } else { //TODO: here if not creating a new resource
                    aux.linkAux = 'resources';
                    aux.titleShow = 'Resources';
                }
            },
            goToStaff: function(substate, filter, staffField, aux) {
                if (substate || staffField.resources[0]) {
                    filter.substate = substate || staffField.resources[0];
                    aux.linkAux = 'staff';
                    if (filter.substate.name) {
                        aux.titleShow = 'Staff: ' + filter.substate.name;
                    } else {
                        aux.titleShow = 'Staff';
                    }
                } else {
                    aux.linkAux = 'staffs'; //TODO: here if not creating a new staff
                    aux.titleShow = 'Staffs';
                }
            },
            goToPayitem: function(substate, filter, payitemField, aux) {
                if (substate || payitemField) {
                    filter.substate = substate || {}; //$scope.payitemField;
                    if (filter.substate.description) {
                        aux.titleShow = 'Pay-item: ' + filter.substate.description;
                    } else {
                        aux.titleShow = 'Pay-item';
                    }
                    aux.linkAux = 'payitem';
                } else {
                    aux.linkAux = 'payitem'; //TODO: here if not creating a new payitem
                    aux.titleShow = 'Pay-items';
                }
            },
            goToScheduling: function(substate, filter, payitemField, aux, projectId) {
                if (substate || payitemField) {
                    filter.substate = substate || {}; //$scope.payitemField;
                    if (filter.substate.description) {
                        aux.titleShow = 'Scheduling: ' + filter.substate.description;
                    } else {
                        aux.titleShow = 'Scheduling';
                    }
                    aux.linkAux = 'scheduling';
                } else {
                    aux.linkAux = 'schedulings'; //TODO: here if not creating a new sched
                    aux.titleShow = 'Schedulings';
                }
            },
            goStateDown: function(state, substate, data, filter, aux) {
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
                                console.log(data.name)
                                aux.titleShow = 'Scheduling Resource: ' + data.name;
                            } else {
                                console.log('wut?')
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
            },
            openPopover: function(test, filter, projectId) {
                switch (test) {
                    case 'staff':
                        filter.pi = false;
                        filter.popup_list = localStorage.getObject('staff_list');
                        break;
                    case 'resource':
                        filter.pi = false;
                        filter.popup_list = localStorage.getObject('resource_list');
                        break;
                    default: //TODO: check if data
                        filter.pi = true;
                        PayitemService.list_payitems(projectId).then(function(data) {
                            $rootScope.payitem_list = data;
                            filter.popup_list = $rootScope.payitem_list;
                        });
                }
            },
            updateCalculations: function(data) {
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
            },
            updateTitle: function(title, placeholder, titleShow) {
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
            }
        }
    }
])
