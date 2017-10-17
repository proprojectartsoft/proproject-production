ppApp.service('PostService', [
    '$q',
    '$http',
    '$timeout',
    '$state',
    '$filter',
    'pendingRequests',
    '$rootScope',
    function($q, $http, $timeout, $state, $filter, pendingRequests, $rootScope) {

        var service = this;
        /**
         * Method to post data
         * @param {object} params - object containing post params
         * - {
         *      url: 'login',
         *      endPoint: 'pub/',
         *      method: 'POST',
         *      params: {}, - for params of the URL
         *      data: {},   - for data to be posted
         *      headers: {},
         *      extraParams: {},
         *      transformRequest: {Function},
         *      transformResponse: {Function}
         *     }
         * @param {Function} success - callback on success
         * @param {Function} error - callback on error
         * @param {Object} [popup] - optional popup object to be closed
         */
        service.post = function(params, success, error, popup) {
            if (['POST', 'PUT', 'GET', 'DELETE'].indexOf(params.method) < 0) {
                return error({
                    error: 500,
                    response: 'Wrong method used'
                });
            }

            var dt = {},
                baseEndPoint = params.hasOwnProperty('endPoint') ? params.endPoint : 'api/',
                baseQueryTo = $APP.server + baseEndPoint,
                self = this;

            self.errorId = 0;
            self.errorStatus = "Unrecognized error";

            /**
             * Method to run on success
             *
             * @param {Object} response - server JSON response parsed into an object or caught in the middle
             * @returns {Object} - error | success object
             */
            self.successCallback = function(response) {
                if (popup) popup.close();

                // This is the success (200)
                // It might be throwing weird or expected errors so we better deal with them at this level
                if (!response) {
                    //console.log('Unknown Server error');
                    dt = {
                        error: 'Something went wrong. The server did not return a proper response!',
                        status: 299 // custom error status
                    };
                    return error({
                        'data': dt
                    });
                }

                success(response);
            };

            /**
             * Method to run on error
             * @param {Object} response - server JSON response parsed into an object or caught in the middle
             * @returns {Object} - error object
             */
            self.errorCallback = function(response) {
                if (popup) popup.close();

                // forced stop querying
                if (!response) {
                    $rootScope.stopQuerying = true;
                    dt = {
                        error: 'Not authorized',
                        status: 401
                    };
                    return error({
                        'data': dt
                    });
                }

                if ([401, 403].indexOf(response.status) > -1) {
                    $rootScope.stopQuerying = true;
                    pendingRequests.cancelAll();
                    sessionStorage.removeItem('isLoggedIn');
                    dt = {
                        error: 'Not authorized',
                        status: response.status
                    };
                    return error({
                        'data': dt
                    });
                }

                dt = {
                    error: response.statusText || 'Unknown server error',
                    status: response.status || 500
                };
                return error({
                    'data': dt
                });
            };

            // classic request object
            var requestObject = {
                method: params.method,
                url: baseQueryTo + params.url,
                data: params.data,
                withCredentials: params.withCredentials
            };

            if (params.data && typeof params.data === 'object') {
                requestObject.data = params.data;
            }

            if (params.params && typeof params.params === 'object') {
                requestObject.params = params.params;
            }
            if (params.transformRequest && typeof params.transformRequest === 'object') {
                requestObject.transformRequest = params.transformRequest;
            }

            if (params.transformResponse && typeof params.transformResponse === 'object') {
                requestObject.transformResponse = params.transformResponse;
            }

            if (params.extraParams && Object.keys(params.extraParams).length) {
                for (var i in params.extraParams) {
                    if (!params.extraParams.hasOwnProperty(i)) continue;
                    requestObject[i] = params.extraParams[i];
                }
            }

            // add cache control to all requests
            requestObject.headers = {
                'Cache-control': 'no-cache, no-store, max-age=0',
                'Pragma': 'no-cache'
            };

            if (params.headers && Object.keys(params.headers).length) {
                for (var y in params.headers) {
                    if (!params.headers.hasOwnProperty(y)) continue;
                    requestObject.headers[y] = params.headers[y];
                }
            }

            // load the $http service
            if (!$rootScope.stopQuerying) {

                var canceller = $q.defer();
                pendingRequests.add({
                    url: requestObject.url,
                    canceller: canceller
                });
                requestObject.timeout = canceller.promise;

                try {
                    $http(requestObject).then(
                        self.successCallback,
                        self.errorCallback
                    );
                } catch (err) {
                    return self.errorCallback({
                        statusText: 'Unknown server error: ' + err,
                        status: 500
                    });
                }
                pendingRequests.remove(requestObject.url);
            } else {
                return self.errorCallback;
            }
        };
    }
]);

ppApp.service('pendingRequests', ['$filter', function($filter) {
    var pending = [];
    this.get = function() {
        return pending;
    };
    this.add = function(request) {
        pending.push(request);
    };
    this.remove = function(request) {
        pending = $filter('filter')(pending, function(p) {
            return p.url !== request;
        });
    };
    this.cancelAll = function() {
        angular.forEach(pending, function(p) {
            p.canceller.resolve();
        });
        pending.length = 0;
    };
}]);

ppApp.service('SettingService', ['$ionicPopup', '$ionicBackdrop', '$ionicBody', '$timeout',
    function($ionicPopup, $ionicBackdrop, $ionicBody, $timeout) {
        var self = this;
        self.show_message_popup = function(title, template) {
            var popup = $ionicPopup.alert({
                title: title,
                template: template,
                content: "",
                buttons: [{
                    text: 'Ok',
                    type: 'button-positive',
                    onTap: function(e) {
                        popup.close();
                    }
                }]
            });
            return popup;
        };

        self.show_loading_popup = function(title) {
            return $ionicPopup.show({
                title: title,
                template: "<center><ion-spinner icon='android'></ion-spinner></center>",
                content: "",
                buttons: []
            });
        };

        self.show_confirm_popup = function(title, template) {
            return $ionicPopup.confirm({
                title: title,
                template: template
            });
        };

        self.show_create_popup = function(email, importCallback, sendCallback, id) {
            return $ionicPopup.show({
                template: '<input type="text" ng-model="filter.email">',
                title: 'Share form',
                subTitle: 'Please enter a valid e-mail address.',
                buttons: [{
                    text: '<i class="ion-person-add"></i>',
                    onTap: function(e) {
                        importCallback(id);
                    }
                }, {
                    text: 'Cancel',
                }, {
                    text: 'Send',
                    type: 'button-positive',
                    onTap: function(e) {
                        if (!email) {
                            e.preventDefault();
                            self.show_message_popup('Share', "Please insert a valid e-mail address.");
                        } else {
                            sendCallback(email, id);
                        }
                    }
                }]
            });
        }

        self.close_all_popups = function() {
            noop = angular.noop;
            elevated = false;
            var popupStack = $ionicPopup._popupStack;
            if (popupStack.length > 0) {
                popupStack.forEach(function(popup, index) {
                    if (popup.isShown === true) {
                        popup.remove();
                        popupStack.pop();
                    }
                });
            }

            $ionicBackdrop.release();
            //Remove popup-open & backdrop if this is last popup
            $timeout(function() {
                // wait to remove this due to a 300ms delay native
                // click which would trigging whatever was underneath this
                $ionicBody.removeClass('popup-open');
                // $ionicPopup._popupStack.pop();
            }, 400, false);
            ($ionicPopup._backButtonActionDone || noop)();
        };
    }
]);
