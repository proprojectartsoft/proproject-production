ppApp.controller('SharedCtrl', [
    '$rootScope',
    '$scope',
    'PostService',
    'SyncService',
    function($rootScope, $scope, PostService, SyncService) {
        $scope.filter = {
            stateshare: 'form',
            edit: false,
            shared: true
        }
        PostService.post({
            method: 'GET',
            url: 'share',
            params: {
                shared: false
            }
        }, function(result) {
            $scope.sharedListData = result.data;
            $scope.num = result.data.length;
        }, function(err) {
            console.log(err);
        });

        $scope.back = function() {
            delete $scope.formData;
        }

        $scope.loadForm = function(predicate) {
            PostService.post({
                method: 'GET',
                url: 'forminstance',
                params: {
                    id: predicate.form_instance_id
                }
            }, function(result) {
                var data = result.data;
                SyncService.getSettings().then(function(settings) {
                    $scope.formData = data;
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
                                if (item.unit_id) {
                                    angular.forEach(settings.unit, function(unt) {
                                        if (unt.id === item.unit_id) {
                                            item.unit_obj = unt;
                                        }
                                    })
                                }
                                if (item.resource_type_id) {
                                    angular.forEach(settings.resource_type, function(res) {
                                        if (res.id === item.resource_type_id) {
                                            item.res_type_obj = res;
                                        }
                                    })
                                }
                                if (item.abseteeism_reason_name) {
                                    angular.forEach(settings.absenteeism, function(abs) {
                                        if (abs.reason === item.abseteeism_reason_name) {
                                            item.absenteeism_obj = abs;
                                        }
                                    })
                                }
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
                                if (item.unit_id) {
                                    angular.forEach(settings.unit, function(unt) {
                                        if (unt.id === item.unit_id) {
                                            item.unit_obj = unt;
                                        }
                                    })
                                }
                                if (item.resource_type_name) {
                                    angular.forEach(settings.resource_type, function(res) {
                                        if (res.name === item.resource_type_name) {
                                            item.res_type_obj = res;
                                        }
                                    })
                                }
                                if (item.abseteeism_reason_name) {
                                    angular.forEach(settings.absenteeism, function(abs) {
                                        if (abs.reason === item.abseteeism_reason_name) {
                                            item.absenteeism_obj = abs;
                                        }
                                    })
                                }
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
                            angular.forEach($scope.payitemField.pay_items, function(item) {
                                if (item.unit_id) {
                                    angular.forEach(settings.unit, function(unt) {
                                        if (unt.id === item.unit_id) {
                                            item.unit_obj = unt;
                                        }
                                    })
                                }
                                angular.forEach(item.resources, function(res) {
                                    if (res.unit_id) {
                                        angular.forEach(settings.unit, function(unt) {
                                            if (unt.id === res.unit_id) {
                                                res.unit_obj = unt;
                                            }
                                        })
                                    }
                                    if (res.resource_type_name) {
                                        angular.forEach(settings.resource_type, function(rest) {
                                            if (rest.name === res.resource_type_name) {
                                                res.res_type_obj = rest;
                                            }
                                        })
                                    }
                                    if (res.abseteeism_reason_name) {
                                        angular.forEach(settings.absenteeism, function(abs) {
                                            if (abs.reason === res.abseteeism_reason_name) {
                                                res.absenteeism_obj = abs;
                                            }
                                        })
                                    }
                                    if (res.current_day) {
                                        var partsOfStr = res.current_day.split('-');
                                        item.current_day_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
                                    }
                                    if (res.expiry_date) {
                                        var partsOfStr = res.expiry_date.split('-');
                                        item.expiry_date_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
                                    }
                                });
                                angular.forEach(item.subtasks, function(subtask) {
                                    angular.forEach(subtask.resources, function(res) {
                                        if (res.unit_id) {
                                            angular.forEach(settings.unit, function(unt) {
                                                if (unt.id === res.unit_id) {
                                                    res.unit_obj = unt;
                                                }
                                            })
                                        }
                                        if (res.resource_type_name) {
                                            angular.forEach(settings.resource_type, function(rest) {
                                                if (rest.name === res.resource_type_name) {
                                                    res.res_type_obj = rest;
                                                }
                                            })
                                        }
                                        if (res.abseteeism_reason_name) {
                                            angular.forEach(settings.absenteeism, function(abs) {
                                                if (abs.reason === res.abseteeism_reason_name) {
                                                    res.absenteeism_obj = abs;
                                                }
                                            })
                                        }
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
                                    });
                                });
                            });
                            $rootScope.payitemField = $scope.payitemField;
                        }, function(err) {
                            console.log(err);
                        });
                    }
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
                            angular.forEach($scope.payitemField.pay_items, function(item) {
                                if (item.unit_id) {
                                    angular.forEach(settings.unit, function(unt) {
                                        if (unt.id === item.unit_id) {
                                            item.unit_obj = unt;
                                        }
                                    })
                                }
                                angular.forEach(item.resources, function(res) {
                                    if (res.unit_id) {
                                        angular.forEach(settings.unit, function(unt) {
                                            if (unt.id === res.unit_id) {
                                                res.unit_obj = unt;
                                            }
                                        })
                                    }
                                    if (res.resource_type_name) {
                                        angular.forEach(settings.resource_type, function(rest) {
                                            if (rest.name === res.resource_type_name) {
                                                res.res_type_obj = rest;
                                            }
                                        })
                                    }
                                    if (res.abseteeism_reason_name) {
                                        angular.forEach(settings.absenteeism, function(abs) {
                                            if (abs.reason === res.abseteeism_reason_name) {
                                                res.absenteeism_obj = abs;
                                            }
                                        })
                                    }
                                    if (res.current_day) {
                                        var partsOfStr = res.current_day.split('-');
                                        item.current_day_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
                                    }
                                    if (res.expiry_date) {
                                        var partsOfStr = res.expiry_date.split('-');
                                        item.expiry_date_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
                                    }
                                });
                                angular.forEach(item.subtasks, function(subtask) {
                                    angular.forEach(subtask.resources, function(res) {
                                        if (res.unit_id) {
                                            angular.forEach(settings.unit, function(unt) {
                                                if (unt.id === res.unit_id) {
                                                    res.unit_obj = unt;
                                                }
                                            })
                                        }
                                        if (res.resource_type_name) {
                                            angular.forEach(settings.resource_type, function(rest) {
                                                if (rest.name === res.resource_type_name) {
                                                    res.res_type_obj = rest;
                                                }
                                            })
                                        }
                                        if (res.abseteeism_reason_name) {
                                            angular.forEach(settings.absenteeism, function(abs) {
                                                if (abs.reason === res.abseteeism_reason_name) {
                                                    res.absenteeism_obj = abs;
                                                }
                                            })
                                        }
                                        if (res.current_day) {
                                            var partsOfStr = res.current_day.split('-');
                                            item.current_day_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
                                        }
                                        if (res.expiry_date) {
                                            var partsOfStr = res.expiry_date.split('-');
                                            item.expiry_date_obj = new Date(partsOfStr[0], parseInt(partsOfStr[1]) - 1, partsOfStr[2])
                                        }
                                    });
                                });
                            });
                            $rootScope.payitemField = $scope.payitemField;
                        }, function(err) {
                            console.log(err);
                        });
                    }
                });
            }, function(err) {
                console.log(err);
            })
        }
    }
]);
