ppApp.controller('FormCompletedCtrl', [
    '$scope',
    '$state',
    'CacheFactory',
    '$rootScope',
    '$location',
    '$stateParams',
    'AuthService',
    '$ionicSideMenuDelegate',
    '$ionicHistory',
    '$ionicListDelegate',
    '$timeout',
    'SecuredPopups',
    'PostService',
    'SettingService',
    '$ionicPopup',
    function($scope, $state, CacheFactory, $rootScope, $location, $stateParams, AuthService, $ionicSideMenuDelegate, $ionicHistory, $ionicListDelegate, $timeout, SecuredPopups, PostService, SettingService, $ionicPopup) {

        $scope.$on('$ionicView.enter', function() {
            $ionicHistory.clearHistory();
            $ionicSideMenuDelegate.canDragContent(false);
        });
        $scope.filter = {};
        $scope.filter.email = "";

        // mixpanel track events
        if (navigator.onLine) {
          mixpanel.track("Page view: PP app", {'Page name:': 'Completed forms list'});
        }

        function sendEmail(res, id) {
            if (res) {
                var alertPopup1 = SettingService.show_loading_popup("Sending email", "<center><ion-spinner icon='android'></ion-spinner></center>");
                PostService.post({
                    method: 'POST',
                    url: 'share',
                    params: {
                        formId: id,
                        email: res
                    }
                }, function(response) {
                    alertPopup1.close();
                    if (response.data.message === "Form shared") {
                        //mixpanel people proprieties
                        mixpanel.people.increment('Form shares: PP app', 1);

                        res = "";
                        var alertPopupC = SecuredPopups.show('alert', {
                            title: 'Share',
                            template: 'Email sent.'
                        });
                    }
                }, function(err) {
                    alertPopup1.close();
                    if (err.status == 422) { //TODO: .data??
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
                            SettingService.show_message_popup('Share', "Please insert a valid e-mail address.");
                        } else {
                            sendEmail($scope.filter.email, id);
                        }
                    }
                }]
            }
        }

        function addContact(id, contact) {
            if ($scope.filter.email && $scope.filter.email != "") {
                if (!$scope.filter.email.includes(contact)) {
                    $scope.filter.email = $scope.filter.email + "," + contact;
                    $timeout(function() {
                        $ionicPopup.show(createPopup(id));
                    });
                } else {
                    SettingService.show_message_popup('Share', "E-mail already added to share list.");
                }
            } else {
                $scope.filter.email = contact;
                $timeout(function() {
                    $ionicPopup.show(createPopup(id));
                });
            }
        }

        $scope.importContact = function(id) {
            $timeout(function() {
                navigator.contacts.pickContact(function(contact) {
                    if (contact.emails) {
                        addContact(id, contact.emails[0].value);
                    } else {
                        SettingService.show_message_popup('Share', "No e-mail address was found. Please enter one manually.");
                    }
                });
            });
        }

        $scope.shareThis = function(predicate) {
            $ionicPopup.show(createPopup(predicate.id));
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
                SettingService.show_message_popup('Error', 'Your account has been de-activated. Contact your supervisor for further information.').then(function(res) {
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
        PostService.post({
            method: 'GET',
            url: 'forminstance',
            params: {
                projectId: $stateParams.projectId,
                categoryId: $stateParams.categoryId
            }
        }, function(res) {
            $scope.isLoaded = true;
            $scope.formInstances = res.data;
            if ($scope.formInstances.length === 0) {
                $scope.hasData = 'no data';
            }
        }, function(err) {
            $scope.hasData = 'no data';
        });

        $scope.refresh = function() {
            PostService.post({
                method: 'GET',
                url: 'forminstance',
                params: {
                    projectId: $stateParams.projectId,
                    categoryId: $stateParams.categoryId
                }
            }, function(res) {
                $scope.formInstances = res.data;
                if ($scope.formInstances.length === 0) {
                    $scope.hasData = 'no data';
                }
                $scope.$broadcast('scroll.refreshComplete');
            }, function(err) {
                console.log(err);
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.change = function(id) {
            $rootScope.formId = id;
            PostService.post({
                method: 'GET',
                url: 'forminstance',
                params: {
                    id: $rootScope.formId
                }
            }, function(res) {
                $rootScope.rootForm = res.data;
                $location.path("/app/view/" + $rootScope.projectId + "/form/" + id);
            }, function(err) {
                console.log(err);
            });
        };

        $scope.form = function(completedFormId) {
            $state.go("app.form");
        };
    }
]);
