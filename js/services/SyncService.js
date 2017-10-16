ppApp.service('SyncService', [
    '$q',
    '$http',
    '$timeout',
    '$cordovaSQLite',
    '$interval',
    'DbService',
    'ResourceService',
    'ProjectService',
    'FormDesignService',
    'UserService',
    'AuthService',
    '$ionicPopup',
    '$rootScope',
    '$state',
    'FormInstanceService',
    'StaffService',
    'SchedulingService',
    'PayitemService',
    'orderByFilter',
    'PostService',

    function($q, $http, $timeout, $cordovaSQLite, $interval, DbService, ResourceService, ProjectService, FormDesignService, UserService, AuthService, $ionicPopup, $rootScope, $state, FormInstanceService, StaffService,
        SchedulingService, PayitemService, orderBy, PostService) {
        var service = this;

        function servresp(name, timer, start, response) {
            this.name = name;
            this.timer = timer;
            this.response = response;
        }

        var getme = function() {
            return $http.get($APP.server + '/api/me')
                .success(function(user) {
                    return user.data;
                })
                .error(function(data, status) {
                    return status;
                })
        };
        var setme = function(user) {
            return $http({
                    method: 'POST',
                    url: $APP.server + '/pub/login',
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json;odata=verbose'
                    },
                    transformRequest: function(obj) {
                        return 'login.user.name=' + user.username + '&login.user.password=' + user.password + '&user=true';
                    },
                    data: user
                })
                .success(function(user) {
                    return user.data;
                })
                .error(function(data, status) {
                    console.log(data, status)
                    return status;
                })
        };

        var addSpecialFields = function(formsToAdd) {
            var def = $q.defer();

            if (!formsToAdd.resourceField && !formsToAdd.staffField && !formsToAdd.payitemField && !formsToAdd.schedField) {
                def.resolve();
            } else {
                var addItemsToServer = function(items, field_id, url) {
                    var prm = $q.defer(),
                        count = 0;
                    if (!items.length) {
                        prm.resolve();
                    }
                    angular.forEach(items, function(item) {
                        PostService.post({
                            method: 'POST',
                            url: url,
                            data: item
                        }, function(x) {
                            field_id = x.data.id;
                            if (count >= items.length) {
                                def.resolve();
                            }
                        }, function(err) {
                            if (count >= items.length) {
                                def.resolve();
                            }
                        });
                    })
                    return prm.promise;
                };

                var resourcePrm = addItemsToServer(formsToAdd.resourceField, formsToAdd.resource_field_id, 'resourcefield'),
                    staffPrm = addItemsToServer(formsToAdd.staffField, formsToAdd.staff_field_id, 'stafffield'),
                    schedulePrm = addItemsToServer(formsToAdd.schedField, formsToAdd.scheduling_field_id, 'schedulingfield'),
                    payitemPrm = addItemsToServer(formsToAdd.payitemField, formsToAdd.pay_item_field_id, 'payitemfield');
                Promise.all([resourcePrm, staffPrm, schedulePrm, payitemPrm]).then(function(res) {
                    def.resolve();
                })
            }
            return def.promise;
        };
        //get data from server
        var down = function(defer) {
            AuthService.version().then(function(result) {
                localStorage.setObject('ppversion', result);
            });

            var storeToLocalDb = function(url, tableName) {
                var prm = $q.defer();
                PostService.post({
                    method: 'GET',
                    url: url
                }, function(result) {
                    var fields = '',
                        values = [],
                        temp = [];
                    // DbService.add('custsett', result.data);
                    $APP.db.transaction(function(tx) {
                        for (var key in result.data[0]) {
                            temp.push(key);
                        }
                        fields = temp.join();
                        tx.executeSql('DROP TABLE IF EXISTS ' + tableName);
                        tx.executeSql('CREATE TABLE IF NOT EXISTS ' + tableName + ' (' + fields + ')');
                        angular.forEach(result.data, function(res) {
                            values = [];
                            for (var key in res) {
                                values.push(res[key]);
                            }
                            tx.executeSql('INSERT INTO ' + tableName + ' VALUES ', values);
                        });
                        prm.resolve(); //TODO: after executeSql; on transaction.then
                    }, function(error) {
                        prm.resolve();
                        console.log('Transaction ERROR: ' + error.message);
                    });
                }, function(err) {
                    prm.resolve();
                })
                return prm.promise;
            };

            var resources = storeToLocalDb('resource', 'ResourcesTable'), //TODO: order alpfabetically
                payitems = storeToLocalDb('payitem', 'PayitemsTable'),
                unit = storeToLocalDb('unit', 'UnitTable'),
                staff = storeToLocalDb('staff', 'StaffTable'),
                resourceType = storeToLocalDb('resourcetype', 'ResourceTypeTable'),
                absenteeism = storeToLocalDb('absenteeismreasons/list', 'AbsenteeismTable'),
                custsett = storeToLocalDb('companysettings', 'CustsettTable');
            //params: {
            // 		customer_id: id
            // }


            //Designs
            var designs = function() {
                var prm = $q.defer();
                PostService.post({
                    method: 'GET',
                    url: 'formdesign/mobilelist',
                    params: {
                        categoryId: null
                    }
                }, function(result) {
                    $APP.db.transaction(function(tx) {
                        tx.executeSql('DROP TABLE IF EXISTS DesignsTable');
                        tx.executeSql('CREATE TABLE IF NOT EXISTS DesignsTable (id int primary key, name text, guidance text, category_id int, permission int, data text)');
                        angular.forEach(result.data, function(form) {
                            tx.executeSql('INSERT INTO DesignsTable VALUES (?,?,?,?,?,?)', [form.id, form.name, form.guidance, form.category_id, form.permission, JSON.stringify(form)]);
                        });
                        prm.resolve();
                        console.log(result.data);
                    }, function(error) {
                        prm.resolve();
                        console.log('Transaction ERROR: ' + error.message);
                    }, function(res) {
                        prm.resolve();
                        console.log('What is this?', res);
                    });
                }, function(err) {
                    prm.resolve();
                })
                return prm.promise;


                // var obj = new servresp('designs', 0, []);
                // var ping = $interval(function() {
                //     obj.timer += 1;
                // }, 1);
                // return FormDesignService.list_mobile().then(function(result) {
                //     if (result) {
                //         $interval.cancel(ping);
                //         obj.response = result;
                //         $APP.db.transaction(function(tx) {
                //             tx.executeSql('DROP TABLE IF EXISTS DesignsTable');
                //             tx.executeSql('CREATE TABLE IF NOT EXISTS DesignsTable (id int primary key, name text, guidance text, category_id int, permission int, data text)');
                //             angular.forEach(result, function(form) {
                //                 tx.executeSql('INSERT INTO DesignsTable VALUES (?,?,?,?,?,?)', [form.id, form.name, form.guidance, form.category_id, form.permission, JSON.stringify(form)]);
                //             });
                //             console.log(result);
                //         }, function(error) {
                //             console.log('Transaction ERROR: ' + error.message);
                //         }, function(res) {
                //             console.log('What is this?', res);
                //         });
                //         return obj;
                //     }
                // });
            };
            //Projects
            var projects = function() {
                var prm = $q.defer();
                PostService.post({
                    method: 'GET',
                    url: 'project/settings',
                    params: {
                        active: true
                    }
                }, function(result) {
                    DbService.add('projects', result.data);
                    var id = localStorage.getObject('ppprojectId');
                    var name = localStorage.getObject('ppnavTitle');
                    var sw = false;
                    $rootScope.projects = result.data;
                    if (id && name) {
                        angular.forEach(result.data, function(proj) {
                            if (proj.id === id && proj.name === name) {
                                sw = true;
                            }
                        });
                    }
                    if (sw === true && id && name) {
                        $rootScope.navTitle = name;
                        $rootScope.projectId = id;
                    } else {
                        var auxTitle = {
                            name: 'No projects.',
                            id: 0
                        }
                        if (result.data.length) {
                            auxTitle = result.data[0]
                        }
                        $rootScope.navTitle = auxTitle.name;
                        $rootScope.projectId = auxTitle.id;
                        localStorage.setObject('ppnavTitle', auxTitle.name);
                        localStorage.setObject('ppprojectId', auxTitle.id);
                    }
                    $APP.db.transaction(function(tx) {
                        tx.executeSql('DROP TABLE IF EXISTS ProjectsTable');
                        tx.executeSql('CREATE TABLE IF NOT EXISTS ProjectsTable (id int primary key, name text)');
                        console.log(result.data);
                        angular.forEach(result.data, function(project) {
                            tx.executeSql('INSERT INTO ProjectsTable VALUES (?,?)', [project.id, project.name]);
                        });
                    }, function(error) {
                        console.log('Transaction ERROR: ' + error.message);
                    }, function() {});
                }, function(err) {
                    prm.resolve();
                })
                return prm.promise;


                // var obj = new servresp('projects', 0, []);
                // var ping = $interval(function() {
                //     obj.timer += 1;
                // }, 1);
                // return ProjectService.list_with_settings(true).then(function(result) {
                //     if (result) {
                //         DbService.add('projects', result);
                //         $interval.cancel(ping)
                //         obj.response = result;
                //         var id = localStorage.getObject('ppprojectId');
                //         var name = localStorage.getObject('ppnavTitle');
                //         var sw = false;
                //         $rootScope.projects = result;
                //         if (id && name) {
                //             angular.forEach(result, function(proj) {
                //                 if (proj.id === id && proj.name === name) {
                //                     sw = true;
                //                 }
                //             });
                //         }
                //         if (sw === true && id && name) {
                //             $rootScope.navTitle = name;
                //             $rootScope.projectId = id;
                //         } else {
                //             var auxTitle = {
                //                 name: 'No projects.',
                //                 id: 0
                //             }
                //             if (result.length) {
                //                 auxTitle = result[0]
                //             }
                //             $rootScope.navTitle = auxTitle.name;
                //             $rootScope.projectId = auxTitle.id;
                //             localStorage.setObject('ppnavTitle', auxTitle.name);
                //             localStorage.setObject('ppprojectId', auxTitle.id);
                //         }
                //         $APP.db.transaction(function(tx) {
                //             tx.executeSql('DROP TABLE IF EXISTS ProjectsTable');
                //             tx.executeSql('CREATE TABLE IF NOT EXISTS ProjectsTable (id int primary key, name text)');
                //             console.log(result);
                //
                //
                //             angular.forEach(result, function(project) {
                //                 tx.executeSql('INSERT INTO ProjectsTable VALUES (?,?)', [project.id, project.name]);
                //             });
                //         }, function(error) {
                //             console.log('Transaction ERROR: ' + error.message);
                //         }, function() {});
                //         return obj;
                //     }
                // });
            }
            //Designs
            // var custsett = function() {
            //     var obj = new servresp('custsett', 0, []);
            //     var ping = $interval(function() {
            //         obj.timer += 1;
            //     }, 1);
            //     return UserService.cust_settings().then(function(result) {
            //         if (result) {
            //             DbService.add('custsett', result);
            //             $interval.cancel(ping)
            //             obj.response = result;
            //             $APP.db.transaction(function(tx) {
            //                 tx.executeSql('DROP TABLE IF EXISTS CustsettTable');
            //                 tx.executeSql('CREATE TABLE IF NOT EXISTS CustsettTable (id int primary key, name text, value text)');
            //                 angular.forEach(result, function(sett) {
            //                     tx.executeSql('INSERT INTO CustsettTable VALUES (?,?,?)', [sett.id, sett.name, sett.value]);
            //                 });
            //             }, function(error) {
            //                 console.log('Transaction ERROR: ' + error.message);
            //             }, function() {});
            //             return obj;
            //         }
            //     });
            // }
            //
            // var payitems = function() {
            //     var obj = new servresp('payitems', 0, []),
            //         project_id = localStorage.getObject('ppprojectId');
            //     var ping = $interval(function() {
            //         obj.timer += 1;
            //     }, 1);
            //     return PayitemService.list_payitems(project_id).then(function(result) {
            //         if (result) {
            //             //order the payitems
            //             var result = orderBy(result, 'name');
            //             DbService.add('payitems', result);
            //             $interval.cancel(ping)
            //             obj.response = result;
            //             $APP.db.transaction(function(tx) {
            //                 tx.executeSql('DROP TABLE IF EXISTS PayitemsTable');
            //                 tx.executeSql('CREATE TABLE IF NOT EXISTS PayitemsTable (id int primary key, reference text, description text, unit_id int, unit_name text)');
            //
            //
            //                 console.log(result);
            //
            //                 angular.forEach(result, function(res) {
            //                     tx.executeSql('INSERT INTO PayitemsTable VALUES (?,?,?,?,?)', [res.id, res.reference, res.description, res.unit_id, res.unit_name]);
            //                 });
            //             }, function(error) {
            //                 console.log('Transaction ERROR: ' + error.message);
            //             }, function() {});
            //             return obj;
            //         }
            //     });
            // }
            //
            // var unit = function() {
            //     var obj = new servresp('unit', 0, []);
            //     var ping = $interval(function() {
            //         obj.timer += 1;
            //     }, 1);
            //     return ResourceService.list_unit().then(function(result) {
            //         if (result) {
            //             DbService.add('unit', result);
            //             $interval.cancel(ping)
            //             obj.response = result;
            //             // $rootScope.unit_list = result;
            //             $APP.db.transaction(function(tx) {
            //                 tx.executeSql('DROP TABLE IF EXISTS UnitTable');
            //                 tx.executeSql('CREATE TABLE IF NOT EXISTS UnitTable (id int primary key, name text, type text)');
            //                 angular.forEach(result, function(unit) {
            //                     tx.executeSql('INSERT INTO UnitTable VALUES (?,?,?)', [unit.id, unit.name, unit.type]);
            //                 });
            //             }, function(error) {
            //                 console.log('Transaction ERROR: ' + error.message);
            //             }, function() {});
            //             return obj;
            //         }
            //     });
            // }
            // var staff = function() {
            //     var obj = new servresp('staff', 0, []);
            //     var ping = $interval(function() {
            //         obj.timer += 1;
            //     }, 1);
            //     return StaffService.list_manager().then(function(result) {
            //         if (result) {
            //             //order the resources
            //             var result = orderBy(result, 'name');
            //             DbService.add('staff', result);
            //             $interval.cancel(ping)
            //             obj.response = result;
            //             $APP.db.transaction(function(tx) {
            //                 tx.executeSql('DROP TABLE IF EXISTS StaffTable');
            //                 tx.executeSql('CREATE TABLE IF NOT EXISTS StaffTable (id int primary key, name text, role text, employer_name text, direct_cost int, unit_name text, unit_id int, resource_type text, resource_id int)');
            //                 angular.forEach(result, function(res) {
            //                     tx.executeSql('INSERT INTO StaffTable VALUES (?,?,?,?,?,?,?,?,?)', [res.id, res.name, res.role, res.employer_name, res.direct_cost, res.unit_name, res.unit_id, res.resource_type, res.resource_id]);
            //                 });
            //             }, function(error) {
            //                 console.log('Transaction ERROR: ' + error.message);
            //             }, function() {});
            //             return obj;
            //         }
            //     });
            // }
            // var resourceType = function() {
            //     var obj = new servresp('resource_type', 0, []);
            //     var ping = $interval(function() {
            //         obj.timer += 1;
            //     }, 1);
            //     return ResourceService.list_resourcetype().then(function(result) {
            //         if (result) {
            //             DbService.add('resource_type', result);
            //             $interval.cancel(ping)
            //             obj.response = result;
            //             $APP.db.transaction(function(tx) {
            //                 tx.executeSql('DROP TABLE IF EXISTS ResourceTypeTable');
            //                 tx.executeSql('CREATE TABLE IF NOT EXISTS ResourceTypeTable (id int primary key, name text)');
            //                 angular.forEach(result, function(res) {
            //                     tx.executeSql('INSERT INTO ResourceTypeTable VALUES (?,?)', [res.id, res.name]);
            //                 });
            //             }, function(error) {
            //                 console.log('Transaction ERROR: ' + error.message);
            //             }, function() {});
            //             return obj;
            //         }
            //     });
            // }
            // var absenteeism = function() {
            //     var obj = new servresp('absenteeism', 0, []);
            //     var ping = $interval(function() {
            //         obj.timer += 1;
            //     }, 1);
            //     return ResourceService.list_absenteeism().then(function(result) {
            //         if (result) {
            //             DbService.add('absenteeism', result);
            //             $interval.cancel(ping)
            //             obj.response = result;
            //             $APP.db.transaction(function(tx) {
            //                 tx.executeSql('DROP TABLE IF EXISTS AbsenteeismTable');
            //                 tx.executeSql('CREATE TABLE IF NOT EXISTS AbsenteeismTable (id int primary key, reason text)');
            //                 angular.forEach(result, function(res) {
            //                     tx.executeSql('INSERT INTO AbsenteeismTable VALUES (?,?)', [res.id, res.reason]);
            //                 });
            //             }, function(error) {
            //                 console.log('Transaction ERROR: ' + error.message);
            //             }, function() {});
            //             return obj;
            //         }
            //     });
            // }
            var doRequest = [];

            forms = localStorage.getObject('ppfsync');
            pics = localStorage.getObject('pppsync');


            Promise.all([resources, unit, staff, resourceType, absenteeism, payitems, designs projects, custsett]).then(function(res) {

            })

            if (forms) {
                var upRequests = [];
                angular.forEach(forms, function(form) {
                    addSpecialFields(form.form).then(function(r) {
                        form.form.resourceField = [];
                        form.form.staffField = [];
                        form.form.schedField = [];
                        form.form.payitemField = [];
                        picX = false;
                        formX = form.form;
                        angular.forEach(pics, function(pic) {
                            if (pic.id === form.id) {
                                picX = pic.imgs;
                            }
                        })
                        if (formX) {
                            var formsToAdd = angular.copy(formX);
                            var picsToAdd = angular.copy(picX);
                            upRequests.push(FormInstanceService.create_sync(formsToAdd, picsToAdd).then(function() {}));
                        }

                        if (forms[forms.length - 1] == form) {
                            doRequest = doRequest.concat(upRequests);
                            localStorage.removeItem('ppfsync')
                            localStorage.removeItem('pppsync')
                            Promise.all([resources, unit, staff, resourceType, absenteeism, payitems]).then(function(res) {
                                if (defer)
                                    defer.resolve();
                                DbService.popclose(); //TODO: not
                            })
                            // asyncCall(doRequest,
                            //     function error(result) {
                            //         console.log('Some error occurred, but we get going:', result);
                            //         if (defer)
                            //             defer.resolve();
                            //         DbService.popclose(); //TODO: not
                            //     },
                            //     function success(result) {
                            //         if (defer)
                            //             defer.resolve();
                            //         DbService.popclose();
                            //     }
                            // );
                        }
                    })
                });
            } else {
                Promise.all([resources, unit, staff, resourceType, absenteeism, payitems]).then(function(res) {
                    if (defer)
                        defer.resolve();
                    DbService.popclose(); //TODO: not
                })
                // asyncCall(doRequest,
                //     function error(result) {
                //         if (defer)
                //             defer.resolve();
                //         DbService.popclose(); //TODO: not
                //         console.log('Some error occurred, but we get going:', result);
                //     },
                //     function success(result) {
                //         if (defer)
                //             defer.resolve();
                //         DbService.popclose();
                //     }
                // );
            }
        };
        //store data locally
        var load = function() {
            var aux;
            //Select the form templates
            $APP.db.transaction(function(tx) {
                tx.executeSql('SELECT * FROM DesignsTable', [], function(tx, rs) {
                    aux = [];
                    for (var i = 0; i < rs.rows.length; i++) {
                        aux.push(JSON.parse(rs.rows.item(i).data));
                    }
                }, function(error) {});
                //Select projects
                tx.executeSql('SELECT * FROM ProjectsTable', [], function(tx, rs) {
                    $rootScope.projects = [];
                    for (var i = 0; i < rs.rows.length; i++) {
                        $rootScope.projects.push(rs.rows.item(i));
                    }
                    var id = localStorage.getObject('ppprojectId');
                    var name = localStorage.getObject('ppnavTitle');
                    var sw = false;
                    if (id && name) {
                        for (var i = 0; i < rs.rows.length; i++) {
                            if (rs.rows.item(i).id === id && rs.rows.item(i).name === name) {
                                sw = true;
                            }
                        }
                    }
                    if (sw === true && id && name) {
                        $rootScope.navTitle = name;
                        $rootScope.projectId = id;
                    } else {
                        $rootScope.navTitle = rs.rows.item(0).name;
                        $rootScope.projectId = rs.rows.item(0).id;
                        localStorage.setObject('ppnavTitle', rs.rows.item(0).name);
                        localStorage.setObject('ppprojectId', rs.rows.item(0).id);
                    }
                    DbService.add('projects', aux);
                }, function(error) {});
                //Select customer settings: currency, start, finish, break
                tx.executeSql('SELECT * FROM CustsettTable', [], function(tx, rs) {
                    aux = [];
                    for (var i = 0; i < rs.rows.length; i++) {
                        aux.push(rs.rows.item(i));
                    }
                    DbService.add('custsett', aux);
                }, function(error) {});
                tx.executeSql('SELECT * FROM ResourcesTable', [], function(tx, rs) {
                    aux = [];
                    for (var i = 0; i < rs.rows.length; i++) {
                        aux.push(rs.rows.item(i));
                    }
                    console.log("RESOURCES ADEED:");
                    console.log(aux);
                    DbService.add('resources', aux);
                }, function(error) {});
                tx.executeSql('SELECT * FROM UnitTable', [], function(tx, rs) {
                    aux = [];
                    for (var i = 0; i < rs.rows.length; i++) {
                        aux.push(rs.rows.item(i));
                    }
                    DbService.add('unit', aux);
                }, function(error) {});
                tx.executeSql('SELECT * FROM StaffTable', [], function(tx, rs) {
                    aux = [];
                    for (var i = 0; i < rs.rows.length; i++) {
                        aux.push(rs.rows.item(i));
                    }
                    DbService.add('staff', aux);
                }, function(error) {});
                tx.executeSql('SELECT * FROM ResourceTypeTable', [], function(tx, rs) {
                    aux = [];
                    for (var i = 0; i < rs.rows.length; i++) {
                        aux.push(rs.rows.item(i));
                    }
                    DbService.add('resource_type', aux);
                }, function(error) {});
                tx.executeSql('SELECT * FROM AbsenteeismTable', [], function(tx, rs) {
                    aux = [];
                    for (var i = 0; i < rs.rows.length; i++) {
                        aux.push(rs.rows.item(i));
                    }
                    DbService.add('absenteeism', aux);
                }, function(error) {});
            });
            $state.go('app.categories', {
                'projectId': $rootScope.projectId
            });
        };

        var close = function() {
            var ppremember = localStorage.getObject('ppremember');
            if (ppremember) {
                localStorage.clear();
                localStorage.setObject('ppremember', ppremember)
            }
        };
        var asyncCall = function(listOfPromises, onErrorCallback, finalCallback) {
            listOfPromises = listOfPromises || [];
            onErrorCallback = onErrorCallback || angular.noop;
            finalCallback = finalCallback || angular.noop;
            var newListOfPromises = listOfPromises.map(function(promise) {
                return promise.catch(function(reason) {
                    onErrorCallback(reason);
                    return {
                        'rejected_status': reason.status
                    };
                });
            });
            $q.all(newListOfPromises).then(finalCallback, function(result) {
                console.log(result)
            }, function(result) {
                console.log(result)
            });
        };

        service.sync = function() {
            $timeout(function() {
                if (navigator.onLine) {
                    getme()
                        .success(function(data) {
                            localStorage.setObject("ppuser", data)
                            AuthService.version().then(function(result) {
                                if (!localStorage.getItem('ppversion') || localStorage.getItem('ppversion') < result) {
                                    $state.go('app.categories', {
                                        'projectId': $rootScope.projectId
                                    });
                                    DbService.popopen('Sync', "<center><ion-spinner icon='android'></ion-spinner></center>", true)
                                    down();
                                } else {
                                    load();
                                    DbService.popclose();
                                }
                            })
                        })
                        .error(function(data, status) {
                            if (navigator.onLine) {
                                if (status === 403) {
                                    var user = localStorage.getObject('ppremember');
                                    if (user) {
                                        $state.go('app.categories', {
                                            'projectId': $rootScope.projectId
                                        });
                                        DbService.popopen('Sync', "<center><ion-spinner icon='android'></ion-spinner></center>", true)
                                        setme(user)
                                            .success(function(user) {
                                                $rootScope.currentUser = {
                                                    id: user.data.id,
                                                    username: user.data.username,
                                                    role_id: user.data.role.id,
                                                    role_title: user.data.role.title,
                                                    active: user.data.active
                                                };
                                                down();
                                            }).error(function() {
                                                DbService.popclose();
                                            })
                                    }
                                } else {
                                    load();
                                    DbService.popclose();
                                }
                            } else {
                                load();
                                DbService.popclose();
                            }
                        })
                } else {
                    if (localStorage.getObject('ppremember')) {
                        load();
                        DbService.popclose();
                    }
                }
            });
        };
        service.sync_button = function() {
            var defer = $q.defer();
            $timeout(function() {
                if (navigator.onLine) {
                    getme()
                        .success(function(data) {
                            localStorage.setObject("ppuser", data);
                            down(defer);
                            $state.go('app.categories', {
                                'projectId': $rootScope.projectId
                            });
                        })
                        .error(function(data, status) {
                            if (navigator.onLine) {
                                if (status === 403) {
                                    var user = localStorage.getObject('ppremember');
                                    if (user) {
                                        $state.go('app.categories', {
                                            'projectId': $rootScope.projectId
                                        });
                                        setme(user)
                                            .success(function(user) {
                                                $rootScope.currentUser = {
                                                    id: user.data.id,
                                                    username: user.data.username,
                                                    role_id: user.data.role.id,
                                                    role_title: user.data.role.title,
                                                    active: user.data.active
                                                };
                                                down(defer);
                                            }).error(function() {
                                                defer.resolve();
                                            })
                                    } else {
                                        defer.resolve();
                                    }
                                } else {
                                    load();
                                    defer.resolve();
                                }
                            } else {
                                load();
                                defer.resolve();
                            }
                        })
                } else {
                    load();
                    defer.resolve()
                }
            });
            return defer.promise;
        };
        service.sync_local = function() {
            testConnection()
            load();
        }
        service.sync_force = function() {
            $timeout(function() {
                down()
            });
        };
        service.sync_close = function() {
            close();
        };

    }
]);
