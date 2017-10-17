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

        //get data from server
        var syncData = function() {
            var deferred = $q.defer();
            AuthService.version().then(function(result) {
                localStorage.setObject('ppversion', result);
            });

            var formsToSync = angular.copy(localStorage.getObject('ppfsync')),
                picsToSync = angular.copy(localStorage.getObject('pppsync'));
            localStorage.removeItem('ppfsync');
            localStorage.removeItem('pppsync');

            //method to get items from server from the given url and store them in local db, in the table given by tableName
            var storeToLocalDb = function(url, tableName, order) {
                    var prm = $q.defer();
                    PostService.post({
                        method: 'GET',
                        url: url
                    }, function(result) {
                        var fields = '',
                            values = [],
                            temp = [],
                            q = '';
                        if (order) {
                            //order the resources
                            result = orderBy(result.data, 'name');
                        }
                        // DbService.add('custsett', result.data);
                        $APP.db.transaction(function(tx) {
                            for (var key in result.data[0]) {
                                temp.push(key);
                                q += '?,';
                            }
                            q = q.substr(0, q.length - 1);
                            fields = temp.join();
                            tx.executeSql('DROP TABLE IF EXISTS ' + tableName);
                            tx.executeSql('CREATE TABLE IF NOT EXISTS ' + tableName + ' (' + fields + ')');
                            angular.forEach(result.data, function(res) {
                                values = [];
                                for (var key in res) {
                                    values.push(res[key]);
                                }
                                tx.executeSql('INSERT INTO ' + tableName + ' VALUES (' + q + ')', values);
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
                },

                //Method to get designs from server and store them in local db
                designs = function() {
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
                },

                //Method to get projects from server and store them in local db
                projects = function() {
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
                },

                //Method to add the offline comppleted forms to server
                addForms = function(forms, pics) {
                    var prm = $q.defer(),
                        count = 0;
                    //no forms to add
                    if (!forms || forms && !forms.length) {
                        prm.resolve();
                        return prm.promise;
                    }

                    //method to add the given items to server
                    var addItemsToServer = function(items, field_id, url) {
                            var d = $q.defer(),
                                cnt = 0;
                            if (!items || items && !items.length) {
                                d.resolve();
                            }
                            angular.forEach(items, function(item) {
                                PostService.post({
                                    method: 'POST',
                                    url: url,
                                    data: item
                                }, function(x) {
                                    field_id = x.data.id; //TODO: it keeps only the last value
                                    if (cnt >= items.length) {
                                        d.resolve();
                                    }
                                }, function(err) {
                                    if (cnt >= items.length) {
                                        d.resolve();
                                    }
                                });
                            })
                            return d.promise;
                        },
                        //method to upload images to server
                        uploadImages = function(imgs, formId, projectId) {
                            var def = defer(),
                                cnt = 0;
                            if (!imgs.length)
                                def.resolve();
                            angular.forEach(imgs, function(img) {
                                img.id = 0;
                                img.formInstanceId = formId;
                                img.projectId = projectId;
                                PostService.post({
                                    method: 'POST',
                                    url: 'defectphoto/uploadfile',
                                    data: img,
                                }, function(payload) {
                                    cnt++;
                                    if (cnt >= imgs.length) {
                                        def.resolve();
                                    }
                                }, function(err) {
                                    cnt++;
                                    if (cnt >= imgs.length) {
                                        def.resolve();
                                    }
                                });
                            })
                            return def.promise;
                        };

                    angular.forEach(forms, function(form) {
                        //add all special fields for the given form
                        var resourcePrm = addItemsToServer(formsToAdd.resourceField, formsToAdd.resource_field_id, 'resourcefield'),
                            staffPrm = addItemsToServer(formsToAdd.staffField, formsToAdd.staff_field_id, 'stafffield'),
                            schedulePrm = addItemsToServer(formsToAdd.schedField, formsToAdd.scheduling_field_id, 'schedulingfield'),
                            payitemPrm = addItemsToServer(formsToAdd.payitemField, formsToAdd.pay_item_field_id, 'payitemfield');

                        Promise.all([resourcePrm, staffPrm, schedulePrm, payitemPrm]).then(function(res) {
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
                                var formsToAdd = angular.copy(formX),
                                    picsToAdd = angular.copy(picX);

                                //add form to server
                                PostService.post({
                                    method: 'POST',
                                    url: 'forminstance',
                                    data: formsToAdd
                                }, function(res) {
                                    uploadImages(picsToAdd, res.data.id, formsToAdd.project_id).then(function(r) {
                                        count++;
                                        if (count >= forms.length) {
                                            prm.resolve();
                                        }
                                    })
                                }, function(err) {
                                    count++;
                                    if (count >= forms.length) {
                                        prm.resolve();
                                    }
                                });

                            }
                        })
                    });
                    return prm.promise;
                }

            var formsPrm = addForms(formsToSync, picsToSync),
                resources = storeToLocalDb('resource', 'ResourcesTable', true),
                payitems = storeToLocalDb('payitem', 'PayitemsTable'),
                unit = storeToLocalDb('unit', 'UnitTable'),
                staff = storeToLocalDb('staff', 'StaffTable'),
                resourceType = storeToLocalDb('resourcetype', 'ResourceTypeTable'),
                absenteeism = storeToLocalDb('absenteeismreasons/list', 'AbsenteeismTable'),
                custsett = storeToLocalDb('companysettings', 'CustsettTable');

            Promise.all([resources, unit, staff, resourceType, absenteeism, payitems, designs, projects, custsett, formsPrm]).then(function(res) {
                DbService.popclose(); //TODO: not
                deferred.resolve();
            })
            return deferred.promise;
        };

        //store data locally
        var loadFromLocalDb = function() {
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

        service.sync = function(isInit) {
            var defer = $q.defer();
            $timeout(function() {
                if (navigator.onLine) {
                    getme()
                        .success(function(data) {
                            localStorage.setObject("ppuser", data);
                            if (isInit) {
                                AuthService.version().then(function(result) {
                                    if (!localStorage.getItem('ppversion') || localStorage.getItem('ppversion') < result) {
                                        DbService.popopen('Sync', "<center><ion-spinner icon='android'></ion-spinner></center>", true);
                                        syncData().then(function(res) {
                                            $state.go('app.categories', {
                                                'projectId': $rootScope.projectId
                                            });
                                            defer.resolve();
                                        })
                                    } else {
                                        loadFromLocalDb();
                                        DbService.popclose();
                                        defer.resolve();
                                    }
                                })
                            } else {
                                syncData().then(function(res) {
                                    $state.go('app.categories', {
                                        'projectId': $rootScope.projectId
                                    });
                                    defer.resolve();
                                })
                            }
                        })
                        .error(function(data, status) {
                            if (navigator.onLine && status === 403) {
                                var user = localStorage.getObject('ppremember');
                                if (user) {
                                    $state.go('app.categories', {
                                        'projectId': $rootScope.projectId
                                    });
                                    if (isInit) {
                                        DbService.popopen('Sync', "<center><ion-spinner icon='android'></ion-spinner></center>", true); //TODO: check if needed and close it everywhere
                                    }
                                    setme(user).success(function(user) {
                                        $rootScope.currentUser = {
                                            id: user.data.id,
                                            username: user.data.username,
                                            role_id: user.data.role.id,
                                            role_title: user.data.role.title,
                                            active: user.data.active
                                        };
                                        syncData().then(function(res) {
                                            defer.resolve();
                                        })
                                    }).error(function() {
                                        DbService.popclose();
                                        defer.resolve();
                                    })
                                } else {
                                    defer.resolve();
                                }
                            } else {
                                loadFromLocalDb();
                                DbService.popclose();
                                defer.resolve();
                            }
                        })
                } else {
                    // if (!isInit || localStorage.getObject('ppremember')) {
                    loadFromLocalDb();
                    DbService.popclose(); //if isInit
                    defer.resolve();
                    // }
                }
            });
            return defer.promise;
        };

        service.sync_close = function() {
            var ppremember = localStorage.getObject('ppremember');
            if (ppremember) {
                localStorage.clear();
                localStorage.setObject('ppremember', ppremember);
            }
        };
    }
]);
