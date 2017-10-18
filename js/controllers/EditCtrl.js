ppApp.controller('EditCtrl', [
    '$scope',
    '$timeout',
    'FormUpdateService',
    '$location',
    '$rootScope',
    '$ionicSideMenuDelegate',
    '$ionicScrollDelegate',
    '$ionicModal',
    '$cordovaCamera',
    'ConvertersService',
    '$ionicHistory',
    'CommonServices',
    '$ionicPopover',
    '$stateParams',
    '$state',
    '$filter',
    '$q',
    'PostService',
    'SettingService',
    function($scope, $timeout, FormUpdateService, $location, $rootScope, $ionicSideMenuDelegate, $ionicScrollDelegate,
        $ionicModal, $cordovaCamera, ConvertersService, $ionicHistory,
        CommonServices, $ionicPopover, $stateParams, $state, $filter, $q, PostService, SettingService) {
        var custSett = null;
        SyncService.getSettings().then(function(settings) {
            custSett = settings.custsett;
            $scope.resource_type_list = settings.resource_type;
            $scope.unit_list = settings.unit;
            $scope.abs_list = settings.absenteeism;
        })

        $scope.filter = {
            edit: true,
            state: 'form',
            popup_title: 'Resource filter',
            popup_list: [],
            searchText: ''
        }
        $scope.repeatable = false;
        $scope.vat = parseInt($filter('filter')(custSett, {
            name: 'vat'
        })[0].value, 10);
        var temp = $filter('filter')(custSett, {
            name: 'currency'
        });
        if (temp && temp.length) {
            $scope.currency = temp[0].value;
        }
        $scope.linkAux = 'forms';

        //set project settings
        SyncService.getProjects().then(function(res) {
            var proj = $filter('filter')(res, {
                id: $stateParams.projectId
            })[0];
            if (proj && proj.settings) {
                var val = $filter('filter')(proj.settings, {
                    name: "margin"
                })[0];
                $rootScope.proj_margin = parseInt(val.value);
            } else {
                $rootScope.proj_margin = 0;
            }
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

        var temp = $filter('filter')(custSett, {
            name: 'currency'
        });
        if (temp && temp.length) {
            $scope.currency = temp[0].value;
            $scope.filter.currency = temp[0].value;
        }
        // $scope.filter.margin = $filter('filter')(custSett, {
        //     name: 'margin'
        // })[0].value;
        $scope.filter.start = $filter('filter')(custSett, {
            name: 'start'
        })[0].value;
        $scope.filter.break = $filter('filter')(custSett, {
            name: 'break'
        })[0].value;
        $scope.filter.finish = $filter('filter')(custSett, {
            name: 'finish'
        })[0].value;
        $scope.doTotal = function(type, parent) {
            if (parent) {
                parent.total_cost = 0;
                if (type === 'resource' || type === 'piresource' || type === 'pisubresource') {
                    angular.forEach(parent.resources, function(res) {
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
            CommonServices.openPopover(test, $scope.filter, $stateParams.projectId);
            $scope.popover.show($event);
        };
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
            CommonServices.addResource($scope.resourceField.resources, $scope.vat);
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
                CommonServices.addResourcePi($scope.filter.substate.resources, $scope.vat);
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
                CommonServices.addResourceInSubtask($scope.filter.substateStk, $scope.vat);
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

        PostService.post({
            method: 'GET',
            url: 'forminstance',
            params: {
                id: $rootScope.formId
            }
        }, function(res) {
            $rootScope.formData = res.data;
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
                $scope.imgURI = res;
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
                                        item.current_day = new Date(item.current_day_obj).getTime();
                                    }
                                });
                                PostService.post({
                                    method: 'PUT',
                                    url: 'resourcefield',
                                    data: $rootScope.resourceField
                                }, function(res) {

                                }, function(err) {
                                    console.log(err);
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
                                    method: 'PUT',
                                    url: 'payitemfield',
                                    data: $rootScope.payitemField
                                }, function(res) {

                                }, function(err) {
                                    console.log(err);
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
                                    method: 'PUT',
                                    url: 'schedulingfield',
                                    data: $rootScope.payitemField
                                }, function(res) {

                                }, function(err) {
                                    console.log(err);
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
                                    if (item.expiry_date_obj) {
                                        item.expiry_date = item.expiry_date_obj.getFullYear() + '-' + (item.expiry_date_obj.getMonth() + 1) + '-' + item.expiry_date_obj.getDate();
                                    }
                                });
                                PostService.post({
                                    method: 'PUT',
                                    url: 'stafffield',
                                    data: $rootScope.staffField
                                }, function(res) {

                                }, function(err) {
                                    console.log(err);
                                });
                            }
                            var requestForm = ConvertersService.instanceToUpdate($scope.formData);
                            PostService.post({
                                method: 'PUT',
                                url: 'forminstance',
                                data: requestForm,
                                params: {
                                    'id': $rootScope.formId
                                }
                            }, function(res) {
                                if (res.data && res.data.status !== 0 && res.data.status !== 502 && res.data.status !== 403 && res.data.status !== 400) {
                                    $rootScope.formId = res.data;
                                    //no image to add
                                    if (!$scope.imgToAdd.length) {
                                        $timeout(function() {
                                            formUp.close();
                                            $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                        });
                                    }
                                    var cnt = 0;
                                    angular.forEach($scope.imgToAdd, function(img) { //TODO: check
                                        img.id = 0;
                                        img.formInstanceId = $scope.formData.id;
                                        img.projectId = $scope.formData.project_id;
                                        PostService.post({
                                            method: 'POST',
                                            url: 'defectphoto/uploadfile',
                                            data: img,
                                        }, function(payload) {
                                            cnt++;
                                            if (cnt >= $scope.imgToAdd.length) {
                                                $timeout(function() {
                                                    $scope.imgToAdd = [];
                                                    formUp.close();
                                                    $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                                });
                                            }
                                        }, function(err) {
                                            if (cnt >= $scope.imgToAdd.length) {
                                                $timeout(function() {
                                                    $scope.imgToAdd = [];
                                                    formUp.close();
                                                    $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                                });
                                            }
                                        });
                                    })
                                } else {
                                    $timeout(function() {
                                        formUp.close();
                                        $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                    });
                                }
                            }, function(err) {
                                if (err.status === 0 || err.status === 502) {
                                    var sync = CacheFactory.get('sync');
                                    if (!sync) {
                                        sync = CacheFactory('sync');
                                    }
                                    sync.setOptions({
                                        storageMode: 'localStorage'
                                    });
                                    $rootScope.toBeUploadedCount = sync.keys().length;
                                    $rootScope.toBeUploadedCount++;
                                    sync.put($rootScope.toBeUploadedCount, requestForm);
                                }
                            });
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

                        function addResource() {
                            var def = $q.defer();
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
                                        item.current_day = $filter('date')(item.current_day_obj, "dd-MM-yyyy");
                                    }
                                });
                                PostService.post({
                                    method: 'POST',
                                    url: 'resourcefield',
                                    data: $rootScope.resourceField
                                }, function(res) {
                                    $scope.formData.resource_field_id = res.data.id;
                                    def.resolve();
                                }, function(err) {
                                    $scope.formData.resourceField = $scope.formData.resourceField || [];
                                    $scope.formData.resourceField.push($rootScope.resourceField);
                                    def.resolve();
                                });
                            } else {
                                def.resolve();
                            }
                            return def.promise;
                        }

                        function addPayitem() {
                            var def = $q.defer();
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
                                    data: $rootScope.payitemField
                                }, function(res) {
                                    $scope.formData.pay_item_field_id = res.data.id;
                                    def.resolve();
                                }, function(err) {
                                    $scope.formData.payitemField = $scope.formData.payitemField || [];
                                    $scope.formData.payitemField.push($rootScope.payitemField);
                                    def.resolve();
                                });
                            } else {
                                def.resolve();
                            }
                            return def.promise;
                        }

                        function addScheduling() {
                            var def = $q.defer();
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
                                    method: 'PUT',
                                    url: 'schedulingfield',
                                    data: $rootScope.payitemField
                                }, function(res) {
                                    $scope.formData.scheduling_field_id = res.data.id;
                                    def.resolve();
                                }, function(err) {
                                    $scope.formData.schedField = $scope.formData.schedField || [];
                                    $scope.formData.schedField.push($rootScope.payitemField);
                                    def.resolve();
                                });
                            } else {
                                def.resolve();
                            }
                            return def.promise;
                        }

                        function addStaff() {
                            var def = $q.defer();
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
                                        item.current_day = item.current_day_obj.getTime();
                                    }
                                    if (item.expiry_date_obj) {
                                        item.expiry_date = item.expiry_date_obj.getFullYear() + '-' + (item.expiry_date_obj.getMonth() + 1) + '-' + item.expiry_date_obj.getDate();
                                    }
                                });
                                PostService.post({
                                    method: 'PUT',
                                    url: 'stafffield',
                                    data: $rootScope.staffField
                                }, function(res) {
                                    $scope.formData.staff_field_id = res.data.id;
                                    def.resolve();
                                }, function(err) {
                                    $scope.formData.staffField = $scope.formData.staffField || [];
                                    $scope.formData.staffField.push($rootScope.staffField);
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
                            fastSave(formUp);
                        })
                    });
                }
            });

            function fastSave(formUp) { //TODO: CHECK REQUESTSH
                var requestForm = ConvertersService.instanceToNew($scope.formData);
                PostService.post({
                    method: 'POST',
                    url: 'forminstance',
                    data: requestForm,
                    withCredentials: true
                }, function(res) {
                    var cnt = 0;
                    angular.forEach($scope.imgURI, function(img) {
                        img.id = 0;
                        img.formInstanceId = res.id;
                        img.projectId = requestForm.project_id;
                        PostService.post({
                            method: 'POST',
                            url: 'defectphoto/uploadfile',
                            data: img,
                        }, function(res) {
                            cnt++;
                            if (cnt >= $scope.imgURI.length) {
                                var data = res.data; //TODO: check it
                                $rootScope.formId = data.id;
                                PostService.post({
                                    method: 'GET',
                                    url: 'forminstance',
                                    params: {
                                        id: $rootScope.formId
                                    }
                                }, function(res) {
                                    $timeout(function() {
                                        formUp.close();
                                        $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                                    });
                                }, function(err) {
                                    $timeout(function() {
                                        formUp.close();
                                    });
                                });
                            }
                        }, function(err) {
                            if (cnt >= $scope.imgURI.length) {
                                $timeout(function() {
                                    formUp.close();
                                });
                            }
                        });
                    })
                    // if (res.data || res.data && res.data.message) {  //TODO: it is on error clause??
                    //     $timeout(function() {
                    //         var alertPopup3 = $ionicPopup.alert({
                    //             title: 'Submision failed.',
                    //             template: 'You have not permission to do this operation'
                    //         });
                    //         alertPopup3.then(function(res) {
                    //             $rootScope.$broadcast('sync.todo');
                    //         });
                    //     }, 10);
                    // } else {
                    // var list = ConvertersService.photoList($scope.imgURI, res.id, requestForm.project_id),
                    //     postImages = '';
                    // if (list.length !== 0) {
                    //     postImages = ImageService.create(list).then(function(x) { //TODO: PostService pic by pic
                    //         return x;
                    //     });
                    // }
                    // }
                    // postImages.then(function(succ) {
                    //     var data = res.data; //TODO: check it
                    //     // if (data && data.status !== 0 && data.status !== 502 && data.status !== 403 && data.status !== 400) {
                    //     $rootScope.formId = data.id;
                    //
                    //     PostService.post({
                    //         method: 'GET',
                    //         url: 'forminstance',
                    //         params: {
                    //             id: $rootScope.formId
                    //         }
                    //     }, function(res) {
                    //         $timeout(function() {
                    //             formUp.close();
                    //             $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                    //         });
                    //     }, function(err) {
                    //         console.log(err);
                    //     });
                    //
                    //     // } else {
                    //     //     $timeout(function() {
                    //     //         formUp.close();
                    //     //         $location.path("/app/view/" + $rootScope.projectId + "/form/" + $rootScope.formId);
                    //     //     });
                    //     // }
                    // })
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
                    for (var i = 0; i < $scope.imgURI.length; i++) {
                        if ($scope.imgURI[i].base64String !== "") {
                            $scope.imgURI.projectId = requestForm.project_id;
                            requestList.push($scope.imgURI[i]);
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


                    // data = err;
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
