ppApp.service('SyncService', [
    '$q',
    '$http',
    '$timeout',
    '$cordovaSQLite',
    '$interval',
    'AuthService',
    '$rootScope',
    'orderByFilter',
    'PostService',
    '$filter',

    function($q, $http, $timeout, $cordovaSQLite, $interval, AuthService, $rootScope, orderBy, PostService, $filter) {
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
            AuthService.version().success(function(result) {
                localStorage.setObject('ppversion', result);
            });

            var formsToSync = angular.copy(localStorage.getObject('ppfsync')),
                picsToSync = angular.copy(localStorage.getObject('pppsync'));
            localStorage.removeItem('ppfsync');
            localStorage.removeItem('pppsync');

            //method to get items from server from the given url and store them in local db, in the table given by tableName
            var storeToLocalDb = function(data, tableName, order) {
                    var prm = $q.defer();
                    PostService.post(data, function(result) {
                        var fields = '',
                            values = [],
                            temp = [],
                            q = '';
                        if (order) {
                            //order the resources
                            result.data = orderBy(result.data, 'name');
                        }
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
                            prm.resolve();
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
                        //prepare project to be stored in local db
                        var temp = [],
                            fields = '',
                            values = [],
                            q = '',
                            qs = '';
                        //make a list with all fields of the first project
                        for (var key in result.data[0]) {
                            if (key == 'settings') {
                                //add project's settings fields
                                for (var subkey in result.data[0][key]) {
                                    temp.push(result.data[0][key][subkey].name);
                                    q += '?,';
                                }
                            } else {
                                //add project's fields
                                temp.push(key);
                                q += '?,';
                            }
                        }
                        q = q.substr(0, q.length - 1);
                        fields = temp.join();

                        $APP.db.transaction(function(tx) {
                            tx.executeSql('DROP TABLE IF EXISTS ProjectsTable');
                            tx.executeSql('CREATE TABLE IF NOT EXISTS ProjectsTable (' + fields + ')');
                            angular.forEach(result.data, function(res) {
                                values = [];
                                for (var key in res) {
                                    if (key == 'settings') {
                                        for (var subkey in res[key]) {
                                            values.push(res[key][subkey].value);
                                        }
                                    } else {
                                        values.push(res[key]);
                                    }
                                }
                                tx.executeSql('INSERT INTO ProjectsTable VALUES (' + q + ')', values);
                            });
                            prm.resolve();
                        }, function(error) {
                            console.log('Transaction ERROR: ' + error.message);
                            prm.resolve();
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
                    var addItemsToServer = function(form, field, url) {
                            var d = $q.defer(),
                                cnt = 0,
                                items = [],
                                field_id = "";
                            switch (field) {
                                case 'resource':
                                    items = form.resourceField;
                                    field_id = "resource_field_id";
                                    break;
                                case 'staff':
                                    items = form.staffField;
                                    field_id = "staff_field_id";
                                    break;
                                case 'payitem':
                                    items = form.payitemField;
                                    field_id = "pay_item_field_id";
                                    break;
                                case 'sched':
                                    items = form.schedField;
                                    field_id = "scheduling_field_id";
                                    break
                            }
                            if (!items || items && !items.length) {
                                d.resolve();
                            }
                            angular.forEach(items, function(item) {
                                PostService.post({
                                    method: 'POST',
                                    url: url,
                                    data: item
                                }, function(x) {
                                    cnt++;
                                    form[field_id] = x.data.id; //TODO: it keeps only the last value
                                    if (cnt >= items.length) {
                                        d.resolve();
                                    }
                                }, function(err) {
                                    cnt++;
                                    if (cnt >= items.length) {
                                        d.resolve();
                                    }
                                });
                            })
                            return d.promise;
                        },
                        //method to upload images to server
                        uploadImages = function(imgs, formId, projectId) {
                            var def = $q.defer(),
                                cnt = 0;
                            if (!imgs.length)
                                def.resolve();
                            angular.forEach(imgs, function(img) {
                                img.id = 0;
                                img.formInstanceId = formId;
                                img.projectId = projectId;
                                PostService.post({
                                    method: 'POST',
                                    url: 'image/uploadfile',
                                    data: img,
                                    withCredentials: true
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
                        var resourcePrm = addItemsToServer(form.form, 'resource', 'resourcefield'),
                            staffPrm = addItemsToServer(form.form, 'staff', 'stafffield'),
                            schedulePrm = addItemsToServer(form.form, 'sched', 'schedulingfield'),
                            payitemPrm = addItemsToServer(form.form, 'payitem', 'payitemfield');

                        Promise.all([resourcePrm, staffPrm, schedulePrm, payitemPrm]).then(function(res) {
                            form.form.resourceField = [];
                            form.form.staffField = [];
                            form.form.schedField = [];
                            form.form.payitemField = [];
                            var picsToAdd = [];
                            var temp = $filter('filter')(pics, {
                                id: form.id
                            });
                            if (temp && temp.length) {
                                picsToAdd = temp[0].imgs;
                            }

                            //add form to server
                            PostService.post({
                                method: 'POST',
                                url: 'forminstance',
                                data: form.form
                            }, function(res) {
                                //mixpanel people proprieties
                                mixpanel.people.increment('Forms completed: PP app', 1);
                                uploadImages(picsToAdd, res.data.id, form.form.project_id).then(function(r) {
                                    count++;
                                    //mixpanel people proprieties
                                    mixpanel.people.increment('Images uploaded: PP app', 1);
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
                        })
                    });
                    return prm.promise;
                }

            PostService.post({
                method: 'GET',
                url: 'companysettings'
            }, function(result) {
                var fields = '',
                    values = [],
                    temp = [],
                    q = '',
                    customerId = result.data[0].customer_id || 0;

                $APP.db.transaction(function(tx) {
                    for (var key in result.data[0]) {
                        temp.push(key);
                        q += '?,';
                    }
                    q = q.substr(0, q.length - 1);
                    fields = temp.join();
                    tx.executeSql('DROP TABLE IF EXISTS CustsettTable');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS CustsettTable (' + fields + ')');
                    angular.forEach(result.data, function(res) {
                        values = [];
                        for (var key in res) {
                            values.push(res[key]);
                        }
                        tx.executeSql('INSERT INTO CustsettTable VALUES (' + q + ')', values);
                    });

                    var formsPrm = addForms(formsToSync, picsToSync),
                        resources = storeToLocalDb({
                            method: 'GET',
                            url: 'resource'
                        }, 'ResourcesTable', true),
                        payitems = storeToLocalDb({
                            method: 'GET',
                            url: 'payitem'
                        }, 'PayitemsTable'),
                        unit = storeToLocalDb({
                            method: 'GET',
                            url: 'unit'
                        }, 'UnitTable'),
                        staff = storeToLocalDb({
                            method: 'GET',
                            url: 'staff'
                        }, 'StaffTable'),
                        resourceType = storeToLocalDb({
                            method: 'GET',
                            url: 'resourcetype',
                            params: {
                                customerId: customerId
                            }
                        }, 'ResourceTypeTable'),
                        absenteeism = storeToLocalDb({
                            method: 'GET',
                            url: 'absenteeismreasons/list',
                            params: {
                                customerId: customerId
                            }
                        }, 'AbsenteeismTable'),
                        projPrm = projects(),
                        designsPrm = designs();

                    Promise.all([resources, unit, staff, resourceType, absenteeism, payitems, designsPrm, projPrm, formsPrm]).then(function(res) {
                        deferred.resolve();
                    })
                }, function(error) {
                    console.log('Transaction ERROR: ' + error.message);
                });
            }, function(err) {})



            // custsett = storeToLocalDb({
            //     method: 'GET',
            //     url: 'companysettings'
            // }, 'CustsettTable').then(function(res) {
            //     Promise.all([resources, unit, staff, resourceType, absenteeism, payitems, designsPrm, projPrm, formsPrm]).then(function(res) {
            //         deferred.resolve();
            //     })
            // })

            return deferred.promise;
        };

        service.getSettings = function() {
            var settings = {},
                prm = $q.defer();
            $APP.db.transaction(function(tx) {
                //Select customer settings: currency, start, finish, break
                var getSetting = function(table, setting) {
                    var def = $q.defer(),
                        aux = [];
                    tx.executeSql('SELECT * FROM ' + table, [], function(tx, rs) {
                        for (var i = 0; i < rs.rows.length; i++) {
                            aux.push(rs.rows.item(i));
                        }
                        setting = aux;
                        def.resolve(aux);
                    }, function(error) {
                        def.reject("Could not load data from local db.");
                    });
                    return def.promise;
                };

                var settPrm = getSetting('CustsettTable').then(function(res) {
                        settings.custsett = res;
                    }),
                    resPrm = getSetting('ResourcesTable').then(function(res) {
                        settings.resources = res;
                    }),
                    unitPrm = getSetting('UnitTable').then(function(res) {
                        settings.unit = res;
                    }),
                    staffPrm = getSetting('StaffTable').then(function(res) {
                        settings.staff = res;
                    }),
                    typePrm = getSetting('ResourceTypeTable').then(function(res) {
                        settings.resource_type = res;
                    }),
                    absPrm = getSetting('AbsenteeismTable').then(function(res) {
                        settings.absenteeism = res;
                    }),
                    payPrm = getSetting('PayitemsTable').then(function(res) {
                        settings.payitems = res;
                    });

                Promise.all([settPrm, resPrm, unitPrm, staffPrm, typePrm, absPrm, payPrm]).then(function() {
                    prm.resolve(settings);
                })
            });
            return prm.promise;
        };

        service.getProjects = function() {
            var prm = $q.defer();
            $APP.db.transaction(function(tx) {
                //Select projects
                tx.executeSql('SELECT * FROM ProjectsTable', [], function(tx, rs) {
                    var aux = [];
                    for (var i = 0; i < rs.rows.length; i++) {
                        aux.push(rs.rows.item(i));
                    }
                    var id = localStorage.getObject('ppprojectId'),
                        name = localStorage.getObject('ppnavTitle'),
                        sw = false;
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
                    prm.resolve(aux);
                }, function(error) {
                    prm.reject("Some unexpected error occured and projects could not be loaded.");
                });
            });
            return prm.promise;
        };

        service.getDesigns = function() {
            var prm = $q.defer(),
                aux = [];
            $APP.db.transaction(function(tx) {
                tx.executeSql('SELECT * FROM DesignsTable', [], function(tx, rs) {
                    for (var i = 0; i < rs.rows.length; i++) {
                        aux.push(JSON.parse(rs.rows.item(i).data));
                    }
                    prm.resolve(aux);
                }, function(error) {
                    prm.reject("Some unexpected error occured and designs could not be loaded.");
                });
            })
            return prm.promise;
        };

        service.selectDesignsWhere = function(fieldName, value) {
            var prm = $q.defer(),
                aux = [];
            $APP.db.transaction(function(tx) {
                tx.executeSql('SELECT * FROM DesignsTable WHERE ' + fieldName + '=' + value, [], function(tx, rs) {
                    for (var i = 0; i < rs.rows.length; i++) {
                        aux.push(JSON.parse(rs.rows.item(i).data));
                    }
                    prm.resolve(aux);
                }, function(error) {
                    console.log('Error selecting designs', error);
                    prm.reject("Could not get designs from db.");
                });
            })
            return prm.promise;
        };

        service.sync = function(isInit) {
            var defer = $q.defer();
            $timeout(function() {
                if (navigator.onLine) {
                    getme()
                        .success(function(data) {
                            localStorage.setObject("ppuser", data);
                            if (isInit) {
                                AuthService.version().success(function(result) {
                                    if (!localStorage.getItem('ppversion') || localStorage.getItem('ppversion') < result) {
                                        syncData().then(function(res) {
                                            defer.resolve();
                                        })
                                    } else {
                                        defer.resolve();
                                    }
                                }).error(function(err) {
                                    defer.resolve();
                                })
                            } else {
                                syncData().then(function(res) {
                                    defer.resolve();
                                })
                            }
                        })
                        .error(function(data, status) {
                            if (navigator.onLine && status === 403) {
                                var user = localStorage.getObject('ppremember');
                                if (user) {
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
                                        defer.resolve();
                                    })
                                } else {
                                    defer.resolve();
                                }
                            } else {
                                defer.resolve();
                            }
                        })
                } else {
                    defer.resolve();
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
