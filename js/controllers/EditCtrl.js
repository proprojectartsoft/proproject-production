ppApp.controller('EditCtrl', [
    '$scope',
    '$timeout',
    '$location',
    '$rootScope',
    '$ionicSideMenuDelegate',
    '$ionicScrollDelegate',
    '$ionicModal',
    '$cordovaCamera',
    '$ionicHistory',
    'CommonServices',
    '$ionicPopover',
    '$stateParams',
    '$state',
    '$filter',
    '$q',
    'PostService',
    'SettingService',
    'SyncService',
    function($scope, $timeout, $location, $rootScope, $ionicSideMenuDelegate, $ionicScrollDelegate,
        $ionicModal, $cordovaCamera, $ionicHistory,
        CommonServices, $ionicPopover, $stateParams, $state, $filter, $q, PostService, SettingService, SyncService) {
        var custSett = null;
        $scope.repeatable = false;
        $scope.linkAux = 'forms';
        $scope.disablePhotosActions = true;
        $scope.imgURI = [];
        SyncService.getSettings().then(function(settings) {
            custSett = settings.custsett;
            $scope.filter = {
                edit: true,
                state: 'form',
                popup_title: 'Resource filter',
                popup_list: [],
                searchText: ''
            }
            $scope.resource_type_list = settings.resource_type;
            $scope.unit_list = settings.unit;
            $scope.abs_list = settings.absenteeism;
            $scope.filter.vat = parseInt(CommonServices.filterByField(custSett, 'name', 'vat').value, 10);
            $scope.currency = CommonServices.filterByField(custSett, 'name', 'currency').value;
            $scope.filter.currency = angular.copy($scope.currency);
            $scope.filter.start = $scope.filter.start || CommonServices.filterByField(custSett, 'name', 'start').value;
            $scope.filter.break = $scope.filter.break || CommonServices.filterByField(custSett, 'name', 'break').value;
            $scope.filter.finish = $scope.filter.finish || CommonServices.filterByField(custSett, 'name', 'finish').value;
            // $scope.filter.margin = CommonServices.filterByField(custSett, 'name','margin');
        })

        //set project settings
        SyncService.getProjects().then(function(res) {
            var proj = CommonServices.filterByField(res, 'id', $stateParams.projectId);
            $rootScope.proj_margin = parseInt(proj.margin) || 0;
            $scope.filter.start = proj.start || CommonServices.filterByField(custSett, 'name', 'start').value || '06:00';
            $scope.filter.break = proj.break || CommonServices.filterByField(custSett, 'name', 'break').value || '00:30';
            $scope.filter.finish = proj.finish || CommonServices.filterByField(custSett, 'name', 'finish').value || '16:00';
        }, function(reason) {
            SettingService.show_message_popup("Error", reason);
        });

        $scope.updateCalculation = function(data) {
            CommonServices.updateCalculation(data);
        }
        $scope.updateTitle = function(title, placeholder) {
            CommonServices.updateTitle(title, placeholder, $scope.titleShow);
        }
        $scope.backHelper = function() {
            if ($scope.linkAux == 'forms') {
                $state.go('app.completed', {
                    'projectId': $stateParams.projectId,
                    'categoryId': $scope.formData.category_id
                });
            } else {
                var temp = CommonServices.backHelper($scope.linkAux, $scope.filter, {
                    resourceField: $scope.resourceField,
                    payitemField: $scope.payitemField
                }, true);
                $scope.titleShow = temp.titleShow || $scope.formData.name || '';
                $scope.linkAux = temp.linkAux;
                $ionicScrollDelegate.resize();
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
            var temp = CommonServices.goState(state, substate, $scope.filter, {
                linkAux: $scope.linkAux,
                titleShow: $scope.titleShow,
                resourceField: $scope.resourceField,
                staffField: $scope.staffField,
                payitemField: $scope.payitemField
            });
            $scope.linkAux = temp.linkAux;
            $scope.titleShow = temp.titleShow;
            $ionicScrollDelegate.resize();
            $scope.goToTop();
        }

        $ionicPopover.fromTemplateUrl('view/search.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

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
        //open popover with the list of resources from filter.substate(Stk/StkRes)
        $scope.openPopover = function($event, predicate, test) {
            //filter.popup_predicate takes the reference to filter.substate
            $scope.filter.popup_predicate = predicate;
            CommonServices.openPopover(test, $scope.filter, $stateParams.projectId);
            $scope.popover.show($event);
        };
        //select one item from popup_list
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
        $scope.addResource = function() {
            CommonServices.addResource($scope.resourceField.resources, {
                open: true,
                stage_id: 1,
                calculation: false,
                id: 0,
                resource_field_id: 0,
                vat: $scope.vat
            });
            $scope.filter.substate = $scope.resourceField.resources[$scope.resourceField.resources.length - 1];
        };
        $scope.addStaff = function() {
            if ($scope.staffField) {
                CommonServices.addStaff($scope.staffField.resources, $scope.filter.start, $scope.filter.break, $scope.filter.finish, $scope.vat);
                $scope.filter.substate = $scope.staffField.resources[$scope.staffField.resources.length - 1];
            }
        }
        $scope.addPayitem = function() {
            CommonServices.addPayitem($scope.payitemField.pay_items);
            $scope.filter.substate = $scope.payitemField.pay_items[$scope.payitemField.pay_items.length - 1]
        }
        $scope.addSubtask = function() {
            if ($scope.filter.substate && $scope.filter.substate.resources.length === 0) {
                CommonServices.addSubtask($scope.filter.substate.subtasks, $scope.vat);
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
                CommonServices.addResource($scope.filter.substate.resources, {
                    open: false,
                    stage_id: 0,
                    calculation: true,
                    vat: $scope.vat
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
                CommonServices.addResource($scope.filter.substateStk.resources, {
                    open: false,
                    stage_id: 0,
                    calculation: true,
                    vat: $scope.vat
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

        $scope.$on('$ionicView.enter', function() {
            $ionicHistory.clearHistory();
            $ionicSideMenuDelegate.canDragContent(false);
        });
        $scope.formData = angular.copy($rootScope.rootForm);
        $scope.titleShow = $scope.formData.name;

        $scope.goPicture = function() {
            $scope.filter.state = 'photos';
            $scope.filter.substate = 'gallery';
            $scope.titleShow = 'Photo Gallery';
            $scope.linkAux = 'photos';
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

        PostService.post({
            method: 'GET',
            url: 'forminstance',
            params: {
                id: $rootScope.formId
            }
        }, function(res) {
            $scope.formData = res.data;
            PostService.post({
                method: 'GET',
                url: 'gallery/instance',
                params: {
                    formInstanceId: $rootScope.formId,
                    projectId: res.data.project_id
                }
            }, function(succ) {
                angular.forEach(succ.data, function(image) {
                    image.url = $APP.server + '/pub/images/' + image.base64String;
                })
                $scope.imgURI = succ.data;
            }, function(err) {
                console.log(err);
            });
            angular.forEach($scope.formData.field_group_instances, function(field) {
                if (field.repeatable) {
                    $scope.repeatable = true;
                    return;
                }
            })
        }, function(err) {
            angular.forEach($scope.formData.field_group_instances, function(field) {
                if (field.repeatable) {
                    $scope.repeatable = true;
                    return;
                }
            })
        });


        $scope.submit = function(help) {
            if (!navigator.onLine) {
                SettingService.show_message_popup('Please note', 'You are offline. You can modify forms when online.');
            } else {
                SettingService.show_confirm_popup('Edit form', 'Are you sure you want to edit this form?').then(function(res) {
                    if (res) {
                        $timeout(function() {
                            var formUp = SettingService.show_loading_popup('Submitting');
                            CommonServices.saveSpecialFields($scope.formData, {
                                resourceField: $rootScope.resourceField,
                                staffField: $rootScope.staffField,
                                payitemField: $rootScope.payitemField
                            }, 'PUT').then(function(result) {
                                CommonServices.saveFormToServer({
                                    method: 'PUT',
                                    url: 'forminstance',
                                    data: CommonServices.instanceToUpdate(result),
                                    params: {
                                        'id': $rootScope.formId
                                    }
                                }, [], formUp); //$scope.imgToAdd
                            })
                        });
                    }
                });
            }
        };

        $scope.saveAsNew = function() {
            SettingService.show_confirm_popup('Edit form', 'Are you sure you want to save this form?').then(function(res) {
                if (res) {
                    $timeout(function() {
                        var formUp = SettingService.show_loading_popup('Submitting');

                        CommonServices.saveSpecialFields($scope.formData, {
                            resourceField: $rootScope.resourceField,
                            staffField: $rootScope.staffField,
                            payitemField: $rootScope.payitemField
                        }, 'POST').then(function(result) {
                            //automatically sync previousely offline created forms
                            if (localStorage.getObject('ppfsync') || localStorage.getObject('pppsync')) {
                                SyncService.sync().then(function(res) {
                                    CommonServices.saveFormToServer({
                                        method: 'POST',
                                        url: 'forminstance',
                                        data: CommonServices.designToInstance(result),
                                        withCredentials: true
                                    }, [], formUp, true);
                                })
                            } else {
                                CommonServices.saveFormToServer({
                                    method: 'POST',
                                    url: 'forminstance',
                                    data: CommonServices.designToInstance(result),
                                    withCredentials: true
                                }, [], formUp, true);
                            }
                        })
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

        if ($scope.filter && $scope.filter.substate && $scope.filter.substate.current_day_obj)
            console.log($scope.filter.substate.current_day_obj);



    }
]);
