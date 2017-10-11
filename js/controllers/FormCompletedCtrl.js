ppApp.controller('FormCompletedCtrl', [
    '$scope',
    '$state',
    'FormInstanceService',
    'CacheFactory',
    '$rootScope',
    '$location',
    '$stateParams',
    'AuthService',
    '$ionicPopup',
    '$ionicSideMenuDelegate',
    '$ionicHistory',
    '$ionicListDelegate',
    'ShareService',
    '$timeout',
    'SecuredPopups',
    function($scope, $state, FormInstanceService, CacheFactory, $rootScope, $location, $stateParams, AuthService, $ionicPopup, $ionicSideMenuDelegate, $ionicHistory, $ionicListDelegate, ShareService, $timeout, SecuredPopups) {

        $scope.$on('$ionicView.enter', function() {
            $ionicHistory.clearHistory();
            $ionicSideMenuDelegate.canDragContent(false);
        });
        $scope.filter = {};
        $scope.filter.email = "";

        function createPopup(id) {
            return {
                template: '<input type="text" ng-model="filter.email">',
                title: 'Share form',
                subTitle: 'Please enter a valid e-mail address.',
                scope: $scope,
                buttons: [{
                    text: '<i class="ion-person-add"></i>',
                    onTap: function(e) {
                        $scope.importContact(id);
                    }
                }, {
                    text: 'Cancel',
                }, {
                    text: 'Send',
                    type: 'button-positive',
                    onTap: function(e) {
                        if (!$scope.filter.email) {
                            e.preventDefault();
                            var alertPopup = $ionicPopup.alert({
                                title: 'Share',
                                template: "",
                                content: "Please insert a valid e-mail address.",
                                buttons: [{
                                    text: 'OK',
                                    type: 'button-positive',
                                    onTap: function(e) {
                                        alertPopup.close();
                                    }
                                }]
                            });
                        } else {
                            sendEmail($scope.filter.email, id);
                        }
                    }
                }]
            }
        }

        function sendEmail(res, id) {
            if (res) {
                var alertPopup1 = $ionicPopup.alert({
                    title: "Sending email",
                    template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                    content: "",
                    buttons: []
                });
                ShareService.form.create(id, res).then(function(response) {
                        alertPopup1.close();
                        if (response.message === "Form shared") {
                            res = "";
                            var alertPopupC = SecuredPopups.show('alert', {
                                title: 'Share',
                                template: 'Email sent.'
                            });
                        }
                    },
                    function(err) {
                        alertPopup1.close();
                        if (err.status == 422) {
                            res = "";
                            var alertPopupC = SecuredPopups.show('alert', {
                                title: 'Share',
                                template: 'Form already shared to this user.'
                            });
                        } else {
                            var alertPopupC = SecuredPopups.show('alert', {
                                title: 'Share',
                                template: 'An unexpected error occured while sending the e-mail.'
                            });
                        }
                    });
            }
        }

        function addContact(id, contact) {
            if ($scope.filter.email && $scope.filter.email != "") {
                if (!$scope.filter.email.includes(contact)) {
                    $scope.filter.email = $scope.filter.email + "," + contact;
                    $timeout(function() {
                        var popup = $ionicPopup.show(createPopup(id));
                    });
                } else {
                    var alertPopup1 = $ionicPopup.alert({
                        title: 'Share',
                        template: "",
                        content: "E-mail already added to share list.",
                        buttons: [{
                            text: 'OK',
                            type: 'button-positive',
                            onTap: function(e) {
                                alertPopup1.close();
                                var popup = $ionicPopup.show(createPopup(id));
                            }
                        }]
                    });
                }
            } else {
                $scope.filter.email = contact;
                $timeout(function() {
                    var popup = $ionicPopup.show(createPopup(id));
                });
            }
        }

        $scope.importContact = function(id) {
            $timeout(function() {
                navigator.contacts.pickContact(function(contact) {
                    if (contact.emails) {
                        addContact(id, contact.emails[0].value);
                    } else {
                        var alertPopup1 = $ionicPopup.alert({
                            title: 'Share',
                            template: "",
                            content: "No e-mail address was found. Please enter one manually.",
                            buttons: [{
                                text: 'OK',
                                type: 'button-positive',
                                onTap: function(e) {
                                    alertPopup1.close();
                                    var popup = $ionicPopup.show(createPopup(id));
                                }
                            }]
                        });
                    }
                });
            });
        }

        $scope.shareThis = function(predicate) {
            var popup = $ionicPopup.show(createPopup(predicate.id));
        };

        $scope.isLoaded = false;
        $rootScope.slideHeader = false;
        $rootScope.slideHeaderPrevious = 0;
        $rootScope.slideHeaderHelper = false;

        $scope.getFullCode = function(row) {
            if (row.revision !== '0') {
                return row.code + '-' + row.form_number + '-Rev' + row.revision;
            } else {
                return row.code + '-' + row.form_number;
            }
        };

        AuthService.me().then(function(user) {
            if (user && user.active === false) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Your account has been de-activated. Contact your supervisor for further information.',
                });
                alertPopup.then(function(res) {
                    var projectsCache = CacheFactory.get('projectsCache');
                    if (projectsCache) {
                        projectsCache.destroy();
                    }
                    var designsCache = CacheFactory.get('designsCache');
                    if (designsCache) {
                        designsCache.destroy();
                    }
                    var instanceCache = CacheFactory.get('instanceCache');
                    if (instanceCache) {
                        instanceCache.destroy();
                    }
                    var registersCache = CacheFactory.get('registersCache');
                    if (registersCache) {
                        registersCache.destroy();
                    }
                    var registerCache = CacheFactory.get('registerCache');
                    if (registerCache) {
                        registerCache.destroy();
                    }

                    var reloadCache = CacheFactory.get('reloadCache');
                    if (reloadCache) {
                        reloadCache.destroy();
                    }

                    var syncCache = CacheFactory.get('sync');
                    if (syncCache) {
                        syncCache.destroy();
                    }

                    var settingsCache = CacheFactory.get('settings');
                    if (settingsCache) {
                        settingsCache.destroy();
                    }
                    AuthService.logout().success(function() {}, function() {});
                    $state.go('login');
                });

            }
        }, function errorCallback(error) {});

        $scope.categoryName = $rootScope.categories[$stateParams.categoryId - 1].name;
        $rootScope.categoryId = $stateParams.categoryId;

        FormInstanceService.list($stateParams.projectId, $stateParams.categoryId).then(function(data) {
            $scope.isLoaded = true;
            $scope.formInstances = data;
            if (data) {
                if (data.length === 0) {
                    $scope.hasData = 'no data';
                }
            } else {
                $scope.hasData = 'no data';
            }
        });

        $scope.refresh = function() {
            FormInstanceService.list($stateParams.projectId, $stateParams.categoryId).then(function(data) {
                $scope.formInstances = data;
                if (data) {
                    if (data.length === 0) {
                        $scope.hasData = 'no data';
                    }
                }
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.change = function(id) {
            $rootScope.formId = id;
            FormInstanceService.get($rootScope.formId).then(function(data) {
                $rootScope.rootForm = data;
                $location.path("/app/view/" + $rootScope.projectId + "/form/" + id);
            });
        };

        $scope.test = function() {};

        $scope.form = function(completedFormId) {
            $state.go("app.form");
        };
    }
]);
