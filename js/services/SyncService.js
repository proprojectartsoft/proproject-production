angular.module($APP.name).factory('SyncService', [
    '$q',
    '$rootScope',
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

    function($q, $rootScope, $http, $timeout, $cordovaSQLite, $interval, DbService, ResourceService, ProjectService, FormDesignService, UserService, AuthService, $ionicPopup, $rootScope, $state, FormInstanceService, StaffService,
        SchedulingService, PayitemService, orderBy) {
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
        }
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
        }

        var addSpecialFields = function(formsToAdd) {
            var def = $q.defer();
            var resourceOK = false,
                staffOK = false,
                schedulingOK = false,
                payOK = false;
            if (!formsToAdd.resourceField && !formsToAdd.staffField && !formsToAdd.payitemField && !formsToAdd.schedField)
                def.resolve();
            if (!formsToAdd.resourceField || formsToAdd.resourceField.length == 0)
                resourceOK = true;
            if (!formsToAdd.staffField || formsToAdd.staffField.length == 0)
                staffOK = true;
            if (!formsToAdd.schedField || formsToAdd.schedField.length == 0)
                schedulingOK = true;
            if (!formsToAdd.payitemField || formsToAdd.payitemField.length == 0)
                payOK = true;

            angular.forEach(formsToAdd.resourceField, function(resField) {
                ResourceService.add_field(resField).success(function(x) {
                    formsToAdd.resource_field_id = x.id;
                    if (formsToAdd.resourceField[formsToAdd.resourceField.length - 1] == resField)
                        resourceOK = true;
                    if (resourceOK && staffOK && schedulingOK && payOK) {
                        def.resolve();
                    }
                }).error(function(err) {
                    if (formsToAdd.resourceField[formsToAdd.resourceField.length - 1] == resField)
                        resourceOK = true;
                    if (resourceOK && staffOK && schedulingOK && payOK) {
                        def.resolve();
                    }
                });
            })
            angular.forEach(formsToAdd.staffField, function(staff) {
                StaffService.add_field(staff).success(function(x) {
                    formsToAdd.staff_field_id = x.id;
                    if (formsToAdd.staffField[formsToAdd.staffField.length - 1] == staff)
                        staffOK = true;
                    if (resourceOK && staffOK && schedulingOK && payOK) {
                        def.resolve();
                    }
                }).error(function(err) {
                    if (formsToAdd.staffField[formsToAdd.staffField.length - 1] == staff)
                        staffOK = true;
                    if (resourceOK && staffOK && schedulingOK && payOK) {
                        def.resolve();
                    }
                });
            })
            angular.forEach(formsToAdd.payitemField, function(pay) {
                PayitemService.add_field(pay).success(function(x) {
                    formsToAdd.pay_item_field_id = x.id;
                    if (formsToAdd.payitemField[formsToAdd.payitemField.length - 1] == pay)
                        payOK = true;
                    if (resourceOK && staffOK && schedulingOK && payOK) {
                        def.resolve();
                    }
                }).error(function(err) {
                    if (formsToAdd.payitemField[formsToAdd.payitemField.length - 1] == pay)
                        payOK = true;
                    if (resourceOK && staffOK && schedulingOK && payOK) {
                        def.resolve();
                    }
                });
            })
            angular.forEach(formsToAdd.schedField, function(sched) {
                SchedulingService.add_field(sched).success(function(x) {
                    formsToAdd.scheduling_field_id = x.id;
                    if (formsToAdd.schedField[formsToAdd.schedField.length - 1] == sched)
                        schedulingOK = true;
                    if (resourceOK && staffOK && schedulingOK && payOK) {
                        def.resolve();
                    }
                }).error(function(err) {
                    if (formsToAdd.schedField[formsToAdd.schedField.length - 1] == sched)
                        schedulingOK = true;
                    if (resourceOK && staffOK && schedulingOK && payOK) {
                        def.resolve();
                    }
                });
            })
            return def.promise;
        }
        //get data from server
        var down = function(defer) {
            AuthService.version().then(function(result) {
                localStorage.setObject('ppversion', result);
            })
            //Designs
            var designs = function() {
                var obj = new servresp('designs', 0, []);
                var ping = $interval(function() {
                    obj.timer += 1;
                }, 1);
                return FormDesignService.list_mobile().then(function(result) {
                    if (result) {
                        $interval.cancel(ping)
                        obj.response = result;
                        $APP.db.transaction(function(tx) {
                            tx.executeSql('DROP TABLE IF EXISTS DesignsTable');
                            tx.executeSql('CREATE TABLE IF NOT EXISTS DesignsTable (id int primary key, name text, guidance text, category_id int, permission int, data text)');
                            console.log("DESIGNS:");
                            console.log(result);
                            angular.forEach(result, function(form) {
                                tx.executeSql('INSERT INTO DesignsTable VALUES (?,?,?,?,?,?)', [form.id, form.name, form.guidance, form.category_id, form.permission, JSON.stringify(form)]);
                            });
                        }, function(error) {
                            console.log('Transaction ERROR: ' + error.message);
                        }, function() {});
                        return obj;
                    }
                });
            }
            //Projects
            var projects = function() {
                var obj = new servresp('projects', 0, []);
                var ping = $interval(function() {
                    obj.timer += 1;
                }, 1);
                return ProjectService.list_with_settings(true).then(function(result) {
                    if (result) {
                        DbService.add('projects', result);
                        $interval.cancel(ping)
                        obj.response = result;
                        var id = localStorage.getObject('ppprojectId');
                        var name = localStorage.getObject('ppnavTitle');
                        var sw = false;
                        $rootScope.projects = result;
                        if (id && name) {
                            angular.forEach(result, function(proj) {
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
                            if (result.length) {
                                auxTitle = result[0]
                            }
                            $rootScope.navTitle = auxTitle.name;
                            $rootScope.projectId = auxTitle.id;
                            localStorage.setObject('ppnavTitle', auxTitle.name);
                            localStorage.setObject('ppprojectId', auxTitle.id);
                        }
                        $APP.db.transaction(function(tx) {
                            tx.executeSql('DROP TABLE IF EXISTS ProjectsTable');
                            tx.executeSql('CREATE TABLE IF NOT EXISTS ProjectsTable (id int primary key, name text)');
                            console.log("PROJECTS:");
                            console.log(result);
                            angular.forEach(result, function(project) {
                                tx.executeSql('INSERT INTO ProjectsTable VALUES (?,?)', [project.id, project.name]);
                            });
                        }, function(error) {
                            console.log('Transaction ERROR: ' + error.message);
                        }, function() {});
                        return obj;
                    }
                });
            }
            //Designs
            var custsett = function() {
                var obj = new servresp('custsett', 0, []);
                var ping = $interval(function() {
                    obj.timer += 1;
                }, 1);
                return UserService.cust_settings().then(function(result) {
                    if (result) {
                        DbService.add('custsett', result);
                        $interval.cancel(ping)
                        obj.response = result;
                        $APP.db.transaction(function(tx) {
                            tx.executeSql('DROP TABLE IF EXISTS CustsettTable');
                            tx.executeSql('CREATE TABLE IF NOT EXISTS CustsettTable (id int primary key, name text, value text)');
                            console.log("CUST SETT:");
                            console.log(result);
                            angular.forEach(result, function(sett) {
                                tx.executeSql('INSERT INTO CustsettTable VALUES (?,?,?)', [sett.id, sett.name, sett.value]);
                            });
                        }, function(error) {
                            console.log('Transaction ERROR: ' + error.message);
                        }, function() {});
                        return obj;
                    }
                });
            }

            var resources = function() {
                var obj = new servresp('resources', 0, []);
                var ping = $interval(function() {
                    obj.timer += 1;
                }, 1);
                return ResourceService.list_manager().then(function(result) {
                    if (result) {
                        //order the resources
                        var result = orderBy(result, 'name');
                        DbService.add('resources', result);
                        $interval.cancel(ping)
                        obj.response = result;
                        $APP.db.transaction(function(tx) {
                            tx.executeSql('DROP TABLE IF EXISTS ResourcesTable');
                            tx.executeSql('CREATE TABLE IF NOT EXISTS ResourcesTable (id int primary key, name text, product_ref text, direct_cost int)');
                            console.log("RESOURCES:");
                            console.log(result);
                            angular.forEach(result, function(res) {
                                tx.executeSql('INSERT INTO ResourcesTable VALUES (?,?,?,?)', [res.id, res.name, res.product_ref, res.direct_cost]);
                            });
                        }, function(error) {
                            console.log('Transaction ERROR: ' + error.message);
                        }, function() {});
                        return obj;
                    }
                });
            }
            var unit = function() {
                var obj = new servresp('unit', 0, []);
                var ping = $interval(function() {
                    obj.timer += 1;
                }, 1);
                return ResourceService.list_unit().then(function(result) {
                    if (result) {
                        DbService.add('unit', result);
                        $interval.cancel(ping)
                        obj.response = result;
                        // $rootScope.unit_list = result;
                        $APP.db.transaction(function(tx) {
                            tx.executeSql('DROP TABLE IF EXISTS UnitTable');
                            tx.executeSql('CREATE TABLE IF NOT EXISTS UnitTable (id int primary key, name text, type text)');
                            console.log("UNIT:");
                            console.log(result);
                            angular.forEach(result, function(unit) {
                                tx.executeSql('INSERT INTO UnitTable VALUES (?,?,?)', [unit.id, unit.name, unit.type]);
                            });
                        }, function(error) {
                            console.log('Transaction ERROR: ' + error.message);
                        }, function() {});
                        return obj;
                    }
                });
            }
            var staff = function() {
                var obj = new servresp('staff', 0, []);
                var ping = $interval(function() {
                    obj.timer += 1;
                }, 1);
                return StaffService.list_manager().then(function(result) {
                    if (result) {
                        //order the resources
                        var result = orderBy(result, 'name');
                        DbService.add('staff', result);
                        $interval.cancel(ping)
                        obj.response = result;
                        $APP.db.transaction(function(tx) {
                            tx.executeSql('DROP TABLE IF EXISTS StaffTable');
                            tx.executeSql('CREATE TABLE IF NOT EXISTS StaffTable (id int primary key, name text, role text, employer_name text, direct_cost int, unit_name text, unit_id int, resource_type text, resource_id int)');
                            console.log("STAFF:");
                            console.log(result);
                            angular.forEach(result, function(res) {
                                tx.executeSql('INSERT INTO StaffTable VALUES (?,?,?,?,?,?,?,?,?)', [res.id, res.name, res.role, res.employer_name, res.direct_cost, res.unit_name, res.unit_id, res.resource_type, res.resource_id]);
                            });
                        }, function(error) {
                            console.log('Transaction ERROR: ' + error.message);
                        }, function() {});
                        return obj;
                    }
                });
            }
            var resourceType = function() {
                var obj = new servresp('resource_type', 0, []);
                var ping = $interval(function() {
                    obj.timer += 1;
                }, 1);
                return ResourceService.list_resourcetype().then(function(result) {
                    if (result) {
                        DbService.add('resource_type', result);
                        $interval.cancel(ping)
                        obj.response = result;
                        $APP.db.transaction(function(tx) {
                            tx.executeSql('DROP TABLE IF EXISTS ResourceTypeTable');
                            tx.executeSql('CREATE TABLE IF NOT EXISTS ResourceTypeTable (id int primary key, name text)');
                            angular.forEach(result, function(res) {
                                tx.executeSql('INSERT INTO ResourceTypeTable VALUES (?,?)', [res.id, res.name]);
                            });
                        }, function(error) {
                            console.log('Transaction ERROR: ' + error.message);
                        }, function() {});
                        return obj;
                    }
                });
            }
            var absenteeism = function() {
                var obj = new servresp('absenteeism', 0, []);
                var ping = $interval(function() {
                    obj.timer += 1;
                }, 1);
                return ResourceService.list_absenteeism().then(function(result) {
                    if (result) {
                        DbService.add('absenteeism', result);
                        $interval.cancel(ping)
                        obj.response = result;
                        $APP.db.transaction(function(tx) {
                            tx.executeSql('DROP TABLE IF EXISTS AbsenteeismTable');
                            tx.executeSql('CREATE TABLE IF NOT EXISTS AbsenteeismTable (id int primary key, reason text)');
                            angular.forEach(result, function(res) {
                                tx.executeSql('INSERT INTO AbsenteeismTable VALUES (?,?)', [res.id, res.reason]);
                            });
                        }, function(error) {
                            console.log('Transaction ERROR: ' + error.message);
                        }, function() {});
                        return obj;
                    }
                });
            }
            var doRequest = [designs(), projects(), custsett(), resources(), unit(), staff(), resourceType(), absenteeism()]

            forms = localStorage.getObject('ppfsync');
            pics = localStorage.getObject('pppsync');

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
                            asyncCall(doRequest,
                                function error(result) {
                                    console.log('Some error occurred, but we get going:', result);
                                    if (defer)
                                        defer.resolve();
                                    DbService.popclose(); //TODO: not
                                },
                                function success(result) {
                                    if (defer)
                                        defer.resolve();
                                    DbService.popclose();
                                }
                            );
                        }
                    })
                });
            } else {
                asyncCall(doRequest,
                    function error(result) {
                        if (defer)
                            defer.resolve();
                        DbService.popclose(); //TODO: not
                        console.log('Some error occurred, but we get going:', result);
                    },
                    function success(result) {
                        if (defer)
                            defer.resolve();
                        DbService.popclose();
                    }
                );
            }
        }
        //store data locally
        var load = function() {
            var aux;
            //Select the form templates
            $APP.db.executeSql('SELECT * FROM DesignsTable', [], function(rs) {
                aux = [];
                for (var i = 0; i < rs.rows.length; i++) {
                    aux.push(JSON.parse(rs.rows.item(i).data));
                }
            }, function(error) {});
            //Select projects
            $APP.db.executeSql('SELECT * FROM ProjectsTable', [], function(rs) {
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
            $APP.db.executeSql('SELECT * FROM CustsettTable', [], function(rs) {
                aux = [];
                for (var i = 0; i < rs.rows.length; i++) {
                    aux.push(rs.rows.item(i));
                }
                DbService.add('custsett', aux);
            }, function(error) {});
            $APP.db.executeSql('SELECT * FROM ResourcesTable', [], function(rs) {
                aux = [];
                for (var i = 0; i < rs.rows.length; i++) {
                    aux.push(rs.rows.item(i));
                }
                DbService.add('resources', aux);
            }, function(error) {});
            $APP.db.executeSql('SELECT * FROM UnitTable', [], function(rs) {
                aux = [];
                for (var i = 0; i < rs.rows.length; i++) {
                    aux.push(rs.rows.item(i));
                }
                DbService.add('unit', aux);
            }, function(error) {});
            $APP.db.executeSql('SELECT * FROM StaffTable', [], function(rs) {
                aux = [];
                for (var i = 0; i < rs.rows.length; i++) {
                    aux.push(rs.rows.item(i));
                }
                DbService.add('staff', aux);
            }, function(error) {});
            $APP.db.executeSql('SELECT * FROM ResourceTypeTable', [], function(rs) {
                aux = [];
                for (var i = 0; i < rs.rows.length; i++) {
                    aux.push(rs.rows.item(i));
                }
                DbService.add('resource_type', aux);
            }, function(error) {});
            $APP.db.executeSql('SELECT * FROM AbsenteeismTable', [], function(rs) {
                aux = [];
                for (var i = 0; i < rs.rows.length; i++) {
                    aux.push(rs.rows.item(i));
                }
                DbService.add('absenteeism', aux);
            }, function(error) {});
            $state.go('app.categories', {
                'projectId': $rootScope.projectId
            });
        }
        var close = function() {
            var ppremember = localStorage.getObject('ppremember');
            if (ppremember) {
                localStorage.clear();
                localStorage.setObject('ppremember', ppremember)
            }
        }
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
        }
        return {
            sync: function() {
                console.log("SYNC IS EXECUTED");
                $timeout(function() {
                    if (navigator.onLine) {
                        console.log("ONLINE");
                        getme()
                            .success(function(data) {
                                console.log("SUCCESS");
                                localStorage.setObject("ppuser", data)
                                AuthService.version().then(function(result) {
                                    if (!localStorage.getItem('ppversion') || localStorage.getItem('ppversion') < result) {
                                        $state.go('app.categories', {
                                            'projectId': $rootScope.projectId
                                        });
                                        DbService.popopen('Sync', "<center><ion-spinner icon='android'></ion-spinner></center>", true)
                                        down();
                                    } else {
                                        console.log("JUST LOAD");
                                        $state.go('app.categories', {
                                            'projectId': $rootScope.projectId
                                        });
                                        load();
                                        DbService.popclose();
                                    }
                                })
                            })
                            .error(function(data, status) {
                              console.log("ERROR GETME");
                                if (navigator.onLine) {
                                    if (status === 403) {
                                        var user = localStorage.getObject('ppremember');
                                        console.log(user);
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
            },
            sync_button: function() {
                var defer = $q.defer();
                $timeout(function() {
                    if (navigator.onLine) {
                        $state.go('app.categories', {
                            'projectId': $rootScope.projectId
                        });
                        DbService.popopen('Sync', "<center><ion-spinner icon='android'></ion-spinner></center>", true)
                        getme()
                            .success(function(data) {
                                localStorage.setObject("ppuser", data);
                                down(defer);
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
                                                    DbService.popclose();
                                                    defer.resolve();
                                                })
                                        } else {
                                            DbService.popclose();
                                            defer.resolve();
                                        }
                                    } else {
                                        load();
                                        defer.resolve();
                                        DbService.popclose();
                                    }
                                } else {
                                    load();
                                    defer.resolve();
                                    DbService.popclose();
                                }
                            })
                    } else {
                        load();
                        defer.resolve()
                        DbService.popclose();
                    }
                });
                return defer.promise;
            },
            sync_local: function() {
                testConnection()
                load();
            },
            sync_force: function() {
                $timeout(function() {
                    down()
                });
            },
            sync_close: function() {
                close();
            }
        }
    }
]);
